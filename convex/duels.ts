import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import type { Doc } from "./_generated/dataModel";

// Create a new multi-player room
export const createRoom = mutation({
  args: {
    userId: v.id("users"),
    itemCount: v.optional(v.number()),
    minPlayers: v.optional(v.number()),
    maxPlayers: v.optional(v.number()),
    trackId: v.optional(v.id("practiceTracks")),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const itemCount = args.itemCount || 5;

    let selectedItems: Id<"practiceItems">[] = [];

    // If trackId is provided, get items from that track's levels
    if (args.trackId) {
      // Get all levels for this track
      const levels = await ctx.db
        .query("practiceLevels")
        .withIndex("by_track", (q) => q.eq("trackId", args.trackId!))
        .collect();

      const levelIds = levels.map((l) => l._id);

      // Get items from these levels - ONLY rate type (Bad/Almost/Good format)
      const trackItems = await ctx.db
        .query("practiceItems")
        .withIndex("by_status", (q) => q.eq("status", "live"))
        .collect();

      // Filter to items that belong to this track's levels AND are rate type AND have a prompt
      const filteredItems = trackItems.filter(
        (item) =>
          item.levelId &&
          levelIds.includes(item.levelId) &&
          item.type === "rate" && // Only rate type items (Bad/Almost/Good)
          item.params?.prompt // Must have a prompt to display
      );

      // Shuffle and select
      const shuffled = filteredItems.sort(() => Math.random() - 0.5);
      selectedItems = shuffled.slice(0, itemCount).map((item) => item._id);

      if (selectedItems.length < itemCount) {
        throw new Error(
          `Not enough rate-type practice items for this topic. Found ${selectedItems.length}, need ${itemCount}.`
        );
      }
    } else {
      // Fallback: Get user's skill level for fair item selection
      const userSkills = await ctx.db
        .query("practiceUserSkills")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const avgElo =
        userSkills.length > 0
          ? userSkills.reduce((sum, s) => sum + s.rating, 0) / userSkills.length
          : 1500;

      // Get only rate type items (Bad/Almost/Good format)
      const allItems = await ctx.db
        .query("practiceItems")
        .withIndex("by_status", (q) => q.eq("status", "live"))
        .collect();

      // Filter to only rate type items that have a prompt
      const rateItems = allItems.filter(
        (item) => item.type === "rate" && item.params?.prompt
      );

      const suitableItems = rateItems
        .map((item) => ({
          item,
          eloDiff: Math.abs(item.elo - avgElo),
        }))
        .filter(({ eloDiff }) => eloDiff < 300) // Increased range for rate items
        .sort((a, b) => a.eloDiff - b.eloDiff)
        .slice(0, Math.min(itemCount * 3, 30));

      const shuffled = suitableItems.sort(() => Math.random() - 0.5);
      selectedItems = shuffled.slice(0, itemCount).map(({ item }) => item._id);

      if (selectedItems.length < itemCount) {
        // If not enough within ELO range, just get any rate items
        const fallbackItems = rateItems.sort(() => Math.random() - 0.5);
        selectedItems = fallbackItems
          .slice(0, itemCount)
          .map((item) => item._id);

        if (selectedItems.length < itemCount) {
          throw new Error(
            `Not enough rate-type practice items available. Found ${rateItems.length}, need ${itemCount}.`
          );
        }
      }
    }

    // Create room
    const roomId = await ctx.db.insert("practiceDuels", {
      hostId: userId,
      participants: [userId],
      itemIds: selectedItems,
      status: "lobby",
      scores: {},
      startedAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      minPlayers: args.minPlayers || 2,
      maxPlayers: args.maxPlayers || 10,
      readyPlayers: [],
      trackId: args.trackId,
    });

    await upsertDuelMember(ctx, roomId, userId, "lobby");

    return { roomId, itemIds: selectedItems };
  },
});

