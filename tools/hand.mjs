// A single-stroke marker "hand": capital letters drawn as polylines, then every
// instance is re-drawn with its own wobble, size, slant and baseline so no two
// letters on the wall come out the same (grand-royal-raw: no handwriting fonts).
// Cap height = 10 units, y grows down, baseline at y=10.
const O = [[2.5,0],[0.8,0.9],[0,3.6],[0,6.4],[0.8,9.1],[2.5,10],[4.2,9.1],[5,6.4],[5,3.6],[4.2,0.9],[2.9,0.15]];
export const GLYPHS = {
  A: { w: 5, s: [[[0,10],[2.5,0],[5,10]], [[1.1,6.4],[4,6.4]]] },
  B: { w: 4.8, s: [[[0,10],[0,0]], [[0,0],[3,0],[4.2,1.2],[4.2,3.5],[3,4.8],[0,4.8]], [[0.2,4.8],[3.4,4.8],[4.8,6.2],[4.8,8.6],[3.4,10],[0,10]]] },
  C: { w: 4.8, s: [[[4.7,1.6],[3.5,0.2],[2,0.1],[0.6,1.2],[0,3.6],[0,6.4],[0.6,8.8],[2,9.9],[3.5,9.8],[4.8,8.4]]] },
  D: { w: 4.8, s: [[[0,0],[0,10]], [[0,0],[2.5,0.2],[4.3,2],[4.8,5],[4.3,8],[2.5,9.8],[0,10]]] },
  E: { w: 4.4, s: [[[4.4,0],[0,0],[0,10],[4.4,10]], [[0,4.9],[3.4,4.9]]] },
  F: { w: 4.4, s: [[[4.4,0],[0,0],[0,10]], [[0,4.9],[3.4,4.9]]] },
  G: { w: 5, s: [[[4.7,1.6],[3.5,0.2],[2,0.1],[0.6,1.2],[0,3.6],[0,6.4],[0.6,8.8],[2,9.9],[3.6,9.8],[4.9,8.6],[4.9,5.8],[2.8,5.8]]] },
  H: { w: 4.6, s: [[[0,0],[0,10]], [[4.6,0],[4.6,10]], [[0,5],[4.6,5]]] },
  I: { w: 2.4, s: [[[1.2,0],[1.2,10]]] },
  J: { w: 3.6, s: [[[3.6,0],[3.6,7.5],[2.9,9.5],[1.6,10],[0.4,9.2],[0,8]]] },
  K: { w: 4.7, s: [[[0,0],[0,10]], [[4.5,0],[0,6]], [[1.5,4.2],[4.8,10]]] },
  L: { w: 4, s: [[[0,0],[0,10],[4,10]]] },
  M: { w: 5.8, s: [[[0,10],[0.3,0],[2.9,6.4],[5.5,0],[5.8,10]]] },
  N: { w: 4.6, s: [[[0,10],[0,0],[4.6,10],[4.6,0]]] },
  O: { w: 5, s: [O] },
  P: { w: 4.4, s: [[[0,10],[0,0],[3,0],[4.4,1.3],[4.4,3.8],[3,5.2],[0,5.2]]] },
  Q: { w: 5, s: [O, [[2.9,7.1],[5.2,10.6]]] },
  R: { w: 4.6, s: [[[0,10],[0,0],[3,0],[4.4,1.3],[4.4,3.8],[3,5.2],[0,5.2]], [[2,5.2],[4.6,10]]] },
  S: { w: 4.6, s: [[[4.4,1.4],[3.2,0.1],[1.4,0.1],[0.2,1.4],[0.3,3.4],[2.2,4.8],[4.2,6.2],[4.6,8.4],[3.4,9.9],[1.4,9.9],[0,8.6]]] },
  T: { w: 5, s: [[[0,0],[5,0]], [[2.5,0],[2.5,10]]] },
  U: { w: 4.6, s: [[[0,0],[0,7],[0.7,9.3],[2.3,10],[3.9,9.3],[4.6,7],[4.6,0]]] },
  V: { w: 4.8, s: [[[0,0],[2.4,10],[4.8,0]]] },
  W: { w: 6.2, s: [[[0,0],[1.5,10],[3.1,3.4],[4.7,10],[6.2,0]]] },
  X: { w: 4.6, s: [[[0,0],[4.6,10]], [[4.6,0],[0,10]]] },
  Y: { w: 4.6, s: [[[0,0],[2.3,5]], [[4.6,0],[2.3,5],[2.3,10]]] },
  Z: { w: 4.6, s: [[[0,0],[4.6,0],[0,10],[4.6,10]]] },
  '#': { w: 4.6, s: [[[1.6,1],[1.1,9]], [[3.6,1],[3.1,9]], [[0,3.6],[4.6,3.6]], [[0,6.4],[4.6,6.4]]] },
  ',': { w: 0.8, s: [[[0.7,9.3],[0.6,10],[0,11.6]]] },
  '.': { w: 0.6, s: [[[0.3,9.5],[0.4,10]]] },
  "'": { w: 0.6, s: [[[0.5,0],[0.2,2.6]]] },
  '!': { w: 0.8, s: [[[0.5,0],[0.4,7]], [[0.4,9.5],[0.45,10]]] },
  '?': { w: 4, s: [[[0,1.6],[1.2,0.1],[2.8,0.1],[4,1.4],[3.8,3.4],[2,5],[2,7]], [[2,9.5],[2.05,10]]] },
  '(': { w: 2.4, s: [[[1.6,-0.6],[0.3,3],[0,5],[0.3,7.4],[1.6,11]]] },
  ')': { w: 2.4, s: [[[0,-0.6],[1.3,3],[1.6,5],[1.3,7.4],[0,11]]] },
  '+': { w: 4, s: [[[0,5.2],[4,5]], [[2,3],[2.1,7.2]]] },
  '-': { w: 3, s: [[[0,5.2],[3,5]]] },
  ' ': { w: 2.4, s: [] },
};

