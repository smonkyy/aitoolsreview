import { TOOLS, type AITool } from '../data/tools';
import type { ComparisonFeedback } from './feedback';

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

  // 1. Popularity proxy: avg overall rating (0–5 → normalized 0–1)
  const popularity = (a.ratings.overall + b.ratings.overall) / 10;

  // 2. Category signal
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
