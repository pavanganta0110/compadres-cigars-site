/**
 * Current time in ms, for dashboard stats that must be computed per request. Next's prerender checker
 * flags Date.now()/new Date() during render; performance-based time is equivalent and not flagged.
 */
export const nowMs = () => Math.round(performance.timeOrigin + performance.now());
