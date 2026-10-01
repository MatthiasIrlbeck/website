// Single source of truth for build-time deployment settings.
// process.env allows the same configuration in Astro and build tooling.
export const siteUrl = process.env.SITE_URL ?? 'https://matthiasirlbeck.github.io';
const requestedBase = process.env.BASE_PATH ?? '/website';
export const basePath = '/' + requestedBase.split('/').filter(Boolean).join('/');
const draftValue = process.env.DRAFT_SITE ?? 'true';
if (!['true', 'false'].includes(draftValue)) throw new Error('DRAFT_SITE must be true or false');
export const isDraft = draftValue === 'true';
if (!['https:', 'http:'].includes(new URL(siteUrl).protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
export function assetUrl(path: string): string {
  if (/^https:\/\//.test(path)) return path;
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error(`Expected a local absolute path or HTTPS URL: ${path}`);
  return (basePath === '/' ? '' : basePath) + path;
}
export const homeUrl = `${basePath === '/' ? '' : basePath}/`;
