import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { contentLinks } from './markdown';

// Imported only by the server-rendered media component. Captions use the same
// local math output and link handling as research Markdown, without browser JS.
const processor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkPlugins: [remarkMath],
  rehypePlugins: [
    [rehypeKatex, { output: 'htmlAndMathml', strict: 'error', throwOnError: true }],
    contentLinks,
  ],
});

export async function renderCaption(caption: string): Promise<string> {
  return (await (await processor).render(caption)).code;
}
