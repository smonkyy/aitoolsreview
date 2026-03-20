/**
 * analytics.ts — Client-side event tracker
 *
 * Fire-and-forget: every event is a POST to Supabase `events` table via REST.
 * Fails silently — never blocks UI or throws to the caller.
 *
 * Env vars required (PUBLIC_ prefix = exposed to browser by Vite/Astro):
 *   PUBLIC_SUPABASE_URL
 *   PUBLIC_SUPABASE_ANON_KEY
 */

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventType =
  | 'page_view'        // any page load
  | 'comparison_view'  // /confronta/[slug] opened
  | 'cta_click'        // "Usa l'AI Tool Advisor" or main CTAs clicked
  | 'tool_click'       // link to an external tool clicked
  | 'advisor_complete' // AIToolFinder finished (results shown)
  | 'comparison_pick'; // user selects a comparison from the picker/grid

export interface TrackPayload {
  event_type: EventType;
  /** comparison slug or page path */
  slug?: string;
  /** tool IDs involved (for comparison events) */
  tool_a?: string;
  tool_b?: string;
  /** any extra structured data */
  meta?: Record<string, unknown>;
}

// ─── Core tracker ──────────────────────────────────────────────────────────────

/**
 * Track an event. Non-blocking — uses fetch with keepalive so it survives
 * page navigations. Silently ignored if env vars are missing.
 */
export function track(payload: TrackPayload): void {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(payload),
    keepalive: true, // survives page unload / navigation
  }).catch(() => { /* intentionally silent */ });
}

// ─── Convenience helpers ────────────────────────────────────────────────────────

export function trackPageView(path: string): void {
  track({ event_type: 'page_view', slug: path });
}

export function trackComparisonView(slug: string, toolA: string, toolB: string): void {
  track({ event_type: 'comparison_view', slug, tool_a: toolA, tool_b: toolB });
}

export function trackCtaClick(label: string, slug?: string): void {
  track({ event_type: 'cta_click', slug, meta: { label } });
}

export function trackToolClick(toolId: string, source: string): void {
  track({ event_type: 'tool_click', tool_a: toolId, meta: { source } });
}

export function trackAdvisorComplete(selections: Record<string, string>, topToolId: string): void {
  track({
    event_type: 'advisor_complete',
    tool_a: topToolId,
    meta: { selections },
  });
}
