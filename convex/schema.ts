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

  // Assessment attempts and results
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
    communityActivity: v.object({
      postsCreated: v.number(),
      upvotesReceived: v.number(),
      downvotesReceived: v.number(),
      helpfulAnswers: v.number(),
      communityScore: v.number(),
    }),
  }).index("by_user", ["userId"]),

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
    .index("by_user_type", ["userId", "quizType"])
});
