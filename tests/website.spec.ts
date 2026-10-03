import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { basePath, homeUrl, isDraft, siteUrl } from '../src/lib/site';
const baseLabel = !isDraft ? 'production' : basePath === '/' ? 'root' : 'project';

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

  const emailCell = page.locator('#contact dd').first();
  const email = await emailCell.locator('[data-email-address]').count() ? emailCell.locator('[data-email-address]') : emailCell;
  if (await email.locator('.missing-label').count()) await expect(email.locator('.missing-label')).toBeVisible();
  else await expect(email).toHaveText(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

  for (const row of await page.locator('.cv-row:has(.thesis-link), .cv-row:has(.thesis-placeholder)').all()) {
    const link = row.locator('.thesis-link');
    if (await link.count()) await expect(link).toHaveAttribute('href', /^(?!#?$).+/);
    else await expect(row.locator('.thesis-placeholder')).toBeVisible();
  }
}

test('optional-content checks cover supplied and missing fixtures', async ({ page }) => {
  const fixtures = [
    `<div class="portrait"><img alt="Portrait of the site owner" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'/%3E"></div>
     <section id="contact"><dd>person@example.edu</dd></section>
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
  test(`${viewport.name}: content, math, requests, overflow, and screenshots`, async ({ page, baseURL }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const failures: string[] = [];
    const remoteRequests: string[] = [];
    const videoRequests: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => {
      if (new URL(request.url()).origin !== new URL(baseURL!).origin) remoteRequests.push(request.url());
      if (/\.(mp4|webm|mov)(?:\?|$)/.test(request.url()) || request.resourceType() === 'media') videoRequests.push(request.url());
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Matthias Irlbeck');
    await expect(page.getByRole('navigation').getByRole('link')).toHaveText(['Research', 'CV', 'Contact']);
    if (isDraft) await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
    else await expect(page.locator('meta[name=robots]')).toHaveCount(0);
    await expect(page.locator('.entry-number, .permalink, .draft-banner, .review-note, .editorial-note')).toHaveCount(0);
    expect(await page.locator('body').textContent()).not.toMatch(/\b(?:draft|approval|approved|verify|review)\b|Link to entry|Exact result to be supplied/i);
    const [firstId] = await researchIds(page);
    await expect(page.locator('details[open]')).toHaveCount(0);
    await expectOptionalContentIsIntentional(page);
    await expect(page.locator('iframe, a[href="#"], video[src]')).toHaveCount(0);
    const paperLinks = page.locator('.paper-links a, .preprint-link');
    expect(await paperLinks.count()).toBeGreaterThan(0);
    await expect(paperLinks.first()).toHaveAttribute('href', /^https?:\/\//);
    const output = `artifacts/screenshots/${baseLabel}/${testInfo.project.name}`;
    await mkdir(output, { recursive: true });
    const collapsed = `${output}/${viewport.name}-collapsed.png`;
    await page.screenshot({ path: collapsed, fullPage: true });
    await testInfo.attach('collapsed', { path: collapsed, contentType: 'image/png' });
    await page.locator(`#${firstId} summary`).click();
    await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
    await expect(page.locator(`#${firstId} .research-text`).getByRole('heading', { name: 'Model', exact: true })).toBeVisible();
    await expect(page.locator(`#${firstId} .research-text`).getByRole('heading', { name: 'Main result', exact: true })).toBeVisible();
    await expect(page.locator(`#${firstId} .katex .katex-mathml math`).first()).toBeVisible();
    await expect(page.locator(`#${firstId} .katex-display`).first()).toBeVisible();
    await expect(page.locator(`#${firstId} summary`)).toHaveAccessibleName(/^Close details\s*:/);
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

test('expanded explanations preserve reading order and fit every tested width', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const ids = await researchIds(page);
  for (const id of ids) {
    const entry = page.locator(`#${id}`);
    await entry.locator('summary').click();
    const hasIllustration = await entry.locator('.research-figure').count() > 0;
    await expect(entry.locator('.expanded-research h4')).toHaveText(hasIllustration
      ? ['Model', 'Main result', 'Illustration', 'Interpretation']
      : ['Model', 'Main result', 'Interpretation']);
    const readingOrder = await entry.locator('.expanded-research').evaluate(content =>
      Array.from(content.querySelectorAll('h4, .research-figure'), element =>
        element.tagName === 'FIGURE' ? 'Figure' : element.textContent?.trim()));
    expect(readingOrder).toEqual(hasIllustration
      ? ['Model', 'Main result', 'Illustration', 'Figure', 'Interpretation']
      : ['Model', 'Main result', 'Interpretation']);
    await expect(entry.locator('.research-text').getByRole('heading', { name: 'Interpretation', exact: true })).toBeVisible();
    await expect(entry.locator('math').first()).toBeVisible();
  }
  const elementIds = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
  expect(elementIds.length).toBe(new Set(elementIds).size);
  const output = `artifacts/screenshots/${baseLabel}/${testInfo.project.name}`;
  await mkdir(output, { recursive: true });
  for (const width of [320, 390, 768, 801, 960, 961, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const overflowingEquations = await page.locator('.katex-display').evaluateAll(equations =>
      equations.filter(equation => equation.scrollWidth > equation.clientWidth + 1)
        .map(equation => equation.closest('article')?.id));
    expect(overflowingEquations, `Display equations fit at ${width}px`).toEqual([]);

    const limits = await page.locator('#typical-voronoi-cell .shape-results > .katex-display').evaluateAll(equations =>
      equations.map(equation => {
        const { top, bottom, left, right } = equation.getBoundingClientRect();
        return { top, bottom, left, right };
      }));
    expect(limits).toHaveLength(3);
    if ([768, 801, 960, 961, 1024, 1440].includes(width)) {
      expect(Math.max(...limits.map(limit => limit.top)) - Math.min(...limits.map(limit => limit.top))).toBeLessThan(2);
      expect(limits[0].right).toBeLessThan(limits[1].left);
      expect(limits[1].right).toBeLessThan(limits[2].left);
    } else {
      expect(limits[0].bottom).toBeLessThan(limits[1].top);
      expect(limits[1].bottom).toBeLessThan(limits[2].top);
    }

    // Correct MathML alone does not catch a renderer/stylesheet version mismatch.
    // Check the visible exponent, using text ranges rather than KaTeX layout classes.
    const power = page.locator('#random-borsuk-graph .research-results p .katex').filter({
      has: page.locator('annotation', { hasText: /^n\^\{-1\/d\}$/ }),
    });
    await expect(power).toHaveCount(1);
    const positions = await power.locator('.katex-html').evaluate(element => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const rects: Record<string, { x: number; y: number; width: number; height: number; fontSize: number }> = {};
      while (walker.nextNode()) {
        const token = walker.currentNode.textContent;
        if (token !== 'n' && token !== '1' && token !== '1/') continue;
        const range = document.createRange();
        range.selectNodeContents(walker.currentNode);
        const { x, y, width, height } = range.getBoundingClientRect();
        const fontSize = Number.parseFloat(getComputedStyle(walker.currentNode.parentElement!).fontSize);
        rects[token === 'n' ? 'base' : 'exponent'] = { x, y, width, height, fontSize };
      }
      return rects;
    });
    expect(positions.base).toBeDefined();
    expect(positions.exponent).toBeDefined();
    expect(positions.exponent.y + positions.exponent.height / 2)
      .toBeLessThan(positions.base.y + positions.base.height * 0.4);
    expect(positions.exponent.x).toBeGreaterThanOrEqual(positions.base.x + positions.base.width - 1);
    expect(positions.exponent.fontSize).toBeLessThan(positions.base.fontSize * 0.9);
    if (width === 390 || width === 1440) {
      const name = width === 390 ? 'mobile' : 'desktop';
      const screenshot = `${output}/${name}-all-expanded.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      await testInfo.attach(`${name}-all-expanded`, { path: screenshot, contentType: 'image/png' });
    }
  }
});

test('native keyboard controls, links, hashes, close controls, and multiple open entries', async ({ page }) => {
  await page.goto('./');
  const [firstId, secondId, ...remainingIds] = await researchIds(page);
  expect(secondId).toBeTruthy();
  await expect(page.locator(`#${firstId} summary`)).toHaveAccessibleName(/^Details(?: and animation)?\s*:/);
  await page.goto(`./#${firstId}`);
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const paper = page.locator(`#${firstId} .paper-links a, #${firstId} .preprint-link`).first();
  await paper.focus();
  await expect(paper).toBeFocused();
  await paper.evaluate(element => element.addEventListener('click', event => event.preventDefault(), { once: true }));
  await paper.click();
  await expect(page.locator(`#${firstId} details`)).toHaveAttribute('open', '');
  const summary = page.locator(`#${secondId} summary`);
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details[open]')).toHaveCount(2);
  await expect(summary).toHaveAccessibleName(/^Close details\s*:/);
  await page.keyboard.press('Space');
  await expect(page.locator('details[open]')).toHaveCount(1);
  await expect(summary).toHaveAccessibleName(/^Details(?: and animation)?\s*:/);
  const anotherId = remainingIds[0] ?? secondId;
  await page.evaluate(id => { location.hash = id; }, anotherId);
  await expect(page.locator(`#${anotherId} details`)).toHaveAttribute('open', '');
  await page.locator(`#${firstId} summary`).click();
  await expect(page.locator(`#${firstId} details`)).not.toHaveAttribute('open', '');
  await expect(page.locator(`#${firstId} summary`)).toBeFocused();
  await expect(page.locator(`#${firstId} summary`)).toHaveAccessibleName(/^Details(?: and animation)?\s*:/);
  await page.evaluate(id => { location.hash = id; }, firstId);
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
  await expect(page.locator('[data-close-details]')).toHaveCount(0);
  await expect(page.locator(`#${firstId} summary`)).toHaveAccessibleName(/^Close details\s*:/);
  await page.locator(`#${firstId} summary`).click();
  await expect(page.locator(`#${firstId} details`)).not.toHaveAttribute('open', '');
  await expect(page.locator(`#${firstId} summary`)).toHaveAccessibleName(/^Details(?: and animation)?\s*:/);
  for (const id of ['typical-voronoi-cell', 'random-borsuk-graph', 'hyperbolic-voronoi-percolation', 'high-dimensional-percolation']) {
    const videoEntry = page.locator(`#${id}`);
    await videoEntry.locator('summary').click();
    await expect(videoEntry.locator('[data-load]')).toBeHidden();
    await expect(videoEntry.locator('video')).toBeHidden();
    const fallback = videoEntry.getByRole('link', { name: /^Watch video:/ });
    await expect(fallback).toBeVisible();
    const response = await page.request.head((await fallback.getAttribute('href'))!);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^video\/mp4/);
  }
  await expect(page.getByRole('button', { name: 'Copy email' })).toBeHidden();
  await context.close();
});

test('supplied documents, contact details, and separate-tab links', async ({ page, baseURL }) => {
  await page.goto('./');
  await expect(page.locator('.eyebrow')).toHaveCount(0);
  await expect(page.locator('[data-email-address]')).toHaveText('matthias.irlbeck@uni-hamburg.de');
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('#contact a')).toHaveCount(0);
  await expect(page.locator('#contact')).toContainText('Room 908, Geomatikum');
  await expect(page.locator('#contact')).toContainText('Bundesstraße 55, 20146 Hamburg');

  for (const link of await page.locator('a[href]').all()) {
    const href = (await link.getAttribute('href'))!;
    if (href.startsWith('#') || await link.evaluate(element => element.classList.contains('wordmark'))) {
      expect(await link.getAttribute('target')).toBeNull();
    } else {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
      await expect(link).toHaveAttribute('rel', /\bnoreferrer\b/);
    }
    expect(await link.getAttribute('download')).toBeNull();
  }

  const prefix = new URL(baseURL!).pathname.replace(/\/$/, '');
  const phdPath = `${prefix}/documents/PhD_thesis_matthias_irlbeck.pdf`;
  await expect(page.locator('#cv').getByRole('link', { name: 'PhD thesis: High-Dimensional Poisson–Voronoi Geometry and Threshold Phenomena', exact: true })).toHaveAttribute('href', phdPath);
  await expect(page.locator('#cv').getByRole('link', { name: 'Master’s thesis: Intrinsic Arm Exponents in High-Dimensional Percolation', exact: true })).toHaveAttribute('href', `${prefix}/documents/Master thesis Matthias Irlbeck.pdf`);
  const percolation = page.locator('#high-dimensional-percolation');
  await expect(percolation.locator('.paper-status')).toHaveText('arXiv expected soon, complete argument is part of my PhD thesis');
  await expect(percolation.locator('.paper-status').getByRole('link', { name: 'PhD thesis', exact: true })).toHaveAttribute('href', phdPath);
  await percolation.locator('summary').click();
  await expect(percolation.locator('.research-text').getByRole('link', { name: 'PhD thesis', exact: true })).toHaveAttribute('href', `${phdPath}#page=12`);
  await expect(page.locator('.paper-year')).toHaveCount(0);
  await expect(page.locator('#cv .document-meta')).toHaveCount(0);

  const documentPaths = new Set(await page.locator('a[href$=".pdf"]').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href)));
  expect(documentPaths.size).toBe(2);
  for (const url of documentPaths) {
    const response = await page.request.head(url);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/pdf(?:;|$)/);
    expect(response.headers()['content-disposition'] ?? '').not.toMatch(/attachment/i);
  }
});

for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
  for (const media of [
    { id: 'typical-voronoi-cell', file: 'typical-voronoi-cell-web.mp4', image: 'typical-cell-video' },
    { id: 'random-borsuk-graph', file: 'borsuk-animation-web.mp4', image: 'borsuk-video' },
    { id: 'hyperbolic-voronoi-percolation', file: 'hyperbolic-poisson-voronoi-web.mp4', image: 'hyperbolic-video' },
    { id: 'high-dimensional-percolation', file: 'vor_perc_clust-web.mp4', image: 'percolation-video' },
  ]) {
    test(`${viewport.name}: ${media.id} video plays, loops, and pauses on close`, async ({ page, baseURL }, testInfo) => {
      await page.setViewportSize(viewport);
      const mediaRequests: string[] = [];
      page.on('request', request => {
        if (request.resourceType() === 'media' || /\.mp4(?:\?|$)/.test(request.url())) mediaRequests.push(request.url());
      });
      await page.goto('./');
      const entry = page.locator(`#${media.id}`);
      const video = entry.locator('video');
      expect(await video.getAttribute('src')).toBeNull();
      expect(mediaRequests).toEqual([]);
      await entry.locator('summary').click();
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);
      expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop)).toBe(true);
      await video.evaluate((element: HTMLVideoElement) => { element.currentTime = element.duration - 0.35; });
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime < 2 && !element.paused), { timeout: 10000 }).toBe(true);
      await expect(entry.locator('[data-error]')).toBeHidden();
      expect(mediaRequests.length).toBeGreaterThan(0);
      await expect(video).toHaveAttribute('src', `${new URL(baseURL!).pathname}media/${media.file}`);
      await expect(video).toHaveAttribute('poster', /-poster\.(?:jpg|webp)$/);
      const frame = await entry.locator('.video-frame').boundingBox();
      expect(Math.abs(frame!.width - frame!.height)).toBeLessThan(1);
      const output = `artifacts/screenshots/${baseLabel}/${testInfo.project.name}`;
      await mkdir(output, { recursive: true });
      const screenshot = `${output}/${viewport.name}-${media.image}.png`;
      await entry.screenshot({ path: screenshot });
      await testInfo.attach(media.image, { path: screenshot, contentType: 'image/png' });
      await entry.locator('summary').click();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      await entry.locator('summary').click();
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
      // The first entry's frame can still be visible with the header in view.
      // Scroll beyond every research entry to exercise offscreen pausing.
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await expect(video).not.toBeInViewport();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
      // A native-controls pause must survive both visibility changes and reopening.
      await video.evaluate((element: HTMLVideoElement) => element.pause());
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      await entry.locator('summary').click();
      await entry.locator('summary').click();
      await video.scrollIntoViewIfNeeded();
      expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
      await video.evaluate((element: HTMLVideoElement) => element.play());
      await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
    });
  }
}

