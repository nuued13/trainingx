/**
 * Generate dynamic feedback messages based on user score
 */

export interface FeedbackMessage {
  greeting: string;
  encouragement: string;
  emoji: string;
}

/**
 * Get personalized feedback based on score percentage
 * @param score - Score from 0-100
 * @param userName - User's name for personalization
 * @returns Personalized feedback message
 */
export function getFeedbackByScore(score: number, userName: string): FeedbackMessage {
  if (score >= 90) {
    return {
      greeting: `Outstanding work, ${userName}!`,
      encouragement: "You're an AI prompting expert! Your skills are exceptional.",
      emoji: "🏆"
    };
  } else if (score >= 80) {
    return {
      greeting: `Excellent job, ${userName}!`,
      encouragement: "You have a strong grasp of AI prompting fundamentals.",
      emoji: "🌟"
    };
  } else if (score >= 70) {
    return {
      greeting: `Great work, ${userName}!`,
      encouragement: "You're well on your way to mastering AI prompting.",
      emoji: "💪"
    };
  } else if (score >= 60) {
    return {
      greeting: `Good effort, ${userName}!`,
      encouragement: "You have a solid foundation. Keep practicing to improve.",
      emoji: "👍"
    };
  } else if (score >= 50) {
    return {
      greeting: `Nice start, ${userName}!`,
      encouragement: "You're building your skills. Let's take them to the next level.",
      emoji: "🚀"
    };
  } else {
    return {
      greeting: `Keep going, ${userName}!`,
      encouragement: "Everyone starts somewhere. You're on the path to improvement.",
      emoji: "💡"
    };
  }
}

/**
 * Get detailed feedback for assessment completion
 * @param percentage - Score percentage (0-100)
 * @returns Detailed feedback message
 */
export function getDetailedFeedback(percentage: number): string {
  if (percentage >= 90) {
    return "Excellent work! You've mastered this material.";
  } else if (percentage >= 80) {
    return "Great job! You have a solid understanding of this topic.";
  } else if (percentage >= 70) {
    return "Good work! Consider reviewing the areas where you lost points.";
  } else if (percentage >= 60) {
    return "You're making progress! Focus on strengthening your weaker areas.";
  } else {
    return "Keep practicing! Review the material and try again.";
  }
}

/**
 * Get score level classification
 * @param score - Score from 0-100
 * @returns Level classification
 */
export function getScoreLevel(score: number): "expert" | "advanced" | "intermediate" | "beginner" {
  if (score >= 80) return "expert";
  if (score >= 70) return "advanced";
  if (score >= 50) return "intermediate";
  return "beginner";
}

/**
 * Get motivational message based on score level
 * @param score - Score from 0-100
 * @returns Motivational message
 */
export function getMotivationalMessage(score: number): string {
  const level = getScoreLevel(score);
  
  switch (level) {
    case "expert":
      return "🎉 Excellent! You have a strong foundation in AI prompting. Continue to the full assessment to unlock career opportunities and earn certifications.";
    case "advanced":
      return "🌟 Impressive! You're nearly at expert level. A bit more practice and you'll be unstoppable.";
    case "intermediate":
      return "👍 Good start! You understand the basics. Let's refine your skills with hands-on practice and unlock more advanced techniques.";
    case "beginner":
      return "💪 Everyone starts somewhere! TrainingX.Ai will help you master prompting step by step. Complete projects, earn badges, and build your AI skillset.";
  }
}
