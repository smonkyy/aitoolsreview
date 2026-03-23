/**
 * /og/[slug].png — Full-resolution OG image (1200×630 PNG).
 *
 * Used by OG meta tags for social sharing (Twitter, LinkedIn, WhatsApp).
 * For card thumbnails, the browser prefers /og/[slug].webp (600×315, ~70% smaller).
 */

import { getCollection } from 'astro:content';
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
  const png = await renderOgPng(props.title, props.description, 1200);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