// Join a room
export const joinRoom = mutation({
  args: {
    userId: v.id("users"),
    roomId: v.id("practiceDuels"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (room.status !== "lobby") {
      throw new Error("Room is not accepting players");
    }

    if (room.participants.includes(args.userId)) {
      return { success: true, message: "Already in room" };
    }

    if (room.participants.length >= room.maxPlayers) {
      throw new Error("Room is full");
    }

    await ctx.db.patch(args.roomId, {
      participants: [...room.participants, args.userId],
    });

    await upsertDuelMember(ctx, args.roomId, args.userId, room.status);

    return { success: true };
  },
});

// Leave a room
export const leaveRoom = mutation({
  args: {
    userId: v.id("users"),
    roomId: v.id("practiceDuels"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (room.status !== "lobby") {
      throw new Error("Cannot leave after game started");
    }

    const newParticipants = room.participants.filter((p) => p !== args.userId);
    const newReadyPlayers = room.readyPlayers.filter((p) => p !== args.userId);

    // If host leaves and others remain, assign new host
    let newHostId = room.hostId;
    if (room.hostId === args.userId && newParticipants.length > 0) {
      newHostId = newParticipants[0];
    }

    // If no one left, delete room
    if (newParticipants.length === 0) {
      await ctx.db.delete(args.roomId);
      await removeAllDuelMembers(ctx, args.roomId);
      return { success: true, roomDeleted: true };
    }

    await ctx.db.patch(args.roomId, {
      hostId: newHostId,
      participants: newParticipants,
      readyPlayers: newReadyPlayers,
    });

    await removeDuelMember(ctx, args.roomId, args.userId);

    return { success: true };
  },
});

// Kick a player (host only)
export const kickPlayer = mutation({
  args: {
    hostId: v.id("users"),
    roomId: v.id("practiceDuels"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (room.hostId !== args.hostId) {
      throw new Error("Only host can kick players");
    }

    if (room.status !== "lobby") {
      throw new Error("Cannot kick after game started");
    }

    if (args.playerId === args.hostId) {
      throw new Error("Host cannot kick themselves");
    }

    const newParticipants = room.participants.filter(
      (p) => p !== args.playerId
    );
    const newReadyPlayers = room.readyPlayers.filter(
      (p) => p !== args.playerId
    );

    await ctx.db.patch(args.roomId, {
      participants: newParticipants,
      readyPlayers: newReadyPlayers,
    });

    await removeDuelMember(ctx, args.roomId, args.playerId);

    return { success: true };
  },
});

// Mark player as ready
export const markReady = mutation({
  args: {
    userId: v.id("users"),
    roomId: v.id("practiceDuels"),
    ready: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (room.status !== "lobby") {
      throw new Error("Room is not in lobby");
    }

    if (!room.participants.includes(args.userId)) {
      throw new Error("Not a participant");
    }

    let newReadyPlayers = [...room.readyPlayers];

    if (args.ready) {
      if (!newReadyPlayers.includes(args.userId)) {
        newReadyPlayers.push(args.userId);
      }
    } else {
      newReadyPlayers = newReadyPlayers.filter((p) => p !== args.userId);
    }

    await ctx.db.patch(args.roomId, {
      readyPlayers: newReadyPlayers,
    });

    // Check if enough players ready to start
    const updatedRoom = await ctx.db.get(args.roomId);
    if (!updatedRoom) return { success: true };

    const readyCount = updatedRoom.readyPlayers.length;
    const totalPlayers = updatedRoom.participants.length;

    if (readyCount >= updatedRoom.minPlayers && readyCount === totalPlayers) {
      // Start the game!
      await ctx.db.patch(args.roomId, {
        status: "active",
        startedAt: Date.now(),
      });
      await updateDuelMemberStatuses(ctx, args.roomId, "active");
    }

    return { success: true };
  },
});

// Force start (host only)
export const forceStart = mutation({
  args: {
    hostId: v.id("users"),
    roomId: v.id("practiceDuels"),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (room.hostId !== args.hostId) {
      throw new Error("Only host can force start");
    }

    if (room.status !== "lobby") {
      throw new Error("Room is not in lobby");
    }

    if (room.participants.length < room.minPlayers) {
      throw new Error(`Need at least ${room.minPlayers} players to start`);
    }

    await ctx.db.patch(args.roomId, {
      status: "active",
      startedAt: Date.now(),
    });

    await updateDuelMemberStatuses(ctx, args.roomId, "active");

    return { success: true };
  },
});

// Submit attempt
export const submitAttempt = mutation({
  args: {
    userId: v.id("users"),
    roomId: v.id("practiceDuels"),
    itemId: v.id("practiceItems"),
    response: v.any(),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    if (!room.participants.includes(args.userId)) {
      throw new Error("Not a participant");
    }

    if (!room.itemIds.includes(args.itemId)) {
      throw new Error("Item not part of this room");
    }

    // Check if already attempted
    const existing = await ctx.db
      .query("practiceDuelAttempts")
      .withIndex("by_duel", (q) => q.eq("duelId", args.roomId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("itemId"), args.itemId)
        )
      )
      .first();

    if (existing) {
      throw new Error("Item already attempted");
    }

    // Record attempt
    await ctx.db.insert("practiceDuelAttempts", {
      duelId: args.roomId,
      userId: args.userId,
      itemId: args.itemId,
      response: args.response,
      score: args.score,
      correct: args.correct,
      timeMs: args.timeMs,
      completedAt: Date.now(),
    });

    // Update player's total score
    const userAttempts = await ctx.db
      .query("practiceDuelAttempts")
      .withIndex("by_duel", (q) => q.eq("duelId", args.roomId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const totalScore = userAttempts.reduce((sum, a) => sum + a.score, 0);

    // Update scores object
    const newScores = { ...room.scores, [args.userId]: totalScore };
    await ctx.db.patch(args.roomId, {
      scores: newScores,
    });

    // Check if all players completed
    const allAttempts = await ctx.db
      .query("practiceDuelAttempts")
      .withIndex("by_duel", (q) => q.eq("duelId", args.roomId))
      .collect();

    const completedPlayers = new Set(
      allAttempts
        .filter((a) => {
          const playerAttempts = allAttempts.filter(
            (pa) => pa.userId === a.userId
          );
          return playerAttempts.length === room.itemIds.length;
        })
        .map((a) => a.userId)
    );

    if (completedPlayers.size === room.participants.length) {
      // Calculate rankings
      const rankings = await Promise.all(
        room.participants.map(async (userId) => {
          const attempts = allAttempts.filter((a) => a.userId === userId);
          const score = attempts.reduce((sum, a) => sum + a.score, 0);
          const correct = attempts.filter((a) => a.correct).length;
          const avgTimeMs =
            attempts.length > 0
              ? attempts.reduce((sum, a) => sum + a.timeMs, 0) / attempts.length
              : 0;

          return {
            userId,
            score,
            correct,
            avgTimeMs,
            rank: 0, // Will be set after sorting
          };
        })
      );

      // Sort by score (desc), then by avgTime (asc)
      rankings.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.avgTimeMs - b.avgTimeMs;
      });

      // Assign ranks
      rankings.forEach((r, i) => {
        r.rank = i + 1;
      });

      await ctx.db.patch(args.roomId, {
        status: "completed",
        completedAt: Date.now(),
        rankings,
      });
      await updateDuelMemberStatuses(ctx, args.roomId, "completed");
    }

    return { success: true, totalScore };
  },
});

// Get room details
export const getRoomDetails = query({
  args: { roomId: v.id("practiceDuels") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const attempts = await ctx.db
      .query("practiceDuelAttempts")
      .withIndex("by_duel", (q) => q.eq("duelId", args.roomId))
      .collect();

    const items = await Promise.all(room.itemIds.map((id) => ctx.db.get(id)));

    const participants = await Promise.all(
      room.participants.map((id) => ctx.db.get(id))
    );

    return {
      room,
      attempts,
      items: items.filter((i) => i !== null),
      participants: participants.filter((p) => p !== null),
    };
  },
});

// Get user's rooms
export const getUserRooms = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membershipQuery = args.status
      ? ctx.db
          .query("practiceDuelMembers")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", args.userId).eq("status", args.status!)
          )
      : ctx.db
          .query("practiceDuelMembers")
          .withIndex("by_user", (q) => q.eq("userId", args.userId));

    const memberships = await membershipQuery.collect();
    const rooms = (
      await Promise.all(memberships.map((member) => ctx.db.get(member.duelId)))
    ).filter((room): room is Doc<"practiceDuels"> => room !== null);

    return rooms
      .filter(
        (room) =>
          room.participants &&
          room.participants.includes(args.userId) &&
          (!args.status || room.status === args.status)
      )
      .sort((a, b) => b.startedAt - a.startedAt);
  },
});

