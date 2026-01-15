import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    needsProfileCompletion: v.optional(v.boolean()),
    isAnonymous: v.optional(v.boolean()),
    // Custom field.
    favoriteColor: v.optional(v.string()),
    customImageId: v.optional(v.id("_storage")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  messages: defineTable({
    userId: v.id("users"),
    body: v.string(),
  }),

  // Enhanced user profiles extending auth
  profiles: defineTable({
    userId: v.id("users"),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    currentLevel: v.number(),
    totalExperience: v.number(),
    learningGoals: v.array(v.string()),
    preferences: v.optional(
      v.object({
        difficulty: v.string(),
        interests: v.array(v.string()),
        notifications: v.boolean(),
      })
    ),
  }).index("by_user", ["userId"]),

  // Projects and exercises (generic)
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.string(),
    difficultyLevel: v.optional(v.number()), // 1-5 scale for "Flames"
    category: v.string(),
    estimatedHours: v.number(),
    tags: v.array(v.string()),
    techStack: v.optional(v.array(v.string())),
    xpReward: v.optional(v.number()),
    slug: v.optional(v.string()), // Made optional to avoid breaking existing without migration, but we should make it required for new ones.
    imageUrl: v.optional(v.string()),
    authorId: v.id("users"),
    isPublished: v.boolean(),
    steps: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
        codeExample: v.optional(v.string()),
        resources: v.array(v.string()),
        order: v.number(),
      })
    ),
    requirements: v.array(v.string()),
    learningObjectives: v.array(v.string()),
    starterPrompt: v.optional(v.string()), // Basic prompt to get started
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"]),

  // Practice Zone projects (from projects-seed.json)
  practiceProjects: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    level: v.number(),
    levelOrder: v.number(),
    estTime: v.string(),
    difficulty: v.number(),
    badge: v.string(),
    steps: v.number(),
    stepDetails: v.array(
      v.object({
        type: v.string(),
        question: v.string(),
        options: v.array(
          v.object({
            quality: v.string(),
            text: v.string(),
            explanation: v.string(),
          })
        ),
      })
    ),
    buildsSkills: v.array(v.string()),
    description: v.string(),
    isAssessment: v.boolean(),
    requiresCompletion: v.optional(v.array(v.string())),
    examplePrompts: v.optional(
      v.array(
        v.object({
          quality: v.string(),
          prompt: v.string(),
          explanation: v.string(),
        })
      )
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_level", ["level"])
    .index("by_category", ["category"]),

  // User progress tracking
  userProgress: defineTable({
    userId: v.id("users"),
    projectId: v.optional(v.id("projects")),
    assessmentId: v.optional(v.id("assessments")),
    status: v.string(),
    progress: v.number(),
    currentStep: v.optional(v.number()),
    score: v.optional(v.number()),
    startedAt: v.number(),
    lastAccessedAt: v.number(),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    timeSpent: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"]),

  // Assessments and quizzes
  assessments: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),
    category: v.string(),
    difficulty: v.string(),
    timeLimit: v.optional(v.number()),
    passingScore: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        type: v.string(),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.union(v.string(), v.number(), v.array(v.string())),
        explanation: v.optional(v.string()),
        points: v.number(),
      })
    ),
    tags: v.array(v.string()),
    isActive: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_type", ["type"]),

  // Assessment attempts and results
  assessmentAttempts: defineTable({
    userId: v.id("users"),
    assessmentId: v.id("assessments"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        answer: v.any(),
        isCorrect: v.boolean(),
        points: v.number(),
      })
    ),
    score: v.number(),
    totalPoints: v.number(),
    percentage: v.number(),
    passed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    timeSpent: v.number(),
    feedback: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_assessment", ["assessmentId"]),

  // AI-powered career matching
  careerMatches: defineTable({
    userId: v.id("users"),
    matches: v.array(
      v.object({
        careerTitle: v.string(),
        matchScore: v.number(),
        keySkills: v.array(v.string()),
        salaryRange: v.optional(v.string()),
        growthPotential: v.string(),
        reasons: v.array(v.string()),
      })
    ),
    skillGapAnalysis: v.array(
      v.object({
        skill: v.string(),
        currentLevel: v.string(),
        targetLevel: v.string(),
        importance: v.string(),
      })
    ),
    recommendedProjects: v.array(v.id("projects")),
    recommendedLearningPath: v.array(v.string()),
    generatedAt: v.number(),
    aiModel: v.string(),
  }).index("by_user", ["userId"]),

  // New AI Matching Results (for the new quiz flow)
  aiMatchingResults: defineTable({
    userId: v.id("users"),
    opportunities: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        type: v.string(),
        location: v.string(),
        salaryRange: v.string(),
        employmentType: v.string(),
        seniority: v.string(),
        description: v.string(),
        impactHighlights: v.array(v.string()),
        keyTechnologies: v.array(v.string()),
        requiredSkills: v.array(v.string()),
        whyPerfectMatch: v.string(),
        nextSteps: v.string(),
        remotePolicy: v.string(),
        promptScoreMin: v.number(),
        skillThresholds: v.any(),
      })
    ),
    skillSuggestions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          category: v.string(),
          why: v.string(),
        })
      )
    ),
    quizAnswers: v.any(),
    generatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Opportunity Roadmaps (Learning paths for specific AI matches)
  opportunityRoadmaps: defineTable({
    userId: v.id("users"),
    opportunityId: v.string(), // The opportunity.id from aiMatchingResults
    goalTitle: v.string(),
    estimatedTime: v.string(),
    hoursPerWeek: v.number(),
    phases: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        duration: v.string(),
        description: v.optional(v.string()),
        status: v.string(), // "current" | "locked" | "completed"
        steps: v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            type: v.string(), // "track" | "project" | "external" | "milestone"
            description: v.optional(v.string()),
            link: v.optional(v.string()),
            estimatedHours: v.number(),
            skillsGained: v.optional(v.array(v.string())),
            isRequired: v.boolean(),
            isCompleted: v.optional(v.boolean()),
          })
        ),
        milestones: v.array(v.string()),
      })
    ),
    nextAction: v.object({
      title: v.string(),
      link: v.optional(v.string()),
      cta: v.string(),
    }),
    generatedAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_opportunity", ["opportunityId"])
    .index("by_user_opportunity", ["userId", "opportunityId"]),

  // User feedback with rewards/gamification
  feedback: defineTable({
    userId: v.id("users"),
    sentiment: v.string(), // "love" | "happy" | "meh" | "sad" | "angry"
    score: v.optional(v.number()), // 0-10 slider
    tags: v.array(v.string()),
    message: v.optional(v.string()),
    contactOk: v.boolean(),
    contactEmail: v.optional(v.string()),
    page: v.optional(v.string()),
    feature: v.optional(v.string()),
    env: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        viewport: v.optional(v.string()),
      })
    ),
    reward: v.object({
      xp: v.number(),
      badgeAwarded: v.optional(v.string()),
    }),
    status: v.string(), // "new" | "reviewed"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // Custom AI assistants (GPTs)
  customAssistants: defineTable({
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    creatorId: v.id("users"),
    isPublic: v.boolean(),
    category: v.string(),
    usageCount: v.number(),
    averageRating: v.number(),
    totalRatings: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("public", ["isPublic"]),

  // Community posts and discussions
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    category: v.string(),
    tags: v.array(v.string()),
    upvotes: v.number(),
    downvotes: v.number(),
    viewCount: v.number(),
    replyCount: v.number(),
    bookmarks: v.optional(v.number()),
    isPinned: v.boolean(),
    isLocked: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Media attachments (images or videos)
    media: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          url: v.string(),
          type: v.union(v.literal("image"), v.literal("video")),
          name: v.optional(v.string()),
          sizeMb: v.optional(v.number()),
          duration: v.optional(v.number()), // For videos, duration in seconds
        })
      )
    ),
    // Moderation status
    moderationStatus: v.optional(v.string()), // "pending" | "approved" | "rejected"
    moderationId: v.optional(v.id("moderationQueue")),
  })
    .index("by_category", ["category"])
    .index("by_author", ["authorId"])
    .index("latest", ["createdAt"]),

  // Comments and replies
  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    upvotes: v.number(),
    downvotes: v.number(),
    isEdited: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  // Real-time chat and support
  chatSessions: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    sessionType: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("active", ["isActive"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    messageType: v.string(),
    isFromAI: v.boolean(),
    metadata: v.optional(
      v.object({
        confidence: v.optional(v.number()),
        sources: v.optional(v.array(v.string())),
        relatedProjects: v.optional(v.array(v.id("projects"))),
      })
    ),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_time", ["createdAt"]),

  // Certificates and achievements
  certificates: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    type: v.string(),
    issuedBy: v.string(),
    issueDate: v.number(),
    expiryDate: v.optional(v.number()),
    certificateUrl: v.string(),
    verificationCode: v.string(),
    metadata: v.optional(
      v.object({
        projectName: v.optional(v.string()),
        assessmentName: v.optional(v.string()),
        score: v.optional(v.number()),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_verification", ["verificationCode"]),

  // Learning paths and recommendations
  learningPaths: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    difficulty: v.string(),
    estimatedDuration: v.number(),
    prerequisites: v.array(v.string()),
    projectIds: v.array(v.id("projects")),
    assessmentIds: v.array(v.id("assessments")),
    outcomes: v.array(v.string()),
    isActive: v.boolean(),
    enrollmentCount: v.number(),
    rating: v.number(),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"]),

  // User enrollments in learning paths
  enrollments: defineTable({
    userId: v.id("users"),
    learningPathId: v.id("learningPaths"),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
    progress: v.number(),
    currentProject: v.optional(v.id("projects")),
    status: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_path", ["learningPathId"]),

  // File storage and assets
  files: defineTable({
    uploadedById: v.id("users"),
    filename: v.string(),
    originalName: v.string(),
    mimeType: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    category: v.string(),
    isPublic: v.boolean(),
    uploadedAt: v.number(),
  })
    .index("by_uploader", ["uploadedById"])
    .index("by_category", ["category"]),

  // User statistics and progress tracking
  userStats: defineTable({
    userId: v.id("users"),
    promptScore: v.number(),
    previousPromptScore: v.number(),
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
    previousSkills: v.optional(
      v.object({
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
      })
    ),
    badges: v.optional(v.array(v.string())),
    completedProjects: v.optional(
      v.array(
        v.object({
          slug: v.string(),
          completedAt: v.string(),
          finalScore: v.number(),
          rubric: v.object({
            clarity: v.number(),
            constraints: v.number(),
            iteration: v.number(),
            tool: v.number(),
          }),
          badgeEarned: v.boolean(),
          skillsGained: v.array(v.string()),
        })
      )
    ),
    assessmentHistory: v.optional(
      v.array(
        v.object({
          date: v.string(),
          promptScore: v.number(),
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
          rubric: v.object({
            clarity: v.number(),
            constraints: v.number(),
            iteration: v.number(),
            tool: v.number(),
          }),
        })
      )
    ),
    streak: v.number(),
    lastActiveDate: v.number(),
    assessmentComplete: v.boolean(),
    unlockedCareers: v.optional(v.array(v.string())),
    weeklyPracticeMinutes: v.optional(v.number()),
    communityScore: v.optional(v.number()),
    totalScore: v.optional(v.number()),
    communityActivity: v.object({
      postsCreated: v.number(),
      upvotesReceived: v.number(),
      downvotesReceived: v.number(),
      helpfulAnswers: v.number(),
      communityScore: v.number(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_totalScore", ["totalScore"])
    .index("by_promptScore", ["promptScore"])
    .index("by_communityScore", ["communityScore"]),

  // Post votes tracking for community
  postVotes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    voteType: v.union(v.literal("up"), v.literal("down")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // User bookmarks for posts
  userBookmarks: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // Quiz results storage
  quizResults: defineTable({
    userId: v.id("users"),
    quizType: v.string(), // 'matching', 'lite_assessment', 'ai_readiness'
    answers: v.any(),
    results: v.any(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["quizType"])
    .index("by_user_type", ["userId", "quizType"]),

  // ===== PHASE 1: NEW NORMALIZED SCHEMA (FEATURE FLAGGED) =====

  // Custom Domain Requests (The "Fabrication" process)
  customDomainRequests: defineTable({
    userId: v.id("users"),
    manifesto: v.string(),
    status: v.string(), // "queued" | "researching" | "generating" | "completed" | "failed"
    progress: v.number(),
    logs: v.array(v.string()),
    domainId: v.optional(v.id("practiceDomains")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Practice Domains (Top-level categories)
  practiceDomains: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    order: v.number(),
    trackCount: v.number(),
    isStarter: v.boolean(), // True for "General AI Skills"
    status: v.string(), // "draft" | "live" | "archived"
    // Custom Domain Fields
    createdBy: v.optional(v.id("users")),
    isUserGenerated: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_order", ["order"])
    .index("by_status", ["status"]),

  // Practice Tracks (replaces category grouping)
  practiceTracks: defineTable({
    domainId: v.id("practiceDomains"),
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    order: v.number(),
    levelCount: v.number(),
    totalChallenges: v.number(),
    estimatedHours: v.number(),
    difficulty: v.string(), // "beginner" | "intermediate" | "advanced"
    prerequisites: v.array(v.string()), // Track slugs
    tags: v.array(v.string()),
    status: v.string(), // "draft" | "live" | "archived"
    // Custom Domain Fields
    createdBy: v.optional(v.id("users")),
    isUserGenerated: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_domain", ["domainId"])
    .index("by_status", ["status"]),

  // Practice Levels (Difficulty tiers within tracks)
  practiceLevels: defineTable({
    trackId: v.id("practiceTracks"),
    levelNumber: v.number(),
    title: v.string(),
    description: v.string(),
    challengeCount: v.number(),
    estimatedMinutes: v.number(),
    requiredScore: v.number(), // % needed to unlock next level
    difficultyRange: v.object({
      min: v.number(),
      max: v.number(),
    }),
    status: v.string(), // "draft" | "live" | "archived"
    // Custom Domain Fields
    createdBy: v.optional(v.id("users")),
    isUserGenerated: v.optional(v.boolean()),
  })
    .index("by_track", ["trackId"])
    .index("by_track_level", ["trackId", "levelNumber"]),

  // User Track Progress
  userTrackProgress: defineTable({
    userId: v.id("users"),
    trackId: v.id("practiceTracks"),
    currentLevel: v.number(),
    completedLevels: v.array(v.number()),
    totalChallengesCompleted: v.number(),
    totalChallenges: v.number(),
    percentComplete: v.number(),
    score: v.optional(v.number()), // NEW: Average score 0-100
    stars: v.optional(v.number()), // NEW: 0-3 stars earned
    bestScore: v.optional(v.number()), // NEW: Highest score achieved
    attempts: v.optional(v.number()), // NEW: Number of attempts
    startedAt: v.number(),
    lastAccessedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_track", ["trackId"])
    .index("by_user_track", ["userId", "trackId"]),

  // User Level Progress
  userLevelProgress: defineTable({
    userId: v.id("users"),
    levelId: v.id("practiceLevels"),
    challengesCompleted: v.number(),
    completedChallengeIds: v.optional(v.array(v.string())), // Store actual completed challenge IDs
    totalChallenges: v.number(),
    percentComplete: v.number(),
    averageScore: v.number(),
    stars: v.optional(v.number()), // NEW: 0-3 stars earned
    attempts: v.optional(v.number()), // NEW: Number of attempts
    status: v.string(), // "locked" | "in_progress" | "completed"
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_level", ["levelId"])
    .index("by_user_level", ["userId", "levelId"]),

  // User Domain Unlocks
  userDomainUnlocks: defineTable({
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
    unlockedAt: v.number(),
    unlockedBy: v.string(), // "completed_level_1" | "admin_override"
  })
    .index("by_user", ["userId"])
    .index("by_domain", ["domainId"])
    .index("by_user_domain", ["userId", "domainId"]),

  // Practice Scenarios (reusable context shells)
  practiceScenarios: defineTable({
    trackId: v.id("practiceTracks"),
    slug: v.string(),
    title: v.string(),
    narrative: v.string(),
    variables: v.object({
      industry: v.optional(v.string()),
      audience: v.optional(v.string()),
      goal: v.optional(v.string()),
      hooks: v.optional(v.array(v.string())),
    }),
    difficultyHint: v.optional(v.number()),
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.string(), // "draft" | "live" | "retired"
  })
    .index("by_slug", ["slug"])
    .index("by_track", ["trackId"])
    .index("by_status", ["status"]),

  // Practice Item Templates (for parametric content generation)
  practiceItemTemplates: defineTable({
    type: v.string(), // "multiple-choice" | "prompt-draft" | "prompt-surgery" | "tool-selection"
    title: v.string(),
    description: v.string(),
    schema: v.any(), // JSON schema of params
    rubric: v.object({
      rubricId: v.string(),
      weights: v.any(),
      maxScore: v.number(),
    }),
    aiEvaluation: v.object({
      enabled: v.boolean(),
      modelHints: v.optional(
        v.object({
          provider: v.string(),
          model: v.string(),
        })
      ),
    }),
    recommendedTime: v.number(),
    skills: v.array(v.string()),
    authorId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    status: v.string(), // "draft" | "live" | "deprecated"
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Practice Items (calibrated question instances)
  practiceItems: defineTable({
    levelId: v.optional(v.id("practiceLevels")), // For curated challenges
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    type: v.string(), // "rate" | "choose" | "fix" | "spot" | "improve" | "before_after"
    category: v.string(), // For filtering
    params: v.any(),
    version: v.string(),
    elo: v.number(),
    eloDeviation: v.number(),
    difficultyBand: v.string(), // "foundation" | "core" | "challenge"
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.string(), // "live" | "retired" | "experimental"
    // Custom Domain Fields
    isUserGenerated: v.optional(v.boolean()),
    generationRequestId: v.optional(v.id("customDomainRequests")),
  })
    .index("by_level", ["levelId"])
    .index("by_template", ["templateId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficultyBand"]),

  // Practice Activities (project step definitions)
  practiceActivities: defineTable({
    projectId: v.id("practiceProjects"),
    order: v.number(),
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    params: v.any(),
    required: v.boolean(),
    timeEstimate: v.number(),
    difficultyOverride: v.optional(v.number()),
    skills: v.array(v.string()),
    version: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_template", ["templateId"]),

  // Practice Attempts (learner responses with AI feedback)
  practiceAttempts: defineTable({
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    projectId: v.optional(v.id("practiceProjects")),
    response: v.any(),
    rubricScores: v.optional(
      v.object({
        clarity: v.number(),
        constraints: v.number(),
        iteration: v.number(),
        tool: v.number(),
      })
    ),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
    feedback: v.optional(v.string()),
    aiFeedback: v.optional(
      v.object({
        summary: v.string(),
        suggestions: v.array(v.string()),
      })
    ),
    metadata: v.optional(
      v.object({
        mode: v.string(),
        difficultyBand: v.string(),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_item", ["itemId"])
    .index("by_project", ["projectId"]),

  // Practice User Skills (Elo-based skill ratings)
  practiceUserSkills: defineTable({
    userId: v.id("users"),
    skillId: v.string(),
    rating: v.number(), // Elo value
    deviation: v.number(), // measurement error
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_skill", ["skillId"])
    .index("by_user_skill", ["userId", "skillId"]),

  // Practice Zone Progress (for static-file based questions - Beginner/Intermediate/Pro tracks)
  practiceZoneProgress: defineTable({
    userId: v.id("users"),
    difficulty: v.string(), // "beginner" | "intermediate" | "pro"
    track: v.string(), // "clarity" | "context" | "constraints" | "output_format" | "iteration" | "evaluation"
    completedQuestionIds: v.array(v.string()), // ["B-CL-001", "B-CL-002", ...]
    scores: v.any(), // { "B-CL-001": 100, "B-CL-002": 75, ... }
    totalScore: v.number(),
    correctAnswers: v.number(),
    bestStreak: v.number(),
    attempts: v.number(),
    lastPlayedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_difficulty_track", ["userId", "difficulty", "track"]),

  // Practice Review Deck (spaced repetition)
  practiceReviewDeck: defineTable({
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    dueAt: v.number(),
    stability: v.number(),
    difficulty: v.number(),
    lapseCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_due", ["dueAt"])
    .index("by_user_due", ["userId", "dueAt"]),

  // Practice User Preferences
  practiceUserPreferences: defineTable({
    userId: v.id("users"),
    interests: v.array(v.string()),
    goals: v.array(v.string()),
    timeBudget: v.string(), // "short" | "standard" | "deep"
    challengeMode: v.boolean(),
    notifications: v.optional(v.boolean()),
    coachNotes: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Daily Drills & Streaks
  practiceStreaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastPracticeDate: v.number(),
    repairTokens: v.number(),
    totalDrillsCompleted: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  practiceDailyDrills: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    itemIds: v.array(v.id("practiceItems")),
    completedItemIds: v.array(v.id("practiceItems")),
    status: v.string(), // "pending" | "in_progress" | "completed"
    completedAt: v.optional(v.number()),
    timeSpentMs: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"]),

  // Placement Test
  placementTests: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        itemId: v.id("practiceItems"),
        response: v.any(),
        correct: v.boolean(),
        timeMs: v.number(),
      })
    ),
    initialSkillRatings: v.object({
      generative_ai: v.number(),
      agentic_ai: v.number(),
      synthetic_ai: v.number(),
      communication: v.number(),
      logic: v.number(),
      planning: v.number(),
      analysis: v.number(),
      creativity: v.number(),
      collaboration: v.number(),
    }),
    recommendedTrack: v.string(),
    completedAt: v.number(),
  }).index("by_user", ["userId"]),

  // AI Evaluation Logs (for cost tracking and debugging)
  // DEPRECATED: Use aiLogs instead for new features
  aiEvaluationLogs: defineTable({
    attemptId: v.id("practiceAttempts"),
    provider: v.string(), // "openai" | "anthropic"
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_attempt", ["attemptId"])
    .index("by_provider", ["provider"])
    .index("by_date", ["createdAt"]),

  // Centralized AI Logs (for ALL AI calls across the platform)
  aiLogs: defineTable({
    // What feature made this call
    feature: v.string(), // "evaluation", "career_coach", "creator_studio", "custom_gpt", "matching"

    // Provider info
    provider: v.string(), // "openai" | "anthropic"
    model: v.string(),

    // Token usage
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),

    // Cost and performance
    cost: v.number(),
    latencyMs: v.number(),

    // Status
    success: v.boolean(),
    errorMessage: v.optional(v.string()),

    // Context (optional)
    userId: v.optional(v.id("users")),
    attemptId: v.optional(v.id("practiceAttempts")),
    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_feature", ["feature", "createdAt"])
    .index("by_provider", ["provider", "createdAt"])
    .index("by_user", ["userId", "createdAt"])
    .index("by_date", ["createdAt"])
    .index("by_success", ["success", "createdAt"]),

  // Feature Flags
  featureFlags: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    description: v.string(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  }).index("by_key", ["key"]),

  // ===== PHASE 3: CREATOR STUDIO & ENGAGEMENT =====

  // Creator Drafts (UGC content in progress)
  creatorDrafts: defineTable({
    creatorId: v.id("users"),
    type: v.string(), // "project" | "item" | "scenario"
    title: v.string(),
    description: v.string(),
    content: v.any(), // Draft content structure
    sourceId: v.optional(
      v.union(
        v.id("practiceProjects"),
        v.id("practiceItems"),
        v.id("practiceScenarios")
      )
    ), // For remixes
    status: v.string(), // "draft" | "pending" | "calibrating" | "published" | "rejected" | "archived"
    validationErrors: v.optional(
      v.array(
        v.object({
          field: v.string(),
          message: v.string(),
          severity: v.string(), // "error" | "warning"
        })
      )
    ),
    metadata: v.object({
      skills: v.array(v.string()),
      difficulty: v.optional(v.string()),
      estimatedTime: v.optional(v.number()),
      tags: v.array(v.string()),
    }),
    generationConfig: v.optional(
      v.object({
        difficulty: v.string(),
        topics: v.array(v.string()),
        questionCount: v.number(),
        style: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
        aiModel: v.string(),
        generatedAt: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    submittedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_creator_status", ["creatorId", "status"]),

  // Calibration Runs (testing UGC before public release)
  practiceCalibrationRuns: defineTable({
    draftId: v.id("creatorDrafts"),
    itemId: v.optional(v.id("practiceItems")),
    userId: v.id("users"),
    response: v.any(),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
    completedAt: v.number(),
    feedback: v.optional(v.string()),
  })
    .index("by_draft", ["draftId"])
    .index("by_item", ["itemId"])
    .index("by_user", ["userId"]),

  // Moderation Flags
  practiceModerationFlags: defineTable({
    contentId: v.union(
      v.id("creatorDrafts"),
      v.id("practiceItems"),
      v.id("practiceProjects")
    ),
    contentType: v.string(), // "draft" | "item" | "project"
    reporterId: v.id("users"),
    reason: v.string(),
    description: v.string(),
    status: v.string(), // "pending" | "reviewing" | "resolved" | "dismissed"
    resolution: v.optional(v.string()),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_content", ["contentId"])
    .index("by_reporter", ["reporterId"]),

  // Creator Profiles
  creatorProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    bio: v.optional(v.string()),
    stats: v.object({
      publishedItems: v.number(),
      totalPlays: v.number(),
      averageRating: v.number(),
      remixCount: v.number(),
      adoptionRate: v.number(), // % of published items that get played
    }),
    badges: v.array(v.string()),
    level: v.number(),
    experience: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_level", ["level"]),

  // Duels (multi-player competitive rooms)
  practiceDuels: defineTable({
    hostId: v.id("users"), // Room creator
    participants: v.array(v.id("users")), // All players in room
    itemIds: v.array(v.id("practiceItems")),
    status: v.string(), // "lobby" | "open" | "active" | "completed" | "expired"
    scores: v.any(), // Map of userId -> score (dynamic keys)
    rankings: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          score: v.number(),
          rank: v.number(),
          correct: v.number(),
          avgTimeMs: v.number(),
        })
      )
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
    // Room settings
    minPlayers: v.number(),
    maxPlayers: v.number(),
    // Topic selection
    trackId: v.optional(v.id("practiceTracks")),
    trackSlug: v.optional(v.string()),
    questions: v.optional(v.array(v.any())), // Store full question content local-first
    // Ready system
    readyPlayers: v.array(v.id("users")),
    // Legacy fields for backward compatibility
    challengerId: v.optional(v.id("users")),
    opponentId: v.optional(v.id("users")),
    challengerScore: v.optional(v.number()),
    opponentScore: v.optional(v.number()),
    winnerId: v.optional(v.id("users")),
    challengerReady: v.optional(v.boolean()),
    opponentReady: v.optional(v.boolean()),
    wager: v.optional(
      v.object({
        type: v.string(),
        amount: v.number(),
      })
    ),
  })
    .index("by_host", ["hostId"])
    .index("by_status", ["status"])
    // Legacy indexes
    .index("by_challenger", ["challengerId"])
    .index("by_opponent", ["opponentId"]),

  practiceDuelMembers: defineTable({
    duelId: v.id("practiceDuels"),
    userId: v.id("users"),
    status: v.string(),
    joinedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_duel", ["duelId"])
    .index("by_user_status", ["userId", "status"]),

  // Duel Attempts (individual item completions in duels)
  practiceDuelAttempts: defineTable({
    duelId: v.id("practiceDuels"),
    userId: v.id("users"),
    itemId: v.id("practiceItems"),
    response: v.any(),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
    completedAt: v.number(),
  })
    .index("by_duel", ["duelId"])
    .index("by_user", ["userId"]),

  // Quests (weekly challenges)
  practiceQuests: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(), // "daily" | "weekly" | "seasonal"
    requirements: v.array(
      v.object({
        type: v.string(), // "complete_items" | "win_duels" | "earn_score" | "practice_skill"
        target: v.any(),
        progress: v.number(),
        goal: v.number(),
      })
    ),
    rewards: v.object({
      xp: v.number(),
      badges: v.array(v.string()),
      unlocks: v.optional(v.array(v.string())),
    }),
    startDate: v.number(),
    endDate: v.number(),
    status: v.string(), // "active" | "completed" | "expired"
    participantCount: v.number(),
    completionCount: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_dates", ["startDate", "endDate"]),

  // User Quest Progress
  practiceUserQuests: defineTable({
    userId: v.id("users"),
    questId: v.id("practiceQuests"),
    progress: v.array(
      v.object({
        requirementIndex: v.number(),
        current: v.number(),
        goal: v.number(),
        completed: v.boolean(),
      })
    ),
    status: v.string(), // "in_progress" | "completed" | "claimed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    claimedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_quest", ["questId"])
    .index("by_user_quest", ["userId", "questId"])
    .index("by_status", ["status"]),

  // Seasons (themed content periods)
  practiceSeasons: defineTable({
    seasonNumber: v.number(),
    title: v.string(),
    description: v.string(),
    theme: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    rewards: v.object({
      badges: v.array(v.string()),
      exclusiveContent: v.array(v.string()),
      leaderboardPrizes: v.array(
        v.object({
          rank: v.number(),
          reward: v.string(),
        })
      ),
    }),
    questIds: v.array(v.id("practiceQuests")),
    status: v.string(), // "upcoming" | "active" | "completed"
    participantCount: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_season_number", ["seasonNumber"]),

  // Share Cards (social sharing)
  practiceShareCards: defineTable({
    userId: v.id("users"),
    type: v.string(), // "achievement" | "duel_win" | "quest_complete" | "skill_milestone"
    title: v.string(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    stats: v.any(), // Relevant stats to display
    shareUrl: v.string(),
    viewCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // Referrals
  practiceReferrals: defineTable({
    referrerId: v.id("users"),
    referredUserId: v.optional(v.id("users")),
    referralCode: v.string(),
    status: v.string(), // "pending" | "completed" | "rewarded"
    rewards: v.optional(
      v.object({
        referrerXp: v.number(),
        referredXp: v.number(),
        unlocks: v.array(v.string()),
      })
    ),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"]),

  // ===== DOMAIN MASTERY ASSESSMENTS =====

  // Assessment definitions (one per domain)
  domainAssessments: defineTable({
    domainId: v.id("practiceDomains"),
    title: v.string(),
    description: v.string(),
    timeLimit: v.number(), // in minutes
    passingScore: v.number(), // percentage (e.g., 70)
    questionCount: v.number(), // total questions (15)
    maxAttempts: v.number(), // max retries
    cooldownHours: v.number(), // hours between retries
    status: v.string(), // "draft" | "live"
  })
    .index("by_domain", ["domainId"])
    .index("by_status", ["status"]),

  // Questions for assessments
  domainAssessmentQuestions: defineTable({
    assessmentId: v.id("domainAssessments"),
    type: v.string(), // "mcq" | "multi-select" | "prompt-write" | "prompt-fix" | "image-prompt"
    order: v.number(),
    scenario: v.optional(v.string()), // Context/scenario text
    question: v.string(), // The actual question
    options: v.optional(
      v.array(
        v.object({
          id: v.string(),
          text: v.string(),
          isCorrect: v.boolean(),
        })
      )
    ),
    promptGoal: v.optional(v.string()), // For prompt writing questions
    promptRubric: v.optional(
      v.object({
        // For AI grading
        criteria: v.array(
          v.object({
            name: v.string(),
            weight: v.number(),
            description: v.string(),
          })
        ),
      })
    ),
    idealAnswer: v.optional(v.string()), // Reference answer for AI comparison
    points: v.number(),
    difficulty: v.string(), // "easy" | "medium" | "hard"
    tags: v.array(v.string()),
    status: v.string(), // "live" | "retired"
  })
    .index("by_assessment", ["assessmentId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // User assessment attempts
  domainAssessmentAttempts: defineTable({
    userId: v.id("users"),
    assessmentId: v.id("domainAssessments"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    timeSpent: v.number(), // in seconds
    // NEW: Store the specific questions selected for this attempt (randomized)
    questionIds: v.optional(v.array(v.id("domainAssessmentQuestions"))),
    answers: v.array(
      v.object({
        questionId: v.id("domainAssessmentQuestions"),
        response: v.any(), // varies by question type
        score: v.number(), // 0-100 for that question
        isCorrect: v.boolean(),
        aiEvaluation: v.optional(
          v.object({
            rationale: v.string(),
            rubricScores: v.any(),
          })
        ),
      })
    ),
    totalScore: v.number(), // 0-100
    passed: v.boolean(),
    attemptNumber: v.number(),
    // NEW: Anti-cheat tracking
    tabSwitchCount: v.optional(v.number()),
    flaggedForReview: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_assessment", ["assessmentId"])
    .index("by_user_assessment", ["userId", "assessmentId"]),

  // Certificates issued on passing - AI Career Readiness Certificate
  domainCertificates: defineTable({
    userId: v.id("users"),
    domainId: v.id("practiceDomains"),
    assessmentAttemptId: v.id("domainAssessmentAttempts"),
    score: v.number(),
    issuedAt: v.number(),
    // New fields for AI Career Readiness Certificate
    certificateId: v.string(), // TX-AI-YEAR-XXXXX format
    userName: v.string(), // Locked-in name at time of issuance
    pdfUrl: v.optional(v.string()), // Stored PDF URL
    // Legacy field - kept for backwards compatibility
    verificationCode: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_domain", ["domainId"])
    .index("by_certificate_id", ["certificateId"])
    .index("by_verification", ["verificationCode"]),

  // Counter for sequential certificate IDs
  certificateCounters: defineTable({
    year: v.number(),
    lastNumber: v.number(),
  }).index("by_year", ["year"]),

  // ===== AI CAREER COACH =====

  // Career Coach Conversations
  careerCoachConversations: defineTable({
    userId: v.id("users"),
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        opportunities: v.optional(
          v.array(
            v.object({
              id: v.string(),
              title: v.string(),
              type: v.string(),
              description: v.string(),
              incomeData: v.object({
                range: v.string(),
                entryLevel: v.string(),
                experienced: v.string(),
                topEarners: v.string(),
              }),
              whyMatch: v.string(),
              keySkillsMatched: v.array(v.string()),
              nextSteps: v.array(v.string()),
            })
          )
        ),
        extractedSkills: v.optional(v.array(v.string())),
        roadmap: v.optional(v.any()), // Roadmap structure from AI SDK
        timestamp: v.number(),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ===== COMMUNITY CONTENT MODERATION =====

  // Content moderation queue for manual review
  moderationQueue: defineTable({
    contentType: v.string(), // "post" | "comment"
    contentId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    authorId: v.id("users"),

    // Content snapshot for review
    text: v.string(),
    mediaStorageIds: v.optional(v.array(v.id("_storage"))),

    // Moderation results
    textModerationResult: v.optional(
      v.object({
        approved: v.boolean(),
        categories: v.array(v.string()), // ["harassment", "hate", "violence", etc.]
        scores: v.any(), // Raw scores from GPT
        reasoning: v.optional(v.string()),
      })
    ),
    mediaModerationResult: v.optional(
      v.object({
        approved: v.boolean(),
        flaggedMedia: v.array(
          v.object({
            storageId: v.id("_storage"),
            reason: v.string(),
            score: v.number(),
          })
        ),
      })
    ),

    // Status
    status: v.string(), // "pending" | "approved" | "rejected" | "manual_review"
    processedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")), // If manual review
    reviewNotes: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["authorId"])
    .index("by_content", ["contentId"]),

  // Moderation audit log for compliance and analytics
  moderationAuditLog: defineTable({
    action: v.string(), // "auto_approve" | "auto_reject" | "manual_approve" | "manual_reject"
    contentType: v.string(),
    contentId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    authorId: v.id("users"),

    // What was checked
    textChecked: v.boolean(),
    mediaChecked: v.boolean(),

    // Results
    textResult: v.optional(
      v.object({
        approved: v.boolean(),
        flaggedCategories: v.array(v.string()),
        model: v.string(),
        tokensUsed: v.number(),
        latencyMs: v.number(),
      })
    ),
    mediaResult: v.optional(
      v.object({
        approved: v.boolean(),
        framesChecked: v.number(),
        flaggedFrames: v.number(),
      })
    ),

    finalDecision: v.string(), // "approved" | "rejected" | "escalated"
    reasoning: v.optional(v.string()),

    // Performance
    totalLatencyMs: v.number(),
    estimatedCost: v.number(),

    createdAt: v.number(),
  })
    .index("by_date", ["createdAt"])
    .index("by_author", ["authorId"])
    .index("by_decision", ["finalDecision"]),
});