test('unavailable supplied video shows a retry control', async ({ page }) => {
  await page.route('**/vor_perc_clust-web.mp4', route => route.abort());
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  await entry.locator('video').scrollIntoViewIfNeeded();
  await expect(entry.locator('[data-error]')).toBeVisible();
  const retry = entry.getByRole('button', { name: 'Play video', exact: true });
  await expect(retry).toBeVisible();
  await page.unroute('**/vor_perc_clust-web.mp4');
  await retry.click();
  await expect.poll(() => entry.locator('video').evaluate((element: HTMLVideoElement) => element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);
  await expect(entry.locator('[data-error]')).toBeHidden();
});

test('reduced motion keeps video playback manual', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mediaRequests: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'media' || /vor_perc_clust-web\.mp4/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  const video = entry.locator('video');
  const play = entry.getByRole('button', { name: 'Play video', exact: true });
  await expect(play).toBeVisible();
  await expect(video).toHaveAttribute('poster', /vor_perc_clust-poster\.jpg$/);
  await expect.poll(() => video.evaluate(async (element: HTMLVideoElement) => {
    const poster = new Image();
    poster.src = element.poster;
    await poster.decode();
    return poster.naturalWidth > 0;
  })).toBe(true);
  expect(await video.getAttribute('src')).toBeNull();
  expect(mediaRequests).toEqual([]);
  await play.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);
  await expect(video).toBeFocused();
});

