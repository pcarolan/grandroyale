// tools/archive.mjs: cut + treat the archive crops; the picks join the wall as ordinary photos (bees-5orh.4, .10).
// Uses a temp fixture (generated source image, stub crops, stub ATTRIBUTION.md, stub photos/), never the real archive/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { buildArchive, parseCrops, parseAttribution } from '../tools/archive.mjs';

const tool = new URL('../tools/archive.mjs', import.meta.url).pathname;
const dims = (f) => execFileSync('magick', ['identify', '-format', '%w %h', f]).toString().trim().split(' ').map(Number);
const manifestOf = (dir) => JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
const jpgs = (dir) => readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort();
const rowsOf = (dir) => readFileSync(join(dir, 'ATTRIBUTION.md'), 'utf8').split('\n').filter((l) => /^\| \S+\.jpg \|/.test(l));
const EXISTING = { file: 'existing.jpg', alt: 'A wall photo', source_url: 'https://commons.wikimedia.org/x', title: 'X', author: 'Someone', license: 'CC0', license_url: '', treatment: 'xerox', weight: 8, w: 10, h: 10, caption: '' };
const EXISTING_ROW = '| existing.jpg | [X](https://commons.wikimedia.org/x) | Someone | CC0 | xerox |';

function fixture(pick) {
  const dir = mkdtempSync(join(tmpdir(), 'archive-test-'));
  const src = join(dir, 'src'), crops = join(dir, 'crops'), out = join(dir, 'photos'), held = join(dir, 'held');
  mkdirSync(src); mkdirSync(crops); mkdirSync(out);
  execFileSync('magick', ['-size', '400x200', 'gradient:red-blue', join(src, '1986_fixture_page.jpg')]);
  writeFileSync(join(src, 'ATTRIBUTION.md'), [
    '# Attribution', '', '| Filename | Year/era | Description | Source + URL | Credit/rights |', '|---|---|---|---|---|',
    '| 1986_fixture_page.jpg | 1986 | Rampage 1986 ad page: Family Video Club (PDF page 136) | Rampage 1986 (Harbor Springs High School) https://archive.org/details/fixture-1986 | Yearbook staff; scan via Internet Archive |',
    '',
  ].join('\n'));
  const lines = [
    { src: '1986_fixture_page.jpg', id: 'video-club', x: 0.1, y: 0.1, w: 0.5, h: 0.8, alt: 'Family Video Club ad', era: '1986', treatment: 'xerox', weight: 9 },
    { src: '1986_fixture_page.jpg', id: 'strip', x: 0, y: 0.5, w: 1, h: 0.25, alt: 'A thin strip', era: '1986', treatment: 'color', weight: 4 },
    { src: 'missing.jpg', id: 'ghost', x: 0, y: 0, w: 1, h: 1, alt: 'Not there', era: '1990', treatment: 'color', weight: 3 },
  ];
  writeFileSync(join(crops, 'crops-a.jsonl'), lines.slice(0, 2).map((l) => JSON.stringify(l)).join('\n') + '\n');
  writeFileSync(join(crops, 'crops-b.jsonl'), JSON.stringify(lines[2]) + '\n\n');
  if (pick) writeFileSync(join(crops, 'pick.json'), JSON.stringify(pick));
  // the wall as it already is: one photo that must never be touched
  writeFileSync(join(out, 'manifest.json'), JSON.stringify([EXISTING], null, 1) + '\n');
  writeFileSync(join(out, 'ATTRIBUTION.md'), ['# Photo credits', '', '| File | Original | Author | License | Treatment |', '|---|---|---|---|---|', EXISTING_ROW, ''].join('\n'));
  writeFileSync(join(out, 'existing.jpg'), 'keep me');
  return { dir, src, crops, out, held, attribution: join(src, 'ATTRIBUTION.md') };
}
const run = (f, extra = {}) => buildArchive({ src: f.src, crops: f.crops, out: f.out, held: f.held, attribution: f.attribution, quality: 70, log: () => {}, ...extra });

test('parseAttribution reads the Desktop table format by filename', () => {
  const m = parseAttribution('| Filename | Year/era | Description | Source + URL | Credit/rights |\n|---|---|---|---|---|\n| a.jpg | 1980 | Prom night | Petosegan 1980 (PHS) https://archive.org/x | Yearbook staff |\n');
  assert.deepEqual(m.get('a.jpg'), { title: 'Prom night', source_url: 'https://archive.org/x', author: 'Petosegan 1980 (PHS)', license: 'Yearbook staff' });
  assert.equal(m.has('Filename'), false);
});

