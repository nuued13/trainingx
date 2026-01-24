import { query, mutation, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { nextLeaderboardFields } from "./userStatsUtils";
import { normalizeEmail } from "./normalizeEmail";

// Get posts with optional filtering
export const getPosts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 20 }) => {
    // Get current user identity to check for bookmarks
    const identity = await ctx.auth.getUserIdentity();
    const currentUser = identity
      ? await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", normalizeEmail(identity.email!)))
          .first()
      : null;

    let posts;

    if (category && category !== "all") {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .take(limit);
    } else {
      posts = await ctx.db.query("posts").order("desc").take(limit);
    }

    // Enrich posts with author information and resolve media URLs
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);

        let isBookmarked = false;
        if (currentUser) {
          const bookmark = await ctx.db
            .query("userBookmarks")
            .withIndex("by_user_post", (q) =>
              q.eq("userId", currentUser._id).eq("postId", post._id)
            )
            .first();
          isBookmarked = !!bookmark;
        }

        // Resolve media URLs from storage IDs
        let resolvedMedia = post.media;
        if (post.media && post.media.length > 0) {
          resolvedMedia = await Promise.all(
            post.media.map(async (mediaItem) => {
              const url = await ctx.storage.getUrl(mediaItem.storageId);
              return {
                ...mediaItem,
                url: url || "",
              };
            })
          );
        }

        return {
          ...post,
          bookmarks: post.bookmarks || 0,
          isBookmarked,
          media: resolvedMedia,
          author:
            author && "name" in author
              ? {
                  name: author.name || "Anonymous",
                  image: "image" in author ? author.image : undefined,
                }
              : null,
        };
      })
    );

    return enrichedPosts;
  },
});

// Create a new post
export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
          name: v.optional(v.string()),
          sizeMb: v.optional(v.number()),
          duration: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { media, ...postData } = args;
    const postId = await ctx.db.insert("posts", {
      ...postData,
      media: media || [],
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user stats - increment posts created
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.authorId))
      .first();

    if (userStats) {
      const communityActivity = {
        ...userStats.communityActivity,
        postsCreated: userStats.communityActivity.postsCreated + 1,
        communityScore: userStats.communityActivity.communityScore + 5, // +5 points for creating a post
      };

      await ctx.db.patch(userStats._id, {
        communityActivity,
        ...nextLeaderboardFields(userStats, { communityActivity }),
      });
    }

    return postId;
  },
});

// Vote on a post
export const votePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
    voteType: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { postId, userId, voteType }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    // Check if user already voted
    const existingVote = await ctx.db
      .query("postVotes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", userId).eq("postId", postId)
      )
      .first();

    // Track how votes change for author stats
    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let scoreDelta = 0;

    if (existingVote) {
      // If same vote type, remove vote (toggle off)
      if (existingVote.voteType === voteType) {
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(postId, {
          upvotes: voteType === "up" ? post.upvotes - 1 : post.upvotes,
          downvotes: voteType === "down" ? post.downvotes - 1 : post.downvotes,
        });
        // Removing the vote - reverse the effect
        if (voteType === "up") {
          upvoteDelta = -1;
          scoreDelta = -1;
        } else {
          downvoteDelta = -1;
          scoreDelta = 1; // Removing a downvote is positive
        }
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, {
          voteType,
          createdAt: Date.now(),
        });
        await ctx.db.patch(postId, {
          upvotes: voteType === "up" ? post.upvotes + 1 : post.upvotes - 1,
          downvotes:
            voteType === "down" ? post.downvotes + 1 : post.downvotes - 1,
        });
        // Changing vote: +1 for new type, -1 for old type
        if (voteType === "up") {
          upvoteDelta = 1;
          downvoteDelta = -1;
          scoreDelta = 2; // From -1 to +1
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
          scoreDelta = -2; // From +1 to -1
        }
      }
    } else {
      // New vote
      await ctx.db.insert("postVotes", {
        userId,
        postId,
        voteType,
        createdAt: Date.now(),
      });
      await ctx.db.patch(postId, {
        upvotes: voteType === "up" ? post.upvotes + 1 : post.upvotes,
        downvotes: voteType === "down" ? post.downvotes + 1 : post.downvotes,
      });
      // New vote
      if (voteType === "up") {
        upvoteDelta = 1;
        scoreDelta = 1;
      } else {
        downvoteDelta = 1;
        scoreDelta = -1;
      }
    }

    // Update post author's community score (only if there's a change)
    if (scoreDelta !== 0 || upvoteDelta !== 0 || downvoteDelta !== 0) {
      const authorStats = await ctx.db
        .query("userStats")
        .withIndex("by_user", (q) => q.eq("userId", post.authorId))
        .first();

      if (authorStats) {
        const communityActivity = {
          ...authorStats.communityActivity,
          upvotesReceived: Math.max(
            0,
            authorStats.communityActivity.upvotesReceived + upvoteDelta
          ),
          downvotesReceived: Math.max(
            0,
            authorStats.communityActivity.downvotesReceived + downvoteDelta
          ),
          communityScore:
            authorStats.communityActivity.communityScore + scoreDelta,
        };

        await ctx.db.patch(authorStats._id, {
          communityActivity,
          ...nextLeaderboardFields(authorStats, { communityActivity }),
        });
      }
    }

    return postId;
  },
});

