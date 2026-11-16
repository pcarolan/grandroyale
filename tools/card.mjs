// The sign-up card's handwriting (a mix tape insert, Pat 2026-11-16): writes lettering/card-*.svg.
// Run: node tools/card.mjs
import { writeFileSync } from 'node:fs';
import { scrawlSVG, write } from './hand.mjs';
const L = new URL('../lettering/', import.meta.url);
const out = (name, svg) => writeFileSync(new URL(name, L), svg);
out('card-title.svg', scrawlSVG('GRAND ROYALE', { seed: 'mixtape-title', px: 6, stroke: 1.5 }));
out('card-number.svg', scrawlSVG('your number', { px: 3, stroke: 1.2, seed: 'card-number' }));
out('card-button.svg', scrawlSVG("TEXT ME WHEN THE PIZZA'S ON", { seed: 'mixtape-button', px: 6, stroke: 1.4, color: '#1f3fb0' }));
// the lede as lines on printed rules (rules sit just under each baseline, outside the ink filter)
const text = "WE'RE NOT OPEN YET.\nLEAVE YOUR NUMBER AND\nWE'LL TEXT YOU THE\nNIGHT WE OPEN.";
const { width } = write(text, { seed: 'mixtape-lede' });
const rules = text.split('\n').map((_, i) => `<path d="M-2 ${(13.5 + 15 * i).toFixed(1)} H${(width + 2).toFixed(1)}"/>`);
out('card-lede.svg', scrawlSVG(text, { seed: 'mixtape-lede', px: 6, stroke: 1.2 })
  .replace('<g fill="none" stroke="#1a1a1a"', `<g stroke="#1a1a1a" stroke-width=".22" opacity=".45">${rules.join('')}</g>\n<g fill="none" stroke="#1a1a1a"`));
