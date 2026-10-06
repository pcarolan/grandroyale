// The other doors in the house: credits.html (a thank-you note listing every photo) and 404.html
// (GitHub Pages serves it for any missing path). Both are written by `node build.mjs` from the manifest,
// on the same wall as index.html (_why crit #6, #7; bees-pyrm.2).
import { readFileSync } from 'node:fs';
import { rng } from './hand.mjs';

const root = new URL('../', import.meta.url);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (p) => 'data:image/jpeg;base64,' + readFileSync(new URL(p, root)).toString('base64');

// the wall: white, faint grain, copy paper, one red, Courier. Same tokens as index.html.
export const WALL_CSS = `
  :root {
    --kraft: #c9a77a;
    --wall: #ffffff;
    --paper: #f1ede3;
    --ink: #1a1a1a;
    --red: #d62718;
    --tape: rgba(238, 229, 200, .78);
    --type: "Courier New", Courier, monospace;
  }
  * { box-sizing: border-box; }
  html { overflow-x: clip; }
  body {
    margin: 0; overflow-x: clip;
    background: var(--wall) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .1 0 0 0 0 .08 0 0 0 0 .05 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");
    color: var(--ink);
    font: 16px/1.4 var(--type);
    -webkit-text-size-adjust: 100%;
  }
  a { color: var(--ink); }
  a:focus-visible { outline: 3px solid var(--red); outline-offset: 3px; }
  .scrap { position: relative; background: var(--paper); }
  .tape { position: absolute; top: -13px; left: 50%; width: 96px; height: 26px; transform: translateX(-50%) rotate(-3deg); background: var(--tape); pointer-events: none; }
  .tape.gaffer { background: var(--ink); opacity: .93; }
`;

const page = (title, extra, css, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${extra}<meta name="theme-color" content="#ffffff">
<style>${WALL_CSS}${css}</style>
</head>
<body>
${body}
</body>
</html>
`;

// ---- credits.html: a thank-you note, then a wall of typed slips, one per photo ----
export function creditsHTML(manifest) {
  const r = rng('credits');
  const slips = manifest.map((m, i) => {
    // no rows: every slip its own width, drop, nudge and tilt
    const rot = ((r() - 0.5) * 10).toFixed(1), dy = ((r() - 0.5) * 70).toFixed(0), w = (170 + r() * 160).toFixed(0), ml = ((r() - 0.4) * 44).toFixed(0);
    const title = esc(m.title || m.file);
    const source = m.source_url ? `<a href="${esc(m.source_url)}">${title}</a>` : title;
    const license = m.license_url ? `<a href="${esc(m.license_url)}">${esc(m.license)}</a>` : esc(m.license);
    return `<li class="scrap slip" style="width:${w}px;margin-left:${ml}px;transform:translateY(${dy}px) rotate(${rot}deg)"><span class="n">${i + 1}.</span> <b>${esc(m.author)}</b><br>${source}<br>${license}<br><span class="f">${esc(m.file)}</span></li>`;
  }).join('\n');
  const css = `
  main { padding: 40px 16px 80px; }
  .note { width: min(460px, 100%); margin: 24px 0 36px 4vw; padding: 30px 24px 22px; transform: rotate(-1.5deg); border-top: 3px solid var(--red); }
  .note p { margin: 0 0 12px; font-size: 17px; font-weight: 700; }
  .note p.big { font: 900 34px/1 "Arial Black", Arial, sans-serif; margin-bottom: 16px; }
  ol { list-style: none; margin: 0; padding: 0; }
  .slip { display: inline-block; vertical-align: top; margin: 10px 14px 18px 0; padding: 12px 12px 14px; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
  .slip .n { color: var(--red); font-weight: 700; }
  .slip .f { font-size: 11px; opacity: .7; }
  .back { display: inline-block; margin: 40px 0 0 6vw; padding: 8px 12px; background: var(--paper); transform: rotate(1.5deg); font-weight: 700; }
  @media (max-width: 599px) { .slip { width: calc(100% - 24px) !important; margin: 10px 0 22px 8px !important; } }
`;
  const body = `<main>
<div class="scrap note">
  <i class="tape gaffer" aria-hidden="true"></i>
  <p class="big">Thank you.</p>
  <p>Almost everything on this wall is someone else's photo. Here's who, and where we found it. Most of them we photocopied, which is a change to the original; none of them show our pizza.</p>
  <p>The pencil slice is Cecilia Carolan's (crown-slice-sketch.jpg, and the tip we cut from it for the 404 page: scraps/cecilia-tip.jpg).</p>
  <p><a href="./">back to the wall</a></p>
</div>
<ol>
${slips}
</ol>
<a class="back" href="./">back to the wall</a>
</main>`;
  return page('Photo credits: Grand Royale Pizza', '<meta name="description" content="Who took the photos on the Grand Royale Pizza wall, and their licenses. Thank you.">\n', css, body);
}

// ---- 404.html: one taped Polaroid, Cecilia's slice looking at it, one typed line ----
export function notFoundHTML() {
  const css = `
  main { position: relative; min-height: 100vh; padding: 12vh 16px 60px; }
  .polaroid { width: min(340px, 70vw); margin: 0 0 0 clamp(16px, 22vw - 40px, 360px); padding: 12px 12px 54px; transform: rotate(4deg); }
  .polaroid img { display: block; width: 100%; height: auto; mix-blend-mode: multiply; }
  .tip { position: relative; display: block; width: 92px; height: auto; margin: -40px 0 0 max(4px, calc(22vw - 70px)); transform: rotate(-24deg); mix-blend-mode: multiply; }
  .line { width: min(330px, 78vw); margin: 18px 0 0 clamp(16px, 30vw - 60px, 440px); padding: 16px 18px 18px; transform: rotate(-1.5deg); font-size: 18px; font-weight: 700; }
  .line p { margin: 0 0 12px; }
`;
  const body = `<main>
<div class="scrap polaroid">
  <i class="tape gaffer" aria-hidden="true"></i>
  <img src="${inline('photos/box-in-the-grass.jpg')}" width="560" height="420" alt="Photocopy of a crushed, empty pizza box lying in wet grass. Somebody was here before you.">
</div>
<img class="tip" src="${inline('scraps/cecilia-tip.jpg')}" width="217" height="260" alt="The tip of Cecilia's pencil pizza slice, looking at the box.">
<div class="scrap line">
  <i class="tape" aria-hidden="true"></i>
  <p>nothing here. the pizza isn't either, yet.</p>
  <a href="/">back to the wall</a>
</div>
</main>`;
  return page('Nothing here: Grand Royale Pizza', '<meta name="robots" content="noindex">\n', css, body);
}
