import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

let isInitialized = false;

export function initPostHog(): void {
  if (typeof window === 'undefined' || isInitialized) return;

  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        disable_session_recording: false,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            ph.debug(false);
          }
        },
      });
      isInitialized = true;
    } catch (err) {
      console.warn('[PostHog] Initialization error:', err);
    }
  } else {
    // In local demo or before API key is provided, log gracefully without breaking
    if (process.env.NODE_ENV === 'development') {
      console.log('[PostHog] Ready (waiting for NEXT_PUBLIC_POSTHOG_KEY in .env)');
    }
  }
}

/**
 * Capture custom analytics event with properties
 */
export function captureEvent(eventName: string, properties?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    if (isInitialized) {
      posthog.capture(eventName, properties);
    }
  } catch (err) {
    console.warn('[PostHog] Error capturing event:', err);
  }
}

/**
 * Capture error or exception with contextual metadata for error tracking
 */
export function captureError(error: Error | string, context?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    const errorMsg = typeof error === 'string' ? error : error?.message || 'Unknown error';
    const errorStack = typeof error === 'object' && error?.stack ? error.stack : '';

    console.error('[Error Tracker]:', errorMsg, context || '');

    if (isInitialized) {
      posthog.capture('$exception', {
        $exception_message: errorMsg,
        $exception_stack_trace_raw: errorStack,
        ...context,
      });
    }
  } catch (err) {
    console.warn('[PostHog] Error capturing exception:', err);
  }
}

/**
 * Identify merchant or buyer session
 */
export function identifyUser(distinctId: string, properties?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  try {
    if (isInitialized) {
      posthog.identify(distinctId, properties);
    }
  } catch (err) {
    console.warn('[PostHog] Error identifying user:', err);
  }
}

export { posthog };
