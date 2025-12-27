import posthog from "posthog-js";

// Define all events for type safety and consistency
export const EVENTS = {
  // Assessment Events
  ASSESSMENT_STARTED: "assessment_started",
  ASSESSMENT_COMPLETED: "assessment_completed",
  ASSESSMENT_QUESTION_ANSWERED: "assessment_question_answered",

  // Practice Events
  PRACTICE_SESSION_STARTED: "practice_session_started",
  PRACTICE_SESSION_COMPLETED: "practice_session_completed",
  PRACTICE_CARD_VIEWED: "practice_card_viewed",
  PRACTICE_CARD_ANSWERED: "practice_card_answered",

  // Career Coach Events
  CAREER_COACH_OPENED: "career_coach_opened",
  CAREER_COACH_MESSAGE_SENT: "career_coach_message_sent",
  CAREER_ROADMAP_GENERATED: "career_roadmap_generated",

  // User Engagement
  SIGNUP_COMPLETED: "signup_completed",
  LOGIN_COMPLETED: "login_completed",
  ONBOARDING_COMPLETED: "onboarding_completed",

  // Feature Usage
  FEATURE_USED: "feature_used",
  ERROR_OCCURRED: "error_occurred",
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Track a custom event with optional properties
 */
export function trackEvent(
  event: EventName,
  properties?: Record<string, unknown>
) {
  posthog.capture(event, properties);
}

// Convenience wrappers for common events
export const track = {
  assessmentStarted: (domain: string) =>
    trackEvent(EVENTS.ASSESSMENT_STARTED, { domain }),

  assessmentCompleted: (domain: string, score: number, timeSpent: number) =>
    trackEvent(EVENTS.ASSESSMENT_COMPLETED, {
      domain,
      score,
      time_spent_seconds: timeSpent,
    }),

  practiceSessionStarted: (trackId: string, levelId: string) =>
    trackEvent(EVENTS.PRACTICE_SESSION_STARTED, {
      track_id: trackId,
      level_id: levelId,
    }),

  practiceCardAnswered: (cardId: string, correct: boolean, timeSpent: number) =>
    trackEvent(EVENTS.PRACTICE_CARD_ANSWERED, {
      card_id: cardId,
      correct,
      time_spent_ms: timeSpent,
    }),

  featureUsed: (featureName: string, metadata?: Record<string, unknown>) =>
    trackEvent(EVENTS.FEATURE_USED, { feature: featureName, ...metadata }),

  errorOccurred: (error: string, context?: Record<string, unknown>) =>
    trackEvent(EVENTS.ERROR_OCCURRED, { error, ...context }),
};