export function rng(seed) {
  let a = 0; for (const c of String(seed)) a = (Math.imul(a ^ c.charCodeAt(0), 2654435761) + 0x9e3779b9) | 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Catmull-Rom through the points -> cubic Bezier path data
function smooth(pts) {
  if (pts.length < 3) return 'M' + pts.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join(' L');
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((n) => n.toFixed(2)).join(' ')} ${c2.map((n) => n.toFixed(2)).join(' ')} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

// Lay out text (\n for new lines). Returns { paths: [d...], width, height } in units.
export function write(text, { seed = text, mess = 1, gap = 2, lineGap = 15, drift = 0.6 } = {}) {
  const r = rng(seed);
  const j = (a) => (r() - 0.5) * 2 * a * mess;
  const paths = []; let maxX = 0; let y0 = 0;
  for (const line of text.toUpperCase().split('\n')) {
    let x = 0; const lineDrift = j(drift);
    for (const ch of line) {
      const g = GLYPHS[ch] || GLYPHS[' '];
      const sc = 1 + j(0.07), rot = j(0.07), base = j(0.45) + lineDrift * (x / 40), slant = 0.12 + j(0.06);
      const cx = g.w / 2;
      for (const s of g.s) {
        const pts = s.map(([px, py]) => {
          px += j(0.22); py += j(0.22);
          const sx = (px - cx) * sc, sy = (py - 10) * sc;          // scale around baseline-center
          const rx = sx * Math.cos(rot) - sy * Math.sin(rot), ry = sx * Math.sin(rot) + sy * Math.cos(rot);
          return [x + cx + rx - ry * slant, y0 + 12 + base + ry];
        });
        if (r() < 0.12 * mess && pts.length > 1) {                 // marker overshoot on some strokes
          const [a, b] = pts.slice(-2); pts.push([b[0] + (b[0] - a[0]) * 0.15, b[1] + (b[1] - a[1]) * 0.15]);
        }
        paths.push(smooth(pts));
      }
      x += g.w * sc + gap + j(0.5);
    }
    maxX = Math.max(maxX, x);
    y0 += lineGap;
  }
  return { paths, width: maxX + 2, height: y0 + 2 };
}

// Standalone SVG of a scrawl. stroke in units (cap height 10).
// halo: a fat paper-colored stroke under the ink so marker on a busy photo stays readable (skill: "Sharpie on a photo")
export function scrawlSVG(text, { color = '#1a1a1a', stroke = 1.25, seed, mess, px = 6, extra = '', pad = 2, halo = '', ...o } = {}) {
  const { paths, width, height } = write(text, { seed, mess, ...o });
  const w = width + pad * 2, h = height + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${w.toFixed(1)} ${h.toFixed(1)}" width="${Math.round(w * px)}" height="${Math.round(h * px)}">
<filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${Math.floor((seed ? rng(seed)() : 0.3) * 99)}"/><feDisplacementMap in="SourceGraphic" scale="0.45"/></filter>
${halo ? `<g fill="none" stroke="${halo}" stroke-width="${stroke * 3}" stroke-linecap="round" stroke-linejoin="round" opacity=".9">${paths.map((d) => `<path d="${d}"/>`).join('')}${extra}</g>` : ''}
<g fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" filter="url(#ink)">
${paths.map((d) => `<path d="${d}"/>`).join('\n')}
${extra}
</g></svg>\n`;
}
