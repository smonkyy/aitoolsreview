/**
 * /og/[slug].webp — Card thumbnail in WebP format (600×315 px).
 *
 * Generates the same OG layout as [slug].png but:
 *  • Rendered at 600×315 (half resolution — sufficient for card display at up to 2× DPI)
 *  • Converted to WebP via Sharp at quality 82 (≈70–80% smaller than the 1200×630 PNG)
 *
 * Used exclusively by ReviewCard.astro via <source type="image/webp">.
 * The full-res 1200×630 PNG is still served to OG meta scrapers.
 */

import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { renderOgPng } from '../../lib/og';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, description: post.data.description },
  }));
}

export async function GET({
  props,
}: {
  props: { title: string; description: string };
}) {
  // 1. Render SVG → PNG at card thumbnail resolution (600×315)
  const png = await renderOgPng(props.title, props.description, 600);

  // 2. Convert PNG → WebP (quality 82 balances size vs. visual fidelity)
  const webp = await sharp(png).webp({ quality: 82 }).toBuffer();

  return new Response(webp, {
    headers: { 'Content-Type': 'image/webp' },
  });
}
