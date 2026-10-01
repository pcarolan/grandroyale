import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('has a tel input', () => assert.match(html, /type="tel"/));
// Consent checkbox removed; submitting a number is the opt-in (bees-vo70.16)
test('has no checkbox', () => assert.ok(!/type="checkbox"/.test(html)));
test('mentions STOP', () => assert.ok(html.includes('STOP')));
test('old consent paragraph is gone', () => assert.ok(!html.includes('By signing up you agree')));
test('has the fineprint line', () => {
  assert.match(html, /class="fineprint"[^>]*>\s*Msg &amp; data rates may apply\. Text STOP to walk the plank\.\s*</);
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
