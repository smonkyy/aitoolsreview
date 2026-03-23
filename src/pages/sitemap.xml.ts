/**
 * sitemap.xml — Sitemap custom con priority scoring intelligente
 *
 * Sostituisce @astrojs/sitemap per assegnare priorità semantiche basate
 * sulla profondità editoriale di ogni pagina:
 *
 * BLOG POSTS (priority da contenuto reale):
 *   ≥ 1500 parole  → 0.9   (recensione approfondita)
 *   ≥ 800 parole   → 0.8   (articolo standard)
 *   < 800 parole   → 0.7   (contenuto breve)
 *   Bonus +0.05 se ha updatedDate recente (< 30 giorni)
 *
 * CATEGORY HUB PAGES:
 *   /migliore-ai-per/*  → 0.85  (guide curate)
 *
 * COMPARISON PAGES:
 *   /confronta/*        → 0.7   (generate da dati — meno editoriale)
 *
 * STATIC PAGES:
 *   /                   → 1.0
 *   /blog/              → 0.85
 *   /confronta/         → 0.8
 *   /strumenti/         → 0.8
 *   /about/             → 0.4
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { TOOLS } from '../data/tools';
import { CATEGORY_PAGES } from '../data/category-pages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SitemapUrl {
  loc:         string;
  lastmod?:    string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority:    number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Conta le parole di un testo in modo approssimativo */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

/** Calcola la priority per un blog post in base alla profondità del contenuto */
function postPriority(post: { body?: string; data: { updatedDate?: Date; pubDate: Date } }): number {
  const wc   = wordCount(post.body ?? '');
  const base = wc >= 1500 ? 0.9 : wc >= 800 ? 0.8 : 0.7;

  // Bonus freshness: +0.05 se aggiornato negli ultimi 30 giorni
  const lastEdit  = post.data.updatedDate ?? post.data.pubDate;
  const daysSince = (Date.now() - lastEdit.getTime()) / (1_000 * 60 * 60 * 24);
  const bonus     = daysSince < 30 ? 0.05 : 0;

  return Math.min(1.0, +(base + bonus).toFixed(2));
}

/** Formatta una data in YYYY-MM-DD per <lastmod> */
function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Genera tutti gli slug per le comparison pages */
function buildComparisonSlugs(): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < TOOLS.length; i++) {
    for (let j = i + 1; j < TOOLS.length; j++) {
      slugs.push(`${TOOLS[i].id}-vs-${TOOLS[j].id}`);
    }
  }
  return slugs;
}

/** Escapa caratteri speciali XML nei valori delle URL */
function escapeXml(str: string): string {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

// ─── Sitemap generator ────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ site }) => {
  const base = String(site).replace(/\/$/, '');
  const today = isoDate(new Date());

  const posts = await getCollection('blog');
  const urls: SitemapUrl[] = [];

  // ── 1. Static pages ────────────────────────────────────────────────────────
  const staticPages: SitemapUrl[] = [
    { loc: `${base}/`,           lastmod: today, changefreq: 'daily',   priority: 1.0  },
    { loc: `${base}/blog/`,      lastmod: today, changefreq: 'daily',   priority: 0.85 },
    { loc: `${base}/confronta/`, lastmod: today, changefreq: 'weekly',  priority: 0.8  },
    { loc: `${base}/strumenti/`, lastmod: today, changefreq: 'weekly',  priority: 0.8  },
    { loc: `${base}/about/`,                     changefreq: 'yearly',  priority: 0.4  },
  ];
  urls.push(...staticPages);

  // ── 2. Blog posts — scored per profondità editoriale ───────────────────────
  const sortedPosts = [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  for (const post of sortedPosts) {
    urls.push({
      loc:         `${base}/blog/${post.id}/`,
      lastmod:     isoDate(post.data.updatedDate ?? post.data.pubDate),
      changefreq:  'weekly',
      priority:    postPriority(post),
    });
  }

  // ── 3. Category hub pages ──────────────────────────────────────────────────
  for (const cat of CATEGORY_PAGES) {
    urls.push({
      loc:        `${base}/migliore-ai-per/${cat.slug}/`,
      lastmod:    today,
      changefreq: 'weekly',
      priority:   0.85,
    });
  }

  // ── 4. Comparison pages ────────────────────────────────────────────────────
  // Ordinate per tool order (deterministico) — priorità uniforme 0.7
  for (const slug of buildComparisonSlugs()) {
    urls.push({
      loc:        `${base}/confronta/${slug}/`,
      changefreq: 'monthly',
      priority:   0.7,
    });
  }

  // ── Render XML ─────────────────────────────────────────────────────────────
  const urlEntries = urls
    .map(u => {
      const lines = [`  <url>`, `    <loc>${escapeXml(u.loc)}</loc>`];
      if (u.lastmod)    lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      lines.push(`    <priority>${u.priority.toFixed(2)}</priority>`);
      lines.push(`  </url>`);
      return lines.join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
