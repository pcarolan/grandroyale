// The blog (blog/): a Tumblr-style feed on the same wall. Pat, 2026-11-16: "give it tumblr vibes, keep with the site vibe".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const { blogHTML, postPageHTML, loadPosts, jpegSize } = await import('../tools/blog.mjs');
const { WALL_CSS } = await import('../tools/pages.mjs');
const posts = loadPosts();
const pages = [['blog/index.html', read('blog/index.html')], ...posts.map((p) => [`blog/${p.slug}.html`, read(`blog/${p.slug}.html`)])];

test('blog pages are current (node build.mjs)', () => {
  assert.equal(read('blog/index.html'), blogHTML(posts));
  for (const p of posts) assert.equal(read(`blog/${p.slug}.html`), postPageHTML(p, posts), p.slug);
});

test('same wall: wall CSS, no webfonts, no header/nav, no grid, no magazine classes', () => {
  for (const [name, p] of pages) {
    assert.ok(p.includes(WALL_CSS), name);
    assert.doesNotMatch(p, /fonts\.googleapis|@font-face/, name);
    assert.doesNotMatch(p, /<header\b|<nav\b/i, name);
    assert.doesNotMatch(p, /display:\s*grid|flex-wrap/, name);
    const classes = [...p.matchAll(/class="([^"]*)"/g)].map((m) => m[1]).join(' ');
    assert.doesNotMatch(classes, /\b(masthead|issue|spread|section|toc|folio|wordmark)\b/, name);
    assert.match(p, /href="\/">&larr; back to the wall/, name);
  }
});

test('house words: no "wood" or "yr"; "hot" only in the name of the hot honey pie (Pat, 2026-11-16)', () => {
  for (const [name, p] of pages) {
    assert.doesNotMatch(p, /wood|\byr\b/i, name);
    assert.doesNotMatch(p.replace(/hot[ -]honey/gi, ''), /\bhot\b/i, name);
  }
});

test('every post photo exists, is small, has no metadata left, and has alt text; photosets stay at 10 or fewer', () => {
  for (const post of posts) {
    assert.ok(post.photos.length <= 10, post.slug);
    for (const ph of post.photos) {
      const f = `blog/photos/${ph.file}`;
      assert.ok(existsSync(new URL(f, root)), f);
      assert.ok(ph.alt && ph.alt.length > 20, `${f}: alt`);
      const { w, h } = jpegSize(f);
      assert.ok(Math.max(w, h) <= 1280, `${f}: ${w}x${h}`);
      assert.ok(!readFileSync(new URL(f, root)).includes('Exif'), `${f}: still has EXIF (GPS); use tools/post-photo.mjs`);
    }
  }
});

test('newest first, and the wall links in', () => {
  const dates = posts.map((p) => p.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.match(read('index.html'), /<a class="it kitchen" href="blog\/"/);
});