// Toggle bookmark on a post
export const toggleBookmark = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, { postId, userId }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const existingBookmark = await ctx.db
      .query("userBookmarks")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", userId).eq("postId", postId)
      )
      .first();

    if (existingBookmark) {
      await ctx.db.delete(existingBookmark._id);
      await ctx.db.patch(postId, {
        bookmarks: Math.max(0, (post.bookmarks || 0) - 1),
      });
      return false; // Not bookmarked anymore
    } else {
      await ctx.db.insert("userBookmarks", {
        userId,
        postId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(postId, {
        bookmarks: (post.bookmarks || 0) + 1,
      });
      return true; // Bookmarked
    }
  },
});

// Get user's vote on a post
export const getUserVote = query({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, { postId, userId }) => {
    const vote = await ctx.db
      .query("postVotes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", userId).eq("postId", postId)
      )
      .first();

    return vote?.voteType || null;
  },
});

// Get user's votes for multiple posts (batch query)
export const getUserVotes = query({
  args: {
    postIds: v.array(v.id("posts")),
    userId: v.id("users"),
  },
  handler: async (ctx, { postIds, userId }) => {
    const votes = await Promise.all(
      postIds.map(async (postId) => {
        const vote = await ctx.db
          .query("postVotes")
          .withIndex("by_user_post", (q) =>
            q.eq("userId", userId).eq("postId", postId)
          )
          .first();
        return { postId, voteType: vote?.voteType || null };
      })
    );

    // Return as a map for easy lookup
    return Object.fromEntries(votes.map((v) => [v.postId, v.voteType]));
  },
});

// Get comments for a post
export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, { postId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .order("desc")
      .collect();

    // Enrich comments with author information
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author: author
            ? {
                name: author.name || "Anonymous",
                image: author.image,
              }
            : null,
        };
      })
    );

    return enrichedComments;
  },
});

// Create a comment
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      ...args,
      upvotes: 0,
      downvotes: 0,
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update post reply count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return commentId;
  },
});

// Increment post view count
export const incrementViewCount = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.patch(postId, {
      viewCount: post.viewCount + 1,
    });

    return postId;
  },
});

// Delete a post (only by owner)
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  handler: async (ctx, { postId, userId }) => {
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    // Verify ownership
    if (post.authorId !== userId) {
      throw new Error("You can only delete your own posts");
    }

    // Delete all comments on this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all votes on this post
    const votes = await ctx.db
      .query("postVotes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();

    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    // Update user stats - decrement posts created
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userStats) {
      const communityActivity = {
        ...userStats.communityActivity,
        postsCreated: Math.max(0, userStats.communityActivity.postsCreated - 1),
        communityScore: userStats.communityActivity.communityScore - 5, // Remove the +5 points from creating
      };

      await ctx.db.patch(userStats._id, {
        communityActivity,
      });
    }

    // Delete the post
    await ctx.db.delete(postId);

    return { success: true };
  },
});

// Get storage URL from storage ID
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

// ============================================
// MODERATED POST CREATION
// ============================================

/**
 * Create a post with full moderation pipeline
 *
 * Flow:
 * 1. Client submits post
 * 2. Server checks rate limits
 * 3. Server moderates text with GPT-4o-mini
 * 4. If approved, insert post
 * 5. If borderline, queue for review
 * 6. If rejected, return error with reason
 */
