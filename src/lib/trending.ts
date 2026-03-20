/**
 * trending.ts — Build-time fetch of trending comparisons from Supabase.
 *
 * Called server-side during `astro build`. Returns an empty array if
 * Supabase is not configured (safe for local dev and first deploys).
 *
 * Env vars (no PUBLIC_ prefix — server-side only, never exposed to browser):
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 */

export interface TrendingComparison {
  slug: string;
  /** Views in the last 7 days */
  views_7d: number;
}

/**
 * Fetches the top trending comparisons by views in the last 7 days.
 * Returns an empty array on any error (graceful degradation).
 */
export async function fetchTrending(limit = 20): Promise<TrendingComparison[]> {
  const url = import.meta.env.SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/trending_comparisons?select=slug,views_7d&limit=${limit}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!res.ok) return [];
    return (await res.json()) as TrendingComparison[];
  } catch {
    return [];
  }
}

/**
 * Builds a slug → views_7d lookup map from trending data.
 * Used by getTopComparisons to apply a trending boost to scores.
 */
export function buildTrendingMap(trending: TrendingComparison[]): Map<string, number> {
  const maxViews = trending[0]?.views_7d ?? 1;
  return new Map(
    trending.map(t => [t.slug, t.views_7d / maxViews]) // normalize to 0–1
  );
}
