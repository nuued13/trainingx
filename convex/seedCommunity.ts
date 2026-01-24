import { mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { nextLeaderboardFields } from "./userStatsUtils";
import type { Id, Doc } from "./_generated/dataModel";

type Rubric = {
  clarity: number;
  constraints: number;
  iteration: number;
  tool: number;
};

type Skills = {
  generative_ai: number;
  agentic_ai: number;
  synthetic_ai: number;
  coding: number;
  agi_readiness: number;
  communication: number;
  logic: number;
  planning: number;
  analysis: number;
  creativity: number;
  collaboration: number;
};

type CommunityActivity = {
  postsCreated: number;
  upvotesReceived: number;
  downvotesReceived: number;
  helpfulAnswers: number;
  communityScore: number;
};

type SeedUser = {
  name: string;
  email: string;
  image?: string;
  promptScore: number;
  streak: number;
  lastActiveDaysAgo: number;
  weeklyPracticeMinutes: number;
  rubric: Rubric;
  skills: Skills;
  communityActivity: CommunityActivity;
};

type SeedPost = {
  ref: string;
  authorEmail: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  viewCount: number;
  createdHoursAgo: number;
};

type SeedComment = {
  postRef: string;
  authorEmail: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdHoursAgo: number;
};

type SeedPayload = {
  users: SeedUser[];
  posts: SeedPost[];
  comments: SeedComment[];
};

// Helper to upsert a user and their stats
async function upsertUser(
  ctx: MutationCtx,
  user: SeedUser
) {
  const existing = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", user.email))
    .first();

  const userId = existing
    ? existing._id
    : await ctx.db.insert("users", {
        name: user.name,
        email: user.email,
        image: user.image,
      });

  const stats = await ctx.db
    .query("userStats")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  const now = Date.now();
  const lastActiveDate = now - user.lastActiveDaysAgo * 24 * 60 * 60 * 1000;

  const baseStats = {
    userId,
    promptScore: user.promptScore,
    previousPromptScore: user.promptScore,
    rubric: user.rubric,
    skills: user.skills,
    previousSkills: user.skills,
    badges: [],
    completedProjects: [],
    assessmentHistory: [],
    streak: user.streak,
    lastActiveDate,
    assessmentComplete: true,
    unlockedCareers: [],
    weeklyPracticeMinutes: user.weeklyPracticeMinutes,
    communityActivity: user.communityActivity,
    communityScore: user.communityActivity.communityScore,
    totalScore: user.promptScore + user.communityActivity.communityScore,
  };

  const statsForScore =
    (stats as Doc<"userStats"> | undefined) ??
    (baseStats as unknown as Doc<"userStats">);

  const leaderboardFields = nextLeaderboardFields(statsForScore, {
    promptScore: user.promptScore,
    communityActivity: user.communityActivity,
  });

  if (stats) {
    await ctx.db.patch(stats._id, {
      ...baseStats,
      ...leaderboardFields,
    });
  } else {
    await ctx.db.insert("userStats", {
      ...baseStats,
      ...leaderboardFields,
    });
  }

  return userId;
}

async function upsertPost(
  ctx: MutationCtx,
  authorId: Id<"users">,
  post: SeedPost,
  existingRefs: Map<string, Id<"posts">>
) {
  if (existingRefs.has(post.ref)) return existingRefs.get(post.ref) as Id<"posts">;

  // If already seeded (same author + title), reuse
  const existing = await ctx.db
    .query("posts")
    .withIndex("by_author", (q) => q.eq("authorId", authorId))
    .collect();
  const match = existing.find((p) => p.title === post.title);
  if (match) {
    existingRefs.set(post.ref, match._id);
    return match._id;
  }

  const now = Date.now();
  const createdAt = now - post.createdHoursAgo * 60 * 60 * 1000;

  const id = await ctx.db.insert("posts", {
    title: post.title,
    content: post.content,
    authorId,
    category: post.category,
    tags: post.tags,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    viewCount: post.viewCount,
    replyCount: 0,
    isPinned: false,
    isLocked: false,
    createdAt,
    updatedAt: createdAt,
  });

  existingRefs.set(post.ref, id);
  return id;
}

async function insertComment(
  ctx: MutationCtx,
  authorId: Id<"users">,
  postId: Id<"posts">,
  comment: SeedComment
) {
  const existing = await ctx.db
    .query("comments")
    .withIndex("by_post", (q) => q.eq("postId", postId))
    .collect();
  const duplicate = existing.find(
    (c) => c.authorId === authorId && c.content === comment.content
  );
  if (duplicate) return;

  const now = Date.now();
  const createdAt = now - comment.createdHoursAgo * 60 * 60 * 1000;

  await ctx.db.insert("comments", {
    postId,
    authorId,
    content: comment.content,
    parentId: undefined,
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    isEdited: false,
    createdAt,
    updatedAt: createdAt,
  });

  // Increment reply count on the post
  const post = await ctx.db.get(postId);
  if (post) {
    await ctx.db.patch(postId, {
      replyCount: (post.replyCount || 0) + 1,
    });
  }
}

export const seedAll = mutation({
  args: {
    data: v.object({
      users: v.array(
        v.object({
          name: v.string(),
          email: v.string(),
          image: v.optional(v.string()),
          promptScore: v.number(),
          streak: v.number(),
          lastActiveDaysAgo: v.number(),
          weeklyPracticeMinutes: v.number(),
          rubric: v.object({
            clarity: v.number(),
            constraints: v.number(),
            iteration: v.number(),
            tool: v.number(),
          }),
          skills: v.object({
            generative_ai: v.number(),
            agentic_ai: v.number(),
            synthetic_ai: v.number(),
            coding: v.number(),
            agi_readiness: v.number(),
            communication: v.number(),
            logic: v.number(),
            planning: v.number(),
            analysis: v.number(),
            creativity: v.number(),
            collaboration: v.number(),
          }),
          communityActivity: v.object({
            postsCreated: v.number(),
            upvotesReceived: v.number(),
            downvotesReceived: v.number(),
            helpfulAnswers: v.number(),
            communityScore: v.number(),
          }),
        })
      ),
      posts: v.array(
        v.object({
          ref: v.string(),
          authorEmail: v.string(),
          title: v.string(),
          content: v.string(),
          category: v.string(),
          tags: v.array(v.string()),
          upvotes: v.number(),
          downvotes: v.number(),
          viewCount: v.number(),
          createdHoursAgo: v.number(),
        })
      ),
      comments: v.array(
        v.object({
          postRef: v.string(),
          authorEmail: v.string(),
          content: v.string(),
          upvotes: v.number(),
          downvotes: v.number(),
          createdHoursAgo: v.number(),
        })
      ),
    }),
  },
  handler: async (ctx, { data }) => {
    const usersByEmail = new Map<string, Id<"users">>();
    for (const u of data.users) {
      const id = await upsertUser(ctx, u);
      usersByEmail.set(u.email, id);
    }

    const postsByRef = new Map<string, Id<"posts">>();
    for (const p of data.posts) {
      const authorId = usersByEmail.get(p.authorEmail);
      if (!authorId) continue;
      const postId = await upsertPost(ctx, authorId, p, postsByRef);
      postsByRef.set(p.ref, postId);
    }

    for (const c of data.comments) {
      const authorId = usersByEmail.get(c.authorEmail);
      const postId = postsByRef.get(c.postRef);
      if (!authorId || !postId) continue;
      await insertComment(ctx, authorId, postId, c);
    }

    return {
      users: data.users.length,
      posts: data.posts.length,
      comments: data.comments.length,
    };
  },
});
