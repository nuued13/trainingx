import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ===== QUERIES =====

// Get all certificates for a user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const certificates = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Enrich with domain info
    const enriched = await Promise.all(
      certificates.map(async (cert) => {
        const domain = await ctx.db.get(cert.domainId);
        // Fetch current user name to ensure it's up to date
        const user = await ctx.db.get(cert.userId);
        return {
          ...cert,
          userName: user?.name ?? cert.userName,
          domain: domain
            ? {
                title: domain.title,
                icon: domain.icon,
                slug: domain.slug,
              }
            : null,
        };
      })
    );

    return enriched.sort((a, b) => b.issuedAt - a.issuedAt);
  },
});

// Get certificate by certificate ID (public verification)
export const verify = query({
  args: { certificateId: v.string() },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_certificate_id", (q) =>
        q.eq("certificateId", args.certificateId)
      )
      .first();

    if (!certificate) {
      return { valid: false, message: "Certificate not found" };
    }

    // Get domain info
    const domain = await ctx.db.get(certificate.domainId);

    return {
      valid: true,
      certificate: {
        userName: certificate.userName,
        certificateId: certificate.certificateId,
        domainTitle: domain?.title || "AI Career Readiness",
        domainIcon: domain?.icon,
        score: certificate.score,
        issuedAt: certificate.issuedAt,
        // NOT showing: userId, email, or private info
      },
    };
  },
});

// Get user's AI Career Readiness Certificate (General AI Skills domain)
export const getAICareerCertificate = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Find General AI Skills domain
    const generalDomain = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", "general-ai-skills"))
      .first();

    if (!generalDomain) return null;

    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("domainId"), generalDomain._id))
      .first();

    if (!certificate) return null;

    // Get current user name to ensure it's up to date
    const user = await ctx.db.get(args.userId);

    return {
      ...certificate,
      userName: user?.name ?? certificate.userName,
      domain: {
        title: generalDomain.title,
        icon: generalDomain.icon,
        slug: generalDomain.slug,
      },
    } as any;
  },
});

// Get certificate for a specific domain
export const getByDomain = query({
  args: {
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("domainId"), args.domainId))
      .first();

    return certificate;
  },
});

// Check if user is eligible for AI Career Readiness Certificate
export const checkEligibility = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Find General AI Skills domain
    const generalDomain = await ctx.db
      .query("practiceDomains")
      .withIndex("by_slug", (q) => q.eq("slug", "general-ai-skills"))
      .first();

    if (!generalDomain) {
      return { eligible: false, reason: "Domain not found" };
    }

    // Check if user already has certificate
    const existingCert = await ctx.db
      .query("domainCertificates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("domainId"), generalDomain._id))
      .first();

    if (existingCert) {
      return {
        eligible: false,
        reason: "Already certified",
        certificateId: existingCert.certificateId,
      };
    }

    // Check track completion (all 8 tracks)
    const tracks = await ctx.db
      .query("practiceTracks")
      .withIndex("by_domain", (q) => q.eq("domainId", generalDomain._id))
      .filter((q) => q.eq(q.field("status"), "live"))
      .collect();

    const trackProgress = await Promise.all(
      tracks.map(async (track) => {
        const progress = await ctx.db
          .query("userTrackProgress")
          .withIndex("by_user_track", (q) =>
            q.eq("userId", args.userId).eq("trackId", track._id)
          )
          .first();
        return {
          trackId: track._id,
          trackTitle: track.title,
          completed: progress?.progress === 100,
        };
      })
    );

    const incompleteTracks = trackProgress.filter((t) => !t.completed);

    if (incompleteTracks.length > 0) {
      return {
        eligible: false,
        reason: `Complete ${incompleteTracks.length} more track(s)`,
        incompleteTracks: incompleteTracks.map((t) => t.trackTitle),
        totalTracks: tracks.length,
        completedTracks: tracks.length - incompleteTracks.length,
      };
    }

    // Check assessment passed
    const assessment = await ctx.db
      .query("domainAssessments")
      .withIndex("by_domain", (q) => q.eq("domainId", generalDomain._id))
      .filter((q) => q.eq(q.field("status"), "live"))
      .first();

    if (!assessment) {
      return { eligible: false, reason: "Assessment not available yet" };
    }

    const attempts = await ctx.db
      .query("domainAssessmentAttempts")
      .withIndex("by_user_assessment", (q) =>
        q.eq("userId", args.userId).eq("assessmentId", assessment._id)
      )
      .collect();

    const passed = attempts.some((a) => a.passed);

    if (!passed) {
      return {
        eligible: false,
        reason: "Pass the domain assessment",
        assessmentId: assessment._id,
      };
    }

    return { eligible: true };
  },
});

// ===== MUTATIONS =====

// Update certificate PDF URL (after PDF generation)
export const updatePdfUrl = mutation({
  args: {
    certificateId: v.string(),
    pdfUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const certificate = await ctx.db
      .query("domainCertificates")
      .withIndex("by_certificate_id", (q) =>
        q.eq("certificateId", args.certificateId)
      )
      .first();

    if (!certificate) {
      throw new Error("Certificate not found");
    }

    await ctx.db.patch(certificate._id, {
      pdfUrl: args.pdfUrl,
    });

    return { success: true };
  },
});
