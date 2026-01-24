import { mutation } from "./_generated/server";

const VIBE_PROJECTS = [
  {
    title: "Webcam Bubble Shooter",
    description:
      "Analyze board state and suggest best shots in a webcam bubble shooter game.",
    difficulty: "Intermediate",
    category: "Game",
    estimatedHours: 4,
    tags: ["Gemini 3 Flash", "Vision", "Gaming"],
    isPublished: true,
    requirements: ["Webcam Input", "Spatial Analysis"],
    learningObjectives: ["Multimodal Input", "Game Logic"],
    starterPrompt:
      "Create a webcam-based bubble shooter game where the player's hand movements control the aim. Use Gemini 1.5 Flash to analyze the webcam feed for hand gestures and calculate the trajectory. The game loop should be built with HTML Canvas.",
  },
  {
    title: "AI Cooking Simulator",
    description:
      "Simulate a kitchen where Gemini controls 100 tools (fry, boil, grill) to cook meals.",
    difficulty: "Advanced",
    category: "Simulation",
    estimatedHours: 8,
    tags: ["Function Calling", "Gemini 3 Flash"],
    isPublished: true,
    requirements: ["Tool Definitions", "State Machine"],
    learningObjectives: ["Agentic Workflows", "API Integration"],
    starterPrompt:
      "Build a cooking simulation engine where an AI chef receives orders and must use available tools (stove, oven, mixer) to prepare dishes. Define each tool as a function that Gemini can call. The state of ingredients should change based on the tool used (e.g., 'raw egg' + 'pan' = 'fried egg').",
  },
  {
    title: "Geolocation Audio Story",
    description:
      "Immersive audio story that syncs to your real-world journey and duration.",
    difficulty: "Advanced",
    category: "Storytelling",
    estimatedHours: 10,
    tags: ["Gemini 3 Flash", "Audio", "Geolocation"],
    isPublished: true,
    requirements: ["Maps API", "TTS"],
    learningObjectives: ["Dynamic Narration", "Audio Processing"],
    starterPrompt:
      "Design a web app that generates a custom audio story based on the user's current location and intended destination. Use the Google Maps API to get the route and duration, and prompt Gemini to write a story that fits exactly that timeframe, incorporating local landmarks as plot points.",
  },
  {
    title: "Quantum Data Visualizer",
    description:
      "Interactive landing page visualizing quantum error correction data.",
    difficulty: "Intermediate",
    category: "Design",
    estimatedHours: 6,
    tags: ["Gemini 3 Pro", "Data Viz", "Three.js"],
    isPublished: true,
    requirements: ["Interactive Canvas", "Typography"],
    learningObjectives: ["Creative Coding", "WebGL"],
    starterPrompt:
      "Create a stunning 3D visualization of quantum qubit coherence using Three.js. The data points should be represented as glowing spheres that interact with mouse hover. The aesthetic should be 'sci-fi lab' with dark backgrounds and neon blue accents.",
  },
  {
    title: "Event Landing Page",
    description:
      "Immersive event landing page with interactive scroll and neon light effects.",
    difficulty: "Intermediate",
    category: "Design",
    estimatedHours: 5,
    tags: ["Design", "Animation", "Gemini 3 Pro"],
    isPublished: true,
    requirements: ["ScrollTrigger", "CSS Glow"],
    learningObjectives: ["Frontend Polish", "Micro-interactions"],
    starterPrompt:
      "Code a landing page for a fictional 'CyberPunk Music Festival'. Use GSAP ScrollTrigger to animate elements as the user scrolls. The hero section must have a parallax effect and neon text that flickers like a broken sign.",
  },
  {
    title: "AI E-commerce Store",
    description: "Serene e-commerce sample experience with an AI concierge.",
    difficulty: "Beginner",
    category: "E-commerce",
    estimatedHours: 4,
    tags: ["One Shot", "Gemini 3 Pro"],
    isPublished: true,
    requirements: ["Clean UI", "Chat Interface"],
    learningObjectives: ["Minimalist Design", "Contextual AI"],
    starterPrompt:
      "Build a minimalist e-commerce product page for high-end furniture. Include a floating 'Concierge' chat button. When clicked, it opens a chat window where an AI assistant (using Gemini) helps answer questions about the specific product currently in view.",
  },
  {
    title: "AI Comic Book Generator",
    description:
      "Localized and personalized comic book generator from user prompts.",
    difficulty: "Advanced",
    category: "AI",
    estimatedHours: 12,
    tags: ["Image Gen", "Gemini 3 Image"],
    isPublished: true,
    requirements: ["Prompt Chaining", "Layout Engine"],
    learningObjectives: ["Generative Art", "Storyboarding"],
    starterPrompt:
      "Develop a web app that takes a short story text as input and generates a 4-panel comic strip. You will need to break the story into scenes, generate a prompt for each scene for an image generation model, and then render the resulting images in a CSS grid layout with speech bubbles.",
  },
  {
    title: "Infographic Generator",
    description:
      "Generate verified visuals and infographics tailored to your audience.",
    difficulty: "Intermediate",
    category: "AI",
    estimatedHours: 8,
    tags: ["World Knowledge", "Text Rendering"],
    isPublished: true,
    requirements: ["Fact Checking", "SVG Generation"],
    learningObjectives: ["Data Synthesis", "Visual AI"],
    starterPrompt:
      "Create a tool that accepts a complex topic (e.g., 'Photosynthesis') and generates a visual SVG infographic explaining it. The AI should break the topic into key steps and write SVG code to visualize each step.",
  },
  {
    title: "Product Mockup Generator",
    description:
      "Generate photo-realistic product mockups from uploaded assets.",
    difficulty: "Beginner",
    category: "Design",
    estimatedHours: 3,
    tags: ["Creative Composition", "Gemini 3 Image"],
    isPublished: true,
    requirements: ["Image Upload", "Composition"],
    learningObjectives: ["Asset Pipelines", "Image Processing"],
    starterPrompt:
      "Build an interface where users upload a company logo, and the AI generates a photorealistic image of that logo printed on various merchandise (t-shirt, mug, notebook).",
  },
  {
    title: "3D Voxel Builder",
    description:
      "Create, visualize, and rebuild voxel sculptures using blocks.",
    difficulty: "Intermediate",
    category: "3D",
    estimatedHours: 6,
    tags: ["3D Building", "Gemini 3 Pro"],
    isPublished: true,
    requirements: ["Three.js", "Voxel Logic"],
    learningObjectives: ["Spatial Reasoning", "3D Editor"],
    starterPrompt:
      "Create a Minecraft-like voxel builder in the browser using Three.js. Users should be able to click to add or remove blocks from a 3D grid. Add a feature to 'save' the creation to local storage JSON.",
  },
  {
    title: "3D Space Runner Game",
    description:
      "Race through a stunning synthwave cosmos at breakneck speeds.",
    difficulty: "Intermediate",
    category: "Game",
    estimatedHours: 5,
    tags: ["3D Games", "React Three Fiber"],
    isPublished: true,
    requirements: ["Game Loop", "Collision"],
    learningObjectives: ["Performance", "React 3D"],
    starterPrompt:
      "Build an infinite runner game in React Three Fiber. The player controls a spaceship flying through a tunnel of neon rings. The speed should increase over time. Detect collisions with the rings.",
  },
  {
    title: "Interactive 3D World",
    description:
      "Navigate a complex 3D world with customizable shader interactions.",
    difficulty: "Advanced",
    category: "3D",
    estimatedHours: 10,
    tags: ["Tool Calling", "GLSL"],
    isPublished: true,
    requirements: ["Shader Code", "Controls"],
    learningObjectives: ["GPU Programming", "Graphics"],
    starterPrompt:
      "Create a 3D terrain viewer where the user can modify the landscape shaders in real-time. Include sliders for 'Water Level', 'Mountain Height', and 'Snow Line' that update the GLSL shader uniforms instantly.",
  },
  {
    title: "Motion Controlled Rhythm Game",
    description:
      "Use webcam to track hand movements and slash sparks to the beat.",
    difficulty: "Advanced",
    category: "Game",
    estimatedHours: 8,
    tags: ["Computer Vision", "Webcam"],
    isPublished: true,
    requirements: ["MediaPipe", "Audio Sync"],
    learningObjectives: ["Gesture Control", "Rhythm Logic"],
    starterPrompt:
      "Develop a rhythm game like 'Beat Saber' but played with a webcam. Use MediaPipe Hand tracking to detect when the user 'slashes' virtual blocks that fly toward the screen in sync with a music track.",
  },
  {
    title: "AI City Builder Simulation",
    description:
      "Manage a virtual metropolis and fulfill tasks provided by Gemini.",
    difficulty: "Intermediate",
    category: "Game",
    estimatedHours: 6,
    tags: ["AI-powered", "Simulation"],
    isPublished: true,
    requirements: ["Resource Manager", "Quest System"],
    learningObjectives: ["Game State", "Dynamic Content"],
    starterPrompt:
      "Code a simple city-building game grid. Every minute, the 'AI Mayor' (Gemini) should pop up with a new request or crisis (e.g., 'The citizens demand a park!'), and the player must place the correct building to satisfy the request.",
  },
  {
    title: "Retro Space Arcade Game",
    description:
      "A retro-futuristic 3D arcade game where players navigate space.",
    difficulty: "Beginner",
    category: "Game",
    estimatedHours: 4,
    tags: ["Arcade", "Retro"],
    isPublished: true,
    requirements: ["Simple Physics", "High Score"],
    learningObjectives: ["Game Basics", "Aesthetics"],
    starterPrompt:
      "Create a simple arcade-style game where the player pilots a ship avoiding asteroids. Use a retro vector-graphics aesthetic (wireframe models). Store the high score in local storage.",
  },
  {
    title: "Image to 3D Voxel Converter",
    description: "Create voxel art scenes inspired by any uploaded image.",
    difficulty: "Intermediate",
    category: "3D",
    estimatedHours: 5,
    tags: ["3D Building", "Image Analysis"],
    isPublished: true,
    requirements: ["Pixel Processing", "Mesh Gen"],
    learningObjectives: ["Algorithms", "Creative Tools"],
    starterPrompt:
      "Build a tool where a user uploads a low-res pixel art image, and the app converts each pixel into a 3D voxel cube in a Three.js scene, essentially turning 2D sprites into 3D models.",
  },
  {
    title: "AI Icon Generator",
    description:
      "Describe an object or icon and render it as editable vector art.",
    difficulty: "Beginner",
    category: "AI",
    estimatedHours: 2,
    tags: ["Vector", "SVG"],
    isPublished: true,
    requirements: ["Text-to-SVG", "Download"],
    learningObjectives: ["Vector Graphics", "Prompting"],
    starterPrompt:
      "Create a simple form where I can describe an icon (e.g., 'a flat style coffee cup'), and the app uses an AI model to generate the SVG code for that icon and renders it on the canvas.",
  },
  {
    title: "Physics Gravity Sandbox",
    description:
      "Physics sandbox for simulating variable gravity and collision.",
    difficulty: "Intermediate",
    category: "Simulation",
    estimatedHours: 5,
    tags: ["Physics", "Matter.js"],
    isPublished: true,
    requirements: ["Gravity Control", "Shape Spawner"],
    learningObjectives: ["Physics Engines", "Interaction"],
    starterPrompt:
      "Using Matter.js, build a 2D physics playground. Allow users to add boxes, circles, and ramps. Add a slider to control the global gravity strength and direction.",
  },
  {
    title: "Real-time Story Illustrator",
    description: "Write a story and watch it get illustrated in real-time.",
    difficulty: "Intermediate",
    category: "AI",
    estimatedHours: 4,
    tags: ["Storytelling", "Image Gen"],
    isPublished: true,
    requirements: ["Debounce", "API Stream"],
    learningObjectives: ["Creative Writing", "Real-time AI"],
    starterPrompt:
      "Build a text editor where, as I type a story, the app waits for a pause (debounce) and then generates an illustration of the current paragraph to display next to the text.",
  },
  {
    title: "Voice Command To-Do List",
    description: "Manage tasks using only your voice commands.",
    difficulty: "Beginner",
    category: "Tools",
    estimatedHours: 3,
    tags: ["Speech-to-Text", "Voice"],
    isPublished: true,
    requirements: ["Web Speech API", "Command Parsing"],
    learningObjectives: ["Voice Interfaces", "Accessibility"],
    starterPrompt:
      "Create a to-do list application controlled entirely by voice. I should be able to say 'Add buy milk', 'Remove buy milk', or 'Clear all', and the app should respond accordingly using the Web Speech API.",
  },
  {
    title: "Retro Logo Generator",
    description: "Generate a unique retro-style synthwave logo for your brand.",
    difficulty: "Beginner",
    category: "Creative",
    estimatedHours: 2,
    tags: ["Image Gen", "Branding"],
    isPublished: true,
    requirements: ["Prompting", "Color Theory"],
    learningObjectives: ["Design Systems", "AI Art"],
    starterPrompt:
      "Design a web tool that asks for a brand name and generates a 'Synthwave 80s' style logo. It should select appropriate fonts, apply neon text-shadows, and a sunset gradient background automatically.",
  },
  {
    title: "Social Media Banner Creator",
    description:
      "Create professional, eye-catching banners for your LinkedIn profile.",
    difficulty: "Beginner",
    category: "Creative",
    estimatedHours: 2,
    tags: ["Image Gen", "Professional"],
    isPublished: true,
    requirements: ["Layout", "Dimensions"],
    learningObjectives: ["Personal Branding", "Visual Hierarchy"],
    starterPrompt:
      "Build a banner creator tool. It should have a sidebar of professional templates (Modern, Bold, Minimal). Users update their name and title, and the canvas updates in real-time. Allow one-click export to PNG.",
  },
  {
    title: "Product Video Generator",
    description: "Generate a hype video teaser for a new product launch.",
    difficulty: "Intermediate",
    category: "Creative",
    estimatedHours: 3,
    tags: ["Video Gen", "Marketing"],
    isPublished: true,
    requirements: ["Scripting", "Video AI"],
    learningObjectives: ["Motion Design", "Storytelling"],
    starterPrompt:
      "Create an app where I enter a product name and description, and it generates a 30-second script for a hype video, complete with suggestions for background music and stock footage descriptions.",
  },
  {
    title: "AI Art Curator App",
    description: "Curate a collection of AI-generated surrealist artworks.",
    difficulty: "Advanced",
    category: "Creative",
    estimatedHours: 4,
    tags: ["Fine Art", "Curation"],
    isPublished: true,
    requirements: ["Style Consistency", "Theming"],
    learningObjectives: ["Art History", "Prompt Engineering"],
    starterPrompt:
      "Build a virtual art gallery. The app should generate 5 unique pieces of 'Surrealist Digital Art' each day. Users can 'Buy' (save to profile) or 'Pass' on them. Saved art should appear in their personal gallery.",
  },
  {
    title: "Podcast Cover Designer",
    description: "Design engaging cover art for your new podcast series.",
    difficulty: "Beginner",
    category: "Creative",
    estimatedHours: 2,
    tags: ["Graphic Design", "Media"],
    isPublished: true,
    requirements: ["Typography", "Imagery"],
    learningObjectives: ["Branding", "Composition"],
    starterPrompt:
      "Create a podcast cover design tool. Ask the user for the podcast genre (True Crime, Tech, Comedy) and suggest color palettes and fonts that match that genre's conventions.",
  },
  {
    title: "Luxury Real Estate Landing",
    description:
      "Build a high-end property listing page with virtual tour integration.",
    difficulty: "Intermediate",
    category: "Web",
    estimatedHours: 6,
    tags: ["React", "Motion", "Tailwind"],
    isPublished: true,
    requirements: ["Responsive Design", "Image Carousel"],
    learningObjectives: ["Modern Layout", "Transitions"],
    starterPrompt:
      "Code a high-end real estate listing page. It needs a full-screen hero slider, a sticky enquiry form on the right, and a 'Virtual Tour' modal. Use a sophisticated serif font for headings.",
  },
  {
    title: "Telehealth Patient Portal",
    description:
      "Secure dashboard for patients to view records and book appointments.",
    difficulty: "Advanced",
    category: "App",
    estimatedHours: 10,
    tags: ["Healthcare", "Security", "Forms"],
    isPublished: true,
    requirements: ["Data Validation", "Calendar Integration"],
    learningObjectives: ["Privacy/HIPAA UI", "State Management"],
    starterPrompt:
      "Build a patient dashboard prototype. It should have a 'Upcoming Appointments' card, a 'Test Results' list, and a 'Book Appointment' flow. The design must be clean, clinical, and reassuring.",
  },
  {
    title: "Fintech Admin Dashboard",
    description:
      "Data-heavy admin panel for tracking transactions and user analytics.",
    difficulty: "Advanced",
    category: "Web",
    estimatedHours: 12,
    tags: ["Charts", "Data Grid", "Finance"],
    isPublished: true,
    requirements: ["Chart.js/Recharts", "Auth Integration"],
    learningObjectives: ["Data Visualization", "Complex State"],
    starterPrompt:
      "Create a dense financial admin dashboard. It needs a sidebar navigation, a top stats row (Revenue, Churn, ARR), and a large main chart showing transaction volume over time. Use a dark mode theme.",
  },
  {
    title: "SaaS Pricing Page",
    description:
      "Interactive pricing tier comparison with toggleable monthly/yearly rates.",
    difficulty: "Beginner",
    category: "Web",
    estimatedHours: 3,
    tags: ["UI Components", "Conversion"],
    isPublished: true,
    requirements: ["Toggle Logic", "Responsive Tables"],
    learningObjectives: ["CSS Grid", "User Interaction"],
    starterPrompt:
      "Build a SaaS pricing component. It should have a toggle switch for 'Monthly' vs 'Yearly' billing. When 'Yearly' is selected, show a 'Save 20%' badge. Highlight the 'Pro' tier as the recommended option.",
  },
  {
    title: "Modern Restaurant App",
    description:
      "Mobile-first web app for browsing menus and table reservation.",
    difficulty: "Intermediate",
    category: "App",
    estimatedHours: 8,
    tags: ["Mobile First", "Ordering"],
    isPublished: true,
    requirements: ["Touch Events", "Shopping Cart"],
    learningObjectives: ["Mobile UX", "Local Storage"],
    starterPrompt:
      "Design a mobile-first menu for a modern fusion restaurant. Items should have large photos and 'Add to Cart' buttons. Include a bottom sheet cart summary that appears when items are added.",
  },
  {
    title: "E-commerce Product Detail",
    description:
      "High-converting product page with size selection and reviews.",
    difficulty: "Beginner",
    category: "E-commerce",
    estimatedHours: 4,
    tags: ["Shopify Style", "Gallery"],
    isPublished: true,
    requirements: ["Image Zoom", "Variant Selection"],
    learningObjectives: ["Product State", "UI Micro-interactions"],
    starterPrompt:
      "Create a detailed product page for a sneaker store. It needs an image gallery with thumbnail navigation, size selector buttons (disable out-of-stock sizes), and an accordion section for 'Product Details' and 'Shipping'.",
  },
  {
    title: "Crypto Portfolio Tracker",
    description:
      "Real-time dashboard tracking cryptocurrency prices and portfolio value.",
    difficulty: "Intermediate",
    category: "App",
    estimatedHours: 7,
    tags: ["API", "WebSockets", "Crypto"],
    isPublished: true,
    requirements: ["API Fetching", "Live Updates"],
    learningObjectives: ["Async Data", "Real-time UI"],
    starterPrompt:
      "Build a crypto tracker dashboard. Fetch live prices from a public API (like CoinGecko). Display a list of coins with their 24h % change (green for up, red for down). Calculate the total value of a hardcoded portfolio.",
  },
];

