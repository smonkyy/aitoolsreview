import { TOOLS, type AITool } from '../data/tools';
import type { ComparisonFeedback } from './feedback';

// ─── Search interest map ────────────────────────────────────────────────────────
//
// Curated brand-recognition scores (0–100) based on actual Google search volume
// and mindshare. Intentionally separate from editorial ratings (which measure
// quality, not popularity). Update this when adding new tools or quarterly.
//
// To update continuously: run `npm run build` after each Supabase signal refresh.
// For automatic freshness: schedule a nightly redeploy in Vercel/Netlify CI.
//
const SEARCH_INTEREST: Record<string, number> = {
  'chatgpt-4o':       100, // most-searched AI tool globally
  'midjourney':        88,
  'claude-4':          87,
  'gemini-2-5-pro':    82, // forte crescita dopo lancio
  'github-copilot':    76, // free tier aumenta mindshare
  'grok-3':            72,
  'stable-diffusion':  70,
  'perplexity-ai':     68,
  'zapier':            66,
  'dall-e-3':          64,
  'elevenlabs':        62,
  'adobe-firefly':     58,
  'notion-ai':         57,
  'cursor':            56,
  'sora':              55,
  'whisper':           52,
  'runway-gen3':       50,
  'windsurf':          48,
  'leonardo-ai':       46,
  'heygen':            46,
  'make':              44,
  'replit-ai':         42,
  'jasper-ai':         40,
  'kling-ai':          38,
  'copy-ai':           34,
  'writesonic':        30,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface PrioritizedComparison {
  toolA: AITool;
  toolB: AITool;
  slug: string;
  /** 0–100 — higher = more likely to generate organic search traffic */
  priorityScore: number;
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Priority is a proxy for "how many people are likely to Google this comparison".
 *
 * Factors (in order of weight):
 *   1. Brand recognition  — both tools have high overall ratings → more known
 *   2. Category match     — same category = clearer head-to-head intent
 *   3. Price contrast     — free vs paid = very common decision query
 *   4. Badge presence     — editorial "Top Pick" / "Best Free" = signal of popularity
 */
function priorityScore(a: AITool, b: AITool): number {
  const sameCategory =
    a.category === b.category ||
    a.secondaryCategories?.includes(b.category) ||
    b.secondaryCategories?.includes(a.category);

  // 1. Brand recognition: use curated SEARCH_INTEREST; fall back to ratings proxy
  //    for tools not yet in the map. Normalized to 0–1.
  const interestA  = (SEARCH_INTEREST[a.id] ?? a.ratings.overall * 20) / 100;
  const interestB  = (SEARCH_INTEREST[b.id] ?? b.ratings.overall * 20) / 100;
  const popularity = (interestA + interestB) / 2;

  // 2. Category signal: same primary > overlapping secondary > no overlap
  const categoryBonus = a.category === b.category ? 1.0 : sameCategory ? 0.75 : 0;

  // 3. Price contrast: "free vs paid" searches are high-intent
  const priceContrast = a.pricing.hasFreeOption !== b.pricing.hasFreeOption ? 1.0 : 0.5;

  // 4. Editorial badge presence (each badge adds 0.1)
  const badgeBonus = (a.badge ? 0.1 : 0) + (b.badge ? 0.1 : 0);

  return Math.round(
    (popularity * 0.45 + categoryBonus * 0.35 + priceContrast * 0.1 + badgeBonus * 0.1) * 100,
  );
}

// ─── Dynamic scoring ───────────────────────────────────────────────────────────

/**
 * Adjusts a base priority score using real user signals:
 *
 * - Click boost  (+0 → +10): logarithmic — rewards popular pages without
 *   letting high-traffic outliers dominate.
 *   10 views → +3.5 | 100 views → +7 | 500 views → +9.5
 *
 * - Feedback boost (−10 → +10): positive if upvote rate > 50%, negative
 *   otherwise. Requires at least 5 votes to avoid noise from single votes.
 *
 * Final score is capped at 100.
 */
function dynamicScore(
  base: number,
  views: number,
  feedback: ComparisonFeedback | undefined,
): number {
  const clickBoost = Math.min(Math.log1p(views) * 1.5, 10);

  const total = (feedback?.upvotes ?? 0) + (feedback?.downvotes ?? 0);
  const rate  = total >= 5 ? feedback!.positive_rate : 0.5;
  const feedbackBoost = (rate - 0.5) * 20;

  return Math.min(Math.round(base + clickBoost + feedbackBoost), 100);
}

// ─── Entry points ──────────────────────────────────────────────────────────────

/**
 * Returns up to `limit` comparison pairs, ranked by priority score.
 * Skips pairs with no category overlap — those aren't meaningful comparisons.
 *
 * @param limit       How many results to return (default 12)
 * @param trendingMap slug → normalized views (0–1) from the last 7 days.
 *                    Built by `buildTrendingMap()` in trending.ts.
 *                    Adds up to +15 points to observed comparisons.
 * @param viewsMap    slug → all-time view count. Built by `buildViewsMap()` in feedback.ts.
 *                    Feeds the click boost in `dynamicScore()`.
 * @param feedbackMap slug → feedback aggregates. Built by `buildFeedbackMap()` in feedback.ts.
 *                    Feeds the feedback boost in `dynamicScore()`.
 */
export function getTopComparisons(
  limit = 12,
  trendingMap:  Map<string, number>              = new Map(),
  viewsMap:     Map<string, number>              = new Map(),
  feedbackMap:  Map<string, ComparisonFeedback>  = new Map(),
): PrioritizedComparison[] {
  const pairs: PrioritizedComparison[] = [];

  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      const a = TOOLS[i];
      const b = TOOLS[j];

      const sameCategory = a.category === b.category;
      const overlapping =
        a.secondaryCategories?.includes(b.category) ||
        b.secondaryCategories?.includes(a.category);

      if (!sameCategory && !overlapping) continue;

      const slug = `${a.id}-vs-${b.id}`;
      const trendBoost = Math.round((trendingMap.get(slug) ?? 0) * 15);
      const base       = Math.min(100, priorityScore(a, b) + trendBoost);

      pairs.push({
        toolA:         a,
        toolB:         b,
        slug,
        priorityScore: dynamicScore(base, viewsMap.get(slug) ?? 0, feedbackMap.get(slug)),
      });
    }
  }

  return pairs
    .sort((x, y) => y.priorityScore - x.priorityScore)
    .slice(0, limit);
}