// Get open rooms
export const getOpenRooms = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const rooms = await ctx.db
      .query("practiceDuels")
      .withIndex("by_status", (q) => q.eq("status", "lobby"))
      .order("desc")
      .take(limit * 2); // Get more to filter

    // Filter rooms that aren't full
    return rooms
      .filter((r) => r.participants && r.participants.length < r.maxPlayers)
      .slice(0, limit);
  },
});

// Get room stats
export const getRoomStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("practiceDuelMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const rooms = (
      await Promise.all(memberships.map((member) => ctx.db.get(member.duelId)))
    ).filter((room): room is Doc<"practiceDuels"> => room !== null);

    const userRooms = rooms.filter(
      (room) => room.participants && room.participants.includes(args.userId)
    );

    const completedRooms = userRooms.filter((r) => r.status === "completed");

    // Count wins (1st place)
    const wins = completedRooms.filter(
      (r) =>
        r.rankings &&
        r.rankings.length > 0 &&
        r.rankings[0].userId === args.userId
    ).length;

    // Count podium finishes (top 3)
    const podiums = completedRooms.filter(
      (r) =>
        r.rankings &&
        r.rankings.slice(0, 3).some((rank) => rank.userId === args.userId)
    ).length;

    return {
      totalRooms: userRooms.length,
      completedRooms: completedRooms.length,
      activeRooms: userRooms.filter((r) => r.status === "active").length,
      wins,
      podiums,
      winRate:
        completedRooms.length > 0
          ? Math.round((wins / completedRooms.length) * 100)
          : 0,
    };
  },
});

