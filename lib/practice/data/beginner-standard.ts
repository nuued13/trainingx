/**
 * Beginner Standard Questions
 * Target audience: Ages 18+
 *
 * These questions use professional scenarios with explicit prompt text
 * and are organized by track with lesson types for deeper learning.
 */

import { BeginnerStandardQuestion } from "../types";

export const beginnerStandardQuestions: BeginnerStandardQuestion[] = [
  // ============================================
  // CLARITY TRACK (B-CL)
  // ============================================
  {
    id: "B-CL-001",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "vague_goal",
    scenario:
      "You want to ask your boss for a raise during your performance review.",
    prompt_text: "Write an email asking for more money.",
    correct_answer: "bad",
    why_short: "The request is too vague and lacks professional context.",
    missing_points: [
      "Specific amount or percentage",
      "Justification or achievements",
      "Professional tone",
    ],
    improved_prompt:
      "Write a formal email to my manager requesting a 10% salary increase, citing my successful leadership of the Q3 project as justification.",
  },
  {
    id: "B-CL-002",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "missing_audience",
    scenario:
      "You are writing a product description for a new pair of high-tech headphones.",
    prompt_text: "Describe the new X-200 headphones.",
    correct_answer: "bad",
    why_short:
      "It does not specify who the description is for, making it hard to choose the right words.",
    missing_points: [
      "Target audience (e.g., gamers, audiophiles)",
      "Key features to highlight",
      "Tone (e.g., exciting, technical)",
    ],
    improved_prompt:
      "Write a catchy product description for the X-200 headphones targeting college students, focusing on the noise-cancellation and long battery life.",
  },
  {
    id: "B-CL-003",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "missing_success_criteria",
    scenario: "You want to summarize a long news article about climate change.",
    prompt_text:
      "Summarize this article about climate change for high school students.",
    correct_answer: "almost",
    why_short:
      "The audience and topic are clear, but the length consists of a wide range of possibilities.",
    missing_points: [
      "Target length (e.g., 200 words)",
      "Output format (e.g., bullet points vs paragraph)",
    ],
    improved_prompt:
      "Summarize this article about climate change for high school students in a single 200-word paragraph.",
  },
  {
    id: "B-CL-004",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "ambiguous_scope",
    scenario: "You need a recipe for a chocolate cake for a party.",
    prompt_text: "Give me a recipe for chocolate cake that is gluten-free.",
    correct_answer: "almost",
    why_short:
      "Useful dietary constraint, but lacks serving size and complexity preference.",
    missing_points: ["Serving size", "Difficulty level or prep time"],
    improved_prompt:
      "Give me a beginner-friendly recipe for a gluten-free chocolate cake that serves 8 people and takes under an hour.",
  },
  {
    id: "B-CL-005",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "vague_goal",
    scenario: "You are starting a newsletter about urban gardening.",
    prompt_text:
      "Write a welcome email for new subscribers to my gardening newsletter.",
    correct_answer: "almost",
    why_short:
      "The context is good, but it refers to a generic 'welcome' without a specific goal.",
    missing_points: ["Specific Call to Action (CTA)", "Tone specification"],
    improved_prompt:
      "Write a warm, welcoming email for new subscribers to my gardening newsletter that encourages them to reply with their favorite plant.",
  },
  {
    id: "B-CL-006",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "missing_audience",
    scenario:
      "You need to explain a new heavy work-from-home policy to your team.",
    prompt_text:
      "Write a memo explaining the new hybrid work policy: 3 days in office, 2 days remote.",
    correct_answer: "almost",
    why_short:
      "The facts are present, but the framing for the specific audience sentiment is missing.",
    missing_points: [
      "Tone (e.g., reassuring)",
      "Audience perspective (benefits vs rules)",
    ],
    improved_prompt:
      "Write a positive and reassuring memo to employees explaining the new hybrid work policy (3 days office, 2 days remote), emphasizing the benefits of in-person collaboration.",
  },
  {
    id: "B-CL-007",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "missing_success_criteria",
    scenario: "You are organizing a study schedule for upcoming exams.",
    prompt_text:
      "Create a 2-week study plan for the SATs covering Math and English, assigning 1 hour per subject each weekday and a practice test on Saturdays.",
    correct_answer: "good",
    why_short:
      "The request is highly specific with clear constraints on time, duration, and subjects.",
    missing_points: [],
    improved_prompt:
      "Create a 2-week study plan for the SATs covering Math and English, assigning 1 hour per subject each weekday and a practice test on Saturdays.",
  },
  {
    id: "B-CL-008",
    difficulty: "beginner",
    level: "standard",
    track: "clarity",
    lesson_type: "ambiguous_scope",
    scenario: "You need to fix performance issues in a script.",
    prompt_text:
      "Review the attached Python script for efficiency errors only, ignoring style guide violations, and provide the top 3 optimizations.",
    correct_answer: "good",
    why_short:
      "The scope is strictly defined (efficiency only), explicitly excluding other feedback (style).",
    missing_points: [],
    improved_prompt:
      "Review the attached Python script for efficiency errors only, ignoring style guide violations, and provide the top 3 optimizations.",
  },

  // ============================================
  // CONTEXT TRACK (B-CX)
  // ============================================
  {
    id: "B-CX-001",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_inputs",
    scenario: "You are using an AI to check your math homework.",
    prompt_text: "Is the answer correct?",
    correct_answer: "bad",
    why_short:
      "The AI cannot verify the answer without seeing the original problem and your solution.",
    missing_points: ["The math problem statement", "Your derived answer"],
    improved_prompt:
      "Here is the math problem: 'Solve for x: 2x + 5 = 15'. My answer is x = 5. Is this correct?",
  },
  {
    id: "B-CX-002",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_background",
    scenario: "You need feedback on a draft email to your team.",
    prompt_text: "Does this email sound okay?",
    correct_answer: "bad",
    why_short:
      "The AI lacks the necessary background information to judge the email's effectiveness.",
    missing_points: [
      "The email draft text",
      "The purpose of the email",
      "The relationship with the team",
    ],
    improved_prompt:
      "I'm sending an email to my team to announce a deadline extension. Does this draft sound supportive but firm? [Insert Draft]",
  },
  {
    id: "B-CX-003",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_definitions",
    scenario: "You want code to calculate a grade based on a score.",
    prompt_text:
      "Write a Python function that takes a score and returns the letter grade based on standard grading rules.",
    correct_answer: "almost",
    why_short:
      "The request is clear but assumes 'standard grading rules' are universal, which varies by region.",
    missing_points: ["Specific grading scale (e.g., A=90-100, B=80-89)"],
    improved_prompt:
      "Write a Python function that takes a score (0-100) and returns a letter grade where A is 90+, B is 80-89, C is 70-79, D is 60-69, and F is below 60.",
  },
  {
    id: "B-CX-004",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_inputs",
    scenario: "You are cooking and want to adjust a recipe.",
    prompt_text:
      "Adjust the ingredients of this pancake recipe to feed a larger group.",
    correct_answer: "almost",
    why_short:
      "The intention is clear, but the scale of adjustment is missing.",
    missing_points: [
      "Target number of people or batch size",
      "The original recipe (if not pasted)",
    ],
    improved_prompt:
      "Adjust the ingredients of the following pancake recipe to serve 10 people instead of 4: [Insert Recipe]",
  },
  {
    id: "B-CX-005",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_background",
    scenario: "You want to write an introduction for a travel blog post.",
    prompt_text:
      "Write an engaging introduction for my blog post about my recent trip.",
    correct_answer: "almost",
    why_short:
      "It asks for an introduction but doesn't say where the trip was or what happened.",
    missing_points: [
      "Destination of the trip",
      "Key highlight or theme of the post",
    ],
    improved_prompt:
      "Write an engaging introduction for my blog post about my recent solo trip to Japan, focusing on the amazing street food.",
  },
  {
    id: "B-CX-006",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "needs_clarifying_questions",
    scenario: "You are planning a weekend getaway.",
    prompt_text:
      "Plan a 3-day weekend itinerary for a couple visiting New York City.",
    correct_answer: "almost",
    why_short:
      "A solid start, but a great itinerary depends on personal interests and budget.",
    missing_points: [
      "Budget (luxury vs budget)",
      "Interests (museums, food, shows)",
    ],
    improved_prompt:
      "Plan a 3-day weekend itinerary for a couple visiting New York City who love art museums and Italian food, with a mid-range budget.",
  },
  {
    id: "B-CX-007",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_inputs",
    scenario: "You need to parse some raw data.",
    prompt_text:
      "Parse this raw CSV string 'Name,Role;Sarah,Editor;Tom,Writer' into a JSON list of objects with 'name' and 'role' keys.",
    correct_answer: "good",
    why_short:
      "The prompt provides the specific input data and the exact desired output structure.",
    missing_points: [],
    improved_prompt:
      "Parse this raw CSV string 'Name,Role;Sarah,Editor;Tom,Writer' into a JSON list of objects with 'name' and 'role' keys.",
  },
  {
    id: "B-CX-008",
    difficulty: "beginner",
    level: "standard",
    track: "context",
    lesson_type: "missing_definitions",
    scenario: "You are a teacher explaining a game.",
    prompt_text:
      "Explain the rules of 'Capture the Flag' to a group of 10-year-olds using simple language, assuming they play outdoors.",
    correct_answer: "good",
    why_short:
      "It provides the specific topic, target audience, and necessary environmental context.",
    missing_points: [],
    improved_prompt:
      "Explain the rules of 'Capture the Flag' to a group of 10-year-olds using simple language, assuming they play outdoors.",
  },

  // ============================================
  // CONSTRAINTS TRACK (B-CT)
  // ============================================
  {
    id: "B-CT-001",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "conflicting_constraints",
    scenario: "You need a summary of a very long book.",
    prompt_text:
      "Summarize 'War and Peace' in exactly 10 words, but make sure to include every major character name and plot twist.",
    correct_answer: "bad",
    why_short:
      "It is impossible to include 'every major character and plot twist' within a '10-word' limit.",
    missing_points: [
      "Prioritization (main theme vs details)",
      "Realistic length constraint",
    ],
    improved_prompt:
      "Summarize the main theme of 'War and Peace' in one sentence under 20 words.",
  },
  {
    id: "B-CT-002",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_constraints",
    scenario: "You want to play a game with the AI.",
    prompt_text: "Let's play a text adventure game.",
    correct_answer: "bad",
    why_short:
      "Without constraints on the setting, rules, or role, the game has no structure.",
    missing_points: [
      "Setting or Genre (e.g., fantasy, sci-fi)",
      "Your starting role",
      "Rules of the game",
    ],
    improved_prompt:
      "Let's play a text adventure game set in a haunted Victorian mansion. I am a detective with a flashlight. You describe the room, and I tell you what I do.",
  },
  {
    id: "B-CT-003",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_tone",
    scenario:
      "You need to reply to a customer who is angry about a delayed shipping order.",
    prompt_text:
      "Write a reply to this angry customer telling them their order is late.",
    correct_answer: "almost",
    why_short:
      "The core message is there, but the tone is critical for customer service and isn't specified.",
    missing_points: [
      "Specific tone (e.g., empathetic, apologetic)",
      "Goal (e.g., retain the customer)",
    ],
    improved_prompt:
      "Write a sincere and apologetic email to a customer whose order is late, offering a 10% discount code to make up for it.",
  },
  {
    id: "B-CT-004",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "overconstrained",
    scenario: "You are brainstorming a slogan for a new coffee brand.",
    prompt_text:
      "Write a catchy 3-word slogan for our coffee that rhymes, contains the word 'Morning', and mentions 'Energy' and 'Beans'.",
    correct_answer: "almost",
    why_short:
      "Demanding too many specific words within a strict 3-word limit makes the task frustrating or impossible.",
    missing_points: [
      "Flexibility in word choice",
      "Realistic word count for the requirements",
    ],
    improved_prompt:
      "Write a catchy rhyming slogan for our coffee that highlights energy and morning vibes, keeping it under 6 words.",
  },
  {
    id: "B-CT-005",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_constraints",
    scenario: "You are looking for a workout routine.",
    prompt_text: "Give me a 30-minute workout plan.",
    correct_answer: "almost",
    why_short:
      "It sets a time limit, but fails to mention available equipment or fitness level.",
    missing_points: [
      "Equipment available (e.g., dumbbells, no equipment)",
      "Fitness level (e.g., beginner, advanced)",
    ],
    improved_prompt:
      "Give me a 30-minute high-intensity interval training (HIIT) workout plan that requires no equipment.",
  },
  {
    id: "B-CT-006",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_constraints",
    scenario: "You want recommendations for a family movie night.",
    prompt_text: "Recommend 3 movies for a family movie night.",
    correct_answer: "almost",
    why_short:
      "Genre and age appropriateness are missing, risking suggestions that the kids can't watch or the parents hate.",
    missing_points: [
      "Age rating (e.g., PG, G)",
      "Preferred genre (e.g., adventure, comedy)",
    ],
    improved_prompt:
      "Recommend 3 animated adventure movies rated PG that are suitable for 7-year-olds.",
  },
  {
    id: "B-CT-007",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_constraints",
    scenario: "You need a secure password.",
    prompt_text:
      "Generate a random password that is 16 characters long, includes keys symbols, numbers, and uppercase letters, but no repeating characters.",
    correct_answer: "good",
    why_short:
      "All constraints—length, character types, and exclusion rules—are explicitly defined.",
    missing_points: [],
    improved_prompt:
      "Generate a random password that is 16 characters long, includes keys symbols, numbers, and uppercase letters, but no repeating characters.",
  },
  {
    id: "B-CT-008",
    difficulty: "beginner",
    level: "standard",
    track: "constraints",
    lesson_type: "missing_tone",
    scenario: "You are declining a wedding invitation.",
    prompt_text:
      "Write a polite note declining a wedding invitation because I will be out of the country on that date.",
    correct_answer: "good",
    why_short:
      "The tone (polite), the action (declining), and the reason (travel) are all clearly provided.",
    missing_points: [],
    improved_prompt:
      "Write a polite note declining a wedding invitation because I will be out of the country on that date.",
  },

  // ============================================
  // OUTPUT FORMAT TRACK (B-OF)
  // ============================================
  {
    id: "B-OF-001",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_format",
    scenario: "You need a list of groceries to buy.",
    prompt_text: "Give me a list of healthy snacks.",
    correct_answer: "bad",
    why_short:
      "The AI could return a paragraph, a bulleted list, or a comma-separated line.",
    missing_points: [
      "Explicit format type (e.g., bullet points)",
      "Grouping or categorization",
    ],
    improved_prompt:
      "Give me a bulleted list of 10 healthy snacks, grouped by food group (e.g., Fruits, Nuts, Dairy).",
  },
  {
    id: "B-OF-002",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_structure_template",
    scenario: "You want to organize user feedback.",
    prompt_text: "Here is some raw feedback. Organize it for me.",
    correct_answer: "bad",
    why_short:
      "Without a structure or template, the 'organization' is up to random chance.",
    missing_points: ["Desired headings or categories", "Format for each entry"],
    improved_prompt:
      "Organize this raw feedback into a table with the following columns: 'Customer Name', 'Issue Category', 'Sentiment (Positive/Negative)', and 'Actionable Item'.",
  },
  {
    id: "B-OF-003",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_schema",
    scenario: "You need data for a software application.",
    prompt_text:
      "Extract the names and phone numbers from this text and give them to me in JSON.",
    correct_answer: "almost",
    why_short:
      "Requesting JSON is good, but the exact keys and structure are undefined.",
    missing_points: [
      "The specific JSON keys (e.g., 'full_name', 'phone_num')",
      "Structure (e.g., list of objects)",
    ],
    improved_prompt:
      "Extract the names and phone numbers from this text and return a JSON array of objects with keys: 'name' and 'phone'.",
  },
  {
    id: "B-OF-004",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_format",
    scenario: "You want to compare two products.",
    prompt_text: "Compare the iPhone 15 and Samsung S24.",
    correct_answer: "almost",
    why_short:
      "A comparison can be a long essay or a quick chart; specifying the format saves reading time.",
    missing_points: [
      "Format preference (e.g., table, side-by-side list)",
      "Comparison criteria",
    ],
    improved_prompt:
      "Create a comparison table for the iPhone 15 and Samsung S24, comparing them on: Price, Battery Life, Camera Specs, and Screen Size.",
  },
  {
    id: "B-OF-005",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "wrong_format_choice",
    scenario: "You are writing a poem.",
    prompt_text: "Write a poem about the ocean and format it as a CSV file.",
    correct_answer: "almost",
    why_short:
      "While a format is technically requested, CSV is a poor, illogical choice for a poem.",
    missing_points: [
      "A more suitable format (e.g., standard stanzas)",
      "Reasonable structure for the content type",
    ],
    improved_prompt:
      "Write a poem about the ocean, formatted into three 4-line stanzas.",
  },
  {
    id: "B-OF-006",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_structure_template",
    scenario: "You need to write meeting minutes.",
    prompt_text: "Summarize this meeting transcript into notes.",
    correct_answer: "almost",
    why_short: "Meeting notes usually need specific sections to be useful.",
    missing_points: [
      "Specific sections (e.g., Attendees, Key Decisions, Action Items)",
      "Layout preference",
    ],
    improved_prompt:
      "Summarize this meeting transcript into formatted notes with these bold headers: 'Attendees', 'Key Discussion Points', 'Decisions Made', and 'Action Items'.",
  },
  {
    id: "B-OF-007",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_schema",
    scenario: "You are converting a unit recipe.",
    prompt_text:
      "Convert this recipe's measurements to metric and output as a Markdown table with columns: 'Ingredient', 'Metric Amount', 'Original Amount'.",
    correct_answer: "good",
    why_short:
      "It specifies the transformation, the output format (Markdown table), and the exact columns.",
    missing_points: [],
    improved_prompt:
      "Convert this recipe's measurements to metric and output as a Markdown table with columns: 'Ingredient', 'Metric Amount', 'Original Amount'.",
  },
  {
    id: "B-OF-008",
    difficulty: "beginner",
    level: "standard",
    track: "output_format",
    lesson_type: "missing_format",
    scenario: "You want code comments generated.",
    prompt_text:
      "Add Python docstrings to each function in the attached code, following the Google Docstring Style Guide.",
    correct_answer: "good",
    why_short:
      "It specifies exactly what to add and the precise style standard to follow.",
    missing_points: [],
    improved_prompt:
      "Add Python docstrings to each function in the attached code, following the Google Docstring Style Guide.",
  },
];

export default beginnerStandardQuestions;
