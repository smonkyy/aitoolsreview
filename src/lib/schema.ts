/**
 * schema.ts — JSON-LD SoftwareApplication generator
 *
 * Per ogni tool nel database genera uno schema strutturato conforme a
 * schema.org/SoftwareApplication, comprensivo di:
 *   - aggregateRating  (ratingValue basato sul rating editoriale del sito)
 *   - offers           (free + paid tier quando disponibile)
 *   - applicationCategory (mappato da ToolCategory a schema.org values)
 *
 * Usato da: confronta/[comparison].astro, migliore-ai-per/[category].astro,
 *            blog/[slug].astro (via BlogPost.astro)
 */

import type { AITool } from '../data/tools';

// ─── Mapping categoria → schema.org applicationCategory ───────────────────────

const CATEGORY_MAP: Record<string, string> = {
  scrittura:    'Productivity',
  immagini:     'GraphicsApplication',
  video:        'VideoApplication',
  audio:        'MultimediaApplication',
  produttivita: 'BusinessApplication',
  coding:       'DeveloperApplication',
};

// ─── Offers builder ───────────────────────────────────────────────────────────

function buildOffers(tool: AITool): object | object[] {
  const paidOffer = tool.pricing.startingPriceUsd
    ? {
        '@type': 'Offer',
        name: 'Pro',
        price: tool.pricing.startingPriceUsd.toFixed(2),
        priceCurrency: 'USD',
        billingDuration: 'P1M', // mensile
      }
    : null;

  if (tool.pricing.hasFreeOption) {
    const freeOffer = {
      '@type': 'Offer',
      name: 'Gratuito',
      price: '0',
      priceCurrency: 'USD',
    };
    return paidOffer ? [freeOffer, paidOffer] : freeOffer;
  }

  return paidOffer ?? {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  };
}

// ─── Main schema factory ──────────────────────────────────────────────────────

/**
 * Converte un AITool in un oggetto JSON-LD SoftwareApplication pronto per
 * l'iniezione nel <head> via <script type="application/ld+json">.
 *
 * @param tool     - il tool dal database
 * @param siteUrl  - URL base del sito (es. "https://aitoolsreview.it/")
 */
export function toolToSchema(tool: AITool, siteUrl: string): object {
  const base = siteUrl.replace(/\/$/, '');
  const toolUrl = tool.affiliateUrl ?? `${base}${tool.link.startsWith('/') ? tool.link : `/${tool.link}`}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${base}/strumenti#${tool.id}`,
    name: tool.name,
    description: [tool.tagline, ...tool.strengths.slice(0, 2)].join('. '),
    applicationCategory: CATEGORY_MAP[tool.category] ?? 'Application',
    operatingSystem: 'Web',
    url: toolUrl,

    // Valutazione editoriale del sito
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.ratings.overall.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: 1, // recensione editoriale di aitoolsreview.it
    },

    // Pricing strutturato
    offers: buildOffers(tool),

    // Campi opzionali
    ...(tool.badge ? { award: tool.badge } : {}),
  };
}

/**
 * Serializza uno o più schemi in stringhe JSON per l'iniezione nel <head>.
 * Accetta un singolo schema o un array di schemi.
 *
 * Uso: <script type="application/ld+json" set:html={serializeSchemas([schemaA, schemaB])} />
 */
export function serializeSchemas(schemas: object[]): string {
  if (schemas.length === 1) return JSON.stringify(schemas[0], null, 0);
  return JSON.stringify(schemas, null, 0);
}
