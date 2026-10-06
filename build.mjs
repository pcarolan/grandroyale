// Inline photos/manifest.json (and photos/archive/manifest.json, if there is one) into index.html
// so the wall renders from file:// (fetch is only the fallback). Run after changing photos: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('photos/manifest.json', 'utf8'));
// only what the page renders; credits (author, license, source) live in photos/ATTRIBUTION.md
const slim = manifest.map(({ file, alt, treatment, weight, w, h, caption }) => ({ file, alt, treatment, weight, w, h, caption }));
// the archive: what keeps the wall going below the fold; credits live in photos/archive/ATTRIBUTION.md
const archive = existsSync('photos/archive/manifest.json') ? JSON.parse(readFileSync('photos/archive/manifest.json', 'utf8')) : [];
const slimArchive = archive.map(({ file, alt, era, treatment, weight, w, h }) => ({ file, alt, era, treatment, weight, w, h }));

const inline = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
let html = readFileSync('index.html', 'utf8');
for (const [id, data] of [['manifest', slim], ['archive', slimArchive]]) {
  const re = new RegExp(`(<script type="application/json" id="${id}">)[\\s\\S]*?(</script>)`);
  if (!re.test(html)) throw new Error(`no <script type="application/json" id="${id}"> in index.html`);
  html = html.replace(re, (m, a, b) => a + inline(data) + b);
}
writeFileSync('index.html', html);
console.log(`inlined ${manifest.length} photos and ${archive.length} archive photos into index.html`);
