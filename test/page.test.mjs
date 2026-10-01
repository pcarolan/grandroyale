import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const read = (p) => readFileSync(new URL(p, root), 'utf8');

// ---- Sign-up form contract (assets/signup.js depends on these) ----
test('has a tel input', () => assert.match(html, /<input[^>]*id="phone"[^>]*type="tel"/));
test('form, error, success and number ids are present', () => {
  for (const id of ['signup', 'phone', 'signup-error', 'signup-success', 'signup-number']) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
  assert.match(html, /<form[^>]*id="signup"/);
  assert.match(html, /id="signup-success"[^>]*hidden[\s\S]*?<h3 tabindex="-1">/);
});
test('has the submit button with the right words', () => {
  assert.match(html, /<button type="submit"[^>]*>Text me when they're hot<\/button>/);
});
test('form copy is the drop-your-number line', () => {
  assert.match(html, /Add your number and we'll send you a text when the pizzas are ready for pickup\./);
  assert.doesNotMatch(html, /Drop your number|pies are hot/);
});
// Consent checkbox and fine print removed; submitting a number is the opt-in (bees-vo70.16)
test('has no checkbox', () => assert.ok(!/type="checkbox"/.test(html)));
test('has no STOP line and no fineprint', () => {
  assert.ok(!html.includes('STOP'));
  assert.ok(!html.includes('By signing up you agree'));
  assert.ok(!/class="[^"]*\bfineprint\b/.test(html));
});
test('loads config.js and signup.js', () => {
  assert.match(html, /<script[^>]*src="assets\/config\.js"/);
  assert.match(html, /<script[^>]*src="assets\/signup\.js"/);
});

// ---- Page basics ----
test('has a viewport meta', () => assert.match(html, /<meta name="viewport"/));
test('has a title', () => assert.match(html, /<title>[^<]+<\/title>/));
test('says coming soon', () => assert.match(html, /coming soon/i));
test('mentions hot and pickup', () => {
  assert.match(html, /\bhot\b/);
  assert.match(html, /\bpickup\b/);
});
test('says Petoskey, MI', () => assert.ok(html.includes('Petoskey, MI')));
test('names the owners', () => assert.ok(html.includes('Todd Webb + Pat Carolan')));
test('respects reduced motion', () => assert.match(html, /prefers-reduced-motion/));
test('body has an explicit background', () => assert.match(html.match(/\bbody\s*\{[^}]*\}/)?.[0] ?? '', /background(-color)?:/));
test('the wall is white, not kraft', () => {
  assert.match(html, /--wall:\s*#fff(fff)?;/i);
  assert.match(html.match(/\bbody\s*\{[^}]*\}/)?.[0] ?? '', /background:\s*var\(--wall\)/);
});

// ---- Forbidden words ----
test('forbidden strings are absent', () => {
  assert.ok(!/wood/i.test(html), 'wood');
  for (const s of ['Roberta', 'Blistered', 'Vol.', 'Fig.', 'Table of contents', 'Issue No']) {
    assert.ok(!html.includes(s), s);
  }
  assert.ok(!/\bTOC\b/.test(html), 'TOC');
});

