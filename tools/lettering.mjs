// Generate the wall's lettering as images (grand-royal-raw rule 5): marker scrawls
// drawn with tools/hand.mjs, a spray-paint stencil, rubber stamps and label-maker
// tape built with ImageMagick. Usage: node tools/lettering.mjs
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { scrawlSVG, write, rng } from './hand.mjs';

const RED = '#d62718', INK = '#1a1a1a', PAPER = '#f1ede3';
const SUP = '/System/Library/Fonts/Supplemental/';
const BLACK = SUP + 'Arial Black.ttf', COND = SUP + 'DIN Condensed Bold.ttf', NARROW = SUP + 'Arial Narrow Bold.ttf';
const TMP = 'lettering/.tmp';
mkdirSync(TMP, { recursive: true });
const mk = (...a) => execFileSync('magick', a.flat());

// ---- Marker scrawls (SVG, drawn) ----
const manifest = JSON.parse(readFileSync('photos/manifest.json', 'utf8'));
for (const p of manifest.filter((m) => m.caption)) {
  writeFileSync(`lettering/cap-${p.file.replace(/\.jpg$/, '')}.svg`, scrawlSVG(p.caption, { px: 4, stroke: 1.35 }));
}

// ---- Sticker: red die-cut, white marker letters ----
{
  const t = write('grand\nroyale', { seed: 'sticker', lineGap: 13, gap: 1.4 });
  const W = t.width + 8, H = t.height + 6;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -3 ${W} ${H}" width="${Math.round(W * 6)}" height="${Math.round(H * 6)}">
<filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="0.5"/></filter>
<rect x="-3.4" y="-2.4" width="${W - 1.2}" height="${H - 1.2}" rx="3" fill="${RED}" stroke="#fff" stroke-width="1"/>
<g fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#ink)">${t.paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>\n`;
  writeFileSync('lettering/sticker.svg', svg);
}

// ---- Spray-paint stencil: GRAND ROYALE ----
function stencil(word, out, color, cuts, pt = 240) {
  const parts = [];
  [...word].forEach((ch, i) => {
    const f = `${TMP}/st-${i}.png`;
    if (ch === ' ') { mk('-size', `${pt * 0.35}x10`, 'xc:black', f); parts.push(f); return; }
    mk('-background', 'black', '-fill', 'white', '-font', BLACK, '-pointsize', String(pt), `label:${ch}`, '-trim', '+repage', f);
    const [w, h] = mk('identify', '-format', '%w %h', f).toString().split(' ').map(Number);
    const c = cuts[ch];
    if (c !== undefined) mk(f, '-fill', 'black', '-draw', `rectangle ${Math.round(w * c - pt * 0.03)},0 ${Math.round(w * c + pt * 0.03)},${h}`, f);
    // each letter of a cut stencil sits a little crooked
    const r = rng(word + i)();
    mk(f, '-bordercolor', 'black', '-border', String(Math.round(pt * 0.07)), '-background', 'black', '-rotate', ((r - 0.5) * 5).toFixed(1), '+repage', f);
    parts.push(f);
  });
  const mask = `${TMP}/mask.png`;
  mk(parts, '-background', 'black', '-gravity', 'south', '+append', '-bordercolor', 'black', '-border', '60', mask);
  const [W, H] = mk('identify', '-format', '%w %h', mask).toString().split(' ').map(Number);
  // drips under two letters
  const r = rng(word);
  const drips = [];
  for (let k = 0; k < 3; k++) { const x = Math.round(W * (0.15 + r() * 0.7)), y = Math.round(H * 0.72), len = Math.round(30 + r() * 70); drips.push('-draw', `line ${x},${y} ${x},${y + len}`, '-draw', `circle ${x},${y + len} ${x + 4},${y + len}`); }
  mk(mask, '-fill', 'white', '-stroke', 'white', '-strokewidth', '5', ...drips, mask);
  // overspray: dilated + blurred halo, broken into dots with noise
  mk(mask, '(', '+clone', '-morphology', 'Dilate', 'Disk:10', '-blur', '0x18', ')',
    '(', '-size', `${W}x${H}`, 'xc:gray', '-seed', '19', '+noise', 'Random', '-colorspace', 'Gray', ')',
    '(', '-clone', '1', '-clone', '2', '-compose', 'Multiply', '-composite', '-threshold', '42%', '-blur', '0x0.6', '-evaluate', 'multiply', '0.55', ')',
    '(', '-clone', '0', '-blur', '0x2.2', '-level', '30%,70%', ')',
    '-delete', '0-2', '-compose', 'Lighten', '-composite',
    // patchy coverage inside the letters
    '(', '-size', `${W}x${H}`, 'xc:gray', '-seed', '3', '+noise', 'Random', '-colorspace', 'Gray', '-blur', '0x9', '-normalize', '-level', '0%,22%', ')',
    '-compose', 'Multiply', '-composite',
    '-resize', '50%', `${TMP}/alpha.png`);
  mk(`${TMP}/alpha.png`, '-background', color, '-alpha', 'shape', '-strip', '-define', 'png:compression-level=9', out);
}
stencil('GRAND ROYALE', 'lettering/stencil-grand-royale.png', RED, { G: 0.5, R: 0.42, A: 0.5, D: 0.45, O: 0.5, E: 0.36 });

