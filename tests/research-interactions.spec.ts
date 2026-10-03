import { test, expect, type Page } from '@playwright/test';

for (const entryId of ['typical-voronoi-cell', 'random-borsuk-graph']) {
  test(`mobile closing restores visible focus after reading ${entryId}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`./#${entryId}`);
    const entry = page.locator(`#${entryId}`);
    const summary = entry.locator('summary');
    await expect(entry.locator('details')).toHaveAttribute('open', '');
    await page.locator(`#${entryId}-interpretation`).scrollIntoViewIfNeeded();
    const stickyBounds = (await summary.boundingBox())!;
    expect(stickyBounds.y).toBeGreaterThanOrEqual(0);
    expect(stickyBounds.y + stickyBounds.height).toBeLessThan(844);
    if (entryId === 'typical-voronoi-cell') {
      await summary.click();
    } else {
      await summary.focus();
      await summary.press('Enter');
    }
    await expect(entry.locator('details')).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
    await expect.poll(async () => {
      const bounds = (await summary.boundingBox())!;
      return bounds.y >= 0 && bounds.y + bounds.height <= 844;
    }).toBe(true);
  });
}

test('closing details without leaving their summary does not reposition the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const summary = page.locator('#typical-voronoi-cell summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.click();
  await expect(page.locator('#typical-voronoi-cell details')).toHaveAttribute('open', '');
  const before = await page.evaluate(() => scrollY);
  await summary.click();
  await expect(page.locator('#typical-voronoi-cell details')).not.toHaveAttribute('open', '');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await expect(summary).toBeFocused();
});

async function mockDataSaving(page: Page, saveData: boolean) {
  await page.addInitScript(value => {
    const connection = new EventTarget();
    Object.defineProperty(connection, 'saveData', { value, writable: true });
    Object.defineProperty(navigator, 'connection', { configurable: true, value: connection });
  }, saveData);
}

async function setDataSaving(page: Page, saveData: boolean) {
  await page.evaluate(value => {
    const connection = (navigator as Navigator & { connection: EventTarget & { saveData: boolean } }).connection;
    connection.saveData = value;
    connection.dispatchEvent(new Event('change'));
  }, saveData);
}

test('data saving shows a poster and fetches video only after an explicit start', async ({ page }) => {
  await mockDataSaving(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const mediaRequests: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'media' || /\.(mp4|webm)(?:\?|$)/.test(request.url())) {
      mediaRequests.push(request.url());
    }
  });
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('poster', /vor_perc_clust-poster\.jpg$/);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expect(await video.getAttribute('src')).toBeNull();
  expect(mediaRequests).toEqual([]);
  const play = entry.getByRole('button', { name: 'Play video', exact: true });
  await expect(play).toBeVisible();
  await play.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) =>
    element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);
  expect(mediaRequests.length).toBeGreaterThan(0);
  await expect(video).toBeFocused();
  // A connection change that leaves data saving enabled must retain the
  // visitor's explicit playback choice.
  await setDataSaving(page, true);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
});

test('enabling data saving pauses autoplay until the visitor starts it again', async ({ page }) => {
  await mockDataSaving(page, false);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) =>
    element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);
  await setDataSaving(page, true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await entry.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await expect(video).toBeFocused();
});

test('newly enabled motion or data preferences pause an explicitly started video independently', async ({ page }) => {
  await mockDataSaving(page, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./#high-dimensional-percolation');
  const entry = page.locator('#high-dimensional-percolation');
  const video = entry.locator('video');
  await video.scrollIntoViewIfNeeded();
  const play = entry.getByRole('button', { name: 'Play video', exact: true });
  await play.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) =>
    element.readyState >= 2 && !element.paused && element.currentTime > 0.1), { timeout: 15000 }).toBe(true);

  // Reduced motion was just enabled, even though data saving already required
  // the visitor's earlier manual start.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await play.click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);

  // Disabling one restriction preserves that explicit start. Enabling it
  // again is a new preference and pauses even while reduced motion stays on.
  await setDataSaving(page, false);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await setDataSaving(page, true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(play).toBeVisible();
});
