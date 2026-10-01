import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const baseLabel = process.env.BASE_PATH === '/' ? 'root' : 'project';

async function researchIds(page: Page) {
  const ids = await page.locator('.research-entry').evaluateAll(entries => entries.map(entry => entry.id));
  expect(ids.length).toBeGreaterThan(0);
  expect(ids.every(Boolean)).toBe(true);
  return ids;
}

async function expectOptionalContentIsIntentional(page: Page) {
  const portrait = page.locator('.portrait');
  const portraitImage = portrait.locator('img');
  if (await portraitImage.count()) {
    await expect(portraitImage).toHaveAttribute('alt', /\S+/);
    await expect.poll(() => portraitImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  } else {
    await expect(portrait.locator('.portrait-placeholder')).toBeVisible();
  }

  const email = page.locator('#contact dd').first();
  const emailLink = email.locator('a[href^="mailto:"]');
  if (await emailLink.count()) await expect(emailLink).toHaveAttribute('href', /^mailto:.+@.+/);
  else await expect(email.locator('.missing-label')).toBeVisible();

  for (const row of await page.locator('.cv-row:has(.thesis-link), .cv-row:has(.thesis-placeholder)').all()) {
    const link = row.locator('.thesis-link');
    if (await link.count()) await expect(link).toHaveAttribute('href', /^(?!#?$).+/);
    else await expect(row.locator('.thesis-placeholder')).toBeVisible();
  }
}

test('optional-content checks cover supplied and missing fixtures', async ({ page }) => {
  const fixtures = [
    `<div class="portrait"><img alt="Portrait of the site owner" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'/%3E"></div>
     <section id="contact"><dd><a href="mailto:person@example.edu">person@example.edu</a></dd></section>
     <div class="cv-row"><a class="thesis-link" href="/documents/thesis.pdf">Thesis</a></div>`,
    `<div class="portrait"><div class="portrait-placeholder">Portrait pending</div></div>
     <section id="contact"><dd><span class="missing-label">Email pending</span></dd></section>
     <div class="cv-row"><p class="thesis-placeholder">Thesis pending</p></div>`,
  ];
  for (const fixture of fixtures) {
    await page.setContent(fixture);
    await expectOptionalContentIsIntentional(page);
  }
});

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
    const [firstId] = await researchIds(page);
    await expect(page.locator('details[open]')).toHaveCount(0);
    await expectOptionalContentIsIntentional(page);
    await expect(page.locator('iframe, a[href="#"], video[src]')).toHaveCount(0);
    const paperLinks = page.locator('.paper-links a:not(.permalink)');
    expect(await paperLinks.count()).toBeGreaterThan(0);
    await expect(paperLinks.first()).toHaveAttribute('href', /^https?:\/\//);
    const output = `artifacts/screenshots/${baseLabel}`;
    await mkdir(output, { recursive: true });
    const collapsed = `${output}/${viewport.name}-collapsed.png`;
    await page.screenshot({ path: collapsed, fullPage: true });
    await testInfo.attach('collapsed', { path: collapsed, contentType: 'image/png' });
    await page.locator(`#${firstId} summary`).click();
    await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
    await expect(page.locator(`#${firstId} .research-figure`)).toBeVisible();
    await expect(page.locator(`#${firstId} .katex .katex-mathml math`).first()).toBeVisible();
    await expect(page.locator(`#${firstId} .katex-display`)).toBeVisible();
    await expect(page.locator(`#${firstId} [data-close-details]`)).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('16px KaTeX_Main'))).toBe(true);
    await page.locator(`#${firstId}`).scrollIntoViewIfNeeded();
    const expanded = `${output}/${viewport.name}-expanded.png`;
    await page.screenshot({ path: expanded, fullPage: true });
    await testInfo.attach('expanded', { path: expanded, contentType: 'image/png' });
    for (const width of viewport.name === 'mobile' ? [390, 320] : [1440]) {
      await page.setViewportSize({ width, height: viewport.height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    expect(failures).toEqual([]);
    expect(remoteRequests).toEqual([]);
    expect(videoRequests).toEqual([]);
  });
}

test('native keyboard controls, links, hashes, close controls, and multiple open entries', async ({ page }) => {
  await page.goto('./');
  const [firstId, secondId, ...remainingIds] = await researchIds(page);
  expect(secondId).toBeTruthy();
  await page.goto(`./#${firstId}`);
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const paper = page.locator(`#${firstId} .paper-links a:not(.permalink)`).first();
  await paper.focus();
  await expect(paper).toBeFocused();
  await paper.evaluate(element => element.addEventListener('click', event => event.preventDefault(), { once: true }));
  await paper.click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const summary = page.locator(`#${secondId} summary`);
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details[open]')).toHaveCount(2);
  await page.keyboard.press('Space');
  await expect(page.locator('details[open]')).toHaveCount(1);
  const anotherId = remainingIds[0] ?? secondId;
  await page.evaluate(id => { location.hash = id; }, anotherId);
  await expect(page.locator(`#${anotherId} details`)).toHaveAttribute('open', '');
  await page.locator(`#${firstId} [data-close-details]`).click();
  await expect(page.locator(`#${firstId} details`)).not.toHaveAttribute('open', '');
  await expect(page.locator(`#${firstId} summary`)).toBeFocused();
  await page.locator(`#${firstId} .permalink`).click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
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
  const [firstId] = await researchIds(page);
  await page.locator(`#${firstId} summary`).click();
  await expect(page.locator(`#${firstId} .research-text p`).first()).toBeVisible();
  await expect(page.locator(`#${firstId} math`).first()).toBeVisible();
  await expect(page.locator(`#${firstId} [data-close-details]`)).toBeVisible();
  await context.close();
});
