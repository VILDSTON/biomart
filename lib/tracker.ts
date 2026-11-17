/**
 * Lightweight Zero-Waste Storefront Analytics Tracker
 * Uses navigator.sendBeacon with fetch(keepalive: true) fallback.
 * Adds 0ms latency to storefront rendering.
 */

export interface TrackPayload {
  store_slug: string;
  store_id?: string;
  event_type: 'page_view' | 'product_view' | 'click';
  source?: string;
  is_unique?: boolean;
  product_id?: string;
  referrer?: string;
}

export function sendTrackEvent(payload: TrackPayload): void {
  if (typeof window === 'undefined') return;

  const bodyString = JSON.stringify({
    ...payload,
    referrer: payload.referrer || (typeof document !== 'undefined' ? document.referrer : ''),
  });

  // Prefer navigator.sendBeacon for true fire-and-forget 0ms latency
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([bodyString], { type: 'application/json' });
      const success = navigator.sendBeacon('/api/track', blob);
      if (success) return;
    } catch {}
  }

  // Fallback to fetch with keepalive
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyString,
      keepalive: true,
    }).catch(() => {});
  } catch {}
}

/**
 * Deduplicates unique store visits in sessionStorage within a 30-minute window.
 */
export function checkUniqueStoreVisit(storeSlug: string): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  const key = `biomart_visit_${storeSlug.toLowerCase().trim()}`;
  try {
    const lastVisit = window.sessionStorage.getItem(key);
    const now = Date.now();
    if (!lastVisit || now - parseInt(lastVisit, 10) > 30 * 60 * 1000) {
      window.sessionStorage.setItem(key, now.toString());
      return true;
    }
  } catch {}
  return false;
}
