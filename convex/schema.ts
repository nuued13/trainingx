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
    isAnonymous: v.optional(v.boolean()),
    // Custom field.
    favoriteColor: v.optional(v.string()),
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
    preferences: v.optional(v.object({
      difficulty: v.string(),
      interests: v.array(v.string()),
      notifications: v.boolean()
    }))
  }).index("by_user", ["userId"]),

  // Projects and exercises (generic)
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.string(),
    category: v.string(),
    estimatedHours: v.number(),
    tags: v.array(v.string()),
    authorId: v.id("users"),
    isPublished: v.boolean(),
    steps: v.array(v.object({
      title: v.string(),
      content: v.string(),
      codeExample: v.optional(v.string()),
      resources: v.array(v.string()),
      order: v.number()
    })),
    requirements: v.array(v.string()),
    learningObjectives: v.array(v.string())
  }).index("by_category", ["category"]).index("by_difficulty", ["difficulty"]),

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
    stepDetails: v.array(v.object({
      type: v.string(),
      question: v.string(),
      options: v.array(v.object({
        quality: v.string(),
        text: v.string(),
        explanation: v.string()
      }))
    })),
    buildsSkills: v.array(v.string()),
    description: v.string(),
    isAssessment: v.boolean(),
    requiresCompletion: v.optional(v.array(v.string())),
    examplePrompts: v.optional(v.array(v.object({
      quality: v.string(),
      prompt: v.string(),
      explanation: v.string()
    })))
  }).index("by_slug", ["slug"])
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
    timeSpent: v.number()
  }).index("by_user", ["userId"]).index("by_project", ["projectId"]),

  // Assessments and quizzes
  assessments: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),
    category: v.string(),
    difficulty: v.string(),
    timeLimit: v.optional(v.number()),
    passingScore: v.number(),
    questions: v.array(v.object({
      id: v.string(),
      question: v.string(),
      type: v.string(),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.union(v.string(), v.number(), v.array(v.string())),
      explanation: v.optional(v.string()),
      points: v.number()
    })),
    tags: v.array(v.string()),
    isActive: v.boolean()
  }).index("by_category", ["category"]).index("by_type", ["type"]),
