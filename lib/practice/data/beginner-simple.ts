/**
 * Beginner Simple Questions
 * Target audience: Ages 11-18
 *
 * These questions use simpler language and focus on scenario-based learning.
 * Questions are organized by track (inferred from ID prefix):
 * - B-CL: Clarity
 * - B-CX: Context
 * - B-CT: Constraints
 * - B-OF: Output Format
 */

import { BeginnerSimpleQuestion } from "../types";

export const beginnerSimpleQuestions: BeginnerSimpleQuestion[] = [
  {
    id: "B-CL-001",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need help writing an essay for English class.",
    why_short:
      "It doesn't say what the essay is about or how long it should be!",
    missing_points: ["Essay topic", "Word count", "Style"],
    improved_prompt:
      "Help me write a 500-word persuasive essay about why schools should have longer lunch breaks.",
  },
  {
    id: "B-CL-002",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want an Instagram caption for your new post.",
    why_short: "It doesn't say what's in the photo or what vibe you want!",
    missing_points: ["What's in the photo", "Mood/vibe", "Hashtags or emojis"],
    improved_prompt:
      "Write a funny Instagram caption for a photo of me and my friends at a concert with some music emojis.",
  },
  {
    id: "B-CL-003",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to understand a confusing chapter from your textbook.",
    why_short: "It doesn't say which subject or what's confusing!",
    missing_points: ["Subject", "Specific topic", "Your level"],
    improved_prompt:
      "Explain photosynthesis to me like I'm in 8th grade. Focus on the light reaction part because that's confusing.",
  },
  {
    id: "B-CL-004",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want ideas for a YouTube video.",
    why_short: "It doesn't say what kind of content you make or who watches!",
    missing_points: ["Your channel topic", "Video length", "Your audience"],
    improved_prompt:
      "Give me 5 video ideas for my gaming channel. My audience is teens and videos are about 10 minutes long.",
  },
  {
    id: "B-CL-005",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need help with a birthday message for your friend.",
    why_short:
      "It doesn't say anything about your friend or your relationship!",
    missing_points: ["Who it's for", "Inside jokes or interests", "Tone"],
    improved_prompt:
      "Write a funny birthday message for my best friend who loves anime and always makes me laugh.",
  },
  {
    id: "B-CL-006",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want book recommendations.",
    why_short: "It doesn't say what genres you like or books you've enjoyed!",
    missing_points: ["Favorite genres", "Books you liked", "What to avoid"],
    improved_prompt:
      "Recommend 3 fantasy books like Percy Jackson for a 15-year-old. Nothing too long—under 400 pages.",
  },
  {
    id: "B-CL-007",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need a study schedule for finals.",
    why_short: "This is great! It says the subjects, time, and format.",
    missing_points: [],
    improved_prompt:
      "Create a 2-week study plan for my finals covering Math, Biology, and History. I can study 2 hours on weekdays and 4 hours on weekends.",
  },
  {
    id: "B-CL-008",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want help debugging your code.",
    why_short:
      "This is perfect! It shows the error and asks for a specific fix.",
    missing_points: [],
    improved_prompt:
      "My Python code gives an 'index out of range' error on line 12. Here's the code: [paste code]. What's wrong and how do I fix it?",
  },
  {
    id: "B-CX-001",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want AI to check your math homework.",
    why_short: "The AI can't check without seeing the actual problem!",
    missing_points: ["The math problem", "Your answer"],
    improved_prompt:
      "I solved this problem: 'If a train travels 120 miles in 2 hours, what's its speed?' I got 60 mph. Is that right?",
  },
  {
    id: "B-CX-002",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want feedback on a text you're sending.",
    why_short: "The AI doesn't know what you wrote or who it's for!",
    missing_points: ["The message", "Who it's to", "What you want"],
    improved_prompt:
      "I'm asking my crush to hang out. Does this text sound chill and not too desperate? [paste your text]",
  },
  {
    id: "B-CX-003",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to create a quiz for your friends.",
    why_short: "It doesn't say what topic or how hard it should be!",
    missing_points: ["Quiz topic", "Number of questions", "Difficulty"],
    improved_prompt:
      "Create a 10-question trivia quiz about Marvel movies. Make it medium difficulty with multiple choice answers.",
  },
  {
    id: "B-CX-004",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want help planning a hangout with friends.",
    why_short:
      "It doesn't say how many friends, what you like, or your budget!",
    missing_points: ["Number of people", "Interests", "Budget"],
    improved_prompt:
      "Plan a fun Saturday hangout for 4 friends. We like movies and food, and each person has about $20 to spend.",
  },
  {
    id: "B-CX-005",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to start a story but you're stuck.",
    why_short: "It doesn't say the genre or any details about the story!",
    missing_points: ["Genre", "Main character", "Setting"],
    improved_prompt:
      "Help me start a mystery story about a teenager who finds a secret door in their school basement. Give me the first paragraph.",
  },
  {
    id: "B-CX-006",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want game recommendations.",
    why_short: "It doesn't say what platform or what games you already like!",
    missing_points: ["Platform", "Games you enjoyed", "Genre preference"],
    improved_prompt:
      "Recommend 3 games like Minecraft for Nintendo Switch. I like building and exploring, no super violent games.",
  },
  {
    id: "B-CX-007",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need to explain something to your younger sibling.",
    why_short: "This is good! It says who you're explaining to and the topic.",
    missing_points: [],
    improved_prompt:
      "Explain how the internet works to my 8-year-old brother using simple words and a fun example.",
  },
  {
    id: "B-CX-008",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want help with a science project idea.",
    why_short:
      "This is great! It gives the subject, requirements, and constraints.",
    missing_points: [],
    improved_prompt:
      "Give me 3 science fair project ideas about the environment. They should be doable in 2 weeks with household materials.",
  },
  {
    id: "B-CT-001",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want a summary of a book for class.",
    why_short: "You can't fit a whole book into just 20 words!",
    missing_points: ["Realistic length", "What to focus on"],
    improved_prompt:
      "Summarize 'To Kill a Mockingbird' in 2 paragraphs, focusing on the main themes and Atticus's character.",
  },
  {
    id: "B-CT-002",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to play a text adventure game with AI.",
    why_short: "The game has no setting, rules, or your character!",
    missing_points: ["Setting", "Your character", "Rules"],
    improved_prompt:
      "Let's play a survival adventure game. I'm stranded on a mysterious island. You describe what I see and give me 3 choices each turn.",
  },
  {
    id: "B-CT-003",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need to apologize to a friend.",
    why_short: "It doesn't say what happened or how serious it is!",
    missing_points: ["What happened", "Tone needed", "Your goal"],
    improved_prompt:
      "Help me write an apology text to my friend because I accidentally spoiled a movie for them. Keep it sincere but light.",
  },
  {
    id: "B-CT-004",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want a short TikTok script idea.",
    why_short: "It asks for too many things in too little time!",
    missing_points: ["Realistic length", "Pick one focus"],
    improved_prompt:
      "Write a funny 15-second TikTok script about the struggle of waking up for school on Monday.",
  },
  {
    id: "B-CT-005",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want a workout you can do at home.",
    why_short:
      "It doesn't say how long, your level, or what equipment you have!",
    missing_points: ["Time", "Fitness level", "Equipment"],
    improved_prompt:
      "Give me a 20-minute workout for beginners I can do in my bedroom with no equipment. Focus on core and legs.",
  },
  {
    id: "B-CT-006",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want Netflix movie recommendations for a movie night.",
    why_short: "It doesn't say the genre or who's watching!",
    missing_points: ["Genre", "Who's watching", "Mood"],
    improved_prompt:
      "Recommend 3 comedy movies on Netflix that are good for a sleepover with friends. Nothing scary!",
  },
  {
    id: "B-CT-007",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need a creative username for a new account.",
    why_short: "This is good! It gives style preferences and constraints.",
    missing_points: [],
    improved_prompt:
      "Create 5 cool usernames for my new gaming account. Include something about dragons, use numbers, and keep it under 15 characters.",
  },
  {
    id: "B-CT-008",
    difficulty: "beginner",
    level: "simple",
    scenario: "You can't go to a friend's party.",
    why_short: "This is good! It says to be polite and gives the reason.",
    missing_points: [],
    improved_prompt:
      "Write a nice text saying I can't come to the party because I have a family thing that weekend. Make it sound genuine.",
  },
  {
    id: "B-OF-001",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need a packing list for a school trip.",
    why_short: "It doesn't say how to organize it or what categories!",
    missing_points: ["Format type", "Categories"],
    improved_prompt:
      "Make a packing checklist for a 3-day school camping trip. Group items by: Clothes, Toiletries, Electronics, and Snacks.",
  },
  {
    id: "B-OF-002",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to rank your favorite songs.",
    why_short: "It doesn't say the format or what info to include!",
    missing_points: ["Format", "What details to include"],
    improved_prompt:
      "Make a table of my top 10 songs with columns for: Rank, Song Name, Artist, and Why I Love It.",
  },
  {
    id: "B-OF-003",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to track your daily habits.",
    why_short: "It doesn't say what format or what to track!",
    missing_points: ["Format", "Specific habits"],
    improved_prompt:
      "Create a weekly habit tracker as a table. Track: Water (8 glasses), Exercise, Reading, and Sleep (8 hours).",
  },
  {
    id: "B-OF-004",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to compare two phones before buying.",
    why_short: "A table is way better than paragraphs for comparing things!",
    missing_points: ["Table format", "What to compare"],
    improved_prompt:
      "Compare iPhone 15 and Samsung Galaxy S24 in a table showing: Price, Camera quality, Battery life, and Storage.",
  },
  {
    id: "B-OF-005",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to write a poem for class.",
    why_short: "A spreadsheet format (CSV) is a weird choice for a poem!",
    missing_points: ["Better format", "Structure"],
    improved_prompt:
      "Write a poem about friendship with 4 stanzas of 4 lines each. Make the last words of lines 2 and 4 rhyme.",
  },
  {
    id: "B-OF-006",
    difficulty: "beginner",
    level: "simple",
    scenario: "You need notes from a group project meeting.",
    why_short: "It needs clear sections to be useful!",
    missing_points: ["Sections", "Format"],
    improved_prompt:
      "Organize these meeting notes with headers: 'Attendees', 'What We Decided', 'Who Does What', and 'Next Meeting Date'.",
  },
  {
    id: "B-OF-007",
    difficulty: "beginner",
    level: "simple",
    scenario: "You're creating a character for a story.",
    why_short: "This is great! It asks for a specific template format.",
    missing_points: [],
    improved_prompt:
      "Create a character profile with these sections: Name, Age, Appearance, Personality, Backstory, and Special Abilities.",
  },
  {
    id: "B-OF-008",
    difficulty: "beginner",
    level: "simple",
    scenario: "You want to organize your playlist by mood.",
    why_short: "This is good! It specifies the exact organization format.",
    missing_points: [],
    improved_prompt:
      "Organize these songs into a list with categories: 'Hype/Workout', 'Chill/Study', 'Sad Hours', and 'Party Mode'.",
  },
];

export default beginnerSimpleQuestions;
