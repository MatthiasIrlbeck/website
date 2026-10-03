import { test, expect } from '@playwright/test';

test('printing keeps selected research open and removes screen-only controls', async ({ page, browserName }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const entries = page.locator('.research-entry');
  await entries.first().locator('summary').click();
  const openIds = await page.locator('.research-entry:has(details[open])').evaluateAll(nodes => nodes.map(node => node.id));

  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveCSS('color', 'rgb(17, 17, 17)');
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  for (const control of await page.locator('nav, summary, .copy-email, .load-video, footer').all()) {
    await expect(control).toBeHidden();
  }
  await expect(entries.first().locator('.research-model')).toBeVisible();
  await expect(entries.nth(1).locator('.research-model')).toBeHidden();
  for (const link of await page.locator('.preprint-link').all()) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https:\/\/arxiv\.org\/abs\//);
    const printedUrl = await link.evaluate(node => getComputedStyle(node, '::after').content);
    // Firefox retains attr(href) in CSSOM even though the printed URL renders.
    expect(printedUrl.replace(/attr\(href\)/g, href!)).toContain(href);
  }
  await testInfo.attach('printed-paper-link', {
    body: await page.locator('.paper-status').first().screenshot(),
    contentType: 'image/png',
  });
  if (browserName === 'chromium') {
    const path = testInfo.outputPath('selected-research.pdf');
    await page.pdf({ path, format: 'A4', printBackground: false });
    await testInfo.attach('print-preview', { path, contentType: 'application/pdf' });
  }

  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  expect(await page.locator('.research-entry:has(details[open])').evaluateAll(nodes => nodes.map(node => node.id))).toEqual(openIds);
  await expect(entries.first().locator('summary')).toBeVisible();
});
