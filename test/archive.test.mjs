// tools/archive.mjs: crop + treat archive photos into photos/archive/ (bees-5orh.4).
// Uses a temp fixture (generated source image, stub crops, stub ATTRIBUTION.md), never the real archive/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { buildArchive, parseCrops, parseAttribution } from '../tools/archive.mjs';

const tool = new URL('../tools/archive.mjs', import.meta.url).pathname;
const dims = (f) => execFileSync('magick', ['identify', '-format', '%w %h', f]).toString().trim().split(' ').map(Number);

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'archive-test-'));
  const src = join(dir, 'src'), crops = join(dir, 'crops'), out = join(dir, 'out', 'archive');
  mkdirSync(src); mkdirSync(crops);
  execFileSync('magick', ['-size', '400x200', 'gradient:red-blue', join(src, '1986_fixture_page.jpg')]);
  writeFileSync(join(src, 'ATTRIBUTION.md'), [
    '# Attribution', '', '| Filename | Year/era | Description | Source + URL | Credit/rights |', '|---|---|---|---|---|',
    '| 1986_fixture_page.jpg | 1986 | Rampage 1986 ad page: Family Video Club (PDF page 136) | Rampage 1986 (Harbor Springs High School) https://archive.org/details/fixture-1986 | Yearbook staff; scan via Internet Archive |',
    '',
  ].join('\n'));
  const lines = [
    { src: '1986_fixture_page.jpg', id: 'video-club', x: 0.1, y: 0.1, w: 0.5, h: 0.8, alt: 'Family Video Club ad', era: '1986', treatment: 'xerox', weight: 6 },
    { src: '1986_fixture_page.jpg', id: 'strip', x: 0, y: 0.5, w: 1, h: 0.25, alt: 'A thin strip', era: '1986', treatment: 'color', weight: 4 },
    { src: 'missing.jpg', id: 'ghost', x: 0, y: 0, w: 1, h: 1, alt: 'Not there', era: '1990', treatment: 'color', weight: 3 },
  ];
  writeFileSync(join(crops, 'crops-a.jsonl'), lines.slice(0, 2).map((l) => JSON.stringify(l)).join('\n') + '\n');
  writeFileSync(join(crops, 'crops-b.jsonl'), JSON.stringify(lines[2]) + '\n\n');
  return { dir, src, crops, out, attribution: join(src, 'ATTRIBUTION.md') };
}

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

test('buildArchive crops, treats, writes manifest + ATTRIBUTION, skips missing src', () => {
  const f = fixture();
  const res = buildArchive({ src: f.src, crops: f.crops, out: f.out, attribution: f.attribution, quality: 70 });
  assert.equal(res.written, 2);
  assert.equal(res.skipped, 1);

  const manifest = JSON.parse(readFileSync(join(f.out, 'manifest.json'), 'utf8'));
  assert.equal(manifest.length, 2);
  const keys = ['file', 'alt', 'era', 'treatment', 'weight', 'w', 'h', 'source_url', 'title', 'author', 'license'];
  for (const m of manifest) {
    for (const k of keys) assert.ok(k in m, `manifest entry missing ${k}`);
    assert.ok(existsSync(join(f.out, m.file)), `missing ${m.file}`);
    const [w, h] = dims(join(f.out, m.file));
    assert.deepEqual([m.w, m.h], [w, h]);
    assert.ok(w <= 800 && h <= 800);
  }
  const vc = manifest.find((m) => m.file === 'video-club.jpg');
  assert.equal(vc.source_url, 'https://archive.org/details/fixture-1986');
  assert.equal(vc.title, 'Rampage 1986 ad page: Family Video Club (PDF page 136)');
  assert.equal(vc.author, 'Rampage 1986 (Harbor Springs High School)');
  assert.equal(vc.license, 'Yearbook staff; scan via Internet Archive');
  assert.equal(vc.weight, 6);
  assert.equal(vc.treatment, 'xerox');
  // crop aspect: (0.5*400)/(0.8*200) = 1.25 ; strip: 400/50 = 8
  assert.ok(Math.abs(vc.w / vc.h - 1.25) / 1.25 < 0.02, `video-club aspect ${vc.w / vc.h}`);
  const strip = manifest.find((m) => m.file === 'strip.jpg');
  assert.ok(Math.abs(strip.w / strip.h - 8) / 8 < 0.02, `strip aspect ${strip.w / strip.h}`);
  assert.ok(!existsSync(join(f.out, 'ghost.jpg')));

  // xerox is grayscale, color keeps colour
  const sat = (file) => +execFileSync('magick', [join(f.out, file), '-colorspace', 'HSL', '-channel', 'G', '-separate', '-format', '%[fx:mean]', 'info:']).toString();
  assert.ok(sat('video-club.jpg') < 0.05, 'xerox should be gray');
  assert.ok(sat('strip.jpg') > 0.2, 'color should keep saturation');

  const md = readFileSync(join(f.out, 'ATTRIBUTION.md'), 'utf8');
  const rows = md.split('\n').filter((l) => /^\| \S+\.jpg \|/.test(l));
  assert.deepEqual(rows.map((r) => r.split(' | ')[0].slice(2)).sort(), manifest.map((m) => m.file).sort());
  assert.match(md, /\| file \| era \| alt \| source \| credit \|/);
  assert.match(md, /\[Rampage 1986 ad page: Family Video Club \(PDF page 136\)\]\(https:\/\/archive\.org\/details\/fixture-1986\)/);
});

test('rerun is idempotent and the CLI honours env overrides, exiting 0 with a skip report', () => {
  const f = fixture();
  const env = { ...process.env, ARCHIVE_SRC: f.src, ARCHIVE_CROPS: f.crops, ARCHIVE_OUT: f.out, ARCHIVE_ATTRIBUTION: f.attribution, ARCHIVE_QUALITY: '60' };
  for (let i = 0; i < 2; i++) {
    const r = spawnSync('node', [tool], { env, cwd: f.dir, encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /missing\.jpg/);
    assert.match(r.stdout + r.stderr, /skipped 1/);
  }
  assert.equal(JSON.parse(readFileSync(join(f.out, 'manifest.json'), 'utf8')).length, 2);
});

test('missing attribution row warns and leaves empty strings', () => {
  const f = fixture();
  writeFileSync(f.attribution, '| Filename | Year/era | Description | Source + URL | Credit/rights |\n|---|---|---|---|---|\n');
  const res = buildArchive({ src: f.src, crops: f.crops, out: f.out, attribution: f.attribution, quality: 70 });
  assert.equal(res.written, 2);
  const m = JSON.parse(readFileSync(join(f.out, 'manifest.json'), 'utf8'))[0];
  assert.deepEqual([m.source_url, m.title, m.author, m.license], ['', '', '', '']);
});
