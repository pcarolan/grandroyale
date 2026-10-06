// No infinite scroll (Pat, 2026-10-05: "get rid of infinite scroll"; bees-5orh.10).
// The wall is one wall: the archive picks are ordinary photos in photos/manifest.json, nothing appends below it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const build = readFileSync(new URL('build.mjs', root), 'utf8');

test('no IntersectionObserver, sentinel or band appending', () => {
  assert.doesNotMatch(html, /IntersectionObserver/);
  assert.doesNotMatch(html, /id = 'more'|id="more"|data-more/);
  assert.doesNotMatch(html, /function band\(/);
});
test('no inline archive manifest, no photos/archive/ anywhere', () => {
  assert.doesNotMatch(html, /id="archive"/);
  assert.doesNotMatch(html, /photos\/archive/);
  assert.doesNotMatch(build, /archive/);
  assert.ok(!existsSync(new URL('photos/archive/', root)), 'photos/archive/ should be gone');
});
test('no "more credits" scrap, no typed-year scrap', () => {
  assert.doesNotMatch(html, /more credits/);
  assert.doesNotMatch(html, /className = 'era'|\.era\s*\{/);
});