export const createModeratedPost = action({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
          name: v.optional(v.string()),
          sizeMb: v.optional(v.number()),
          duration: v.optional(v.number()),
          // Client-side moderation result (for audit, not trust)
          clientModerationPassed: v.optional(v.boolean()),
        })
      )
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    postId?: string;
    reason?: string;
    message?: string;
    categories?: string[];
    queueId?: string;
  }> => {
    const startTime = Date.now();

    // Step 0: Rate limiting - max 3 posts per minute per user
    const oneMinuteAgo = Date.now() - 60000;
    const recentPosts = await ctx.runQuery(
      internal.contentModeration.getRecentPostCount,
      {
        authorId: args.authorId,
        since: oneMinuteAgo,
      }
    );

    if (recentPosts >= 3) {
      return {
        success: false,
        reason: "rate_limited",
        message: "Slow down! You can post up to 3 times per minute.",
        categories: [],
      };
    }

    // Step 1: Moderate title + content in SINGLE call (50% cost savings)
    const combinedText = `[TITLE]\n${args.title}\n\n[CONTENT]\n${args.content}`;
    const moderationResult = await ctx.runAction(
      api.contentModeration.moderateText,
      {
        text: combinedText,
        context: { contentType: "post_full", authorId: args.authorId },
      }
    );

    // Handle different decisions
    if (moderationResult.decision === "rejected") {
      return {
        success: false,
        reason: "content_rejected",
        message: `Your post was flagged for: ${moderationResult.categories.join(", ")}. Please revise and try again.`,
        categories: moderationResult.categories,
      };
    }

    if (moderationResult.decision === "needs_review") {
      // Queue for manual review instead of immediate publishing
      const queueId = await ctx.runMutation(
        internal.contentModeration.queueForReview,
        {
          contentType: "post",
          authorId: args.authorId,
          title: args.title,
          content: args.content,
          category: args.category,
          tags: args.tags,
          media: args.media,
          moderationResult,
        }
      );

      return {
        success: false,
        reason: "pending_review",
        message:
          "Your post is being reviewed by our team. This usually takes a few minutes.",
        categories: moderationResult.categories,
        queueId,
      };
    }

    // Step 3: Create the post (all checks passed)
    const postId = await ctx.runMutation(internal.posts.insertPost, {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      category: args.category,
      tags: args.tags,
      media: args.media,
      moderationStatus: "approved",
    });

    // Step 4: Log to audit trail
    await ctx.runMutation(internal.contentModeration.createAuditLog, {
      action: "auto_approve",
      contentType: "post",
      contentId: postId,
      authorId: args.authorId,
      textChecked: true,
      mediaChecked: false, // Frontend handles media
      textResult: {
        approved: true,
        flaggedCategories: [],
        model: "gpt-4o-mini",
        tokensUsed: 0, // Will be tracked in aiLogs
        latencyMs: Date.now() - startTime,
      },
      finalDecision: "approved",
      totalLatencyMs: Date.now() - startTime,
      estimatedCost: 0.001, // Minimal
    });

    return {
      success: true,
      postId,
    };
  },
});

/**
 * Internal mutation to insert post (bypasses action limitations)
 */
export const insertPost = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    media: v.optional(v.any()),
    moderationStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      authorId: args.authorId,
      category: args.category,
      tags: args.tags,
      media: args.media || [],
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      moderationStatus: args.moderationStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user stats
    const userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.authorId))
      .first();

    if (userStats) {
      const communityActivity = {
        ...userStats.communityActivity,
        postsCreated: userStats.communityActivity.postsCreated + 1,
        communityScore: userStats.communityActivity.communityScore + 5,
      };

      await ctx.db.patch(userStats._id, {
        communityActivity,
        ...nextLeaderboardFields(userStats, { communityActivity }),
      });
    }

    return postId;
  },
});

// ============================================
// MODERATED COMMENT CREATION
// ============================================

/**
 * Create a comment with moderation
 */
export const createModeratedComment = action({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    commentId?: string;
    reason?: string;
    message?: string;
    categories?: string[];
  }> => {
    // Moderate comment content
    const result = await ctx.runAction(api.contentModeration.moderateText, {
      text: args.content,
      context: { contentType: "comment", authorId: args.authorId },
    });

    if (!result.approved) {
      return {
        success: false,
        reason: "comment_rejected",
        message: `Your comment was flagged for: ${result.categories.join(", ")}`,
        categories: result.categories,
      };
    }

    // Insert comment
    const commentId = await ctx.runMutation(internal.posts.insertComment, {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
    });

    return { success: true, commentId };
  },
});

/**
 * Internal mutation to insert comment
 */
export const insertComment = internalMutation({
  args: {
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: args.authorId,
      content: args.content,
      parentId: args.parentId,
      upvotes: 0,
      downvotes: 0,
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update post reply count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        replyCount: post.replyCount + 1,
      });
    }

    return commentId;
  },
});
