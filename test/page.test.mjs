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
  assert.match(html, /<button type="submit"[^>]*>Text me when the pizza's on<\/button>/);
  assert.doesNotMatch(html, /when they're hot/);
});
// _why crit (CRIT.md #2, bees-pyrm.2): the card talks like the person who wrote "PIZZA." on the flyer
test('the card asks like a friend, not an intake form', () => {
  assert.match(html, /<p class="lede">We're not open yet\. Leave your number and we'll text you the first night we fire the oven\.<\/p>/);
  assert.match(html, /<label for="phone">your number<\/label>/);
  assert.match(html, /placeholder="231 and the rest"/);
  assert.doesNotMatch(html, /555-0199/, 'no fake phone number on a wall of true things');
  assert.doesNotMatch(html, /next batch|Your phone number|Send us your number/);
  assert.doesNotMatch(html, /Add your number|ready for pickup/);
  assert.doesNotMatch(html, /Drop your number|pies are hot/);
});
test('success says "Got it" and is quiet: no list, no newsletter, no confetti', () => {
  const ok = html.match(/<div class="success" id="signup-success" hidden>[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(ok, /<h3 tabindex="-1">Got it\.<\/h3>/);
  assert.match(ok, /<p>We'll text <strong id="signup-number"><\/strong> once, when the pizza's on\. No newsletter, we promise\.<\/p>/);
  assert.doesNotMatch(ok, /on the list|Yay|!/);
  assert.doesNotMatch(ok, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'no emoji');
});
test('signup.js errors are said by a person', () => {
  const js = read('assets/signup.js');
  assert.match(js, /phone: "That's not ten digits\. Try again, we'll wait\."/);
  assert.match(js, /offline: "Our phone isn't plugged in yet\. Come back in a day\."/);
  assert.match(js, /network: "Didn't go through\. Bad signal or bad luck; try once more\."/);
  assert.doesNotMatch(js, /Enter a 10-digit|555-0199|isn't connected yet|Check your connection/);
});
test('the meta description matches the card', () => {
  assert.match(html, /<meta name="description" content="[^"]*first night we fire the oven[^"]*">/);
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
test('never says hot (owner removed the word on 2026-09-30)', () => {
  assert.doesNotMatch(html, /\bhot\b/i);
  assert.doesNotMatch(read('assets/signup.js'), /\bhot\b/i);
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
// "Archive scan: <original credit>": 80s/90s Petoskey-area yearbook and museum crops, Pat's call 2026-10-05 (bees-5orh.11)
const LICENSE_OK = /^(Public domain|PD|CC0|CC BY(-SA)? \d\.\d|Own photo|Own scan|Archive scan: \S)/i;

test('manifest has 25-40 photos with full metadata', () => {
  assert.ok(Array.isArray(manifest));
  assert.ok(manifest.length >= 25 && manifest.length <= 60, `count ${manifest.length}`);
  for (const p of manifest) {
    for (const k of ['file', 'alt', 'source_url', 'author', 'license']) {
      assert.ok(typeof p[k] === 'string' && p[k].trim(), `${p.file}: missing ${k}`);
    }
    assert.match(p.source_url, /^https:\/\//);
  }
});
test('licenses are PD, CC0, CC BY, CC BY-SA, own, or a credited archive scan (no NC/ND)', () => {
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
// Cecilia Carolan's pencil sketch: pizza slice wearing a dice crown (Pat, 2026-10-06; bees-4dqr.1)
test("Cecilia's crown slice sketch is on the wall, credited to her", () => {
  const p = manifest.find((m) => m.file === 'crown-slice-sketch.jpg');
  assert.ok(p, 'crown-slice-sketch.jpg not in manifest');
  assert.equal(p.author, 'Cecilia Carolan');
  assert.ok(p.weight >= 7, `weight ${p.weight}`);
  assert.match(read('photos/ATTRIBUTION.md'), /\| crown-slice-sketch\.jpg \|[^\n]*\| Cecilia Carolan \|/);
});
test('index.html inlines the current manifest (run node build.mjs)', () => {
  const m = html.match(/<script type="application\/json" id="manifest">([\s\S]*?)<\/script>/);
  assert.ok(m, 'no inline manifest');
  // the page inlines only what it renders; credits live in ATTRIBUTION.md (bees-vo70.17)
  const keep = ({ file, alt, treatment, weight, w, h, caption, place }) => ({ file, alt, treatment, weight, w, h, caption, place });
  assert.deepEqual(JSON.parse(m[1]), manifest.map(keep).map((o) => JSON.parse(JSON.stringify(o))));
});
test('no photo-credits receipt on the wall', () => {
  assert.ok(!html.includes('PHOTOS ON THIS WALL'));
  assert.ok(!html.includes('THANK YOU COME AGAIN'));
  assert.ok(!/id="credits"|id="receipt"|class="[^"]*\breceipt\b/.test(html));
  for (const a of ['Missvain', 'Rhododendrites']) assert.ok(!html.includes(a), `author ${a} still in index.html`);
});
// (the ATTRIBUTION.md link became the thank-you card + credits.html: test/pages.test.mjs, bees-pyrm.2)

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

// ---- Owner removal 2026-09-30: no "pickup only" ----
test('no "pickup only" anywhere on the wall', () => {
  assert.doesNotMatch(html, /pickup only|pickup-only/i);
  assert.ok(!existsSync(new URL('lettering/stamp-pickup-only.png', root)), 'stamp-pickup-only.png should be deleted');
  assert.doesNotMatch(readFileSync(new URL('tools/lettering.mjs', root), 'utf8'), /pickup only|pickup-only/i);
});

// ---- Owner removal 2026-09-30: no tape or staples on photos ----
test('photos are not taped or stapled', () => {
  assert.doesNotMatch(html, /hold\(fig/);
});

// ---- Owner's own photos (2026-09-30) ----
test('the yellow awning photo (Pat\'s own) is on the wall', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  const own = manifest.find((p) => p.file === 'yellow-awning.jpg');
  assert.ok(own, 'yellow-awning.jpg missing from manifest');
  assert.equal(own.license, 'Own photo');
  assert.equal(own.author, 'Pat Carolan');
  assert.ok(own.weight >= 8, 'should be a big one');
  assert.ok(existsSync(new URL('photos/yellow-awning.jpg', root)));
  assert.match(readFileSync(new URL('tools/photos.mjs', root), 'utf8'), /Own photo/, 'generator must preserve own photos');
});

test('the C. Joy\'s arcade clipping (Pat\'s scan) is on the wall', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  const own = manifest.find((p) => p.file === 'cjoys-arcade-ad.jpg');
  assert.ok(own, 'cjoys-arcade-ad.jpg missing from manifest');
  assert.equal(own.license, 'Own scan');
  assert.ok(existsSync(new URL('photos/cjoys-arcade-ad.jpg', root)));
});
test('the VACANCY bar photo (Pat\'s own) is on the wall', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  assert.ok(manifest.find((p) => p.file === 'vacancy-bar.jpg'), 'vacancy-bar.jpg missing from manifest');
  assert.ok(existsSync(new URL('photos/vacancy-bar.jpg', root)));
  assert.ok(existsSync(new URL('tools/own.mjs', root)), 'tools/own.mjs should exist');
});

// ---- Owner 2026-10-01: "make the lettering more regal" (bees-vo70.20) ----
// The name is the Grand Royal Records look: crown over Sancreek, rendered to an image, screen-print rough.
test('the spray/h1 is the crowned Sancreek wordmark image', () => {
  assert.ok(existsSync(new URL('lettering/wordmark-grand-royale.png', root)), 'missing lettering/wordmark-grand-royale.png');
  assert.match(html, /<h1[^>]*id="spray"[^>]*><img src="lettering\/wordmark-grand-royale\.png"[^>]*alt="Grand Royale Pizza"/);
});
test('the old spray stencil is gone', () => {
  assert.ok(!html.includes('stencil-grand-royale'), 'index.html still references the stencil');
  assert.ok(!existsSync(new URL('lettering/stencil-grand-royale.png', root)), 'stencil-grand-royale.png should be deleted');
  assert.doesNotMatch(read('tools/lettering.mjs'), /stencil-grand-royale/);
});
test('no Google Fonts link anywhere', () => assert.ok(!html.includes('fonts.googleapis.com')));
test('Sancreek is vendored with its OFL license', () => {
  assert.ok(existsSync(new URL('tools/fonts/Sancreek-Regular.ttf', root)));
  assert.ok(existsSync(new URL('tools/fonts/OFL.txt', root)));
});
test('the sticker carries the crown', () => assert.match(read('lettering/sticker.svg'), /class="crown"/));

// ---- Owner copy rule 2026-10-01: no "yr" in captions ----
test('no caption or lettering says "yr"', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  for (const p of manifest) assert.doesNotMatch(p.caption || '', /\byr\b/i, `${p.file}: ${p.caption}`);
  assert.doesNotMatch(html, /\byr\b/i);
  assert.doesNotMatch(readFileSync(new URL('tools/photos.mjs', root), 'utf8'), /\byr\b/i);
  assert.ok(manifest.find((p) => p.file === 'bar-sink.jpg')?.caption === 'wash your hands');
});

// ---- Owner placement 2026-10-01: credits pinned bottom right -> now the thank-you card (test/pages.test.mjs) ----
test('the Victory Lanes bowling alley photo (Pat\'s own) is on the wall', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  assert.ok(manifest.find((p) => p.file === 'victory-lanes.jpg'), 'victory-lanes.jpg missing from manifest');
  assert.ok(existsSync(new URL('photos/victory-lanes.jpg', root)));
});

// ---- Owner removal 2026-10-01: one skate photo fewer (dirt ollie) ----
test('the dirt-ollie skate photo is gone', () => {
  const manifest = JSON.parse(readFileSync(new URL('photos/manifest.json', root), 'utf8'));
  assert.ok(!manifest.find((p) => p.file === 'dirt-ollie.jpg'));
  assert.ok(!existsSync(new URL('photos/dirt-ollie.jpg', root)));
  assert.doesNotMatch(html, /dirt-ollie/);
  assert.doesNotMatch(readFileSync(new URL('tools/photos.mjs', root), 'utf8'), /dirt-ollie/);
  assert.doesNotMatch(readFileSync(new URL('photos/ATTRIBUTION.md', root), 'utf8'), /dirt-ollie/);
});

// Pat 2026-10-05: "spread out the photos a bit" (bees-5orh.12). Pinned so the wall doesn't drift back to crowded.
test('the wall breathes: density 1.0 desktop / 1.3 phone, overlap tolerance 0.25', () => {
  assert.match(html, /area \* \(mobile \? 1\.3 : 1\.0\) \/ W/, 'wall-height density factor');
  assert.match(html, /Math\.max\(0, frac - 0\.25\)/, 'overlap tolerance in the scatter score');
  assert.doesNotMatch(html, /frac - 0\.38|mobile \? 0\.95 : 0\.74/);
});

// Pat 2026-10-06: slice-paper-plate marker caption is "royale with cheese" (bees-5orh.13).
test('the paper-plate caption reads "royale with cheese"', () => {
  assert.match(html, /"caption":\s*"royale with cheese"/);
  assert.doesNotMatch(html, /not ours yet/);
  assert.doesNotMatch(read('tools/photos.mjs'), /not ours yet/);
  const m = JSON.parse(read('photos/manifest.json')).find((p) => p.file === 'slice-paper-plate.jpg');
  assert.equal(m.caption, 'royale with cheese');
  assert.ok(existsSync(new URL('lettering/cap-slice-paper-plate.svg', root)));
});
test('attribution header no longer claims one blanket free license', () => {
  const a = read('photos/ATTRIBUTION.md');
  assert.doesNotMatch(a, /used under a free license/);
  assert.match(a, /public domain or Creative Commons/);
  assert.match(a, /Archive scan:/);
});

// Pat: "put it near the top" -- Cecilia's sketch is pinned into the first screen (bees-4dqr.5)
test("Cecilia's sketch is pinned to the top of the wall", () => {
  const p = manifest.find((m) => m.file === 'crown-slice-sketch.jpg');
  assert.equal(p.place, 'top');
  assert.ok(p.weight >= 7, 'weight >= 7 so it also shows on phones');
});
test('build.mjs keeps the place field in the slim manifest', () => {
  assert.match(read('build.mjs'), /\(\{[^)]*\bplace\b[^)]*\}\) => \(\{[^)]*\bplace\b/);
});
test("the scatter honours place: 'top' within the first screen", () => {
  assert.match(html, /place === 'top'/);
  assert.match(html, /VH \* 0\.85 - it\.h/);
});
test('pinned items stack over the other photos but under the name', () => {
  assert.match(html, /it\.place === 'top' \? 41 \+ z % 19/);
});

// Pat 2026-10-06: card is a tropical pink post-it (bees-xzb4.1). --red stays the one spot colour for stripe/button.
test('the card is a tropical pink post-it; inputs stay cream', () => {
  const root = html.match(/:root\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(root, /--postit:\s*#ff7eb9/i);
  assert.match(html.match(/#card\s*\{[^}]*\}/)?.[0] ?? '', /background:\s*var\(--postit\)/);
  assert.match(html.match(/#card input\s*\{[^}]*\}/)?.[0] ?? '', /background:\s*var\(--paper\)/);
  assert.match(html.match(/#card \.error\s*\{[^}]*\}/)?.[0] ?? '', /border-left:\s*4px solid var\(--ink\)/);
});