// Assessment Questions (age-branched)
assessment_questions: defineTable({
id: v.number(),
ageGroup: v.string(),
question: v.string(),
options: v.array(v.object({
text: v.string(),
skill: v.string(),
weight: v.number()
}))
}),  // Assessment attempts and results
  assessmentAttempts: defineTable({
    userId: v.id("users"),
    assessmentId: v.id("assessments"),
    answers: v.array(v.object({
      questionId: v.string(),
      answer: v.any(),
      isCorrect: v.boolean(),
      points: v.number()
    })),
    score: v.number(),
    totalPoints: v.number(),
    percentage: v.number(),
    passed: v.boolean(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    timeSpent: v.number(),
    feedback: v.optional(v.string())
  }).index("by_user", ["userId"]).index("by_assessment", ["assessmentId"]),

  // AI-powered career matching
  careerMatches: defineTable({
    userId: v.id("users"),
    matches: v.array(v.object({
      careerTitle: v.string(),
      matchScore: v.number(),
      keySkills: v.array(v.string()),
      salaryRange: v.optional(v.string()),
      growthPotential: v.string(),
      reasons: v.array(v.string())
    })),
    skillGapAnalysis: v.array(v.object({
      skill: v.string(),
      currentLevel: v.string(),
      targetLevel: v.string(),
      importance: v.string()
    })),
    recommendedProjects: v.array(v.id("projects")),
    recommendedLearningPath: v.array(v.string()),
    generatedAt: v.number(),
    aiModel: v.string()
  }).index("by_user", ["userId"]),

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
    updatedAt: v.number()
  }).index("by_creator", ["creatorId"]).index("public", ["isPublic"]),

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
    isPinned: v.boolean(),
    isLocked: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_category", ["category"]).index("by_author", ["authorId"]).index("latest", ["createdAt"]),

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
    updatedAt: v.number()
  }).index("by_post", ["postId"]).index("by_author", ["authorId"]),

  // Real-time chat and support
  chatSessions: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    sessionType: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    lastActivityAt: v.number()
  }).index("by_user", ["userId"]).index("active", ["isActive"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    messageType: v.string(),
    isFromAI: v.boolean(),
    metadata: v.optional(v.object({
      confidence: v.optional(v.number()),
      sources: v.optional(v.array(v.string())),
      relatedProjects: v.optional(v.array(v.id("projects")))
    })),
    createdAt: v.number()
  }).index("by_session", ["sessionId"]).index("by_time", ["createdAt"]),

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
    metadata: v.optional(v.object({
      projectName: v.optional(v.string()),
      assessmentName: v.optional(v.string()),
      score: v.optional(v.number())
    }))
  }).index("by_user", ["userId"]).index("by_verification", ["verificationCode"]),

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
    createdAt: v.number()
  }).index("by_category", ["category"]).index("by_difficulty", ["difficulty"]),

  // User enrollments in learning paths
  enrollments: defineTable({
    userId: v.id("users"),
    learningPathId: v.id("learningPaths"),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
    progress: v.number(),
    currentProject: v.optional(v.id("projects")),
    status: v.string()
  }).index("by_user", ["userId"]).index("by_path", ["learningPathId"]),

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
    uploadedAt: v.number()
  }).index("by_uploader", ["uploadedById"]).index("by_category", ["category"]),

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
    previousSkills: v.optional(v.object({
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
    })),
    badges: v.optional(v.array(v.string())),
    completedProjects: v.optional(v.array(v.object({
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
    }))),
    assessmentHistory: v.optional(v.array(v.object({
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
    }))),
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
  }).index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  // Quiz results storage
  quizResults: defineTable({
    userId: v.id("users"),
    quizType: v.string(), // 'matching', 'lite_assessment', 'ai_readiness'
    answers: v.any(),
    results: v.any(),
    completedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_type", ["quizType"])
    .index("by_user_type", ["userId", "quizType"]),

  // ===== PHASE 1: NEW NORMALIZED SCHEMA (FEATURE FLAGGED) =====
  
  // Practice Tracks (replaces category grouping)
  practiceTracks: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    level: v.number(),
    icon: v.optional(v.string()),
    order: v.number(),
    tags: v.array(v.string()),
    status: v.string(), // "draft" | "live" | "archived"
  })
    .index("by_slug", ["slug"])
    .index("by_level", ["level"])
    .index("by_status", ["status"]),

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
      modelHints: v.optional(v.object({ 
        provider: v.string(), 
        model: v.string() 
      })),
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
    templateId: v.id("practiceItemTemplates"),
    scenarioId: v.optional(v.id("practiceScenarios")),
    params: v.any(),
    version: v.string(),
    elo: v.number(),
    eloDeviation: v.number(),
    difficultyBand: v.string(), // "foundation" | "core" | "challenge"
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.string(), // "live" | "retired" | "experimental"
  })
    .index("by_template", ["templateId"])
    .index("by_scenario", ["scenarioId"])
    .index("by_status", ["status"])
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
    rubricScores: v.optional(v.object({ 
      clarity: v.number(), 
      constraints: v.number(), 
      iteration: v.number(), 
      tool: v.number() 
    })),
    score: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
    feedback: v.optional(v.string()),
    aiFeedback: v.optional(v.object({ 
      summary: v.string(), 
      suggestions: v.array(v.string()) 
    })),
    metadata: v.optional(v.object({ 
      mode: v.string(), 
      difficultyBand: v.string() 
    })),
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
  })
    .index("by_user", ["userId"]),

  // Daily Drills & Streaks
  practiceStreaks: defineTable({
    userId: v.id("users"),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastPracticeDate: v.number(),
    repairTokens: v.number(),
    totalDrillsCompleted: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

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
    items: v.array(v.object({
      itemId: v.id("practiceItems"),
      response: v.any(),
      correct: v.boolean(),
      timeMs: v.number(),
    })),
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
  })
    .index("by_user", ["userId"]),

  // AI Evaluation Logs (for cost tracking and debugging)
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

  // Feature Flags
  featureFlags: defineTable({
    key: v.string(),
    enabled: v.boolean(),
    description: v.string(),
    updatedAt: v.number(),
    updatedBy: v.id("users"),
  })
    .index("by_key", ["key"]),

  // ===== PHASE 3: CREATOR STUDIO & ENGAGEMENT =====

  // Creator Drafts (UGC content in progress)
  creatorDrafts: defineTable({
    creatorId: v.id("users"),
    type: v.string(), // "project" | "item" | "scenario"
    title: v.string(),
    description: v.string(),
    content: v.any(), // Draft content structure
    sourceId: v.optional(v.union(
      v.id("practiceProjects"),
      v.id("practiceItems"),
      v.id("practiceScenarios")
    )), // For remixes
    status: v.string(), // "draft" | "pending" | "calibrating" | "published" | "rejected" | "archived"
    validationErrors: v.optional(v.array(v.object({
      field: v.string(),
      message: v.string(),
      severity: v.string(), // "error" | "warning"
    }))),
    metadata: v.object({
      skills: v.array(v.string()),
      difficulty: v.optional(v.string()),
      estimatedTime: v.optional(v.number()),
      tags: v.array(v.string()),
    }),
    generationConfig: v.optional(v.object({
      difficulty: v.string(),
      topics: v.array(v.string()),
      questionCount: v.number(),
      style: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      aiModel: v.string(),
      generatedAt: v.number(),
    })),
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
    scores: v.object({}), // Map of userId -> score (stored as strings)
    rankings: v.optional(v.array(v.object({
      userId: v.id("users"),
      score: v.number(),
      rank: v.number(),
      correct: v.number(),
      avgTimeMs: v.number(),
    }))),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
    // Room settings
    minPlayers: v.number(),
    maxPlayers: v.number(),
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
    wager: v.optional(v.object({
      type: v.string(),
      amount: v.number(),
    })),
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
    requirements: v.array(v.object({
      type: v.string(), // "complete_items" | "win_duels" | "earn_score" | "practice_skill"
      target: v.any(),
      progress: v.number(),
      goal: v.number(),
    })),
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
    progress: v.array(v.object({
      requirementIndex: v.number(),
      current: v.number(),
      goal: v.number(),
      completed: v.boolean(),
    })),
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
      leaderboardPrizes: v.array(v.object({
        rank: v.number(),
        reward: v.string(),
      })),
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
    rewards: v.optional(v.object({
      referrerXp: v.number(),
      referredXp: v.number(),
      unlocks: v.array(v.string()),
    })),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_code", ["referralCode"])
    .index("by_status", ["status"]),

  // ===== ASSESSMENT SESSION FLOW =====
  
  // Assessment Sessions (captures user assessment completion with digital thumbprint)
  assessmentSessions: defineTable({
    userId: v.optional(v.string()), // Optional for anonymous users
    answers: v.array(v.any()), // Raw answer data from assessment
    digitalThumbprint: v.object({
      skills: v.array(v.string()), // List of identified skills
      weights: v.record(v.string(), v.number()), // Skill -> weight/score mapping
    }),
    sessionToken: v.string(), // Unique identifier for tracking (for anonymous users)
    completedAt: v.number(),
    createdAt: v.number(),
    seenPathwayIds: v.array(v.string()), // Track which pathways user has seen
  })
    .index("by_user", ["userId"])
    .index("by_token", ["sessionToken"])
    .index("by_completed", ["completedAt"]),

  // Success Pathways (career/learning paths matched to user skills)
  successPathways: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // One of 4 main categories
    difficulty: v.string(), // "beginner" | "intermediate" | "advanced"
    requiredSkills: v.array(v.string()), // Skills needed for this pathway
    skillWeights: v.record(v.string(), v.number()), // Importance of each skill
    sections: v.object({
      overview: v.string(),
      whyThisPath: v.string(),
      skillsYouHave: v.array(v.string()),
      skillsToLearn: v.array(v.string()),
      nextSteps: v.array(v.string()),
      resources: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
        type: v.string(), // "course" | "article" | "video" | "tool"
      }))),
    }),
    estimatedTimeMonths: v.number(), // How long to complete this pathway
    salaryRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
      currency: v.string(),
    })),
    demandLevel: v.string(), // "high" | "medium" | "low"
    tags: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_active", ["isActive"]),
});
