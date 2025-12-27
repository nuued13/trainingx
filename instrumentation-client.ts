import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest", // Use reverse proxy to bypass ad blockers
  ui_host: "https://us.i.posthog.com",
  defaults: "2025-11-30",
  // Industry-standard settings
  capture_pageview: true, // Auto-capture page views
  capture_pageleave: true, // Track when users leave pages
  autocapture: true, // Auto-capture clicks, form submissions
  session_recording: {
    maskAllInputs: true, // Privacy: mask form inputs in recordings
    maskTextSelector: ".sensitive", // Mask elements with .sensitive class
  },
  loaded: (posthog) => {
    // Enable debug mode in development
    if (process.env.NODE_ENV === "development") {
      posthog.debug();
    }
  },
});

export default posthog;
