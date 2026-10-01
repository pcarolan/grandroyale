import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('has a tel input', () => assert.match(html, /type="tel"/));
// Consent checkbox and fine print removed; submitting a number is the opt-in (bees-vo70.16)
test('has no checkbox', () => assert.ok(!/type="checkbox"/.test(html)));
test('old consent paragraph is gone', () => assert.ok(!html.includes('By signing up you agree')));
test('has no STOP line and no fineprint', () => {
  assert.ok(!html.includes('STOP'));
  assert.ok(!/class="[^"]*\bfineprint\b/.test(html));
});
test('says coming soon', () => assert.match(html, /coming soon/i));
test('mentions hot and pickup', () => {
  assert.match(html, /\bhot\b/);
  assert.match(html, /\bpickup\b/);
});
test('loads config.js and signup.js', () => {
  assert.match(html, /<script[^>]*src="assets\/config\.js"/);
  assert.match(html, /<script[^>]*src="assets\/signup\.js"/);
});
test('has a viewport meta', () => assert.match(html, /<meta name="viewport"/));
test('has a title', () => assert.match(html, /<title>[^<]+<\/title>/));
test('does not name Roberta', () => assert.ok(!html.includes('Roberta')));

// Wordmark: Grand Royal Records-style serif + crown (bees-vo70.15)
test('Google Fonts link loads Sancreek', () => {
  const link = html.match(/<link[^>]*href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*"[^>]*>/);
  assert.ok(link, 'no Google Fonts stylesheet link');
  assert.match(link[0], /family=Sancreek/);
});
test('wordmark element uses Sancreek', () => {
  assert.match(html, /class="wordmark"/);
  const rule = html.match(/\.wordmark\s*\{[^}]*\}/);
  assert.ok(rule, 'no .wordmark CSS rule');
  assert.match(rule[0], /font-family:[^;]*(Sancreek|var\(--royal\))/);
  assert.match(html, /--royal:\s*"Sancreek"/);
});
test('says "Grand Royale" in mixed case', () => {
  assert.match(html, /class="wordmark"[^>]*>Grand Royale</);
  assert.ok(!/text-transform:\s*uppercase/.test(html.match(/\.wordmark\s*\{[^}]*\}/)?.[0] ?? ''));
});
test('has a crown SVG', () => assert.match(html, /<svg\b[^>]*(class|id)="[^"]*crown[^"]*"/));

// Zine redesign after Grand Royal magazine (bees-vo70.16)
test('DESIGN.md exists with at least 8 numbered observations', () => {
  const url = new URL('../DESIGN.md', import.meta.url);
  assert.ok(existsSync(url), 'DESIGN.md missing');
  const md = readFileSync(url, 'utf8');
  const obs = md.split(/^## /m).find((s) => /^Observations/.test(s));
  assert.ok(obs, 'no "## Observations" section');
  assert.ok((obs.match(/^\d+\.\s/gm) || []).length >= 8);
});
test('does not say wood', () => assert.ok(!/wood/i.test(html)));
test('pitch tagline is gone', () => assert.ok(!html.includes('Blistered')));
test('has the Petoskey, MI dateline', () => assert.match(html, />\s*Petoskey, MI\s*</));
test('has the issue line', () => assert.match(html, /Vol\. 1 No\. 0 · Coming soon · Free/));
test('respects reduced motion', () => assert.match(html, /prefers-reduced-motion/));
test('body has an explicit background', () => assert.match(html.match(/\bbody\s*\{[^}]*\}/)?.[0] ?? '', /background(-color)?:/));
test('form copy starts with the drop-your-number line', () => {
  assert.match(html, /Drop your number and we'll send a text when the pies are hot and ready for pickup\./);
});
test('no external images', () => {
  assert.ok(!/<img\b/i.test(html));
  assert.ok(!/url\(\s*["']?https?:/i.test(html));
});
