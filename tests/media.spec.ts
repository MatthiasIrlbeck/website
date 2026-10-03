import { test, expect, type Locator, type Page } from '@playwright/test';
import { homeUrl } from '../src/lib/site';

const mainPort = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
const fixturePort = Number(process.env.PLAYWRIGHT_FIXTURE_PORT ?? mainPort + 1);
if (!Number.isInteger(fixturePort) || fixturePort < 1 || fixturePort > 65535) {
  throw new Error('PLAYWRIGHT_FIXTURE_PORT must be a valid port number');
}
const fixtureUrl = `http://127.0.0.1:${fixturePort}${homeUrl}`;
const firstClip = 'vor_perc_clust-web.mp4';
const secondClip = 'hyperbolic-poisson-voronoi-web.mp4';
const firstCaptionMath = [String.raw`\mathbb{H}^3`, String.raw`\lambda>0`];
const secondCaptionMath = [String.raw`p_u(\lambda)\ge c_d>0`, String.raw`d\ge3`];

async function expectPlaying(page: Page, entryId = 'fixture-multiple-clips') {
  await expect.poll(() => page.locator(`#${entryId} video`).evaluate((video: HTMLVideoElement) =>
    video.readyState >= 2 && !video.paused && video.currentTime > 0.1), { timeout: 15000 }).toBe(true);
}

async function expectCaptionMath(entry: Locator, expressions: string[]) {
  const caption = entry.locator('figcaption[data-caption]');
  await expect(caption.locator('.katex')).toHaveCount(expressions.length);
  await expect(caption.locator('.katex-mathml math')).toHaveCount(expressions.length);
  await expect(caption.locator('annotation[encoding="application/x-tex"]')).toHaveText(expressions);
  await expect(caption.locator('.katex-html').first()).toBeVisible();
}

test('real component fixtures defer collapsed assets and omit absent media', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'media' || /-poster\.(?:jpg|webp)/.test(request.url())) requests.push(request.url());
  });
  await page.goto(fixtureUrl);
  await expect(page.locator('video[src], video[poster]')).toHaveCount(0);
  await expect(page.locator('[data-clip]')).toHaveCount(4);
  expect(requests).toEqual([]);

  const missing = page.locator('#fixture-missing-media');
  await missing.locator('summary').click();
  await expect(missing.locator('.research-media-note')).toHaveCount(0);
  await expect(missing.locator('.research-figure, video, .research-illustration')).toHaveCount(0);
  await expect(missing.locator('.research-text h4')).toHaveText(['Model', 'Main result', 'Interpretation']);
});

test('real two-clip component switches sources, posters, captions, and selection', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${fixtureUrl}#fixture-multiple-clips`);
  const entry = page.locator('#fixture-multiple-clips');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('poster', /vor_perc_clust-poster\.jpg$/);
  expect(await video.getAttribute('src')).toBeNull();
  expect(await video.evaluate((element: HTMLVideoElement) => element.controls)).toBe(false);
  await entry.getByRole('button', { name: 'Play video', exact: true }).click();
  await expectPlaying(page);
  await expect(video).toBeFocused();
  await expect(video).toHaveAttribute('src', new RegExp(`${firstClip}$`));

  const second = entry.getByRole('button', { name: 'Second supplied clip', exact: true });
  await second.focus();
  await second.press('Enter');
  await video.scrollIntoViewIfNeeded();
  await expectPlaying(page);
  await expect(video).toHaveAttribute('src', new RegExp(`${secondClip}$`));
  await expect(video).toHaveAttribute('poster', /hyperbolic-poisson-voronoi-poster\.webp$/);
  await expect(entry.locator('figcaption[data-caption]')).toHaveText('Second fixture caption: the supplied hyperbolic clip.');
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await expect(second).toBeFocused();
  await expect(entry.getByRole('button', { name: 'First supplied clip', exact: true })).toHaveAttribute('aria-pressed', 'false');

  await video.evaluate((element: HTMLVideoElement) => element.pause());
  await entry.locator('summary').click();
  await entry.locator('summary').click();
  await video.scrollIntoViewIfNeeded();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);

  await entry.getByRole('button', { name: 'First supplied clip', exact: true }).click();
  await video.scrollIntoViewIfNeeded();
  await expectPlaying(page);
  await expect(video).toHaveAttribute('src', new RegExp(`${firstClip}$`));
  await expect(entry.locator('figcaption[data-caption]')).toHaveText('First fixture caption: the supplied percolation clip.');
});

test('real two-clip component retries a failed selection without losing its caption', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(`**/${secondClip}`, route => route.abort());
  await page.goto(`${fixtureUrl}#fixture-multiple-clips`);
  const entry = page.locator('#fixture-multiple-clips');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  await entry.getByRole('button', { name: 'Second supplied clip', exact: true }).click();
  await expect(entry.locator('[data-error]')).toBeVisible();
  await expect(entry.locator('figcaption[data-caption]')).toHaveText('Second fixture caption: the supplied hyperbolic clip.');
  await page.unroute(`**/${secondClip}`);
  await entry.getByRole('button', { name: 'Play video', exact: true }).click();
  await expectPlaying(page);
  await expect(entry.locator('[data-error]')).toBeHidden();
  await expect(video).toHaveAttribute('src', new RegExp(`${secondClip}$`));
  await expect(video).toBeFocused();
  await expect(entry.getByRole('button', { name: 'Second supplied clip', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('caption math stays rendered through clip changes and a playback retry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(`**/${secondClip}`, route => route.abort());
  await page.goto(`${fixtureUrl}#fixture-math-captions`);
  const entry = page.locator('#fixture-math-captions');
  const caption = entry.locator('figcaption[data-caption]');
  await entry.locator('video').scrollIntoViewIfNeeded();
  await expectCaptionMath(entry, firstCaptionMath);
  await expect(caption).toContainText('First mathematical caption:');

  await entry.getByRole('button', { name: 'Second mathematics clip', exact: true }).click();
  await expect(entry.locator('[data-error]')).toBeVisible();
  await expectCaptionMath(entry, secondCaptionMath);
  await expect(caption).toContainText('Second mathematical caption:');

  await page.unroute(`**/${secondClip}`);
  await entry.getByRole('button', { name: 'Play video', exact: true }).click();
  await expectPlaying(page, 'fixture-math-captions');
  await expect(entry.locator('[data-error]')).toBeHidden();
  await expectCaptionMath(entry, secondCaptionMath);

  await entry.getByRole('button', { name: 'First mathematics clip', exact: true }).click();
  await expectPlaying(page, 'fixture-math-captions');
  await expectCaptionMath(entry, firstCaptionMath);
  await expect(caption).toContainText('First mathematical caption:');
});

test('real two-clip component offers both supplied videos without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(fixtureUrl);
  const entry = page.locator('#fixture-multiple-clips');
  await entry.locator('summary').click();
  for (const inactive of await entry.locator('.video-frame, .video-idle, .clip-options').all()) {
    await expect(inactive).toBeHidden();
  }
  await expect(entry.locator('[data-load]')).toBeHidden();
  const links = entry.getByRole('link', { name: /^Watch video:/ });
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    const response = await page.request.head(new URL((await link.getAttribute('href'))!, fixtureUrl).href);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^video\/mp4/);
  }
  const mathematicalEntry = page.locator('#fixture-math-captions');
  await mathematicalEntry.locator('summary').click();
  await expectCaptionMath(mathematicalEntry, firstCaptionMath);
  await context.close();
});