export const seedVibecoding = mutation({
  args: {},
  handler: async (ctx) => {
    // 0. Ensure a valid user exists to own these projects
    let user = await ctx.db.query("users").first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: "System Admin",
        email: "admin@vibecoding.ai",
        isAnonymous: false,
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Could not create or find a system user.");

    const systemUserId = user._id;

    // 1. Delete all existing projects
    const existing = await ctx.db.query("projects").collect();
    for (const project of existing) {
      await ctx.db.delete(project._id);
    }

    // 2. Insert new projects
    for (const project of VIBE_PROJECTS) {
      await ctx.db.insert("projects", {
        ...project,
        slug: `${project.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        authorId: systemUserId,
        steps: [], // Default steps
      });
    }

    return `Seeding Complete: Deleted ${existing.length}, Inserted ${VIBE_PROJECTS.length} projects owned by ${user.name}.`;
  },
});

export const backfillAssessmentStarted = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updated = 0;

    for (const user of users) {
      if (user.assessmentStarted === undefined) {
        await ctx.db.patch(user._id, {
          assessmentStarted: false,
        });
        updated++;
      }
    }

    console.log(`[Backfill] assessmentStarted set to false for ${updated} users`);
    return { updated, message: `Backfilled assessmentStarted for ${updated} users` };
  },
});
