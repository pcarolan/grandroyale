// The _why pass (CRIT.md, bees-pyrm.2): captions as a running joke, a resident in the room,
// one surprise on tap, the missing sticker turning up, a menu that doesn't exist yet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { GLYPHS, write } from '../tools/hand.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const manifest = JSON.parse(read('photos/manifest.json'));
const byFile = (f) => manifest.find((m) => m.file === f);
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];

// ---- #4 numbered captions as a running joke (Grand Royal 3:031) ----
test('the marker hand can write numbers', () => {
  for (const d of '0123456789') assert.ok(GLYPHS[d] && GLYPHS[d].s.length, `no glyph for ${d}`);
  assert.ok(write('12.').paths.length >= 3);
});
test('a dozen photos carry numbered deadpan captions, numbers unique, out of order on purpose', () => {
  const run = manifest.filter((m) => /^\d+\. /.test(m.caption || ''));
  assert.ok(run.length >= 10 && run.length <= 14, `run of ${run.length}`);
  const nums = run.map((m) => parseInt(m.caption, 10));
  assert.equal(new Set(nums).size, nums.length, 'numbers repeat');
  assert.ok(Math.max(...nums) > run.length, 'the numbers skip, so the reader goes hunting');
  for (const m of run) assert.ok(existsSync(new URL(`lettering/cap-${m.file.replace(/\.jpg$/, '')}.svg`, root)), `no lettering for ${m.file}`);
});
test('the run has the crit\'s lines, and the sketch is "our pizza (artist\'s rendering)"', () => {
  const caps = manifest.map((m) => m.caption || '');
  for (const c of ['3. not our pizza', '7. also not our pizza', '19. Todd, probably']) assert.ok(caps.includes(c), c);
  assert.equal(byFile('crown-slice-sketch.jpg').caption, "12. this is our pizza\n(artist's rendering)");
  assert.equal(byFile('crown-slice-sketch.jpg').place, 'top');
});
test("Pat's own captions are untouched", () => {
  assert.equal(byFile('slice-paper-plate.jpg').caption, 'royale with cheese');
  assert.equal(byFile('bar-sink.jpg').caption, 'wash your hands');
  assert.equal(byFile('payphone-fence.jpg').caption, 'call us (no)');
});
test('captions stay inside the house words', () => {
  for (const m of manifest) assert.doesNotMatch(m.caption || '', /\b(hot|yr)\b|wood/i, m.file);
});
test('archive picks can carry their own caption and alt', () => {
  const pick = JSON.parse(read('archive/pick.json'));
  const dance = pick.find((p) => p.id === '1980_petosegan_dance-candids_01-1');
  assert.equal(dance.caption, '19. Todd, probably');
  assert.equal(byFile('1980_petosegan_dance-candids_01-1.jpg').caption, '19. Todd, probably');
  assert.match(read('tools/archive.mjs'), /caption: p\.caption \?\? ''/);
});
test('multi-line captions get a taller strip of marker', () => {
  assert.match(html, /p\.caption\.split\('\\n'\)\.length/);
});

// ---- #1 the resident: Cecilia's slice, in scraps, near what it's about ----
test('two small scraps are cut from Cecilia\'s sketch by tools/scraps.mjs', () => {
  assert.ok(existsSync(new URL('tools/scraps.mjs', root)));
  for (const f of ['scraps/cecilia-dice.jpg', 'scraps/cecilia-tip.jpg']) {
    assert.ok(existsSync(new URL(f, root)), f);
    assert.ok(statSync(new URL(f, root)).size < 60 * 1024, `${f} too heavy`);
  }
});
test('the dice crown sits by the card, placed next to it and never on it', () => {
  assert.match(html, /<img class="it resident[^"]*"[^>]*data-near="card"[^>]*src="scraps\/cecilia-dice\.jpg"/);
  assert.match(html, /data-near/);
  assert.match(html, /keepOut\.push\(nb\)/);
});
test('no speech bubbles, no handwriting webfont, no faux scrawl', () => {
  assert.doesNotMatch(html, /bubble|speech|says hi/i);
  assert.doesNotMatch(html, /@font-face|fonts\.googleapis/);
  assert.doesNotMatch(css, /coffee|ring-stain|cursive|Comic Sans|Marker Felt|Bradley Hand|Chalkduster/i);
});

