// "dont dupe photos and bring back the polaroid style." (Pat, 2026-10-06; bees-pyrm.6)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const manifest = JSON.parse(read('photos/manifest.json'));
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const js = html.match(/<script>\s*\(function[\s\S]*?<\/script>/)[0];
const STRIP_RE = /var STRIP = \[[^\]]*\];/;

// ---- one of each photo ----
test('no file appears twice in the manifest', () => {
  const files = manifest.map((m) => m.file);
  const dupes = files.filter((f, i) => files.indexOf(f) !== i);
  assert.deepEqual(dupes, []);
});
test('no photos/<file> src appears twice in index.html (the STRIP contact strip aside)', () => {
  const page = html.replace(STRIP_RE, '');
  const seen = {};
  for (const [, f] of page.matchAll(/photos\/([\w.-]+\.jpg)/g)) seen[f] = (seen[f] || 0) + 1;
  for (const m of manifest) seen[m.file] = (seen[m.file] || 0) + 1;   // each manifest entry is rendered once
  const twice = Object.entries(seen).filter(([, n]) => n > 1).map(([f]) => f);
  assert.deepEqual(twice, []);
});
test('the contact strip lists each frame once', () => {
  const strip = JSON.parse(html.match(STRIP_RE)[0].replace(/^var STRIP = /, '').replace(/;$/, '').replace(/'/g, '"'));
  assert.equal(new Set(strip).size, strip.length);
});
test("Cecilia's sketch is on the wall once: no scraps cut from it on index.html", () => {
  assert.doesNotMatch(html, /scraps\//);
  assert.doesNotMatch(html, /class="[^"]*\bresident\b/);
  assert.doesNotMatch(html, /data-near/);
  assert.ok(!existsSync(new URL('scraps/cecilia-dice.jpg', root)), 'dice scrap file still there');
  const sketch = manifest.filter((m) => m.file === 'crown-slice-sketch.jpg');
  assert.equal(sketch.length, 1);
  assert.equal(sketch[0].place, 'top');
  assert.equal(sketch[0].caption, "12. this is our pizza\n(artist's rendering)");
});
test('the 404 keeps the slice tip (a different page)', () => {
  assert.ok(existsSync(new URL('scraps/cecilia-tip.jpg', root)));
  assert.match(read('tools/pages.mjs'), /scraps\/cecilia-tip\.jpg/);
});

// ---- polaroid sheets ----
test('.print .sheet keeps the Polaroid side padding', () => {
  assert.match(css, /\.print \.sheet\s*\{\s*padding:\s*9px 9px 0;\s*\}/);
});
test('every photo is a Polaroid print: 9px top and sides, a bottom pad (22, or 30/38 under a caption)', () => {
  assert.match(js, /fig\.className = 'it ph print ' \+ p\.treatment;/);
  assert.match(js, /var pad = \[9, 9, p\.caption \? \(mobile \? 30 : 38\) \+ more : 22, 9\];/);
  assert.doesNotMatch(js, /r\(\) < 0\.55/, 'no more bare, unpadded photocopies');
  assert.doesNotMatch(js, /sheet\.style\.clipPath/, 'no torn edges eating the Polaroid border');
});
test('captions sit in the Polaroid bottom margin', () => {
  assert.match(css, /\.cap\s*\{\s*position:\s*absolute;\s*left:\s*12px;\s*bottom:\s*7px;\s*height:\s*22px;/);
});