test('visibility events suspend playback and preserve manual pauses', async ({ page }) => {
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  // Headless tabs stay visible. Supply browser visibility states explicitly.
  const setHidden = async (hidden: boolean) => page.evaluate(value => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value ? 'hidden' : 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await setHidden(true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await setHidden(false);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await video.evaluate((element: HTMLVideoElement) => element.pause());
  await setHidden(true);
  await setHidden(false);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);

  await video.evaluate((element: HTMLVideoElement) => element.play());
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  // Native pause events are queued. Closing in the same task must retain the
  // visitor's choice even if the pause event arrives after the details close.
  const closedPauseTime = await video.evaluate((element: HTMLVideoElement) => {
    element.pause();
    element.closest<HTMLDetailsElement>('details')!.open = false;
    return element.currentTime;
  });
  await expect(entry.locator('details')).not.toHaveAttribute('open', '');
  await entry.locator('summary').click();
  await video.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(closedPauseTime);

  await video.evaluate((element: HTMLVideoElement) => element.play());
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  // A fast background/foreground transition can precede delivery of the
  // native pause event too. Neither transition may resume this manual pause.
  const visibilityPauseTime = await video.evaluate((element: HTMLVideoElement) => {
    element.pause();
    const pausedAt = element.currentTime;
    for (const hidden of [true, false]) {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    }
    return pausedAt;
  });
  await page.waitForTimeout(200);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(visibilityPauseTime);
});

test('email copy preserves keyboard focus and reports a denied clipboard request', async ({ page, context, browserName }) => {
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  else await page.addInitScript(() => {
    navigator.clipboard.writeText = async text => { (window as Window & { copiedEmail?: string }).copiedEmail = text; };
  });
  await page.goto('./');
  const copy = page.getByRole('button', { name: 'Copy email', exact: true });
  await copy.focus();
  await copy.press('Enter');
  await expect(page.locator('[data-copy-status]')).toHaveText('Email copied.');
  await expect(copy).toBeFocused();
  expect(await page.evaluate(actual => actual ? navigator.clipboard.readText() : (window as Window & { copiedEmail?: string }).copiedEmail, browserName === 'chromium')).toBe('matthias.irlbeck@uni-hamburg.de');
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
  });
  await copy.press('Enter');
  await expect(page.locator('[data-copy-status]')).toHaveText('Could not copy. Select the address to copy it.');
  await expect(copy).toBeEnabled();
  await expect(copy).toBeFocused();
});

