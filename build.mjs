// Inline photos/manifest.json into index.html so the wall renders from file://
// (fetch is only the fallback). Run after changing photos: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync('photos/manifest.json', 'utf8'));
// only what the page renders; credits (author, license, source) live in photos/ATTRIBUTION.md
const slim = manifest.map(({ file, alt, treatment, weight, w, h, caption, place }) => ({ file, alt, treatment, weight, w, h, caption, place }));
const json = JSON.stringify(slim).replace(/</g, '\\u003c');
const html = readFileSync('index.html', 'utf8');
const re = /(<script type="application\/json" id="manifest">)[\s\S]*?(<\/script>)/;
if (!re.test(html)) throw new Error('no <script type="application/json" id="manifest"> in index.html');
writeFileSync('index.html', html.replace(re, (m, a, b) => a + json + b));
console.log(`inlined ${manifest.length} photos into index.html`);
