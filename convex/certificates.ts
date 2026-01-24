import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import certificateRules from "../data/certificate-rules.json";

export const checkAndIssueCertificates = mutation({
  args: {
    userId: v.id("users"),
    promptScore: v.number(),
    completedProjects: v.number(),
    assessmentComplete: v.boolean(),
  },
  handler: async (ctx, { userId, promptScore, completedProjects, assessmentComplete }) => {
    const existingCertificates = await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const issuedIds = new Set(existingCertificates.map(c => c.type));

    for (const rule of certificateRules) {
      if (issuedIds.has(rule.id)) continue;

      const meetsPS = promptScore >= rule.requiredPS;
      const meetsProjects = completedProjects >= rule.requiredProjects;
      const meetsAssessment = !rule.requiredAssessment || assessmentComplete;

      if (meetsPS && meetsProjects && meetsAssessment) {
        const verificationCode = `${rule.id}-${userId}-${Date.now()}`;
        const certificateUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://trainingx.ai"}/certificates/${verificationCode}`;

        await ctx.db.insert("certificates", {
          userId,
          title: rule.name,
          description: rule.description,
          type: rule.id,
          issuedBy: "TrainingX.ai",
          issueDate: Date.now(),
          certificateUrl,
          verificationCode,
          metadata: {
            score: promptScore,
          },
        });
      }
    }
  },
});

export const getUserCertificates = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getCertificateByCode = query({
  args: { verificationCode: v.string() },
  handler: async (ctx, { verificationCode }) => {
    return await ctx.db
      .query("certificates")
      .withIndex("by_verification", (q) => q.eq("verificationCode", verificationCode))
      .first();
  },
});
