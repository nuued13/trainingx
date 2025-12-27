import posthog from "posthog-js";

interface UserProperties {
  email?: string;
  name?: string;
  plan?: "free" | "pro" | "enterprise";
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Identify a user in PostHog after authentication
 * Call this after login/signup - links anonymous events to the user
 */
export function identifyUser(userId: string, properties?: UserProperties) {
  posthog.identify(userId, properties);
}

/**
 * Reset user identity on logout
 * Creates a new anonymous ID for the session
 */
export function resetUser() {
  posthog.reset();
}

/**
 * Update user properties without changing identity
 */
export function setUserProperties(properties: UserProperties) {
  posthog.setPersonProperties(properties);
}
