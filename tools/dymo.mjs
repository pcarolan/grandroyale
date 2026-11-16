// One label-maker tape (embossed white caps on black plastic), the same look as tools/lettering.mjs dymo().
// Run: node tools/dymo.mjs "BLOG" lettering/label-blog.png blog     (needs rsvg-convert and ImageMagick 7 `magick`)
import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { rng } from './hand.mjs';

const INK = '#1a1a1a', TMP = 'lettering/.tmp';
export function dymo(text, out, seed, { magick = 'magick' } = {}) {
  mkdirSync(TMP, { recursive: true });
  const r = rng(seed);
  const adv = 28, H = 64, W = text.length * adv + 50;
  const chars = [...text].map((c, i) => `<text x="${25 + i * adv + adv / 2}" y="${46 + (r() - 0.5) * 4}" text-anchor="middle">${c.replace('&', '&amp;')}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect x="0" y="4" width="${W}" height="${H - 8}" rx="5" fill="${INK}"/>
<rect x="0" y="6" width="${W}" height="6" fill="#fff" opacity=".07"/>
<g font-family="Arial Narrow" font-weight="bold" font-size="40" fill="#e9e6df" stroke="#fff" stroke-width=".6" opacity=".93">${chars}</g></svg>`;
  writeFileSync(`${TMP}/dymo.svg`, svg);
  execFileSync('rsvg-convert', [`${TMP}/dymo.svg`, '-o', `${TMP}/dymo.png`]);
  execFileSync(magick, [`${TMP}/dymo.png`, '-attenuate', '0.25', '+noise', 'Uniform', '-strip', out]);
  return { w: W, h: H };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const [text, out, seed = text] = process.argv.slice(2);
  if (!text || !out) { console.error('usage: node tools/dymo.mjs "TEXT" out.png [seed]'); process.exit(1); }
  console.log(out, dymo(text, out, seed));
}