// Legacy compatibility - keep old function names
export const createDuel = createRoom;
export const acceptDuel = joinRoom;
export const getDuelDetails = getRoomDetails;
export const getUserDuels = getUserRooms;
export const getOpenDuels = getOpenRooms;
export const getDuelStats = getRoomStats;
export const submitDuelAttempt = submitAttempt;

async function upsertDuelMember(
  ctx: MutationCtx,
  duelId: Id<"practiceDuels">,
  userId: Id<"users">,
  status: string
) {
  const existing = await ctx.db
    .query("practiceDuelMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("duelId"), duelId))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      status,
      updatedAt: Date.now(),
    });
    return;
  }

  await ctx.db.insert("practiceDuelMembers", {
    duelId,
    userId,
    status,
    joinedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

async function removeDuelMember(
  ctx: MutationCtx,
  duelId: Id<"practiceDuels">,
  userId: Id<"users">
) {
  const existing = await ctx.db
    .query("practiceDuelMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("duelId"), duelId))
    .first();

  if (existing) {
    await ctx.db.delete(existing._id);
  }
}

async function removeAllDuelMembers(
  ctx: MutationCtx,
  duelId: Id<"practiceDuels">
) {
  const members = await ctx.db
    .query("practiceDuelMembers")
    .withIndex("by_duel", (q) => q.eq("duelId", duelId))
    .collect();

  for (const member of members) {
    await ctx.db.delete(member._id);
  }
}

async function updateDuelMemberStatuses(
  ctx: MutationCtx,
  duelId: Id<"practiceDuels">,
  status: string
) {
  const members = await ctx.db
    .query("practiceDuelMembers")
    .withIndex("by_duel", (q) => q.eq("duelId", duelId))
    .collect();

  for (const member of members) {
    await ctx.db.patch(member._id, {
      status,
      updatedAt: Date.now(),
    });
  }
}
