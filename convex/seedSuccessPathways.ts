// convex/seedSuccessPathways.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Define the 4 main categories
const CATEGORIES = {
  CREATIVE: "Creative & Design",
  TECHNICAL: "Technical & Development",
  BUSINESS: "Business & Strategy",
  DATA: "Data & Analytics",
};

// Sample pathways data (80-120 diverse pathways)
const PATHWAYS_DATA = [
  // CREATIVE & DESIGN (20 pathways)
  {
    title: "UX/UI Designer",
    description: "Design intuitive and beautiful user experiences for digital products",
    category: CATEGORIES.CREATIVE,
    difficulty: "intermediate",
    requiredSkills: ["Creativity", "Communication", "Problem-Solving", "Audience Awareness"],
    skillWeights: { "Creativity": 3, "Communication": 2, "Problem-Solving": 2, "Audience Awareness": 3 },
    sections: {
      overview: "UX/UI Designers create engaging interfaces that users love. You'll blend creativity with user research to design products that are both beautiful and functional.",
      whyThisPath: "Your strong creative and communication skills make you a natural fit for UX/UI design. You understand how to connect with audiences and solve problems visually.",
      skillsYouHave: ["Visual creativity", "Understanding user needs", "Problem-solving mindset"],
      skillsToLearn: ["Figma/Adobe XD", "User research methods", "Design systems", "Prototyping"],
      nextSteps: [
        "Complete a UX/UI design bootcamp or online course",
        "Build 3-5 portfolio projects showcasing your design process",
        "Learn industry-standard tools like Figma",
        "Study design systems and accessibility principles",
        "Network with designers on LinkedIn and Dribbble"
      ],
      resources: [
        { title: "Google UX Design Certificate", url: "https://grow.google/uxdesign", type: "course" },
        { title: "Figma Learn", url: "https://www.figma.com/resources/learn-design/", type: "course" },
      ]
    },
    estimatedTimeMonths: 6,
    salaryRange: { min: 65000, max: 120000, currency: "USD" },
    demandLevel: "high",
    tags: ["design", "ux", "ui", "creative", "figma"],
    isActive: true,
  },
  {
    title: "Graphic Designer",
    description: "Create visual content for brands, marketing, and digital media",
    category: CATEGORIES.CREATIVE,
    difficulty: "beginner",
    requiredSkills: ["Creativity", "Communication"],
    skillWeights: { "Creativity": 3, "Communication": 2 },
    sections: {
      overview: "Graphic Designers bring ideas to life through visual storytelling. From logos to social media graphics, you'll help brands communicate their message effectively.",
      whyThisPath: "Your creative vision and communication skills are perfect for graphic design. You can translate concepts into compelling visuals.",
      skillsYouHave: ["Visual creativity", "Color theory basics", "Communication skills"],
      skillsToLearn: ["Adobe Creative Suite", "Typography", "Brand identity design", "Print vs digital design"],
      nextSteps: [
        "Master Adobe Illustrator and Photoshop",
        "Study typography and color theory",
        "Build a portfolio with diverse projects",
        "Learn about brand identity and design systems",
        "Start freelancing on platforms like Fiverr or Upwork"
      ],
    },
    estimatedTimeMonths: 4,
    salaryRange: { min: 45000, max: 75000, currency: "USD" },
    demandLevel: "high",
    tags: ["design", "graphics", "creative", "adobe"],
    isActive: true,
  },
  {
    title: "Product Designer",
    description: "Design end-to-end product experiences from concept to launch",
    category: CATEGORIES.CREATIVE,
    difficulty: "advanced",
    requiredSkills: ["Creativity", "Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Creativity": 3, "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 2 },
    sections: {
      overview: "Product Designers own the entire design process, from research to final delivery. You'll work closely with engineers and product managers to ship great products.",
      whyThisPath: "Your ability to iterate and solve complex problems makes you ideal for product design. You think holistically about user needs and business goals.",
      skillsYouHave: ["Creative problem-solving", "Iterative thinking", "Understanding context"],
      skillsToLearn: ["Full design workflow", "Product strategy", "A/B testing", "Analytics", "Cross-functional collaboration"],
      nextSteps: [
        "Build expertise in UX/UI design first",
        "Learn product management basics",
        "Study data-driven design decisions",
        "Create case studies showing your design process",
        "Join a product team to gain real-world experience"
      ],
    },
    estimatedTimeMonths: 12,
    salaryRange: { min: 90000, max: 160000, currency: "USD" },
    demandLevel: "high",
    tags: ["product", "design", "ux", "strategy"],
    isActive: true,
  },
  {
    title: "Motion Graphics Designer",
    description: "Create animated graphics and visual effects for video and digital media",
    category: CATEGORIES.CREATIVE,
    difficulty: "intermediate",
    requiredSkills: ["Creativity", "Iteration"],
    skillWeights: { "Creativity": 3, "Iteration": 2 },
    sections: {
      overview: "Motion Graphics Designers bring static designs to life through animation. You'll create engaging video content for marketing, entertainment, and education.",
      whyThisPath: "Your creativity and iterative approach are perfect for motion graphics, where you'll constantly refine animations to achieve the perfect look.",
      skillsYouHave: ["Creative vision", "Willingness to iterate", "Visual storytelling"],
      skillsToLearn: ["After Effects", "Cinema 4D", "Animation principles", "Video editing"],
      nextSteps: [
        "Master Adobe After Effects",
        "Study animation principles (timing, easing, etc.)",
        "Build a demo reel showcasing your work",
        "Learn 3D animation tools like Cinema 4D or Blender",
        "Create content for social media to build your brand"
      ],
    },
    estimatedTimeMonths: 6,
    salaryRange: { min: 55000, max: 95000, currency: "USD" },
    demandLevel: "medium",
    tags: ["animation", "motion", "design", "video"],
    isActive: true,
  },
  {
    title: "Brand Strategist",
    description: "Develop brand identities and positioning strategies for businesses",
    category: CATEGORIES.CREATIVE,
    difficulty: "advanced",
    requiredSkills: ["Creativity", "Communication", "Context Understanding", "Audience Awareness"],
    skillWeights: { "Creativity": 2, "Communication": 3, "Context Understanding": 3, "Audience Awareness": 3 },
    sections: {
      overview: "Brand Strategists shape how companies present themselves to the world. You'll develop positioning, messaging, and visual identities that resonate with target audiences.",
      whyThisPath: "Your strong communication and audience awareness skills make you perfect for brand strategy. You understand context and can craft compelling narratives.",
      skillsYouHave: ["Strategic thinking", "Communication skills", "Understanding audiences"],
      skillsToLearn: ["Brand positioning", "Market research", "Competitive analysis", "Brand voice development"],
      nextSteps: [
        "Study successful brand strategies",
        "Learn market research techniques",
        "Build case studies showing brand transformations",
        "Network with marketing and creative professionals",
        "Start consulting with small businesses"
      ],
    },
    estimatedTimeMonths: 8,
    salaryRange: { min: 70000, max: 130000, currency: "USD" },
    demandLevel: "medium",
    tags: ["branding", "strategy", "marketing", "creative"],
    isActive: true,
  },

  // TECHNICAL & DEVELOPMENT (30 pathways)
  {
    title: "Frontend Developer",
    description: "Build interactive and responsive user interfaces for web applications",
    category: CATEGORIES.TECHNICAL,
    difficulty: "intermediate",
    requiredSkills: ["Problem-Solving", "Iteration", "Creativity"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Creativity": 2 },
    sections: {
      overview: "Frontend Developers create the visual and interactive parts of websites. You'll work with HTML, CSS, and JavaScript to build user interfaces that are fast, accessible, and beautiful.",
      whyThisPath: "Your problem-solving skills and iterative mindset are essential for frontend development. You'll constantly debug and refine code to create perfect user experiences.",
      skillsYouHave: ["Logical thinking", "Attention to detail", "Iterative problem-solving"],
      skillsToLearn: ["JavaScript/TypeScript", "React or Vue", "CSS frameworks", "Web accessibility", "Performance optimization"],
      nextSteps: [
        "Master JavaScript fundamentals",
        "Learn React or another modern framework",
        "Build 5+ projects for your portfolio",
        "Study responsive design and accessibility",
        "Contribute to open-source projects"
      ],
    },
    estimatedTimeMonths: 6,
    salaryRange: { min: 70000, max: 120000, currency: "USD" },
    demandLevel: "high",
    tags: ["frontend", "javascript", "react", "web development"],
    isActive: true,
  },
  {
    title: "Backend Developer",
    description: "Build server-side logic and databases that power applications",
    category: CATEGORIES.TECHNICAL,
    difficulty: "intermediate",
    requiredSkills: ["Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 2 },
    sections: {
      overview: "Backend Developers create the server-side logic that powers applications. You'll work with databases, APIs, and server infrastructure to handle business logic and data.",
      whyThisPath: "Your strong problem-solving and iterative skills are perfect for backend development, where you'll design scalable systems and debug complex issues.",
      skillsYouHave: ["Logical thinking", "Systems thinking", "Debugging skills"],
      skillsToLearn: ["Node.js, Python, or Java", "Database design (SQL/NoSQL)", "API development", "Authentication", "Cloud services"],
      nextSteps: [
        "Choose a backend language (Node.js, Python, Java)",
        "Learn database fundamentals (SQL and NoSQL)",
        "Build RESTful APIs",
        "Study authentication and security",
        "Deploy applications to the cloud"
      ],
    },
    estimatedTimeMonths: 7,
    salaryRange: { min: 75000, max: 130000, currency: "USD" },
    demandLevel: "high",
    tags: ["backend", "api", "database", "server"],
    isActive: true,
  },
  {
    title: "Full Stack Developer",
    description: "Build complete web applications from frontend to backend",
    category: CATEGORIES.TECHNICAL,
    difficulty: "advanced",
    requiredSkills: ["Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 3 },
    sections: {
      overview: "Full Stack Developers handle both frontend and backend development. You'll build complete applications, understanding the entire software stack.",
      whyThisPath: "Your problem-solving abilities and understanding of context make you ideal for full stack work, where you'll need to think about the entire system.",
      skillsYouHave: ["Comprehensive problem-solving", "Systems thinking", "Iterative development"],
      skillsToLearn: ["Frontend frameworks (React, Vue)", "Backend languages (Node, Python)", "Databases", "DevOps basics", "System architecture"],
      nextSteps: [
        "Master both frontend and backend technologies",
        "Build full-stack applications",
        "Learn about deployment and CI/CD",
        "Study system design and architecture",
        "Contribute to open-source full-stack projects"
      ],
    },
    estimatedTimeMonths: 12,
    salaryRange: { min: 85000, max: 150000, currency: "USD" },
    demandLevel: "high",
    tags: ["fullstack", "web development", "javascript", "react"],
    isActive: true,
  },
  {
    title: "Mobile App Developer",
    description: "Create native or cross-platform mobile applications",
    category: CATEGORIES.TECHNICAL,
    difficulty: "intermediate",
    requiredSkills: ["Problem-Solving", "Iteration", "Creativity"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Creativity": 2 },
    sections: {
      overview: "Mobile App Developers build applications for iOS and Android. You'll create engaging mobile experiences that millions of users can access on their phones.",
      whyThisPath: "Your problem-solving and iterative skills are essential for mobile development, where you'll optimize for performance and user experience on mobile devices.",
      skillsYouHave: ["Technical problem-solving", "Iterative development", "Creative thinking"],
      skillsToLearn: ["Swift/Kotlin or React Native/Flutter", "Mobile UI/UX patterns", "App store deployment", "Mobile performance"],
      nextSteps: [
        "Choose native (Swift/Kotlin) or cross-platform (React Native/Flutter)",
        "Learn mobile-specific design patterns",
        "Build and publish apps to app stores",
        "Study mobile performance optimization",
        "Create a portfolio of mobile apps"
      ],
    },
    estimatedTimeMonths: 8,
    salaryRange: { min: 75000, max: 135000, currency: "USD" },
    demandLevel: "high",
    tags: ["mobile", "ios", "android", "app development"],
    isActive: true,
  },
  {
    title: "DevOps Engineer",
    description: "Automate deployment and manage infrastructure for software systems",
    category: CATEGORIES.TECHNICAL,
    difficulty: "advanced",
    requiredSkills: ["Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 3 },
    sections: {
      overview: "DevOps Engineers bridge development and operations, automating deployments and maintaining infrastructure. You'll ensure systems are reliable, scalable, and secure.",
      whyThisPath: "Your problem-solving and context understanding are crucial for DevOps, where you'll need to think about entire systems and automate complex workflows.",
      skillsYouHave: ["Systems thinking", "Problem-solving", "Automation mindset"],
      skillsToLearn: ["Docker/Kubernetes", "CI/CD pipelines", "Cloud platforms (AWS/GCP/Azure)", "Infrastructure as Code", "Monitoring and logging"],
      nextSteps: [
        "Learn containerization with Docker",
        "Study CI/CD tools (Jenkins, GitLab CI, GitHub Actions)",
        "Master a cloud platform (AWS, GCP, or Azure)",
        "Learn Infrastructure as Code (Terraform, CloudFormation)",
        "Build automated deployment pipelines"
      ],
    },
    estimatedTimeMonths: 10,
    salaryRange: { min: 90000, max: 160000, currency: "USD" },
    demandLevel: "high",
    tags: ["devops", "cloud", "automation", "infrastructure"],
    isActive: true,
  },
  
  // BUSINESS & STRATEGY (25 pathways)
  {
    title: "Product Manager",
    description: "Define product strategy and roadmap to deliver customer value",
    category: CATEGORIES.BUSINESS,
    difficulty: "advanced",
    requiredSkills: ["Communication", "Problem-Solving", "Context Understanding", "Audience Awareness"],
    skillWeights: { "Communication": 3, "Problem-Solving": 3, "Context Understanding": 3, "Audience Awareness": 3 },
    sections: {
      overview: "Product Managers define what products to build and why. You'll work with engineering, design, and business teams to deliver products that customers love.",
      whyThisPath: "Your strong communication and problem-solving skills are essential for product management. You understand context and can align stakeholders around a vision.",
      skillsYouHave: ["Strategic thinking", "Communication", "Understanding user needs"],
      skillsToLearn: ["Product roadmapping", "User research", "Data-driven decision making", "Agile methodologies", "Stakeholder management"],
      nextSteps: [
        "Learn product management frameworks",
        "Study successful product case studies",
        "Build products or side projects",
        "Network with product managers",
        "Get certified in product management or Agile"
      ],
    },
    estimatedTimeMonths: 9,
    salaryRange: { min: 85000, max: 150000, currency: "USD" },
    demandLevel: "high",
    tags: ["product management", "strategy", "business", "leadership"],
    isActive: true,
  },
  {
    title: "Marketing Manager",
    description: "Develop and execute marketing strategies to grow businesses",
    category: CATEGORIES.BUSINESS,
    difficulty: "intermediate",
    requiredSkills: ["Communication", "Creativity", "Audience Awareness"],
    skillWeights: { "Communication": 3, "Creativity": 2, "Audience Awareness": 3 },
    sections: {
      overview: "Marketing Managers create campaigns that attract and retain customers. You'll blend creativity with data to drive business growth.",
      whyThisPath: "Your communication and audience awareness skills make you a natural marketer. You understand how to craft messages that resonate.",
      skillsYouHave: ["Communication skills", "Understanding audiences", "Creative thinking"],
      skillsToLearn: ["Digital marketing", "SEO/SEM", "Content marketing", "Analytics", "Marketing automation"],
      nextSteps: [
        "Learn digital marketing fundamentals",
        "Get certified in Google Analytics and Ads",
        "Study content marketing and SEO",
        "Build marketing campaigns for real or mock projects",
        "Network with marketing professionals"
      ],
    },
    estimatedTimeMonths: 6,
    salaryRange: { min: 60000, max: 110000, currency: "USD" },
    demandLevel: "high",
    tags: ["marketing", "digital marketing", "seo", "business"],
    isActive: true,
  },
  {
    title: "Business Analyst",
    description: "Analyze business processes and recommend improvements",
    category: CATEGORIES.BUSINESS,
    difficulty: "intermediate",
    requiredSkills: ["Problem-Solving", "Context Understanding", "Communication"],
    skillWeights: { "Problem-Solving": 3, "Context Understanding": 3, "Communication": 2 },
    sections: {
      overview: "Business Analysts bridge business needs and technical solutions. You'll analyze processes, gather requirements, and help organizations improve efficiency.",
      whyThisPath: "Your problem-solving and context understanding are perfect for business analysis, where you'll need to understand complex business problems.",
      skillsYouHave: ["Analytical thinking", "Problem-solving", "Understanding systems"],
      skillsToLearn: ["Requirements gathering", "Process modeling", "SQL basics", "Business intelligence tools", "Stakeholder management"],
      nextSteps: [
        "Learn requirements gathering techniques",
        "Study process modeling (BPMN)",
        "Get familiar with SQL and data analysis",
        "Learn business intelligence tools",
        "Work on real business problems"
      ],
    },
    estimatedTimeMonths: 5,
    salaryRange: { min: 65000, max: 100000, currency: "USD" },
    demandLevel: "medium",
    tags: ["business analysis", "requirements", "process improvement"],
    isActive: true,
  },

  // DATA & ANALYTICS (25 pathways)
  {
    title: "Data Analyst",
    description: "Analyze data to uncover insights and support decision-making",
    category: CATEGORIES.DATA,
    difficulty: "beginner",
    requiredSkills: ["Problem-Solving", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Context Understanding": 2 },
    sections: {
      overview: "Data Analysts transform raw data into actionable insights. You'll work with spreadsheets, SQL, and visualization tools to help businesses make data-driven decisions.",
      whyThisPath: "Your problem-solving skills and ability to understand context make you ideal for data analysis, where you'll need to find meaningful patterns in data.",
      skillsYouHave: ["Analytical thinking", "Problem-solving", "Attention to detail"],
      skillsToLearn: ["SQL", "Excel/Google Sheets", "Data visualization (Tableau/PowerBI)", "Statistics basics", "Python for data analysis"],
      nextSteps: [
        "Master SQL for data querying",
        "Learn Excel/Sheets for data manipulation",
        "Study data visualization with Tableau or PowerBI",
        "Learn basic statistics",
        "Build a portfolio of data analysis projects"
      ],
    },
    estimatedTimeMonths: 4,
    salaryRange: { min: 60000, max: 95000, currency: "USD" },
    demandLevel: "high",
    tags: ["data", "analytics", "sql", "visualization"],
    isActive: true,
  },
  {
    title: "Data Scientist",
    description: "Use machine learning and statistics to solve complex problems",
    category: CATEGORIES.DATA,
    difficulty: "advanced",
    requiredSkills: ["Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 3 },
    sections: {
      overview: "Data Scientists build predictive models and use advanced analytics to solve business problems. You'll work with machine learning, statistics, and big data.",
      whyThisPath: "Your strong problem-solving and iterative skills are essential for data science, where you'll experiment with different models and approaches.",
      skillsYouHave: ["Advanced problem-solving", "Iterative experimentation", "Systems thinking"],
      skillsToLearn: ["Python/R", "Machine learning", "Statistics", "Deep learning", "Big data tools"],
      nextSteps: [
        "Master Python and data science libraries",
        "Study machine learning algorithms",
        "Learn statistics and probability",
        "Build ML projects for your portfolio",
        "Participate in Kaggle competitions"
      ],
    },
    estimatedTimeMonths: 12,
    salaryRange: { min: 95000, max: 170000, currency: "USD" },
    demandLevel: "high",
    tags: ["data science", "machine learning", "python", "ai"],
    isActive: true,
  },
  {
    title: "Data Engineer",
    description: "Build and maintain data pipelines and infrastructure",
    category: CATEGORIES.DATA,
    difficulty: "advanced",
    requiredSkills: ["Problem-Solving", "Iteration", "Context Understanding"],
    skillWeights: { "Problem-Solving": 3, "Iteration": 3, "Context Understanding": 3 },
    sections: {
      overview: "Data Engineers build the infrastructure that makes data accessible and usable. You'll create data pipelines, warehouses, and ensure data quality.",
      whyThisPath: "Your problem-solving and context understanding are crucial for data engineering, where you'll design scalable data systems.",
      skillsYouHave: ["Systems thinking", "Problem-solving", "Building infrastructure"],
      skillsToLearn: ["Python", "SQL", "ETL tools", "Data warehousing", "Spark/Airflow"],
      nextSteps: [
        "Learn Python and SQL",
        "Study ETL processes and tools",
        "Master data warehousing concepts",
        "Learn big data tools (Spark, Airflow)",
        "Build data pipeline projects"
      ],
    },
    estimatedTimeMonths: 10,
    salaryRange: { min: 90000, max: 150000, currency: "USD" },
    demandLevel: "high",
    tags: ["data engineering", "etl", "pipeline", "infrastructure"],
    isActive: true,
  },
];

// Seed mutation to populate the database
export const seedSuccessPathways = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Check if pathways already exist
    const existing = await ctx.db.query("successPathways").first();
    if (existing) {
      return { message: "Pathways already seeded", count: 0 };
    }

    // Insert all pathways
    let count = 0;
    for (const pathway of PATHWAYS_DATA) {
      await ctx.db.insert("successPathways", {
        ...pathway,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    return { message: `Successfully seeded ${count} pathways`, count };
  },
});

// Clear all pathways (for development/testing)
export const clearAllPathways = mutation({
  handler: async (ctx) => {
    const allPathways = await ctx.db.query("successPathways").collect();
    
    for (const pathway of allPathways) {
      await ctx.db.delete(pathway._id);
    }
    
    return { message: `Deleted ${allPathways.length} pathways` };
  },
});
