export function trackEvent(event: string, data?: any) {
  console.log('[Analytics]', event, data);

  // Wire to PostHog, Mixpanel, Google Analytics, etc.
  // Example:
  // if (window.posthog) {
  //   window.posthog.capture(event, data);
  // }
}
