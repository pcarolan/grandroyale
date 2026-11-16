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

// the other doors in the house, on the same wall (tools/pages.mjs; bees-pyrm.2)
const { creditsHTML, notFoundHTML } = await import('./tools/pages.mjs');
writeFileSync('credits.html', creditsHTML(manifest));
writeFileSync('404.html', notFoundHTML());
console.log('wrote credits.html and 404.html');

// the blog: a Tumblr-style blog on the same wall (tools/blog.mjs, blog/posts.json)
const { blogHTML, postPageHTML, loadPosts, feedHTML, FEED_CSS } = await import('./tools/blog.mjs');
const posts = loadPosts();
writeFileSync('blog/index.html', blogHTML(posts));
// ...and on the homepage: the feed and its CSS go into index.html (Pat 2026-11-16: everything is one page)
{
  const home = readFileSync('index.html', 'utf8');
  const feedRe = /(<!-- feed -->)[\s\S]*?(<!-- \/feed -->)/, cssRe = /(<style id="feed-css">)[\s\S]*?(<\/style>)/;
  if (!feedRe.test(home) || !cssRe.test(home)) throw new Error('index.html needs <!-- feed --><!-- /feed --> and <style id="feed-css">');
  writeFileSync('index.html', home.replace(feedRe, (m, a, b) => `${a}\n${feedHTML(posts)}\n${b}`).replace(cssRe, (m, a, b) => a + FEED_CSS + b));
}
for (const p of posts) writeFileSync(`blog/${p.slug}.html`, postPageHTML(p, posts));
console.log(`wrote blog/index.html and ${posts.length} posts`);
