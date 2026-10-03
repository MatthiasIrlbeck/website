import type { CollectionEntry } from 'astro:content';

// The collection's Markdown processor has already rendered links and KaTeX.
// Separate its top-level h4 sections so the main result precedes the illustration
// in the HTML reading order, without another renderer or client-side DOM changes.
export function researchContent(entry: CollectionEntry<'research'>) {
  const html = entry.rendered?.html;
  if (!html) throw new Error(`Research entry ${entry.id} has no rendered content.`);

  const headingIds = new Map<string, string>();
  const scopedHtml = html.replace(
    /(<h[1-6]\b[^>]*\bid=")([^"]+)(")/g,
    (_match, before: string, headingId: string, after: string) => {
      const scopedId = `${entry.id}-${headingId}`;
      headingIds.set(headingId, scopedId);
      return `${before}${scopedId}${after}`;
    },
  ).replace(/(<a\b[^>]*\bhref=")#([^"]+)(")/g,
    (match, before: string, headingId: string, after: string) => {
      let decodedId: string;
      try { decodedId = decodeURIComponent(headingId); } catch { return match; }
      return headingIds.has(decodedId) ? `${before}#${headingIds.get(decodedId)}${after}` : match;
    },
  );
  const sections = scopedHtml.trim().split(/(?=<h4\b)/);
  const expected = ['Model', 'Main result', 'Interpretation'];
  if (sections.length !== expected.length || sections.some((section, index) =>
    section.match(/^<h4\b[^>]*>([^<]+)<\/h4>/)?.[1] !== expected[index]
  )) {
    throw new Error(`Research entry ${entry.id} must contain Model, Main result, and Interpretation as top-level h4 sections.`);
  }

  return { model: sections[0], mainResult: sections[1], interpretation: sections[2] };
}
