// AI Agent Messages - Personalized based on Digital Thumbprint scores

export interface AgentMessage {
  agentName: string;
  message: string;
  icon: string;
  color: string;
}

export interface UserScores {
  problemSolving: number;
  communication: number;
  audienceAwareness: number;
  iteration: number;
  contextUnderstanding: number;
  creativity: number;
}

// Homepage Agent (Spiral) - Welcome message
export function getHomepageAgentMessage(userName?: string): AgentMessage {
  return {
    agentName: "Spiral",
    message: `Hey${userName ? ` ${userName}` : ''}! I'm Spiral, your AI guide. Ready to discover your AI superpowers in 60 seconds? Take the assessment and I'll show you which AI careers, side hustles, and pathways match your unique skills!`,
    icon: "✨",
    color: "purple"
  };
}

// User Setup Agent - Explains assessment results
export function getUserSetupAgentMessage(scores: UserScores, topSkill: string): AgentMessage {
  const skillName = topSkill.replace(/([A-Z])/g, ' $1').trim();
  const topScore = scores[topSkill as keyof UserScores];
  
  return {
    agentName: "Setup Assistant",
    message: `Amazing! Your Digital Thumbprint is ready. Your top skill is ${skillName} (${topScore}%)! This puts you in the top tier for ${getTopPathwayForSkill(topSkill)}. Let me show you what this unlocks...`,
    icon: "🎯",
    color: "blue"
  };
}

// AI Success Pathway Agent - Explains pathway matches
export function getPathwayAgentMessage(scores: UserScores, pathwayCount: number): AgentMessage {
  const avgScore = Math.round(
    (scores.problemSolving + scores.communication + scores.audienceAwareness + 
     scores.iteration + scores.contextUnderstanding + scores.creativity) / 6
  );
  
  let encouragement = "";
  if (avgScore >= 85) {
    encouragement = "You're crushing it! Your scores unlock TOP-TIER opportunities.";
  } else if (avgScore >= 70) {
    encouragement = "Strong profile! You're ready for high-growth AI pathways.";
  } else {
    encouragement = "Great start! Let's build these skills to unlock even more pathways.";
  }
  
  return {
    agentName: "Pathway Guide",
    message: `${encouragement} I found ${pathwayCount} AI pathways that match your skills. These include careers ($80K-$150K), side hustles ($30-$150/hr), trades with AI integration, and business opportunities. Want to see your top matches?`,
    icon: "🚀",
    color: "green"
  };
}

// Practice Zone Agent - Recommends practice
export function getPracticeZoneAgentMessage(scores: UserScores): AgentMessage {
  const weakestSkill = getWeakestSkill(scores);
  const weakestSkillName = weakestSkill.replace(/([A-Z])/g, ' $1').trim();
  const weakestScore = scores[weakestSkill as keyof UserScores];
  
  return {
    agentName: "Practice Coach",
    message: `Your ${weakestSkillName} is at ${weakestScore}%. Let's boost it! I've got exercises, challenges, and AI tools to practice with. Every 5% improvement unlocks new pathways. Ready to level up?`,
    icon: "💪",
    color: "orange"
  };
}

// Learning Flash Game Agent - Instant feedback
export function getFlashGameAgentMessage(correct: boolean, streak: number): AgentMessage {
  if (correct) {
    if (streak >= 5) {
      return {
        agentName: "Game Master",
        message: `🔥 ${streak} in a row! You're on FIRE! Keep this streak going and you'll unlock bonus XP!`,
        icon: "🎮",
        color: "red"
      };
    }
    return {
      agentName: "Game Master",
      message: `✅ Correct! +10 XP. That's the kind of thinking that gets you hired in AI roles. Next question...`,
      icon: "🎮",
      color: "green"
    };
  } else {
    return {
      agentName: "Game Master",
      message: `Not quite! But here's why: ${getHintForQuestion()}. Try another one - you learn faster from mistakes!`,
      icon: "🎮",
      color: "yellow"
    };
  }
}

// App Studio Agent - Generates project ideas
export function getAppStudioAgentMessage(scores: UserScores): AgentMessage {
  const topSkills = getTopTwoSkills(scores);
  const project = suggestProjectForSkills(topSkills);
  
  return {
    agentName: "Studio Builder",
    message: `Based on your ${topSkills[0]} and ${topSkills[1]} skills, I recommend building: ${project}. I'll guide you through it step-by-step using Gemini Apps. Want to start?`,
    icon: "🛠️",
    color: "purple"
  };
}

