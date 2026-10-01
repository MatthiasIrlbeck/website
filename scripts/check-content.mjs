import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { profile } from '../src/data/profile.ts';
import { cv } from '../src/data/cv.ts';
import { contact } from '../src/data/contact.ts';

assert(profile.biography.length > 0 && profile.biography.length <= 5, 'Biography must contain at most five sentences');
function checkAsset(url) {
  if (url === null) return;
  if (url.startsWith('https://')) { new URL(url); return; }
  assert(url.startsWith('/') && !url.startsWith('//'), `Invalid local asset URL: ${url}`);
  assert(existsSync(`public${url}`), `Missing local asset: ${url}`);
}
if (profile.portrait) {
  checkAsset(profile.portrait.src);
  assert(profile.portrait.alt.length > 0, 'Portrait needs alt text');
}
for (const label of ['PhD thesis', 'Master’s thesis']) {
  assert(cv.some(row => row.thesis?.label === label), `${label} field missing`);
}
for (const row of cv) if (row.thesis?.url) checkAsset(row.thesis.url);
if (contact.email) assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email), 'Invalid contact email');
const orders = new Set();
for (const file of readdirSync('src/content/research').filter(f => f.endsWith('.md'))) {
  const text = readFileSync(`src/content/research/${file}`, 'utf8');
  const order = Number(text.match(/^order: (\d+)$/m)?.[1]);
  assert(order > 0 && !orders.has(order), `Invalid/duplicate research order in ${file}`);
  orders.add(order);
  assert(!/href=["']#['"]/.test(text), `Fake link in ${file}`);
  assert(!/youtube\.com\/embed|youtu\.be/.test(text), `YouTube embed/link in ${file}`);
  // Check local source/poster/thumbnail URLs without fetching external assets.
  for (const match of text.matchAll(/^\s*(?:src|poster):\s*["']?(\/[^\s"']+)/gm)) checkAsset(match[1]);
}
assert(orders.size > 0, 'No research entries');
console.log(`Content checks passed: ${orders.size} research entries, biography, CV/thesis fields, contact, and supplied local assets.`);