// ---- Photo wall, not a magazine (grand-royal-raw skill, bees-vo70.17) ----
test('no header or nav element', () => {
  assert.ok(!/<header\b/i.test(html));
  assert.ok(!/<nav\b/i.test(html));
});
test('no magazine class names', () => {
  const classes = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).join(' ');
  assert.ok(!/\b(masthead|issue|spread|section|toc|folio|wordmark)\b/.test(classes), classes);
});
test('photos are not laid out with grid or flex-wrap', () => {
  assert.ok(!/display:\s*grid/.test(html));
  assert.ok(!/flex-wrap/.test(html));
});
test('at most 2 Google Fonts families', () => {
  const links = [...html.matchAll(/https:\/\/fonts\.googleapis\.com\/css2?\?[^"']*/g)].map((m) => m[0]);
  const families = links.flatMap((l) => [...l.matchAll(/family=([^&:]+)/g)].map((m) => m[1]));
  assert.ok(families.length <= 2, families.join(','));
  assert.ok(!/Permanent\+Marker|Rock\+Salt|Sancreek/.test(links.join(' ')));
});
test('no external images', () => {
  assert.ok(!/<img[^>]*src="https?:/i.test(html));
  assert.ok(!/url\(\s*["']?https?:/i.test(html));
});

// ---- Manifest + attribution ----
const manifest = JSON.parse(read('photos/manifest.json'));
const LICENSE_OK = /^(Public domain|PD|CC0|CC BY(-SA)? \d\.\d)/i;

test('manifest has 25-40 photos with full metadata', () => {
  assert.ok(Array.isArray(manifest));
  assert.ok(manifest.length >= 25 && manifest.length <= 40, `count ${manifest.length}`);
  for (const p of manifest) {
    for (const k of ['file', 'alt', 'source_url', 'author', 'license']) {
      assert.ok(typeof p[k] === 'string' && p[k].trim(), `${p.file}: missing ${k}`);
    }
    assert.match(p.source_url, /^https:\/\//);
  }
});
test('licenses are PD, CC0, CC BY or CC BY-SA only (no NC/ND)', () => {
  for (const p of manifest) {
    assert.match(p.license, LICENSE_OK, `${p.file}: ${p.license}`);
    assert.ok(!/\b(NC|ND)\b/.test(p.license), `${p.file}: ${p.license}`);
  }
});
test('every photo file exists and is at most 400 KB', () => {
  for (const p of manifest) {
    const url = new URL(`photos/${p.file}`, root);
    assert.ok(existsSync(url), `missing photos/${p.file}`);
    assert.ok(statSync(url).size <= 400 * 1024, `${p.file} is ${statSync(url).size} bytes`);
  }
});
test('committed photos total under 6 MB', () => {
  const dir = new URL('photos/', root);
  const total = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .reduce((n, f) => n + statSync(new URL(f, dir)).size, 0);
  assert.ok(total < 6 * 1024 * 1024, `${total} bytes`);
});
test('ATTRIBUTION.md lists every photo with its source and license', () => {
  const md = read('photos/ATTRIBUTION.md');
  for (const p of manifest) {
    assert.ok(md.includes(p.file), `ATTRIBUTION missing ${p.file}`);
    assert.ok(md.includes(p.source_url), `ATTRIBUTION missing ${p.source_url}`);
  }
});
test('index.html inlines the current manifest (run node build.mjs)', () => {
  const m = html.match(/<script type="application\/json" id="manifest">([\s\S]*?)<\/script>/);
  assert.ok(m, 'no inline manifest');
  // the page inlines only what it renders; credits live in ATTRIBUTION.md (bees-vo70.17)
  const keep = ({ file, alt, treatment, weight, w, h, caption }) => ({ file, alt, treatment, weight, w, h, caption });
  assert.deepEqual(JSON.parse(m[1]), manifest.map(keep).map((o) => JSON.parse(JSON.stringify(o))));
});
test('no photo-credits receipt on the wall', () => {
  assert.ok(!html.includes('PHOTOS ON THIS WALL'));
  assert.ok(!html.includes('THANK YOU COME AGAIN'));
  assert.ok(!/id="credits"|id="receipt"|class="[^"]*\breceipt\b/.test(html));
  for (const a of ['Missvain', 'Rhododendrites']) assert.ok(!html.includes(a), `author ${a} still in index.html`);
});
test('exactly one link to ATTRIBUTION.md, worded "photo credits"', () => {
  const links = [...html.matchAll(/<a\b[^>]*href="photos\/ATTRIBUTION\.md"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(links.length, 1);
  assert.equal(links[0][1].trim(), 'photo credits');
  assert.equal((html.match(/photos\/ATTRIBUTION\.md/g) || []).length, 1);
});

// ---- Lettering is images, not webfonts (skill rule 5) ----
test('lettering images exist and are used', () => {
  const used = [...html.matchAll(/(lettering\/[\w.-]+\.(?:png|svg))/g)].map((m) => m[1]);
  const uniq = [...new Set(used)];
  assert.ok(uniq.length >= 3, `only ${uniq.length} lettering images referenced`);
  for (const f of uniq) assert.ok(existsSync(new URL(f, root)), `missing ${f}`);
});

// ---- Owner removals 2026-09-30: no "yr number here" arrow, no "who ordered the pie?" ----
test('no YR NUMBER HERE arrow on the wall', () => {
  assert.doesNotMatch(html, /scrawl-arrow|id="arrow"|class="it arrow|yr number|yr-number/i);
  assert.ok(!existsSync(new URL('lettering/scrawl-arrow.svg', root)), 'lettering/scrawl-arrow.svg should be deleted');
  const gen = readFileSync(new URL('tools/lettering.mjs', root), 'utf8');
  assert.doesNotMatch(gen, /scrawl-arrow|yr number/i);
});
test('no "who ordered the pie?" scrawl on the wall', () => {
  assert.doesNotMatch(html, /scrawl-who|who ordered/i);
  assert.ok(!existsSync(new URL('lettering/scrawl-who.svg', root)), 'lettering/scrawl-who.svg should be deleted');
  const gen = readFileSync(new URL('tools/lettering.mjs', root), 'utf8');
  assert.doesNotMatch(gen, /scrawl-who|who ordered/i);
});