test('parseCrops throws with the line number on bad JSON', () => {
  const { crops } = fixture();
  writeFileSync(join(crops, 'crops-c.jsonl'), '{"src":"a.jpg","id":"ok","x":0,"y":0,"w":1,"h":1}\n{not json\n');
  assert.throws(() => parseCrops(crops), /crops-c\.jsonl.*line 2/);
});

test('picks join photos/manifest.json as ordinary wall photos, after the existing ones, in pick order', () => {
  const f = fixture(['strip', { id: 'video-club', weight: 7 }]);
  const res = run(f);
  assert.equal(res.written, 2);
  const m = manifestOf(f.out);
  assert.deepEqual(m.map((p) => p.file), ['existing.jpg', 'strip.jpg', 'video-club.jpg']);
  assert.deepEqual(m[0], EXISTING, 'existing entry untouched');
  const keys = ['file', 'alt', 'source_url', 'title', 'author', 'license', 'license_url', 'treatment', 'weight', 'w', 'h', 'caption'];
  for (const p of m.slice(1)) {
    assert.deepEqual(Object.keys(p), keys);
    assert.deepEqual([p.w, p.h], dims(join(f.out, p.file)));
    assert.ok(p.w <= 800 && p.h <= 800);
    assert.equal(p.caption, '');
    assert.equal(p.license_url, '');
  }
  const vc = m[2];
  assert.equal(vc.source_url, 'https://archive.org/details/fixture-1986');
  assert.equal(vc.title, 'Rampage 1986 ad page: Family Video Club (PDF page 136)');
  assert.equal(vc.author, 'Rampage 1986 (Harbor Springs High School)');
  assert.equal(vc.license, 'Archive scan: Yearbook staff; scan via Internet Archive');
  assert.equal(vc.alt, 'Family Video Club ad');
  assert.equal(vc.treatment, 'xerox');
  assert.equal(vc.weight, 7, 'explicit pick weight wins');
  assert.equal(m[1].weight, 5, 'crop weight 4 clamps up to 5');
  // crop aspect: (0.5*400)/(0.8*200) = 1.25 ; strip: 400/50 = 8
  assert.ok(Math.abs(vc.w / vc.h - 1.25) / 1.25 < 0.02, `video-club aspect ${vc.w / vc.h}`);
  assert.ok(Math.abs(m[1].w / m[1].h - 8) / 8 < 0.02);
  const sat = (file) => +execFileSync('magick', [join(f.out, file), '-colorspace', 'HSL', '-channel', 'G', '-separate', '-format', '%[fx:mean]', 'info:']).toString();
  assert.ok(sat('video-club.jpg') < 0.05, 'xerox should be gray');
  assert.ok(sat('strip.jpg') > 0.2, 'color should keep saturation');
  assert.deepEqual(rowsOf(f.out), [EXISTING_ROW,
    '| strip.jpg | [Rampage 1986 ad page: Family Video Club (PDF page 136)](https://archive.org/details/fixture-1986) | Rampage 1986 (Harbor Springs High School) | Archive scan: Yearbook staff; scan via Internet Archive | color |',
    '| video-club.jpg | [Rampage 1986 ad page: Family Video Club (PDF page 136)](https://archive.org/details/fixture-1986) | Rampage 1986 (Harbor Springs High School) | Archive scan: Yearbook staff; scan via Internet Archive | xerox |']);
  assert.equal(readFileSync(join(f.out, 'existing.jpg'), 'utf8'), 'keep me');
});

test('crop weights clamp into 5-7 so the picks mix into the wall', () => {
  const f = fixture(['video-club']);
  run(f);
  assert.equal(manifestOf(f.out)[1].weight, 7, 'crop weight 9 clamps down to 7');
});

test('every crop, picked or not, is held with its own manifest + credits', () => {
  const f = fixture(['strip']);
  const res = run(f);
  assert.equal(res.held, 2);
  assert.equal(res.skipped, 1);
  assert.deepEqual(jpgs(f.held), ['strip.jpg', 'video-club.jpg']);
  const h = manifestOf(f.held);
  assert.deepEqual(h.map((p) => p.file).sort(), ['strip.jpg', 'video-club.jpg']);
  assert.equal(h.find((p) => p.file === 'video-club.jpg').source_url, 'https://archive.org/details/fixture-1986');
  assert.match(readFileSync(join(f.held, 'ATTRIBUTION.md'), 'utf8'), /\| video-club\.jpg \|/);
  assert.deepEqual(dims(join(f.held, 'strip.jpg')), dims(join(f.out, 'strip.jpg')));
  assert.ok(!existsSync(join(f.out, 'video-club.jpg')));
});

