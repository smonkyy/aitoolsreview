// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// Nota: @astrojs/sitemap è stato sostituito da src/pages/sitemap.xml.ts
// che genera priorità dinamiche basate sulla profondità del contenuto.

// https://astro.build/config
export default defineConfig({
	site: 'https://aitoolsreview.it',
	integrations: [mdx(), react()],
	vite: {
		plugins: [tailwindcss()],
	},
});
