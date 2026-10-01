// Add one of the owner's own photos to the wall.
//   node tools/own.mjs <source image> <slug> <treatment: color|xerox|red> <weight 3-9> "<alt text>" "<title>" ["Own photo"|"Own scan"]
// Writes photos/<slug>.jpg (max 900px, stripped), inserts the entry at the top of photos/manifest.json,
// adds a row to photos/ATTRIBUTION.md, then run `node build.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [src, slug, treatment = 'color', weight = '8', alt = '', title = '', license = 'Own photo'] = process.argv.slice(2);
if (!src || !slug || !alt) { console.error('usage: node tools/own.mjs <src> <slug> <treatment> <weight> "<alt>" "<title>" [license]'); process.exit(1); }
const out = `photos/${slug}.jpg`;
const ops = treatment === 'xerox' ? ['-colorspace', 'Gray', '-brightness-contrast', '5x25', '-attenuate', '0.35', '+noise', 'Gaussian']
  : treatment === 'red' ? ['-colorspace', 'Gray', '-brightness-contrast', '5x25', '-fill', '#d62718', '-tint', '100']
  : ['-colorspace', 'sRGB'];
execFileSync('magick', [src, ...ops, '-resize', '900x900>', '-strip', '-quality', '80', out]);
const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', out]).toString().trim().split(' ').map(Number);
const entry = { file: `${slug}.jpg`, alt, source_url: 'https://grandroyalepizza.com', title: title || slug, author: 'Pat Carolan', license, license_url: '', treatment, weight: +weight, w, h, caption: '' };
const manifest = JSON.parse(readFileSync('photos/manifest.json', 'utf8')).filter((m) => m.file !== entry.file);
manifest.unshift(entry);
writeFileSync('photos/manifest.json', JSON.stringify(manifest, null, 1) + '\n');
let md = readFileSync('photos/ATTRIBUTION.md', 'utf8').split('\n').filter((l) => !l.startsWith(`| ${entry.file} |`)).join('\n');
const hdr = '|---|---|---|---|---|';
md = md.replace(hdr, `${hdr}\n| ${entry.file} | [${entry.title}](${entry.source_url}) | ${entry.author} | ${license} | ${treatment} |`);
writeFileSync('photos/ATTRIBUTION.md', md);
console.log(`added ${out} ${w}x${h}, manifest now ${manifest.length}; run: node build.mjs`);
