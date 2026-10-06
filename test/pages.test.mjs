// _why crit #6 and #7 (bees-pyrm.2): credits as a thank-you note with its own page, and a 404 that's part of the wall.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const html = read('index.html');
const manifest = JSON.parse(read('photos/manifest.json'));
const pages = await import('../tools/pages.mjs');

const wallish = (page, name) => {
  assert.match(page, /^<!doctype html>/i, `${name}: doctype`);
  assert.match(page, /<meta name="viewport"/, `${name}: viewport`);
  assert.match(page, /<title>[^<]+<\/title>/, `${name}: title`);
  assert.ok(page.includes(pages.WALL_CSS), `${name}: not on the same wall CSS`);
  assert.match(pages.WALL_CSS, /--wall:\s*#fff(fff)?;/i);
  assert.match(pages.WALL_CSS, /body\s*\{[^}]*background:\s*var\(--wall\)/);
  assert.doesNotMatch(page, /<header\b|<nav\b/i, `${name}: no header or nav`);
  const words = page.replace(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g, '');   // base64 can spell anything
  assert.doesNotMatch(words, /\bhot\b|wood|\byr\b/i, `${name}: house words`);
  assert.doesNotMatch(page, /fonts\.googleapis|@font-face/, `${name}: no webfonts`);
  const classes = [...page.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).join(' ');
  assert.doesNotMatch(classes, /\b(masthead|issue|spread|section|toc|folio|wordmark)\b/, `${name}: magazine class`);
  assert.doesNotMatch(page, /display:\s*grid|flex-wrap/, `${name}: no grid`);
};

// ---- 404 ----
test('404.html exists on the wall, with the line and a way back, no nav or header', () => {
  assert.ok(existsSync(new URL('404.html', root)));
  const p = read('404.html');
  wallish(p, '404.html');
  assert.ok(p.includes("nothing here. the pizza isn't either, yet."));
  assert.match(p, /<a href="\/">back to the wall<\/a>/);
  assert.match(p, /<meta name="robots" content="noindex">/);
});
test('404.html works at any depth: the box in the grass and the slice are inline, not relative paths', () => {
  const p = read('404.html');
  assert.equal((p.match(/src="data:image\/jpeg;base64,/g) || []).length, 2);
  assert.doesNotMatch(p, /src="(?!data:)/, 'every image inline');
  assert.match(p, /crushed, empty pizza box/);
});
test('404.html is current (node build.mjs)', () => assert.equal(read('404.html'), pages.notFoundHTML()));

// ---- credits ----
test('credits.html exists and lists every photo on the wall: file, author, license, source', () => {
  assert.ok(existsSync(new URL('credits.html', root)));
  const p = read('credits.html');
  wallish(p, 'credits.html');
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  for (const m of manifest) {
    assert.ok(p.includes(m.file), `credits missing ${m.file}`);
    assert.ok(p.includes(esc(m.author)), `credits missing author ${m.author}`);
    assert.ok(p.includes(esc(m.license)), `credits missing license for ${m.file}`);
    assert.ok(p.includes(`href="${esc(m.source_url)}"`), `credits missing source for ${m.file}`);
  }
  assert.ok(p.includes('scraps/cecilia-tip.jpg'), 'credits missing the 404 scrap');   // the dice scrap is gone (bees-pyrm.6)
  assert.match(p, /Thank you\./);
  assert.match(p, /<a href="\.\/">back to the wall<\/a>/);
});
test('credits.html is current (node build.mjs)', () => assert.equal(read('credits.html'), pages.creditsHTML(manifest)));
test('build.mjs writes credits.html and 404.html', () => {
  const b = read('build.mjs');
  assert.match(b, /creditsHTML/);
  assert.match(b, /notFoundHTML/);
});

// ---- the thank-you card on the wall ----
test('a taped thank-you card replaces the tiny "photo credits" link and points at credits.html', () => {
  const card = html.match(/<div class="it thanks"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.ok(card, 'no thank-you card');
  assert.match(card, /Almost everything on this wall is someone else's photo\. Thank you\./);
  assert.match(card, /<a href="credits\.html">Here's who &rarr;<\/a>/);
  assert.match(card, /class="tape/);
  assert.doesNotMatch(card, /scraps\//, 'no second copy of the sketch on the wall (bees-pyrm.6)');
  assert.ok(!/data-scrap/.test(card), 'pinned, not scattered');
  assert.doesNotMatch(html, /photos\/ATTRIBUTION\.md|>photo credits</);
  assert.equal((html.match(/href="credits\.html"/g) || []).length, 1);
});
test('the thank-you card stays pinned bottom right (owner placement 2026-10-01)', () => {
  const css = html.match(/\.thanks\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(css, /right:\s*\d+px/);
  assert.match(css, /bottom:\s*\d+px/);
});
