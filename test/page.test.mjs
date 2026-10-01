import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const CONSENT = 'By signing up you agree to receive text messages from Grand Royale Pizza about pizza pickups. Message and data rates may apply. Message frequency varies. Reply STOP to opt out, HELP for help.';

test('has a tel input', () => assert.match(html, /type="tel"/));
test('has a required checkbox', () => {
  const inputs = html.match(/<input\b[^>]*>/gi) || [];
  assert.ok(inputs.some((t) => /type="checkbox"/.test(t) && /\brequired\b/.test(t)));
});
test('has the exact consent copy', () => assert.ok(html.includes(CONSENT)));
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
