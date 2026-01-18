// convex/assessmentQuestions.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Store all 17 questions with age-branching logic
export const getQuestions = query({
  args: { ageGroup: v.string() }, // "8-14", "15-18", "18+"
  handler: async (ctx, args) => {
    const questions = await ctx.db.query("assessment_questions")
      .filter((q) => q.eq(q.field("ageGroup"), args.ageGroup))
      .order("asc")
      .collect();
    return questions;
  },
});

export const seedQuestions = mutation({
  handler: async (ctx) => {
    // Clear existing
    const existing = await ctx.db.query("assessment_questions").collect();
    for (const q of existing) {
      await ctx.db.delete(q._id);
    }

    // QUESTIONS FOR ALL AGE GROUPS (8-14, 15-18, 18+)
    const allAgeQuestions = [
      {
        id: 1,
        ageGroup: "all",
        question: "When you ask AI for help, what do you usually want?",
        options: [
          { text: "A quick answer", skill: "Problem-Solving", weight: 1 },
          { text: "Step-by-step help", skill: "Iteration", weight: 2 },
          { text: "Ideas to explore", skill: "Creativity", weight: 2 },
          { text: "Something I can share", skill: "Audience Awareness", weight: 1 }
        ]
      },
      {
        id: 2,
        ageGroup: "all",
        question: "If AI gives you a weird answer, what do you do?",
        options: [
          { text: "Try again with different words", skill: "Communication", weight: 2 },
          { text: "Ask it to explain", skill: "Context Understanding", weight: 2 },
          { text: "Give up and try something else", skill: "Problem-Solving", weight: 0 },
          { text: "Ask a friend or adult", skill: "Collaboration", weight: 1 }
        ]
      },
      {
        id: 3,
        ageGroup: "all",
        question: "What kind of AI task sounds most fun to you?",
        options: [
          { text: "Making pictures or videos", skill: "Creativity", weight: 2 },
          { text: "Getting homework help", skill: "Problem-Solving", weight: 1 },
          { text: "Building something cool", skill: "Iteration", weight: 2 },
          { text: "Learning something new", skill: "Context Understanding", weight: 2 }
        ]
      }
    ];

    // AGE 8-14 SPECIFIC
    const age8_14 = [
      {
        id: 4,
        ageGroup: "8-14",
        question: "When you tell AI what you want, how do you say it?",
        options: [
          { text: "Short and simple", skill: "Communication", weight: 1 },
          { text: "I give details and examples", skill: "Context Understanding", weight: 2 },
          { text: "I ask it like a question", skill: "Communication", weight: 1 },
          { text: "I'm not sure how to say it", skill: "Communication", weight: 0 }
        ]
      },
      {
        id: 5,
        ageGroup: "8-14",
        question: "If you could use AI to make something, what would it be?",
        options: [
          { text: "A game or app", skill: "Creativity", weight: 2 },
          { text: "Art or a story", skill: "Creativity", weight: 2 },
          { text: "Help with schoolwork", skill: "Problem-Solving", weight: 1 },
          { text: "Something for my friends", skill: "Audience Awareness", weight: 2 }
        ]
      }
    ];

    // AGE 15-18 SPECIFIC
    const age15_18 = [
      {
        id: 4,
        ageGroup: "15-18",
        question: "When working on a project, how do you use AI?",
        options: [
          { text: "Get it started, then I take over", skill: "Iteration", weight: 2 },
          { text: "Go back and forth to improve it", skill: "Iteration", weight: 3 },
          { text: "Just once to get an answer", skill: "Problem-Solving", weight: 1 },
          { text: "To check my work", skill: "Context Understanding", weight: 2 }
        ]
      },
      {
        id: 5,
        ageGroup: "15-18",
        question: "What AI skill would help you most right now?",
        options: [
          { text: "Getting better grades", skill: "Problem-Solving", weight: 2 },
          { text: "Starting a side hustle", skill: "Creativity", weight: 2 },
          { text: "Building my portfolio", skill: "Audience Awareness", weight: 2 },
          { text: "Learning career skills", skill: "Context Understanding", weight: 2 }
        ]
      }
    ];

    // AGE 18+ SPECIFIC
    const age18Plus = [
      {
        id: 4,
        ageGroup: "18+",
        question: "How do you approach AI prompting at work or school?",
        options: [
          { text: "I iterate until it's right", skill: "Iteration", weight: 3 },
          { text: "I give clear context upfront", skill: "Context Understanding", weight: 3 },
          { text: "I keep it simple and direct", skill: "Communication", weight: 2 },
          { text: "I'm still learning how", skill: "Problem-Solving", weight: 1 }
        ]
      },
      {
        id: 5,
        ageGroup: "18+",
        question: "What's your biggest AI goal right now?",
        options: [
          { text: "Advance my career", skill: "Problem-Solving", weight: 2 },
          { text: "Build or scale a business", skill: "Creativity", weight: 3 },
          { text: "Earn extra income", skill: "Audience Awareness", weight: 2 },
          { text: "Learn AI deeply", skill: "Context Understanding", weight: 3 }
        ]
      }
    ];

    // UNIVERSAL FINAL QUESTIONS (all ages)
    const finalQuestions = [
      {
        id: 6,
        ageGroup: "all",
        question: "Who do you want to help or impress with your AI skills?",
        options: [
          { text: "My teacher or boss", skill: "Audience Awareness", weight: 2 },
          { text: "My friends or team", skill: "Collaboration", weight: 2 },
          { text: "Myself (personal goals)", skill: "Problem-Solving", weight: 1 },
          { text: "Everyone online", skill: "Audience Awareness", weight: 2 }
        ]
      },
      {
        id: 7,
        ageGroup: "all",
        question: "How do you feel about trying new AI tools?",
        options: [
          { text: "Excited! I want to try them all", skill: "Creativity", weight: 2 },
          { text: "Curious but careful", skill: "Context Understanding", weight: 2 },
          { text: "Only if I need them", skill: "Problem-Solving", weight: 1 },
          { text: "Nervous, I need help", skill: "Communication", weight: 1 }
        ]
      }
    ];

    // Insert all questions
    const allQuestions = [
      ...allAgeQuestions,
      ...age8_14,
      ...age15_18,
      ...age18Plus,
      ...finalQuestions
    ];

    for (const q of allQuestions) {
      await ctx.db.insert("assessment_questions", q);
    }

    return { success: true, count: allQuestions.length };
  },
});
