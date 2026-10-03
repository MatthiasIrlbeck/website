import { test, expect } from '@playwright/test';
import { basePath, homeUrl, isDraft, siteUrl } from '../src/lib/site';

test('built metadata matches the deployment configuration and indexing policy', async ({ page, baseURL }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  expect(new URL(baseURL!).pathname).toBe(homeUrl);
  const canonicalUrl = new URL(homeUrl, siteUrl).href;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonicalUrl);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonicalUrl);

  if (isDraft) {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  } else {
    expect(basePath).toBe('/');
    expect(canonicalUrl).toBe('https://www.matthiasirlbeck.com/');
    const indexingRestrictions = /\b(?:noindex|nofollow|noarchive|none)\b/i;
    const robots = await page.locator('meta[name]').evaluateAll(elements => elements
      .filter(element => /^(?:robots|googlebot|bingbot)$/i.test(element.getAttribute('name') ?? ''))
      .map(element => element.getAttribute('content') ?? ''));
    for (const directive of robots) expect(directive).not.toMatch(indexingRestrictions);
    expect(response!.headers()['x-robots-tag'] ?? '').not.toMatch(indexingRestrictions);
  }
});

test('all rendered local assets and links resolve under the deployment base', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  // Deferred videos and posters live in data attributes while entries are closed.
  // Include every portrait srcset candidate, not just the browser's chosen image.
  const references = await page.evaluate(() => {
    const urls: string[] = [];
    for (const element of document.querySelectorAll('[href], [src], [poster], [data-src], [data-poster], [srcset]')) {
      for (const attribute of ['href', 'src', 'poster', 'data-src', 'data-poster']) {
        const value = element.getAttribute(attribute);
        if (value) urls.push(value);
      }
      const srcset = element.getAttribute('srcset');
      if (srcset) urls.push(...srcset.split(',').map(candidate => candidate.trim().split(/\s+/)[0]));
    }
    for (const element of document.querySelectorAll('meta[property="og:image"]')) {
      const value = element.getAttribute('content');
      if (value) urls.push(value);
    }
    return urls;
  });
  const previewOrigin = new URL(baseURL!).origin;
  const siteOrigin = new URL(siteUrl).origin;
  const paths = new Set<string>();
  for (const reference of references) {
    const url = new URL(reference, baseURL);
    if (![previewOrigin, siteOrigin].includes(url.origin)) continue;
    expect(url.pathname, reference).toMatch(new RegExp(`^${homeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    if (basePath === '/') expect(url.pathname, reference).not.toMatch(/^\/website(?:\/|$)/);
    if (url.pathname === homeUrl && url.hash) {
      const target = decodeURIComponent(url.hash.slice(1));
      expect(await page.evaluate(id => Boolean(document.getElementById(id)), target), reference).toBe(true);
    }
    paths.add(url.pathname + url.search);
  }
  expect([...paths].filter(path => /\.mp4$/.test(path))).toHaveLength(4);
  expect([...paths].filter(path => /\.pdf$/.test(path))).toHaveLength(2);
  expect([...paths].some(path => /\.css$/.test(path))).toBe(true);
  // Astro may inline these small modules instead of emitting separate JS files.
  const scripts = await page.locator('script[type="module"]').evaluateAll(elements =>
    elements.map(element => ({ src: element.getAttribute('src'), content: element.textContent?.trim() ?? '' })));
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) expect(Boolean(script.src || script.content)).toBe(true);
  for (const path of paths) {
    // HEAD verifies packaged files without downloading videos or full theses.
    const response = await page.request.head(new URL(path, previewOrigin).href);
    expect(response.status(), path).toBe(200);
    const expectedType = path.endsWith('.pdf') ? /^application\/pdf(?:;|$)/
      : path.endsWith('.mp4') ? /^video\/mp4(?:;|$)/
      : path.endsWith('.css') ? /^text\/css(?:;|$)/
      : path.endsWith('.js') ? /^(?:text|application)\/javascript(?:;|$)/
      : /\.(?:png|jpe?g|webp|avif)$/.test(path) ? /^image\// : null;
    if (expectedType) expect(response.headers()['content-type'], path).toMatch(expectedType);
    if (!isDraft) expect(response.headers()['x-robots-tag'] ?? '', path).not.toMatch(/\b(?:noindex|nofollow|noarchive|none)\b/i);
  }
});
