/**
 * tailwind.config.js — AI Tools Review
 *
 * NOTE: This project uses Tailwind CSS v4 with CSS-based configuration via
 * @theme in global.css. This file is provided as a v3-equivalent reference
 * for documentation and tooling autocomplete purposes.
 *
 * Actual config lives in: src/styles/global.css → @theme { ... }
 *
 * @type {import('tailwindcss').Config}
 */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				ai: {
					// Dark mode surfaces
					bg: '#0f1117',
					bg2: '#111827',
					card: '#1a1f2e',
					border: '#1e2435',

					// Accents
					purple: '#a855f7',
					'purple-dark': '#7c3aed',
					green: '#10b981',

					// Text
					text: '#f1f5f9',
					muted: '#94a3b8',
					faint: '#64748b',
				},
				light: {
					// Light mode surfaces
					bg: '#f8fafc',
					bg2: '#f1f5f9',
					card: '#ffffff',
					border: '#e2e8f0',

					// Text
					text: '#0f172a',
					muted: '#475569',
					faint: '#94a3b8',
				},
			},
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
			},
			borderRadius: {
				xl: '0.75rem',
				'2xl': '1rem',
				'3xl': '1.5rem',
			},
			boxShadow: {
				'purple-glow': '0 8px 30px rgba(168, 85, 247, 0.3)',
				'purple-sm': '0 4px 15px rgba(168, 85, 247, 0.15)',
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.4s ease-out',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
		},
	},
	plugins: [],
};
