import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const asset = z.string().refine(value => /^https:\/\//.test(value) || /^\/(?!\/)/.test(value), 'Use HTTPS or an absolute local path');
const research = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(), authors: z.array(z.string()).min(1), status: z.string(),
    order: z.number().int().positive(), summary: z.string(), needsReview: z.boolean(),
    links: z.array(z.object({ label: z.string(), url: z.url({ protocol: /^https$/ }) })),
    thumbnail: z.object({ src: asset, alt: z.string() }).nullable().default(null),
    media: z.array(z.object({
      label: z.string(), src: asset, poster: asset, caption: z.string(),
    })).default([]),
  }),
});
export const collections = { research };
