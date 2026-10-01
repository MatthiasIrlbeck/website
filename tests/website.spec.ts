import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const firstId = 'typical-voronoi-cell';
const secondId = 'random-borsuk-graph';
const baseLabel = process.env.BASE_PATH === '/' ? 'root' : 'project';

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`${viewport.name}: content, math, requests, overflow, and screenshots`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    const failures: string[] = [];
    const remoteRequests: string[] = [];
    const videoRequests: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => {
      if (!request.url().startsWith('http://127.0.0.1:4321')) remoteRequests.push(request.url());
      if (/\.(mp4|webm|mov)(?:\?|$)/.test(request.url()) || request.resourceType() === 'media') videoRequests.push(request.url());
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matthias Irlbeck');
    await expect(page.getByRole('navigation').getByRole('link')).toHaveText(['Research', 'CV', 'Contact']);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('.research-entry')).toHaveCount(4);
    await expect(page.locator('details[open]')).toHaveCount(0);
    await expect(page.locator('.thesis-placeholder')).toHaveCount(2);
    await expect(page.getByText('Portrait to be added', { exact: true })).toBeVisible();
    await expect(page.getByText('Professional email to be confirmed')).toBeVisible();
    await expect(page.locator('iframe, a[href="#"], video[src]')).toHaveCount(0);
    await expect(page.locator('#typical-voronoi-cell .paper-links a').first()).toHaveAttribute('href', 'https://arxiv.org/abs/2506.02607');
    const output = `artifacts/screenshots/${baseLabel}`;
    await mkdir(output, { recursive: true });
    const collapsed = `${output}/${viewport.name}-collapsed.png`;
    await page.screenshot({ path: collapsed, fullPage: true });
    await testInfo.attach('collapsed', { path: collapsed, contentType: 'image/png' });
    await page.locator(`#${firstId} summary`).click();
    await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
    await expect(page.locator(`#${firstId} .media-placeholder`)).toBeVisible();
    await expect(page.locator(`#${firstId} .katex .katex-mathml math`).first()).toBeVisible();
    await expect(page.locator(`#${firstId} .katex-display`)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true);
    await page.locator(`#${firstId}`).scrollIntoViewIfNeeded();
    const expanded = `${output}/${viewport.name}-expanded.png`;
    await page.screenshot({ path: expanded, fullPage: true });
    await testInfo.attach('expanded', { path: expanded, contentType: 'image/png' });
    // Long formulas may scroll inside their own container; the document must not overflow.
    for (const width of viewport.name === 'mobile' ? [390, 320] : [1440]) {
      await page.setViewportSize({ width, height: viewport.height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    expect(failures).toEqual([]);
    expect(remoteRequests).toEqual([]);
    expect(videoRequests).toEqual([]);
  });
}

test('native keyboard controls, links, hash loading, and multiple open entries', async ({ page }) => {
  await page.goto(`./#${firstId}`);
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const paper = page.locator(`#${firstId} .paper-links a`).first();
  await paper.focus();
  await expect(paper).toBeFocused();
  // Suppress external navigation while still sending a real click through the DOM.
  await paper.evaluate(element => element.addEventListener('click', event => event.preventDefault(), { once: true }));
  await paper.click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const summary = page.locator(`#${secondId} summary`);
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details[open]')).toHaveCount(2);
  await page.keyboard.press('Space');
  await expect(page.locator('details[open]')).toHaveCount(1);
  await page.evaluate(() => { location.hash = 'high-dimensional-percolation'; });
  await expect(page.locator('#high-dimensional-percolation details')).toHaveAttribute('open', '');
  await expect(page.locator('details[open]')).toHaveCount(2);
  await page.locator(`#${firstId} summary`).click();
  await expect(page.locator(`#${firstId} details`)).not.toHaveAttribute('open', '');
  await page.locator(`#${firstId} .permalink`).click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  // A repeated permalink click also reopens an entry when the hash has not changed.
  await page.locator(`#${firstId} summary`).click();
  await page.locator(`#${firstId} .permalink`).click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const response = await page.request.get('./animations');
  expect(response.status()).toBe(404);
});

test('research remains in static HTML with JavaScript disabled', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await page.locator(`#${firstId} summary`).click();
  await expect(page.getByText('Exact result to be supplied.', { exact: true }).first()).toBeVisible();
  await expect(page.locator(`#${firstId} math`).first()).toBeVisible();
  await context.close();
});
