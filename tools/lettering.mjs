// Generate the wall's lettering as images (grand-royal-raw rule 5): marker scrawls
// drawn with tools/hand.mjs, the crowned Sancreek name (Grand Royal Records look,
// screen-printed rough), rubber stamps and label-maker tape built with ImageMagick. Usage: node tools/lettering.mjs
import { writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { scrawlSVG, rng } from './hand.mjs';

const RED = '#d62718', INK = '#1a1a1a', PAPER = '#f1ede3';
const SUP = '/System/Library/Fonts/Supplemental/';
const COND = SUP + 'DIN Condensed Bold.ttf';
const TMP = 'lettering/.tmp';
mkdirSync(TMP, { recursive: true });
const mk = (...a) => execFileSync('magick', a.flat());

// ---- Marker scrawls (SVG, drawn) ----
const manifest = JSON.parse(readFileSync('photos/manifest.json', 'utf8'));
for (const p of manifest.filter((m) => m.caption)) {
  writeFileSync(`lettering/cap-${p.file.replace(/\.jpg$/, '')}.svg`, scrawlSVG(p.caption, { px: 4, stroke: 1.35 }));
}

// ---- The name: crown over Sancreek "Grand Royale" (owner: "make the lettering more regal") ----
// Sancreek (OFL, vendored in tools/fonts/) is the closest free match to the Grand Royal Records
// swash serif. Glyphs become SVG paths (harfbuzz positions + fontTools outlines), so no webfont ships.
const SANCREEK = 'tools/fonts/Sancreek-Regular.ttf';
function textPath(text) {
  const shaped = JSON.parse(execFileSync('hb-shape', ['--output-format=json', SANCREEK, text]).toString());
  const py = `import sys,json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
gs=TTFont(sys.argv[1]).getGlyphSet();out={}
for n in sys.argv[2:]:
  p=SVGPathPen(gs);gs[n].draw(p);out[n]=p.getCommands()
print(json.dumps(out))`;
  const outl = JSON.parse(execFileSync('python3', ['-c', py, SANCREEK, ...new Set(shaped.map((g) => g.g))]).toString());
  let x = 0; const d = [];
  for (const g of shaped) { if (outl[g.g]) d.push(`<path transform="translate(${x + g.dx} ${g.dy})" d="${outl[g.g]}"/>`); x += g.ax; }
  // font units are y-up: flip so the baseline sits at y=0
  return { svg: `<g transform="scale(1 -1)">${d.join('')}</g>`, width: x };
}
// Crown: five points with ball tips, a band, three jewels knocked out. viewBox 80x52.
const CROWN_W = 80, CROWN_H = 52;
function crown(fill, hole) {
  const tips = [[4, 16], [22, 10], [40, 4], [58, 10], [76, 16]];
  return `<g class="crown" fill="${fill}"><path d="M10 40 L4 16 L13 30 L22 10 L31 27 L40 4 L49 27 L58 10 L67 30 L76 16 L70 40 Z"/>`
    + tips.map(([x, y]) => `<circle cx="${x}" cy="${y - 2.6}" r="3.6"/>`).join('')
    + `<rect x="8" y="42.5" width="64" height="7" rx="1.2"/></g>`
    + `<g fill="${hole}"><circle cx="25" cy="35" r="2.4"/><circle cx="40" cy="33.5" r="3.4"/><circle cx="55" cy="35" r="2.4"/></g>`;
}
// lay out crown over one or more lines of Sancreek, in font units
function mark(lines, ink, hole, { crownW = 2600, gap = 1750, lead = 2350, pad = 300 } = {}) {
  const ts = lines.map(textPath);
  const W = Math.max(...ts.map((t) => t.width)) + pad * 2;
  const cs = crownW / CROWN_W, ch = CROWN_H * cs, top = pad + ch + gap;
  const body = ts.map((t, i) => `<g transform="translate(${(W - t.width) / 2} ${top + i * lead})">${t.svg}</g>`).join('');
  const H = top + (lines.length - 1) * lead + 620 + pad;
  return { W, H, inner: `<g transform="translate(${(W - crownW) / 2} ${pad}) scale(${cs})">${crown(ink, hole)}</g><g fill="${ink}">${body}</g>` };
}

// Wordmark PNG: screen-printed red on transparent, chewed edges, ink dropouts, a ghost
// pass printed 2px off register, and a paper-colored halo so it reads over photos.
{
  const m = mark(['Grand Royale'], '#fff', '#000', { gap: 2000 });
  const PX = 1800, s = PX / m.W, h = Math.round(m.H * s);
  writeFileSync(`${TMP}/wm.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.W} ${m.H}" width="${PX}" height="${h}"><rect width="100%" height="100%" fill="#000"/>${m.inner}</svg>`);
  execFileSync('rsvg-convert', [`${TMP}/wm.svg`, '-o', `${TMP}/wm.png`]);
  const pad = 40, CW = PX + pad * 2, CH = h + pad * 2;
  mk(`${TMP}/wm.png`, '-colorspace', 'Gray', '-bordercolor', 'black', '-border', String(pad), `${TMP}/m0.png`);
  // chewed edges: jitter the pixels, then re-threshold
  mk(`${TMP}/m0.png`, '-seed', '93', '-spread', '2.5', '-blur', '0x1.2', '-threshold', '50%', `${TMP}/m1.png`);
  // ink: fine pinholes + a few worn patches where the screen didn't fill
  mk(`${TMP}/m1.png`,
    '(', '-size', `${CW}x${CH}`, 'xc:gray', '-seed', '1994', '+noise', 'Random', '-colorspace', 'Gray', '-blur', '0x1.1', '-normalize', '-threshold', '7%', ')',
    '-compose', 'Multiply', '-composite',
    '(', '-size', `${CW}x${CH}`, 'xc:gray', '-seed', '7', '+noise', 'Random', '-colorspace', 'Gray', '-blur', '0x14', '-normalize', '-threshold', '13%', ')',
    '-compose', 'Multiply', '-composite', '-blur', '0x0.5', `${TMP}/ink.png`);
  // halo: fat, rough, paper-colored, under everything
  mk(`${TMP}/m0.png`, '-morphology', 'Dilate', 'Disk:9', '-seed', '5', '-spread', '3', '-blur', '0x2', '-threshold', '45%', '-blur', '0x0.8', `${TMP}/halo.png`);
  const layer = (a, color, out, extra = []) => mk(a, ...extra, '-background', color, '-alpha', 'shape', out);
  layer(`${TMP}/halo.png`, PAPER, `${TMP}/L0.png`, ['-evaluate', 'multiply', '0.92']);
  layer(`${TMP}/m1.png`, RED, `${TMP}/L1.png`, ['-evaluate', 'multiply', '0.4', '-roll', '+4+3']);
  layer(`${TMP}/ink.png`, RED, `${TMP}/L2.png`);
  mk(`${TMP}/L0.png`, `${TMP}/L1.png`, '-compose', 'Over', '-composite', `${TMP}/L2.png`, '-compose', 'Over', '-composite',
    '-trim', '+repage', '-strip', '-define', 'png:compression-level=9', 'lettering/wordmark-grand-royale.png');
}

// ---- Sticker: red die-cut, the same crowned mark in white, screen-print wobble ----
{
  const m = mark(['Grand', 'Royale'], '#fff', RED, { crownW: 2000, gap: 1700, lead: 1850, pad: 150 });
  // same 281x204 die-cut as before, so the sheet and the loose sticker keep their sizes on the wall
  const k = 0.01, b = 2.2, H = m.H * k, W = (H + b * 2) * 281 / 204 - b * 2, dx = (W / k - m.W) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${(W + b * 2).toFixed(2)} ${(H + b * 2).toFixed(2)}" width="281" height="204">
<filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0.6" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="g"/><feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -12 8.6" result="holes"/><feComposite in="d" in2="holes" operator="in"/></filter>
<rect x="${-b + 0.5}" y="${-b + 0.5}" width="${(W + b * 2 - 1).toFixed(2)}" height="${(H + b * 2 - 1).toFixed(2)}" rx="4" fill="${RED}" stroke="#fff" stroke-width="1"/>
<g filter="url(#ink)"><g transform="scale(${k}) translate(${dx.toFixed(1)} 0)">${m.inner}</g></g></svg>\n`;
  writeFileSync('lettering/sticker.svg', svg);
}

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
