import { test, expect } from '@playwright/test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import type { CollectionEntry } from 'astro:content';
import { contentLinks } from '../src/lib/markdown';
import { researchContent } from '../src/lib/research-content';
import { assetUrl } from '../src/lib/site';

test('Markdown assets and subsection links survive either deployment base and repeated headings', async () => {
  const processor = await createMarkdownProcessor({ rehypePlugins: [contentLinks] });
  const rendered = await processor.render(`#### Model
![Local poster](/media/borsuk-animation-poster.webp)
[Local PDF](/documents/PhD_thesis_matthias_irlbeck.pdf#page=12)
[Main result](#main-result) · [Further detail](#further-detail) · [Contact](#contact)
[Unicode heading](#m%C3%BCller)
##### Further detail
Some more detail.
##### Müller
Unicode heading.
#### Main result
The result.
#### Interpretation
Its meaning.`);
  const first = researchContent({ id: 'first-paper', rendered: { html: rendered.code } } as CollectionEntry<'research'>);
  const second = researchContent({ id: 'second-paper', rendered: { html: rendered.code } } as CollectionEntry<'research'>);
  expect(first.model).toContain(`src="${assetUrl('/media/borsuk-animation-poster.webp')}"`);
  expect(first.model).toContain(`href="${assetUrl('/documents/PhD_thesis_matthias_irlbeck.pdf#page=12')}"`);
  expect(first.model).toContain('target="_blank" rel="noopener noreferrer"');
  expect(first.model).toContain('href="#first-paper-main-result"');
  expect(first.model).toContain('href="#first-paper-further-detail"');
  expect(first.model).toContain('href="#first-paper-müller"');
  expect(first.model).toContain('href="#contact"');
  expect(first.model).toContain('id="first-paper-further-detail"');
  expect(second.model).toContain('id="second-paper-further-detail"');
  expect(first.mainResult).toContain('id="first-paper-main-result"');
  expect(first.interpretation).toContain('id="first-paper-interpretation"');
});
