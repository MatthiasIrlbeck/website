import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { siteUrl, basePath } from './src/lib/site.ts';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  output: 'static',
  markdown: {
    processor: unified({
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { output: 'htmlAndMathml', strict: 'error', throwOnError: true }]],
    }),
  },
});
