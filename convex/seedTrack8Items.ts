import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track 8: Multimodal Prompting
 * Focus: Image analysis, vision prompts, audio processing, cross-modal reasoning
 */
export const createTrack8Items = mutation({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let user;
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      user = await ctx.db.query("users").first();
    }
    if (!user) throw new Error("No users found");

    const track = await ctx.db
      .query("practiceTracks")
      .withIndex("by_slug", (q) => q.eq("slug", "multimodal-prompting"))
      .first();

    if (!track) throw new Error("Track 8 not found");

    const level = await ctx.db
      .query("practiceLevels")
      .withIndex("by_track_level", (q) => 
        q.eq("trackId", track._id).eq("levelNumber", 1)
      )
      .first();

    if (!level) throw new Error("Level not found");

    const existingItems = await ctx.db
      .query("practiceItems")
      .withIndex("by_level", (q) => q.eq("levelId", level._id))
      .take(1);

    if (existingItems.length > 0) {
      return { success: false, message: "Track 8 already has items" };
    }

    let template = await ctx.db
      .query("practiceItemTemplates")
      .withIndex("by_type", (q) => q.eq("type", "multiple-choice"))
      .first();

    let templateId = template?._id ?? await ctx.db.insert("practiceItemTemplates", {
      type: "multiple-choice",
      title: "Multimodal AI",
      description: "Master image, audio, and cross-modal prompting",
      schema: {},
      rubric: { rubricId: "multimodal", weights: {}, maxScore: 100 },
      aiEvaluation: { enabled: false },
      recommendedTime: 70,
      skills: ["multimodal", "vision"],
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "live",
    });

    const items = [
      {
        scenario: "What is 'multimodal AI'?",
        options: [
          "AI that works in multiple languages",
          "AI that can process and understand multiple types of input (text, images, audio, video)",
          "AI with multiple models",
          "AI that gives multiple answers"
        ],
        correctAnswer: "AI that can process and understand multiple types of input (text, images, audio, video)",
        explanation: "Multimodal AI: Can understand and work with different data types - text, images, audio, video. Examples: GPT-4V (vision), Gemini (multimodal), Claude (images). Enables richer interactions.",
        elo: 1200,
      },
      
      {
        scenario: "Which AI models currently support image input?",
        options: [
          "Only specialized image AI",
          "GPT-4V, Claude 3, Gemini",
          "None of them",
          "Only Gemini"
        ],
        correctAnswer: "GPT-4V, Claude 3, Gemini",
        explanation: "Vision-capable models: GPT-4 with Vision (GPT-4V), Claude 3 (all variants), Gemini. They can analyze images, answer questions about them, extract text, identify objects, and more.",
        elo: 1150,
      },
      
      {
        scenario: "You upload an image of a chart. What's the best prompt?",
        options: [
          "What is this?",
          "Analyze this chart. Extract: title, axes labels, data points, trends, and key insights.",
          "Describe the image",
          "Tell me about this"
        ],
        correctAnswer: "Analyze this chart. Extract: title, axes labels, data points, trends, and key insights.",
        explanation: "Specific vision prompts work best: State what you want extracted or analyzed. Generic 'describe this' gives generic descriptions. Specific requests get specific, useful information.",
        elo: 1300,
      },
      
      {
        scenario: "What can vision AI do with images?",
        options: [
          "Only describe what's visible",
          "Describe, analyze, extract text (OCR), identify objects, answer questions, compare images",
          "Just identify objects",
          "Only read text"
        ],
        correctAnswer: "Describe, analyze, extract text (OCR), identify objects, answer questions, compare images",
        explanation: "Vision AI capabilities: Describe scenes, read text (OCR), identify objects/people, analyze diagrams, answer questions about images, compare multiple images, detect patterns, and more.",
        elo: 1250,
      },
      
      {
        scenario: "You want AI to extract text from a photo of a document. What's this called?",
        options: [
          "Image reading",
          "Optical Character Recognition (OCR)",
          "Text detection",
          "Document scanning"
        ],
        correctAnswer: "Optical Character Recognition (OCR)",
        explanation: "OCR (Optical Character Recognition): Converting images of text into actual text. Vision AI can do this: 'Extract all text from this image' or 'Transcribe this handwritten note.'",
        elo: 1200,
      },
      
      {
        scenario: "Which prompt is best for analyzing a screenshot of code?",
        options: [
          "What's in this image?",
          "This is a code screenshot. Identify: language, purpose, potential bugs, and suggest improvements.",
          "Describe this",
          "Is this code?"
        ],
        correctAnswer: "This is a code screenshot. Identify: language, purpose, potential bugs, and suggest improvements.",
        explanation: "Context + specific requests: Tell AI what it's looking at (code screenshot), then specify what you want (language, purpose, bugs, improvements). Context helps AI focus its analysis.",
        elo: 1350,
      },
      
      {
        scenario: "Can vision AI identify people in photos?",
        options: [
          "Yes, always",
          "It can describe appearance but typically won't identify specific individuals (privacy)",
          "No, never",
          "Only celebrities"
        ],
        correctAnswer: "It can describe appearance but typically won't identify specific individuals (privacy)",
        explanation: "Privacy protection: Vision AI can describe 'a person wearing a blue shirt' but won't identify 'this is John Smith' (except public figures). This protects privacy and prevents misuse.",
        elo: 1250,
      },
      
      {
        scenario: "You upload multiple images. What's a good multimodal prompt?",
        options: [
          "Describe each image",
          "Compare these images. Identify: similarities, differences, and which best fits [criteria].",
          "What are these?",
          "Tell me about the images"
        ],
        correctAnswer: "Compare these images. Identify: similarities, differences, and which best fits [criteria].",
        explanation: "Multi-image analysis: AI can compare across images. Specify what to compare (style, content, quality) and your criteria. Useful for: choosing designs, finding differences, pattern recognition.",
        elo: 1400,
      },
      
      {
        scenario: "What's the best way to get detailed image analysis?",
        options: [
          "Upload and wait",
          "Ask specific questions about what you want to know",
          "Request a description",
          "Hope AI notices everything"
        ],
        correctAnswer: "Ask specific questions about what you want to know",
        explanation: "Targeted questions: 'What color is the car?', 'How many people are in the background?', 'What brand logo is visible?' Specific questions get specific answers. General prompts get general descriptions.",
        elo: 1250,
      },
      
      {
        scenario: "Can AI generate images from text descriptions?",
        options: [
          "No AI can do this",
          "Yes - DALL-E (ChatGPT), Midjourney, Stable Diffusion, Imagen (Gemini)",
          "Only DALL-E",
          "All AI can do this"
        ],
        correctAnswer: "Yes - DALL-E (ChatGPT), Midjourney, Stable Diffusion, Imagen (Gemini)",
        explanation: "Text-to-image AI: DALL-E 3 (in ChatGPT), Midjourney, Stable Diffusion, Imagen (Gemini), and others. Describe what you want, AI generates it. Different models have different styles and strengths.",
        elo: 1150,
      },
      
      {
        scenario: "What makes a good image generation prompt?",
        options: [
          "Just name the subject",
          "Subject + style + composition + lighting + details",
          "One word",
          "As short as possible"
        ],
        correctAnswer: "Subject + style + composition + lighting + details",
        explanation: "Detailed prompts = better images: 'A red fox in a snowy forest, oil painting style, golden hour lighting, close-up portrait, detailed fur texture.' Specify: subject, style, composition, lighting, mood, details.",
        elo: 1300,
      },
      
      {
        scenario: "You want a specific art style in generated images. How do you prompt?",
        options: [
          "Hope AI guesses",
          "Explicitly specify: 'in the style of [artist/movement]' or 'photorealistic' or 'watercolor'",
          "Use artistic words",
          "Upload an example"
        ],
        correctAnswer: "Explicitly specify: 'in the style of [artist/movement]' or 'photorealistic' or 'watercolor'",
        explanation: "Style specification: 'in the style of Van Gogh', 'photorealistic', 'anime style', 'watercolor painting', 'pixel art'. Be explicit about the aesthetic you want. AI knows many styles.",
        elo: 1250,
      },
      
      {
        scenario: "What's 'image-to-image' generation?",
        options: [
          "Copying images",
          "Using an input image as reference to generate a new image with modifications",
          "Comparing images",
          "Image editing"
        ],
        correctAnswer: "Using an input image as reference to generate a new image with modifications",
        explanation: "Image-to-image: Upload an image, ask AI to modify it. 'Make this photo look like a painting', 'Change the background to a beach', 'Add a sunset'. Transforms existing images based on prompts.",
        elo: 1350,
      },
      
      {
        scenario: "Can AI analyze diagrams and flowcharts?",
        options: [
          "No, too complex",
          "Yes - can identify components, follow logic, explain relationships",
          "Only simple ones",
          "Only if you explain them first"
        ],
        correctAnswer: "Yes - can identify components, follow logic, explain relationships",
        explanation: "Diagram analysis: Vision AI can understand flowcharts, diagrams, mind maps. 'Explain this flowchart's logic', 'What are the main components of this system diagram?', 'Summarize this process.'",
        elo: 1300,
      },
      
      {
        scenario: "You upload a photo of a math problem. What's the best prompt?",
        options: [
          "Solve this",
          "This is a math problem. Solve it step-by-step, showing all work and explaining each step.",
          "What's the answer?",
          "Help with math"
        ],
        correctAnswer: "This is a math problem. Solve it step-by-step, showing all work and explaining each step.",
        explanation: "Educational prompts: Specify you want step-by-step solutions with explanations. This helps you learn, not just get answers. 'Show your work' triggers chain-of-thought reasoning.",
        elo: 1250,
      },
      
      {
        scenario: "What's the limitation of AI vision?",
        options: [
          "It's perfect",
          "Can misinterpret images, struggle with small text, make mistakes on complex scenes",
          "It can't see anything",
          "Only works on photos"
        ],
        correctAnswer: "Can misinterpret images, struggle with small text, make mistakes on complex scenes",
        explanation: "Vision limitations: May misread small/blurry text, misinterpret ambiguous images, miss subtle details, or hallucinate objects. Always verify important information, especially for critical tasks.",
        elo: 1200,
      },
      
      {
        scenario: "Can AI understand memes and cultural references in images?",
        options: [
          "No, never",
          "Often yes - trained on internet data including memes and cultural content",
          "Only text memes",
          "Only if you explain them"
        ],
        correctAnswer: "Often yes - trained on internet data including memes and cultural content",
        explanation: "Cultural understanding: AI often recognizes popular memes, cultural references, and visual jokes because they're in training data. But may miss very recent or niche references.",
        elo: 1300,
      },
      
      {
        scenario: "You want AI to identify objects in an image for accessibility. Best prompt?",
        options: [
          "What's in this image?",
          "Describe this image for a visually impaired person: identify all objects, their positions, and relationships.",
          "List objects",
          "Describe everything"
        ],
        correctAnswer: "Describe this image for a visually impaired person: identify all objects, their positions, and relationships.",
        explanation: "Accessibility prompts: Specify the purpose (accessibility) to get appropriate detail level. AI will provide spatial relationships, important details, and context - not just object lists.",
        elo: 1350,
      },
      
      {
        scenario: "What's 'cross-modal reasoning'?",
        options: [
          "Using multiple AI models",
          "Connecting information across different modalities (e.g., relating image content to text knowledge)",
          "Comparing images",
          "Translating between languages"
        ],
        correctAnswer: "Connecting information across different modalities (e.g., relating image content to text knowledge)",
        explanation: "Cross-modal reasoning: AI connects visual information with text knowledge. Example: See a plant in image → identify species → provide care instructions. Bridges visual and textual understanding.",
        elo: 1400,
      },
      
      {
        scenario: "Can AI analyze video content?",
        options: [
          "No, only images",
          "Some models (like Gemini) can analyze video directly",
          "Only if you extract frames",
          "Never"
        ],
        correctAnswer: "Some models (like Gemini) can analyze video directly",
        explanation: "Video analysis: Gemini can process video directly. Others may need frame extraction. Can analyze: actions, scenes, objects over time, summarize content, answer questions about video events.",
        elo: 1300,
      },
      
      {
        scenario: "You upload a product photo. What's a good e-commerce prompt?",
        options: [
          "Describe this product",
          "Analyze this product image. Generate: compelling description, key features, target audience, and suggested price range based on visible quality.",
          "What is this?",
          "Write a description"
        ],
        correctAnswer: "Analyze this product image. Generate: compelling description, key features, target audience, and suggested price range based on visible quality.",
        explanation: "Business prompts: Specify business context and what you need. AI can analyze product appeal, suggest marketing angles, identify features, and provide business insights from images.",
        elo: 1350,
      },
      
      {
        scenario: "What's the best way to get AI to focus on specific parts of an image?",
        options: [
          "Crop the image first",
          "Use spatial references: 'Focus on the top-left corner' or 'Analyze the text in the center'",
          "Hope AI notices",
          "Upload multiple times"
        ],
        correctAnswer: "Use spatial references: 'Focus on the top-left corner' or 'Analyze the text in the center'",
        explanation: "Spatial guidance: AI understands spatial references. 'What's in the background?', 'Read the text at the bottom', 'Describe the person on the right'. Directs attention to specific areas.",
        elo: 1300,
      },
      
      {
        scenario: "Can AI detect emotions or sentiment in images?",
        options: [
          "No, that's impossible",
          "Yes - can analyze facial expressions, body language, and scene mood",
          "Only in text",
          "Only for obvious emotions"
        ],
        correctAnswer: "Yes - can analyze facial expressions, body language, and scene mood",
        explanation: "Emotion detection: AI can identify facial expressions (happy, sad, angry), body language, and overall scene mood. Useful for: photo selection, content moderation, UX research.",
        elo: 1250,
      },
      
      {
        scenario: "You want to verify if an image matches a description. Best approach?",
        options: [
          "Just look yourself",
          "Upload image and ask: 'Does this image match this description: [description]? Explain why or why not.'",
          "Describe the image",
          "Compare manually"
        ],
        correctAnswer: "Upload image and ask: 'Does this image match this description: [description]? Explain why or why not.'",
        explanation: "Verification prompts: AI can compare images to descriptions, specifications, or requirements. Useful for: quality control, content verification, matching products to descriptions.",
        elo: 1350,
      },
      
      {
        scenario: "What's a limitation when using AI for medical image analysis?",
        options: [
          "No limitations",
          "AI isn't medically certified and shouldn't replace professional diagnosis",
          "It's too slow",
          "It can't see medical images"
        ],
        correctAnswer: "AI isn't medically certified and shouldn't replace professional diagnosis",
        explanation: "Critical limitation: AI can describe medical images but lacks: medical training, certification, liability, patient context. Never use for diagnosis. Only licensed professionals should interpret medical images.",
        elo: 1300,
      },
    ];

    const itemIds = [];
    for (const item of items) {
      const itemId = await ctx.db.insert("practiceItems", {
        levelId: level._id,
        templateId,
        type: "multiple-choice",
        category: "multimodal",
        params: {
          scenario: item.scenario,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
        },
        version: "1.0",
        elo: item.elo,
        eloDeviation: 150,
        difficultyBand: "intermediate",
        tags: ["multimodal", "vision", "images"],
        createdBy: user._id,
        createdAt: Date.now(),
        status: "live",
      });
      itemIds.push(itemId);
    }

    return {
      success: true,
      levelId: level._id,
      templateId,
      itemIds,
      count: itemIds.length,
      message: `Created ${itemIds.length} items for Track 8: Multimodal Prompting`,
    };
  },
});