test('200% text keeps navigation and expanded content inside narrow viewports', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
  for (const summary of await page.locator('.research-details > summary').all()) await summary.evaluate(element => { (element.parentElement as HTMLDetailsElement).open = true; });
  for (const width of [320, 390, 800, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of await page.getByRole('navigation').getByRole('link').all()) {
      const box = (await link.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    const contactRows = await page.locator('#contact dl > div').evaluateAll(rows => rows.map(row => ({
      labelRight: row.querySelector('dt')!.getBoundingClientRect().right,
      labelBottom: row.querySelector('dt')!.getBoundingClientRect().bottom,
      valueLeft: row.querySelector('dd')!.getBoundingClientRect().left,
      valueTop: row.querySelector('dd')!.getBoundingClientRect().top,
    })));
    for (const row of contactRows) {
      // Firefox can report the intended gap just below its integer value.
      if (row.valueTop >= row.labelBottom) expect(row.valueTop - row.labelBottom).toBeGreaterThanOrEqual(3.99);
      else expect(row.valueLeft - row.labelRight).toBeGreaterThanOrEqual(15.99);
    }
    expect(Math.abs(contactRows[0].valueLeft - contactRows[1].valueLeft)).toBeLessThan(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const output = `artifacts/screenshots/${baseLabel}/${testInfo.project.name}`;
  await mkdir(output, { recursive: true });
  const screenshot = `${output}/mobile-200-percent-text.png`;
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: screenshot });
  await testInfo.attach('200-percent-text', { path: screenshot, contentType: 'image/png' });
});

test('mobile close control stays reachable while reading long details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const entry = page.locator('#typical-voronoi-cell');
  const summary = entry.locator('summary');
  await summary.click();
  await entry.locator('.research-text h4').last().scrollIntoViewIfNeeded();
  const box = (await summary.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThan(844);
  await summary.click();
  await expect(entry.locator('details')).not.toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
});

test('subsection fragments open details and leave the heading below the mobile close control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const headingId = 'typical-voronoi-cell-main-result';
  await page.goto(`./#${headingId}`);
  const entry = page.locator('#typical-voronoi-cell');
  await expect(entry.locator('details')).toHaveAttribute('open', '');
  const heading = page.locator(`#${headingId}`);
  await expect(heading).toBeVisible();
  await expect.poll(async () => {
    const title = (await heading.boundingBox())!;
    const close = (await entry.locator('summary').boundingBox())!;
    return title.y >= close.y + close.height;
  }).toBe(true);
});