// ---- #8 a menu that doesn't exist yet ----
test('a typed MENU (not yet) scrap is taped low on the wall', () => {
  const menu = html.match(/<div class="it menu"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.ok(menu, 'no menu scrap');
  assert.match(menu, /data-scrap/);
  assert.match(menu, /data-tape="masking"/);
  for (const s of ['MENU (not yet)', 'cheese', 'pepperoni', 'the one Todd keeps', 'talking about', "when he's ready", 'slices after 2am', ' no']) assert.ok(menu.includes(s), s);
  assert.ok(+menu.match(/data-w="(\d+)"/)[1] <= 4, 'low weight: it sits low');
});

// ---- #5 one surprise on tap ----
test('the upside-down box flips on tap: class swap, no animation, keyboard too', () => {
  assert.match(html, /'upside-down-box\.jpg'/);
  assert.match(html, /classList\.toggle\('flipped'\)/);
  assert.match(css, /\.flipped \.sheet\s*\{\s*transform:\s*rotate\(180deg\)/);
  assert.doesNotMatch(css, /transition|animation/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /e\.key === 'Enter' \|\| e\.key === ' '/);
});
test('the box is on phones too, and stays well away from the card', () => {
  assert.ok(byFile('upside-down-box.jpg').weight >= 7);
  assert.match(html, /it\.flip \? grow\(c, 140\)/);
});

// ---- #12 the missing sticker turns up on the payphone ----
test('the peeled sticker is stuck, crooked, on the payphone photo', () => {
  assert.match(html, /'payphone-fence\.jpg'/);
  assert.match(html, /stray\.src = 'lettering\/sticker\.svg'/);
  assert.match(css, /\.stray\s*\{[^}]*position:\s*absolute/);
});

// ---- #9 mobile first screen: wordmark, Cecilia, card ----
test('on phones the postcard and the names label go below the fold', () => {
  assert.match(html, /<img class="it label names"[^>]*data-below/);
  assert.match(html, /BELOW = \['petoskey-postcard\.jpg'\]/);
  assert.match(html, /it\.below && mobile/);
});

// ---- #11 cheap is a courtesy to bar Wi-Fi ----
test('the scatter lazy-loads everything below the first screen and decodes off the main thread', () => {
  assert.match(html, /if \(best\.y > VH\) it\.img\.loading = 'lazy';/);
  assert.doesNotMatch(html, /best\.y > VH \* 1\.2/);
  assert.match(html, /img\.decoding = 'async';/);       // every wall photo
  assert.match(html, /cap\.decoding = 'async'; cap\.loading = 'lazy';/);   // marker captions
  assert.match(html, /i\.loading = 'lazy'; i\.decoding = 'async';/);       // contact strip
  assert.match(html, /stray\.loading = 'lazy'; stray\.decoding = 'async';/);
});
test('every static image but the name decodes async; the ones low on the wall load lazy', () => {
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => !/wordmark-grand-royale/.test(t));
  assert.ok(imgs.length >= 6);
  for (const t of imgs) assert.match(t, /decoding="async"/, t);
  for (const t of imgs.filter((t) => /sticker1|label names|stamp|class="tip"/.test(t))) assert.match(t, /loading="lazy"/, t);
});

// ---- #10 alt text as whispers ----
const ASIDES = {
  'upside-down-box.jpg': '(It is.)',
  'petoskey-stone.jpg': "It's a 350-million-year-old coral and it's sitting on a napkin.",
  'crown-slice-sketch.jpg': "So far she's the only one of us who has made a pizza.",
  'payphone-fence.jpg': 'One of our stickers ended up on it.',
  'box-in-the-grass.jpg': 'Somebody liked it.',
  'no-moshing-sign.jpg': "We'll put one up too and mean it about as much.",
  'bar-sink.jpg': "Ours will be cleaner. That's not a high bar.",
  '1996_rayder-charlevoix_lunchtime-burger-king_p21-1.jpg': "We'd like to be the other option.",
};
test('alt text whispers: the description, then an aside, on 8 photos', () => {
  for (const [f, aside] of Object.entries(ASIDES)) {
    const alt = byFile(f).alt;
    assert.ok(alt.endsWith(aside), `${f}: ${alt}`);
    assert.ok(alt.length > aside.length + 20, `${f}: the description stays`);
    assert.doesNotMatch(alt, /\b(hot|yr)\b|wood/i, f);
  }
  const alts = JSON.parse(read('tools/alts.json'));
  for (const slug of ['upside-down-box', 'petoskey-stone', 'payphone-fence', 'box-in-the-grass', 'no-moshing-sign', 'bar-sink']) {
    assert.equal(alts[slug], byFile(`${slug}.jpg`).alt, `tools/alts.json ${slug} matches the manifest`);
  }
  const bk = JSON.parse(read('archive/pick.json')).find((p) => p.id === '1996_rayder-charlevoix_lunchtime-burger-king_p21-1');
  assert.equal(bk.alt, byFile('1996_rayder-charlevoix_lunchtime-burger-king_p21-1.jpg').alt);
});

// ---- what waits on scans ----
test('TODO-scans.md says exactly which scans to get from Cecilia, Pat and Todd', () => {
  assert.ok(existsSync(new URL('TODO-scans.md', root)));
  const t = read('TODO-scans.md');
  for (const s of ['Cecilia', 'Todd', 'Pat', 'pencil', 'scraps/cecilia-dice.jpg', 'scraps/cecilia-tip.jpg', 'dpi']) assert.ok(t.includes(s), s);
  assert.ok((t.match(/^\s*[-|] /gm) || []).length >= 8, 'a real list');
});
test('DESIGN.md has a dated _why pass section', () => {
  assert.match(read('DESIGN.md'), /## _why pass \(2026-10-06\)/);
});