// ---- Rubber stamps ----
function stamp(text, out, color, seed, pt = 110) {
  const f = `${TMP}/stamp.png`;
  mk('-background', 'black', '-fill', 'white', '-font', COND, '-pointsize', String(pt), '-kerning', '4', `label:${text}`, '-trim', '+repage',
    '-bordercolor', 'black', '-border', String(Math.round(pt * 0.28)),
    '-fill', 'none', '-stroke', 'white', '-strokewidth', String(Math.round(pt * 0.09)),
    '-draw', `roundrectangle ${Math.round(pt * 0.08)},${Math.round(pt * 0.08)} %[fx:w-${Math.round(pt * 0.08)}],%[fx:h-${Math.round(pt * 0.08)}] 14,14`, f);
  // ink: uneven pressure + missing specks, one side lighter
  const [W, H] = mk('identify', '-format', '%w %h', f).toString().split(' ').map(Number);
  mk(f, '(', '-size', `${W}x${H}`, 'xc:gray', '-seed', String(seed), '+noise', 'Random', '-colorspace', 'Gray', '-blur', '0x1.2', '-normalize', '-threshold', '28%', ')',
    '-compose', 'Multiply', '-composite',
    '(', '-size', `${W}x${H}`, 'gradient:white-gray50', '-rotate', '90', '-resize', `${W}x${H}!`, ')', '-compose', 'Multiply', '-composite',
    '-blur', '0x0.7', '-level', '10%,75%', `${TMP}/stamp-a.png`);
  mk(`${TMP}/stamp-a.png`, '-background', color, '-alpha', 'shape', '-resize', '60%', '-strip', out);
}
stamp('COMING SOON', 'lettering/stamp-coming-soon.png', RED, 11);
stamp('PICKUP ONLY', 'lettering/stamp-pickup-only.png', INK, 23);

// ---- Label-maker tape (embossed white caps on black plastic) ----
function dymo(text, out, seed) {
  const r = rng(seed);
  const adv = 28, H = 64, W = text.length * adv + 50;
  const chars = [...text].map((c, i) => `<text x="${25 + i * adv + adv / 2}" y="${46 + (r() - 0.5) * 4}" text-anchor="middle">${c.replace('&', '&amp;')}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect x="0" y="4" width="${W}" height="${H - 8}" rx="5" fill="${INK}"/>
<rect x="0" y="6" width="${W}" height="6" fill="#fff" opacity=".07"/>
<g font-family="Arial Narrow" font-weight="bold" font-size="40" fill="#e9e6df" stroke="#fff" stroke-width=".6" opacity=".93">${chars}</g></svg>`;
  writeFileSync(`${TMP}/dymo.svg`, svg);
  execFileSync('rsvg-convert', [`${TMP}/dymo.svg`, '-o', `${TMP}/dymo.png`]);
  mk(`${TMP}/dymo.png`, '-attenuate', '0.25', '+noise', 'Uniform', '-strip', out);
}
dymo('PETOSKEY, MI', 'lettering/label-petoskey.png', 'pet');
dymo('TODD WEBB + PAT CAROLAN', 'lettering/label-names.png', 'names');

rmSync(TMP, { recursive: true, force: true });
console.log('lettering done');
