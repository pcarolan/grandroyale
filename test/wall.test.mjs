// The wall keeps going (bees-5orh.5): archive photos append in seeded bands as you scroll,
// with nothing on the first screen that says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
const visible = html
  .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/g, ' ')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<[^>]+>/g, ' ');

// ---- data ----
test('index.html carries an inline archive manifest', () => {
  const m = html.match(/<script type="application\/json" id="archive">([\s\S]*?)<\/script>/);
  assert.ok(m, 'no <script type="application/json" id="archive">');
  assert.ok(Array.isArray(JSON.parse(m[1])));
});
test('archive photos come from photos/archive/, fetch is the fallback', () => {
  assert.match(script, /'photos\/archive\/'/);
  assert.match(script, /fetch\('photos\/archive\/manifest\.json'\)/);
});

// ---- the surprise ----
test('an IntersectionObserver watches an invisible #more sentinel', () => {
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /id = 'more'|id="more"/);
  assert.match(script, /'aria-hidden', 'true'/);
  assert.match(script, /rootMargin: '120% 0px'/);
});
test('placement is band-based: one scatter() for the first wall and every band', () => {
  assert.match(script, /function scatter\(items, r, top, W, H, keepOut\)/);
  assert.match(script, /mulberry32\(1993\)/, 'first wall keeps seed 1993');
  assert.match(script, /mulberry32\(1993 \+ /, 'band k uses seed 1993 + k');
  assert.ok((script.match(/scatter\(/g) || []).length >= 3, 'scatter defined and called for wall + bands');
});
test('band photos lazy-load and are not taped (owner rule)', () => {
  assert.match(script, /loading = 'lazy'/);
  assert.doesNotMatch(html, /hold\(fig/);
});
test('the form card is never dropped into a band', () => {
  const band = script.slice(script.indexOf('function band('));
  assert.ok(script.includes('function band('), 'no band() function');
  assert.doesNotMatch(band.slice(0, band.indexOf('\n  }\n')), /card/);
});
test('the extra scraps are the existing label and red stamp', () => {
  assert.match(script, /lettering\/label-petoskey\.png/);
  assert.match(script, /lettering\/stamp-coming-soon\.png/);
});
test('"more credits" links the archive attribution, inside the first band only', () => {
  assert.match(script, /photos\/archive\/ATTRIBUTION\.md/);
  assert.match(script, /'more credits'/);
  assert.match(script, /k === 1/);
});

test('the first strip tucks up under the first wall: no empty seam between them', () => {
  const band = script.slice(script.indexOf('function band('));
  assert.match(band, /var top = k === 1 \? frontier - 150 : frontier;/);
});

// ---- nothing hints at it ----
test('no visible words that give it away', () => {
  assert.doesNotMatch(visible, /load more|more photos|scroll/i);
  assert.doesNotMatch(html, /load more|more photos/i);
});
test('still no grid or flex-wrap anywhere', () => {
  assert.equal((html.match(/display:\s*grid/g) || []).length, 0);
  assert.equal((html.match(/flex-wrap/g) || []).length, 0);
});
test('no animation or transition added', () => {
  assert.doesNotMatch(html, /@keyframes|animation:|transition:/);
});
test('no new fonts', () => {
  assert.doesNotMatch(html, /@font-face|fonts\.googleapis/);
});

// ---- build.mjs ----
function sandbox(archive) {
  const dir = mkdtempSync(join(tmpdir(), 'gr-wall-'));
  mkdirSync(join(dir, 'photos'));
  for (const f of ['index.html', 'build.mjs', 'photos/manifest.json']) copyFileSync(fileURLToPath(new URL(f, root)), join(dir, f));
  if (archive) {
    mkdirSync(join(dir, 'photos/archive'));
    writeFileSync(join(dir, 'photos/archive/manifest.json'), JSON.stringify(archive));
  }
  execFileSync(process.execPath, ['build.mjs'], { cwd: dir, stdio: 'pipe' });
  const out = readFileSync(join(dir, 'index.html'), 'utf8');
  rmSync(dir, { recursive: true, force: true });
  return JSON.parse(out.match(/<script type="application\/json" id="archive">([\s\S]*?)<\/script>/)[1]);
}
test('build.mjs inlines photos/archive/manifest.json, slim fields only', () => {
  const full = [
    { file: 'yb-1987-01.jpg', alt: 'Yearbook <crop>', era: '1987', treatment: 'xerox', weight: 6, w: 400, h: 520, source_url: 'https://x', author: 'A', license: 'PD', crop: [1, 2, 3, 4] },
    { file: 'news-1972.jpg', alt: 'Clipping', era: '1972', treatment: 'red', weight: 8, w: 600, h: 300, license: 'PD' },
  ];
  const got = sandbox(full);
  assert.deepEqual(got, full.map(({ file, alt, era, treatment, weight, w, h }) => ({ file, alt, era, treatment, weight, w, h })));
});
test('build.mjs inlines [] when there is no archive manifest', () => {
  assert.deepEqual(sandbox(null), []);
});
test('a typed year goes on at most 1 photo in 4 (.era, no new fonts)', () => {
  assert.match(script, /className = 'era'/);
  assert.match(script, /\(eras \+ 1\) \* 4 <= n/);
  assert.match(html, /\.era\s*\{[^}]*var\(--type\)/);
});
