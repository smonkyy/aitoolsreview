import fs from 'node:fs';
import path from 'node:path';
import { getCollection } from 'astro:content';
import { createElement as h } from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export async function getStaticPaths() {
	const posts = await getCollection('blog');
	return posts.map((post) => ({
		params: { slug: post.id },
		props: {
			title: post.data.title,
			description: post.data.description,
		},
	}));
}

export async function GET({ props }: { props: { title: string; description: string } }) {
	const { title, description } = props;

	const fontRegular = fs.readFileSync(
		path.resolve('./public/fonts/atkinson-regular.woff'),
	);
	const fontBold = fs.readFileSync(
		path.resolve('./public/fonts/atkinson-bold.woff'),
	);

	// Truncate description to avoid overflow
	const desc = description.length > 120 ? description.slice(0, 117) + '…' : description;

	const svg = await satori(
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
					background: '#0d0d18',
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
					background: 'linear-gradient(90deg, #a855f7 0%, #7c3aed 50%, transparent 100%)',
				},
			}),
			// Glow background
			h('div', {
				style: {
					position: 'absolute',
					top: '-100px',
					right: '-100px',
					width: '500px',
					height: '500px',
					borderRadius: '50%',
					background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)',
				},
			}),
			// Main content
			h(
				'div',
				{ style: { display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' } },
				// Badge
				h(
					'div',
					{
						style: {
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							marginBottom: '8px',
						},
					},
					h('div', {
						style: {
							width: '10px',
							height: '10px',
							borderRadius: '50%',
							background: '#a855f7',
						},
					}),
					h(
						'span',
						{
							style: {
								fontSize: '18px',
								color: '#a855f7',
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
					{
						style: {
							fontSize: '24px',
							color: '#9ca3af',
							lineHeight: 1.5,
							fontWeight: 400,
						},
					},
					desc,
				),
			),
			// Bottom branding
			h(
				'div',
				{
					style: {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingTop: '32px',
						borderTop: '1px solid rgba(168,85,247,0.2)',
					},
				},
				h(
					'span',
					{ style: { fontSize: '20px', color: '#7c3aed', fontWeight: 700 } },
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
				{ name: 'Atkinson', data: fontRegular, weight: 400, style: 'normal' },
				{ name: 'Atkinson', data: fontBold, weight: 700, style: 'normal' },
			],
		},
	);

	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
	const png = resvg.render().asPng();

	return new Response(png, {
		headers: { 'Content-Type': 'image/png' },
	});
}
