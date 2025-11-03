import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get posts with optional filtering
export const getPosts = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, limit = 50 }) => {
    let posts;

    if (category && category !== "all") {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_category", (q) => q.eq("category", category))
        .order("desc")
        .take(limit);
    } else {
      posts = await ctx.db
        .query("posts")
        .order("desc")
        .take(limit);
    }

    // Enrich posts with author information
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author && "name" in author ? {
            name: author.name || "Anonymous",
            image: "image" in author ? author.image : undefined,
          } : null,
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
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("posts", {
      ...args,
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
      await ctx.db.patch(userStats._id, {
        communityActivity: {
          ...userStats.communityActivity,
          postsCreated: userStats.communityActivity.postsCreated + 1,
          communityScore: userStats.communityActivity.communityScore + 5, // +5 points for creating a post
        },
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

    if (existingVote) {
      // If same vote type, remove vote (toggle off)
      if (existingVote.voteType === voteType) {
        await ctx.db.delete(existingVote._id);
        await ctx.db.patch(postId, {
          upvotes: voteType === "up" ? post.upvotes - 1 : post.upvotes,
          downvotes: voteType === "down" ? post.downvotes - 1 : post.downvotes,
        });
      } else {
        // Change vote type
        await ctx.db.patch(existingVote._id, {
          voteType,
          createdAt: Date.now(),
        });
        await ctx.db.patch(postId, {
          upvotes: voteType === "up" ? post.upvotes + 1 : post.upvotes - 1,
          downvotes: voteType === "down" ? post.downvotes + 1 : post.downvotes - 1,
        });
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
    }

    // Update post author's community score
    const authorStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", post.authorId))
      .first();

    if (authorStats) {
      const scoreChange = voteType === "up" ? 1 : -1;
      await ctx.db.patch(authorStats._id, {
        communityActivity: {
          ...authorStats.communityActivity,
          upvotesReceived: voteType === "up" 
            ? authorStats.communityActivity.upvotesReceived + 1 
            : authorStats.communityActivity.upvotesReceived,
          downvotesReceived: voteType === "down" 
            ? authorStats.communityActivity.downvotesReceived + 1 
            : authorStats.communityActivity.downvotesReceived,
          communityScore: authorStats.communityActivity.communityScore + scoreChange,
        },
      });
    }

    return postId;
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
          author: author ? {
            name: author.name || "Anonymous",
            image: author.image,
          } : null,
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