test('reruns replace only its own entries; unpicking removes the jpg, entry and row', () => {
  const f = fixture(['strip', 'video-club']);
  run(f); run(f);
  assert.equal(manifestOf(f.out).length, 3);
  assert.equal(rowsOf(f.out).length, 3);
  writeFileSync(join(f.crops, 'pick.json'), JSON.stringify(['video-club']));
  run(f);
  assert.deepEqual(manifestOf(f.out).map((p) => p.file), ['existing.jpg', 'video-club.jpg']);
  assert.deepEqual(jpgs(f.out), ['existing.jpg', 'video-club.jpg']);
  assert.deepEqual(rowsOf(f.out).map((r) => r.split(' | ')[0].slice(2)), ['existing.jpg', 'video-club.jpg']);
});

test('without pick.json every crop joins the wall and nothing is held', () => {
  const f = fixture();
  run(f);
  assert.deepEqual(manifestOf(f.out).map((p) => p.file), ['existing.jpg', 'video-club.jpg', 'strip.jpg']);
  assert.ok(!existsSync(f.held));
});

test('a pick id that matches no crop is an error naming it', () => {
  const f = fixture(['strip', 'nope-1']);
  assert.throws(() => run(f), /pick.*nope-1/);
});

test('missing attribution row warns and leaves empty strings', () => {
  const f = fixture(['strip']);
  writeFileSync(f.attribution, '| Filename | Year/era | Description | Source + URL | Credit/rights |\n|---|---|---|---|---|\n');
  const warn = [];
  run(f, { log: (s) => warn.push(s) });
  const p = manifestOf(f.out)[1];
  assert.deepEqual([p.source_url, p.title, p.author], ['', '', '']);
  assert.ok(warn.some((w) => /no attribution row/.test(w)));
});

test('the CLI honours env overrides, writes held copies to ARCHIVE_HELD, exits 0 with a skip report', () => {
  const f = fixture(['video-club']);
  const env = { ...process.env, ARCHIVE_SRC: f.src, ARCHIVE_CROPS: f.crops, ARCHIVE_OUT: f.out, ARCHIVE_ATTRIBUTION: f.attribution, ARCHIVE_HELD: f.held, ARCHIVE_QUALITY: '60' };
  const r = spawnSync('node', [tool], { env, cwd: f.dir, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stderr, /missing\.jpg/);
  assert.match(r.stdout, /wrote 1 .*held 2.*skipped 1/);
  assert.deepEqual(jpgs(f.out), ['existing.jpg', 'video-club.jpg']);
  assert.deepEqual(jpgs(f.held), ['strip.jpg', 'video-club.jpg']);
});

test('the real archive/pick.json: ten known crop ids, weights 5-7, at least 3 at 7', () => {
  const dir = new URL('../archive/', import.meta.url).pathname;
  const pick = JSON.parse(readFileSync(join(dir, 'pick.json'), 'utf8'));
  assert.equal(pick.length, 10);
  const ids = pick.map((p) => p.id);
  assert.equal(new Set(ids).size, 10);
  const known = new Set(parseCrops(dir).map((c) => c.id));
  for (const id of ids) assert.ok(known.has(id), `unknown pick ${id}`);
  assert.ok(pick.every((p) => p.weight >= 5 && p.weight <= 7));
  assert.ok(pick.filter((p) => p.weight === 7).length >= 3);
});

test('existing entries keep their exact bytes (non-ASCII stays \\u-escaped like the committed manifest)', () => {
  const f = fixture(['strip']);
  const text = JSON.stringify([{ ...EXISTING, author: 'Johan Jönsson' }], null, 1).replace(/[\u0080-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n';
  writeFileSync(join(f.out, 'manifest.json'), text);
  run(f);
  const after = readFileSync(join(f.out, 'manifest.json'), 'utf8');
  assert.ok(after.startsWith(text.slice(0, text.lastIndexOf('}') + 1)), 'existing entry bytes changed');
  assert.match(after, /J\\u00f6nsson/);
});

// _why pass (bees-pyrm.2): a pick can carry a numbered caption and an alt aside, and reruns keep them
test('a pick\'s caption and alt win over the crop\'s', () => {
  const f = fixture([{ id: 'video-club', caption: '19. Todd, probably', alt: 'Family Video Club ad. Late fees were the real business.' }, 'strip']);
  run(f);
  const m = manifestOf(f.out);
  assert.equal(m[1].caption, '19. Todd, probably');
  assert.equal(m[1].alt, 'Family Video Club ad. Late fees were the real business.');
  assert.equal(m[2].caption, '');
  assert.equal(m[2].alt, 'A thin strip');
});