test('sharing assets, heading hierarchy, and narrow layouts', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('Matthias Irlbeck');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Matthias Irlbeck');
  const prefix = homeUrl;
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', new URL(homeUrl, siteUrl).href);
  const shareImage = (await page.locator('meta[property="og:image"]').getAttribute('content'))!;
  expect(shareImage).toBe(new URL(`${prefix}images/Matthias_Irlbeck.jpg`, siteUrl).href);
  const imageResponse = await page.request.head(new URL(shareImage).pathname);
  expect(imageResponse.status()).toBe(200);
  const icon = (await page.locator('link[rel="icon"]').getAttribute('href'))!;
  expect(icon).toBe(`${prefix}favicon-voronoi-cover.png`);
  const iconResponse = await page.request.get(icon);
  expect(iconResponse.status()).toBe(200);
  expect(iconResponse.headers()['content-type']).toContain('image/png');
  const iconPng = await iconResponse.body();
  expect(Array.from(iconPng.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  const iconSize = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, iconPng.toString('base64'));
  expect(iconSize).toEqual({ width: 64, height: 64 });
  const portrait = page.locator('.portrait img');
  await expect(portrait).toHaveAttribute('srcset', /96w.*612w/);
  for (const entry of await page.locator('.research-entry').all()) {
    const title = await entry.locator('.entry-metadata h3').innerText();
    await expect(entry.locator('summary')).toHaveAccessibleName(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(entry.locator('.research-text h3')).toHaveCount(0);
    expect(await entry.locator('.research-text h4').count()).toBeGreaterThan(0);
  }
  for (const width of [1440, 1024, 961, 960, 801, 800, 768, 561, 560, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const spacing = await page.locator('.research-entry').evaluateAll(entries => entries.map(entry => {
      const status = entry.querySelector('.paper-status')!;
      const text = document.createTreeWalker(status, NodeFilter.SHOW_TEXT);
      text.nextNode();
      const range = document.createRange();
      range.selectNodeContents(text.currentNode);
      return {
        authorGap: range.getBoundingClientRect().top - entry.querySelector('.coauthors')!.getBoundingClientRect().bottom,
        summaryGap: entry.querySelector('.paper-summary')!.getBoundingClientRect().top - status.getBoundingClientRect().bottom,
        linkHeight: status.querySelector('a')!.getBoundingClientRect().height,
      };
    }));
    for (const key of ['authorGap', 'summaryGap'] as const) {
      const gaps = spacing.map(entry => entry[key]);
      expect(Math.max(...gaps) - Math.min(...gaps), `Consistent ${key} at ${width}px`).toBeLessThan(1);
    }
    for (const entry of spacing) expect(entry.linkHeight).toBeGreaterThanOrEqual(43.99);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const portraitBox = await portrait.boundingBox();
  const nameBox = await page.locator('#profile-name').boundingBox();
  expect(nameBox!.x).toBeGreaterThan(portraitBox!.x + portraitBox!.width);
  expect((await page.locator('#research').boundingBox())!.y).toBeLessThan(600);
});