/**
 * Given any two tool IDs, returns the canonical slug (A always comes first
 * in TOOLS array order — matching getStaticPaths in [comparison].astro).
 */
export function canonicalSlug(idA: string, idB: string): string {
  const order = TOOLS.map(t => t.id);
  const iA = order.indexOf(idA);
  const iB = order.indexOf(idB);
  const [first, second] = iA <= iB ? [idA, idB] : [idB, idA];
  return `${first}-vs-${second}`;
}

/**
 * Returns up to `limit` comparisons that involve at least one of `anchorIds`,
 * ranked by dynamic priority score and excluding `excludeSlug`.
 *
 * Use this to populate "Altri confronti correlati" sections on comparison and
 * tool detail pages. The same Supabase maps used by getTopComparisons can be
 * passed here to apply real user-signal boosts.
 *
 * @param anchorIds   Tool IDs whose comparisons should be included.
 * @param excludeSlug The current comparison slug — omitted from results.
 * @param limit       Max results (default 5).
 */
export function getRelatedComparisons(
  anchorIds:    string[],
  excludeSlug:  string,
  limit         = 5,
  trendingMap:  Map<string, number>             = new Map(),
  viewsMap:     Map<string, number>             = new Map(),
  feedbackMap:  Map<string, ComparisonFeedback> = new Map(),
): PrioritizedComparison[] {
  const anchorSet = new Set(anchorIds);
  const seen      = new Set<string>();
  const pairs: PrioritizedComparison[] = [];

  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      const a = TOOLS[i];
      const b = TOOLS[j];

      // At least one side must be an anchor
      if (!anchorSet.has(a.id) && !anchorSet.has(b.id)) continue;

      const slug = `${a.id}-vs-${b.id}`;
      if (slug === excludeSlug || seen.has(slug)) continue;
      seen.add(slug);

      // Require some category overlap (same logic as getTopComparisons)
      const sameCategory  = a.category === b.category;
      const overlapping   =
        a.secondaryCategories?.includes(b.category) ||
        b.secondaryCategories?.includes(a.category);
      if (!sameCategory && !overlapping) continue;

      const trendBoost = Math.round((trendingMap.get(slug) ?? 0) * 15);
      const base       = Math.min(100, priorityScore(a, b) + trendBoost);

      pairs.push({
        toolA:         a,
        toolB:         b,
        slug,
        priorityScore: dynamicScore(base, viewsMap.get(slug) ?? 0, feedbackMap.get(slug)),
      });
    }
  }

  return pairs
    .sort((x, y) => y.priorityScore - x.priorityScore)
    .slice(0, limit);
}
