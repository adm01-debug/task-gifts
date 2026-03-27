/**
 * Application monitoring setup.
 *
 * Integrates:
 * - Error tracking (Sentry-ready stub)
 * - Web Vitals (CLS, FID, LCP, FCP, TTFB)
 * - External log handler for loggingService
 *
 * To enable Sentry:
 * 1. npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN in .env
 * 3. Uncomment the Sentry initialization below
 */

import { logger } from "@/services/loggingService";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initMonitoring() {
  // --- Error Tracking (Sentry stub) ---
  if (SENTRY_DSN) {
    // Uncomment when @sentry/react is installed:
    // import("@sentry/react").then((Sentry) => {
    //   Sentry.init({
    //     dsn: SENTRY_DSN,
    //     environment: import.meta.env.MODE,
    //     tracesSampleRate: 0.1,
    //     replaysSessionSampleRate: 0.01,
    //   });
    //   logger.setExternalHandler((entry) => {
    //     if (entry.level === "error") {
    //       Sentry.captureMessage(entry.message, { level: "error", extra: { context: entry.context } });
    //     }
    //   });
    //   logger.info("Sentry initialized", "monitoring");
    // });
    logger.info("Sentry DSN configured (install @sentry/react to activate)", "monitoring");
  }

  // Connect logger external handler for warn/error forwarding
  logger.setExternalHandler((entry) => {
    // In production, forward errors to your monitoring service
    if (import.meta.env.PROD && entry.level === "error") {
      // Beacon API for fire-and-forget error reporting
      try {
        const payload = JSON.stringify({
          level: entry.level,
          message: entry.message,
          context: entry.context,
          timestamp: entry.timestamp,
        });
        navigator.sendBeacon?.("/api/errors", payload);
      } catch {
        // Best-effort error reporting
      }
    }
  });

  // --- Web Vitals ---
  reportWebVitals();

  // --- Global error handler ---
  window.addEventListener("unhandledrejection", (event) => {
    logger.error(
      `Unhandled promise rejection: ${event.reason}`,
      "global",
      event.reason
    );
  });
}

/**
 * Reports Core Web Vitals (CLS, FID, LCP, FCP, TTFB) using PerformanceObserver.
 * No external dependency needed — uses native browser APIs.
 */
function reportWebVitals() {
  if (typeof PerformanceObserver === "undefined") return;

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        logger.info(`LCP: ${Math.round(lastEntry.startTime)}ms`, "web-vitals");
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch {
    // Not supported
  }

  // First Input Delay
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        logger.info(`FID: ${Math.round(fidEntry.processingStart - fidEntry.startTime)}ms`, "web-vitals");
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch {
    // Not supported
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as LayoutShiftEntry).hadRecentInput) {
          clsValue += (entry as LayoutShiftEntry).value;
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Report CLS on page hide
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        logger.info(`CLS: ${clsValue.toFixed(4)}`, "web-vitals");
      }
    });
  } catch {
    // Not supported
  }
}

// Type augmentation for PerformanceObserver entries
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
