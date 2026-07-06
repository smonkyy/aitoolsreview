/**
 * Shared OG image generator — used by both /og/[slug].png and /og/[slug].webp endpoints.
 *
 * Fonts are loaded once and cached in module scope across the SSG build,
 * avoiding redundant filesystem reads for each of the 12 OG pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createElement as h } from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// ── Font cache ────────────────────────────────────────────────────────────────

let _fontRegular: Buffer | null = null;
let _fontBold: Buffer | null = null;

function getFonts(): { regular: Buffer; bold: Buffer } {
  if (!_fontRegular) {
    _fontRegular = fs.readFileSync(path.resolve('./public/fonts/atkinson-regular.woff'));
  }
  if (!_fontBold) {
    _fontBold = fs.readFileSync(path.resolve('./public/fonts/atkinson-bold.woff'));
  }
  return { regular: _fontRegular, bold: _fontBold };
}

// ── SVG tree builder ──────────────────────────────────────────────────────────

/**
 * Generates a Satori SVG string for the OG image layout.
 * Canvas is always 1200×630; use `renderWidthPx` in renderOgPng to resize.
 */
async function buildSvg(title: string, desc: string): Promise<string> {
  const { regular, bold } = getFonts();

  return satori(
    h(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: '#0d0d0d',
          fontFamily: 'Atkinson',
          position: 'relative',
        },
      },
      // Top accent bar
      h('div', {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #c9a84c 0%, #a8863a 50%, transparent 100%)',
        },
      }),
      // Glow
      h('div', {
        style: {
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)',
        },
      }),
      // Content area
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: 1,
            justifyContent: 'center',
          },
        },
        // Badge row
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
          h('div', {
            style: { width: '10px', height: '10px', borderRadius: '50%', background: '#c9a84c' },
          }),
          h(
            'span',
            {
              style: {
                fontSize: '18px',
                color: '#c9a84c',
                fontWeight: 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              },
            },
            'Recensione',
          ),
        ),
        // Title
        h(
          'div',
          {
            style: {
              fontSize: '52px',
              fontWeight: 700,
              color: '#f1f0ff',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            },
          },
          title,
        ),
        // Description
        h(
          'div',
          { style: { fontSize: '24px', color: '#9ca3af', lineHeight: 1.5, fontWeight: 400 } },
          desc,
        ),
      ),
      // Branding footer
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '32px',
            borderTop: '1px solid rgba(201,168,76,0.2)',
          },
        },
        h(
          'span',
          { style: { fontSize: '20px', color: '#a8863a', fontWeight: 700 } },
          'AIToolsReview.it',
        ),
        h(
          'span',
          { style: { fontSize: '16px', color: '#4b5563' } },
          'Recensioni AI indipendenti',
        ),
      ),
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Atkinson', data: regular, weight: 400, style: 'normal' as const },
        { name: 'Atkinson', data: bold, weight: 700, style: 'normal' as const },
      ],
    },
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Renders the OG image as a PNG Buffer.
 *
 * @param title       - Post title
 * @param description - Post description (truncated if >120 chars)
 * @param renderWidth - Output pixel width (height scales at 315/600 ratio).
 *                      Use 1200 for full-res OG meta, 600 for card thumbnails.
 */
export async function renderOgPng(
  title: string,
  description: string,
  renderWidth: 1200 | 600 = 1200,
): Promise<Buffer> {
  const desc = description.length > 120 ? description.slice(0, 117) + '…' : description;
  const svg  = await buildSvg(title, desc);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: renderWidth } });
  return Buffer.from(resvg.render().asPng());
}
