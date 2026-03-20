/**
 * feedback.ts — Build-time fetch of comparison feedback and all-time views
 * from Supabase.
 *
 * Mirrors the trending.ts pattern: called server-side during `astro build`,
 * returns empty data if Supabase is not configured (safe for local dev).
 *
 * Env vars (server-side only, no PUBLIC_ prefix):
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 */

export interface ComparisonFeedback {
  slug: string;
  upvotes: number;
  downvotes: number;
  /** Fraction of positive votes (0–1). Default 0.5 if no votes yet. */
  positive_rate: number;
}

export interface ComparisonViews {
  slug: string;
  views: number;
}

// ─── Feedback ──────────────────────────────────────────────────────────────────

/**
 * Fetches per-slug feedback aggregates from the `comparison_feedback` view.
 * Returns an empty array on any error.
 */
export async function fetchFeedback(): Promise<ComparisonFeedback[]> {
  const url = import.meta.env.SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/comparison_feedback?select=slug,upvotes,downvotes,positive_rate`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as ComparisonFeedback[];
  } catch {
    return [];
  }
}

/** Builds a slug → FeedbackData lookup map. */
export function buildFeedbackMap(
  feedback: ComparisonFeedback[],
): Map<string, ComparisonFeedback> {
  return new Map(feedback.map(f => [f.slug, f]));
}

// ─── All-time views ────────────────────────────────────────────────────────────

/**
 * Fetches all-time view counts from the `comparison_stats` view.
 * Returns an empty array on any error.
 */
export async function fetchComparisonViews(): Promise<ComparisonViews[]> {
  const url = import.meta.env.SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/comparison_stats?select=slug,views`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    return (await res.json()) as ComparisonViews[];
  } catch {
    return [];
  }
}

/** Builds a slug → views lookup map. */
export function buildViewsMap(views: ComparisonViews[]): Map<string, number> {
  return new Map(views.map(v => [v.slug, v.views]));
}
