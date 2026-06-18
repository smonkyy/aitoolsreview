import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			/** ID del tool recensito (da data/tools.ts) — attiva VerdettTecnico + ProsConsBox */
			reviewedToolId: z.string().optional(),
			/** ID autore (da data/authors.ts) — default: 'redazione' */
			author: z.string().optional().default('redazione'),
			/** Durata del test sul campo, es. "3 settimane", "1 mese" */
			testDuration: z.string().optional(),
		}),
});

export const collections = { blog };
