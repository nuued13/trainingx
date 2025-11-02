import { Step } from "@shared/schema";
import { Rubric } from "@/lib/scoring";

export const questions: (Step & { primaryDimension: keyof Rubric })[] = [
  // CLARITY QUESTIONS (4)
  {
    type: "multiple-choice",
    question:
      "You need AI to create a product description for your online store. Which prompt is best?",
    primaryDimension: "clarity",
    options: [
      {
        quality: "bad",
        text: "Write a product description",
        explanation:
          "Too vague - what product? What tone? What length? No specifics provided.",
      },
      {
        quality: "almost",
        text: "Write a product description for eco-friendly water bottles",
        explanation:
          "Has the product but missing key details like tone, audience, length, and unique selling points.",
      },
      {
        quality: "good",
        text: "Write a 150-word product description for eco-friendly stainless steel water bottles targeting health-conscious millennials. Highlight: BPA-free, keeps drinks cold 24hrs, comes in 5 colors. Tone: energetic and inspiring.",
        explanation:
          "Perfect! Includes product details, target audience, key features, word count, and desired tone.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You want AI to analyze survey data. What's the most effective prompt?",
    primaryDimension: "clarity",
    options: [
      {
        quality: "bad",
        text: "Analyze this data",
        explanation:
          "No context about what to analyze, what format to use, or what insights you need.",
      },
      {
        quality: "good",
        text: "Analyze this customer satisfaction survey (500 responses). Create a summary with: 1) Top 3 themes from feedback, 2) Average ratings by category, 3) Key recommendations. Present as bullet points.",
        explanation:
          "Excellent! Specifies data type, desired outputs, structure, and presentation format.",
      },
      {
        quality: "almost",
        text: "Look at this survey and tell me what customers think",
        explanation:
          "Vague on deliverables - what specific insights or format do you need?",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You need AI to create a how-to guide for your team. Which approach is best?",
    primaryDimension: "clarity",
    options: [
      {
        quality: "almost",
        text: "Write a guide about using our new tool",
        explanation:
          "Missing crucial context: who's the audience? What level of detail? What format?",
      },
      {
        quality: "bad",
        text: "Help me write instructions",
        explanation:
          "Too vague - instructions for what? For whom? What format?",
      },
      {
        quality: "good",
        text: "Write a step-by-step guide for new employees on how to submit expense reports. Include: screenshots for each step, common mistakes to avoid, who to contact for help. Use simple language and number each step clearly.",
        explanation:
          "Perfect! Defines audience, format, required sections, and writing style expectations.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You want AI to write a social media post. How do you ensure the best result?",
    primaryDimension: "clarity",
    options: [
      {
        quality: "good",
        text: "Write a LinkedIn post (300 chars) announcing our Q1 product launch. Target: B2B decision makers. Include: key benefit, launch date (March 15), call-to-action to register. Tone: professional but exciting.",
        explanation:
          "Excellent! Specifies platform, length, audience, key points to cover, and desired tone.",
      },
      {
        quality: "bad",
        text: "Write a post about our new product",
        explanation:
          "Missing platform, length, audience, key messages, and tone.",
      },
      {
        quality: "almost",
        text: "Write a professional LinkedIn post about our product launch",
        explanation:
          "Has platform and tone but lacks length limit, specific details, and what to emphasize.",
      },
    ],
  },

  // CONSTRAINTS QUESTIONS (3)
  {
    type: "multiple-choice",
    question:
      "You need AI to research market trends. Which prompt sets proper boundaries?",
    primaryDimension: "constraints",
    options: [
      {
        quality: "bad",
        text: "Research market trends for me",
        explanation:
          "No boundaries - what industry? Time period? Geographic scope? Sources to use/avoid?",
      },
      {
        quality: "good",
        text: "Research US electric vehicle market trends from 2023-2024. Focus on: consumer adoption rates, top 3 manufacturers, charging infrastructure growth. Limit to data from industry reports and government sources. Exclude opinion pieces. Max 500 words.",
        explanation:
          "Perfect! Clear scope (geographic, time, topics), source constraints, exclusions, and length limit.",
      },
      {
        quality: "almost",
        text: "Research electric vehicle trends in the last 2 years",
        explanation:
          "Has topic and timeframe but missing geographic scope, what aspects to focus on, source constraints, and length.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You're asking AI to draft a customer response email. Which defines constraints best?",
    primaryDimension: "constraints",
    options: [
      {
        quality: "almost",
        text: "Write an email responding to a customer complaint about late delivery",
        explanation:
          "Has scenario but lacks tone specificity, length constraints, required elements, and what NOT to include.",
      },
      {
        quality: "good",
        text: "Write a 200-word customer service email responding to a late delivery complaint. Tone: empathetic and solution-focused. Include: sincere apology, explanation (shipping partner delay), compensation offer (20% discount), next steps. Avoid: blame-shifting or over-promising.",
        explanation:
          "Excellent! Defines length, tone, required elements, and explicit boundaries on what to avoid.",
      },
      {
        quality: "bad",
        text: "Write a response to an unhappy customer",
        explanation:
          "Too vague - what's the issue? What tone? What length? What should/shouldn't be included?",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You need a summary of a long article. How do you constrain the task effectively?",
    primaryDimension: "constraints",
    options: [
      {
        quality: "good",
        text: "Summarize this 5000-word article in exactly 250 words. Focus only on: main argument, key evidence, conclusion. Use simple language for general audience. Exclude: author's biography, tangential examples, publication details.",
        explanation:
          "Perfect! Precise length, clear focus areas, audience level, and explicit exclusions defined.",
      },
      {
        quality: "bad",
        text: "Give me a summary of this article",
        explanation:
          "No constraints on length, focus, detail level, or audience.",
      },
      {
        quality: "almost",
        text: "Summarize this article briefly focusing on the main points",
        explanation:
          "'Briefly' is vague. What's brief? Which main points? What to exclude? Who's the audience?",
      },
    ],
  },

  // ITERATION QUESTIONS (4)
  {
    type: "multiple-choice",
    question:
      "AI gave you a generic business plan template. How do you improve it?",
    primaryDimension: "iteration",
    options: [
      {
        quality: "bad",
        text: "Regenerate and hope for something better",
        explanation:
          "Random regeneration rarely helps - you need to add specific guidance.",
      },
      {
        quality: "almost",
        text: "Make it more specific and detailed",
        explanation:
          "Too vague - specific about what? Which sections need detail? Provide concrete examples.",
      },
      {
        quality: "good",
        text: "Revise the business plan with these specifics: Industry = SaaS B2B, Target = mid-size companies, Revenue model = subscription tiers ($49/$99/$199/month), Competition = list 3 main competitors and our differentiators, Timeline = 18-month roadmap.",
        explanation:
          "Excellent! Provides concrete examples, specific parameters, and clear additions to make it relevant.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "The AI's response has the right content but wrong tone. What's your best next step?",
    primaryDimension: "iteration",
    options: [
      {
        quality: "good",
        text: "Keep the same content but rewrite in [desired tone]. Example of the tone I want: [paste example text with the right style]",
        explanation:
          "Perfect! Preserves good content while providing concrete examples of desired tone.",
      },
      {
        quality: "bad",
        text: "Try a completely different AI tool",
        explanation:
          "The issue is your prompt clarity, not the tool. Provide better tone guidance first.",
      },
      {
        quality: "almost",
        text: "Change the tone to be more professional",
        explanation:
          "Better, but 'professional' is subjective. Provide specific examples of the tone you want.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "AI's code solution works but is overly complex. How do you iterate?",
    primaryDimension: "iteration",
    options: [
      {
        quality: "almost",
        text: "Simplify this code",
        explanation:
          "Too vague - simplify how? What's the complexity issue? What constraints matter (readability, performance, etc.)?",
      },
      {
        quality: "good",
        text: "Refactor this code to be more maintainable: 1) Break the 200-line function into smaller functions (max 20 lines each), 2) Add descriptive variable names, 3) Remove nested loops if possible, 4) Add comments for complex logic.",
        explanation:
          "Excellent! Specific improvements identified with measurable criteria and clear priorities.",
      },
      {
        quality: "bad",
        text: "Write this code differently",
        explanation:
          "No direction on what's wrong or what 'differently' means.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You got a good first draft but need to expand section 3. What's the best approach?",
    primaryDimension: "iteration",
    options: [
      {
        quality: "bad",
        text: "Start over with a new prompt from scratch",
        explanation:
          "Wasteful - you already have good content. Build on what works rather than restarting.",
      },
      {
        quality: "good",
        text: "Keep sections 1, 2, and 4 as-is. Expand section 3 to 400 words by adding: specific industry statistics, 2-3 case study examples, and expert quotes. Maintain the same writing style as other sections.",
        explanation:
          "Perfect! Strategic iteration - preserves good work, targets specific expansion, gives concrete additions.",
      },
      {
        quality: "almost",
        text: "Add more content to section 3",
        explanation:
          "Vague - how much more? What kind of content? Any specific examples or data needed?",
      },
    ],
  },

  // TOOL SELECTION QUESTIONS (3)
  {
    type: "multiple-choice",
    question:
      "You're creating a presentation with text, images, and charts. How do you approach this with AI?",
    primaryDimension: "tool",
    options: [
      {
        quality: "bad",
        text: "Don't use AI - it can't help with presentations",
        explanation:
          "AI can help with multiple aspects! You're missing out on significant productivity gains.",
      },
      {
        quality: "good",
        text: "Use ChatGPT/Claude for slide content and talking points, Midjourney/DALL-E for custom images, and ChatGPT for data analysis to create chart insights, then assemble in PowerPoint",
        explanation:
          "Excellent! Leverages each tool's strengths - text AI for content, image AI for visuals, assembly in presentation software.",
      },
      {
        quality: "almost",
        text: "Use ChatGPT for everything since it's the most versatile",
        explanation:
          "ChatGPT can't generate images or create actual presentation files. Better to use specialized tools for each task.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You need help planning a week's worth of healthy meals on a budget. Which tool strategy is best?",
    primaryDimension: "tool",
    options: [
      {
        quality: "almost",
        text: "Use the newest most advanced AI model available",
        explanation:
          "Newer isn't always better - choose tools based on what they're good at, not just popularity.",
      },
      {
        quality: "good",
        text: "Use ChatGPT for meal planning and recipes, ask for specific dietary needs, budget constraints, and cooking time limits. Request shopping lists organized by store section.",
        explanation:
          "Perfect! Chooses appropriate AI tool, provides complete context (dietary needs, budget), and asks for actionable outputs.",
      },
      {
        quality: "bad",
        text: "Pick any AI randomly - they all do the same thing",
        explanation:
          "Wrong! Different AI tools have different strengths. Matching the tool to your task matters.",
      },
    ],
  },
  {
    type: "multiple-choice",
    question:
      "You want to create a marketing campaign with video scripts, social posts, and email copy. Best approach?",
    primaryDimension: "tool",
    options: [
      {
        quality: "good",
        text: "Use ChatGPT/Claude for scripts and copy (leveraging long-form text strength), Jasper/Copy.ai for marketing-optimized variations, and social media AI tools for platform-specific formatting. Test different AI outputs for best results.",
        explanation:
          "Excellent! Uses specialized tools for different content types and platforms, plus tests multiple outputs.",
      },
      {
        quality: "bad",
        text: "Manually write everything - AI isn't reliable for creative work",
        explanation:
          "AI is highly effective for creative ideation and drafts. You're missing major efficiency gains.",
      },
      {
        quality: "almost",
        text: "Use one AI writing tool for all content types",
        explanation:
          "Different content formats benefit from specialized tools. Marketing copy, long-form scripts, and social posts have different requirements.",
      },
    ],
  },
];