// Community Matching Agent - Introduces mentors
export function getCommunityAgentMessage(mentorCount: number, peerCount: number): AgentMessage {
  return {
    agentName: "Community Connector",
    message: `I found ${mentorCount} mentors who scored like you 5+ years ago and ${peerCount} peers learning alongside you right now. Want intros? Mentors can fast-track your journey by sharing what worked for them.`,
    icon: "🤝",
    color: "blue"
  };
}

// Teacher Co-Pilot Agent (Admin) - For Boys & Girls Clubs directors
export function getTeacherCoPilotMessage(learnerCount: number, topPathway: string): AgentMessage {
  return {
    agentName: "Teacher Co-Pilot",
    message: `Your ${learnerCount} learners are making progress! Top pathway match: ${topPathway} (45% of students). I'm tracking their skill growth and can generate reports for funders. What would you like to see?`,
    icon: "📊",
    color: "teal"
  };
}

// Spiral Study Buddy - Homework help
export function getSpiralStudyBuddyMessage(subject?: string): AgentMessage {
  if (subject) {
    return {
      agentName: "Spiral Study Buddy",
      message: `Hey! Need help with ${subject}? I can explain concepts, work through problems with you, or quiz you to test your understanding. What are you working on?`,
      icon: "📚",
      color: "purple"
    };
  }
  return {
    agentName: "Spiral Study Buddy",
    message: `Hey! I'm your 24/7 homework helper. Math, science, reading, coding - whatever you need. Just tell me what you're stuck on and I'll break it down for you. Voice chat or text?`,
    icon: "📚",
    color: "purple"
  };
}

// Analytics Agent - Shows growth
export function getAnalyticsAgentMessage(improvement: number, timeframe: string): AgentMessage {
  let motivation = "";
  if (improvement >= 15) {
    motivation = "That's EXCEPTIONAL growth! Keep this pace and you'll be job-ready in weeks.";
  } else if (improvement >= 8) {
    motivation = "Solid progress! You're improving faster than 70% of users.";
  } else {
    motivation = "Every percentage point counts. Stay consistent and results compound!";
  }
  
  return {
    agentName: "Analytics Tracker",
    message: `Your skills improved ${improvement}% over the past ${timeframe}! ${motivation} Your top growing skill unlocked 3 new pathway matches. Want to see them?`,
    icon: "📈",
    color: "green"
  };
}

// Helper functions
function getTopPathwayForSkill(skill: string): string {
  const pathways: Record<string, string> = {
    problemSolving: "AI Data Analyst and AI Prompt Engineer roles",
    communication: "AI Marketing Specialist and AI Content Creator roles",
    audienceAwareness: "AI Social Media Manager and AI Marketing roles",
    iteration: "AI Prompt Engineer and AI Virtual Assistant roles",
    contextUnderstanding: "AI Research Analyst and AI Consulting roles",
    creativity: "AI Content Creator and AI Design roles"
  };
  return pathways[skill] || "multiple AI career pathways";
}

function getWeakestSkill(scores: UserScores): string {
  let weakest = "problemSolving";
  let lowestScore = scores.problemSolving;
  
  Object.entries(scores).forEach(([skill, score]) => {
    if (score < lowestScore) {
      weakest = skill;
      lowestScore = score;
    }
  });
  
  return weakest;
}

function getTopTwoSkills(scores: UserScores): string[] {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return [
    sorted[0][0].replace(/([A-Z])/g, ' $1').trim(),
    sorted[1][0].replace(/([A-Z])/g, ' $1').trim()
  ];
}

function suggestProjectForSkills(skills: string[]): string {
  const projects = [
    "A content generation bot that writes social media posts",
    "An AI-powered customer service assistant",
    "A personalized study guide generator",
    "An automated email responder with tone adaptation",
    "A product description generator for e-commerce"
  ];
  return projects[Math.floor(Math.random() * projects.length)];
}

function getHintForQuestion(): string {
  return "The best prompts are specific, provide context, and tell the AI exactly what format you want.";
}
