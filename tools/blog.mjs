// The blog: a Tumblr-style blog on the same wall. One column of taped-up posts, newest first;
// photo posts are Tumblr photosets (rows of 1-3, cropped to one height per row), text posts are big type.
// Written by `node build.mjs` from blog/posts.json into blog/index.html and blog/<slug>.html.
// Add a post: drop photos with `node tools/post-photo.mjs`, add an entry at the top of blog/posts.json, run node build.mjs.
import { readFileSync } from 'node:fs';
import { WALL_CSS } from './pages.mjs';
import { rng } from './hand.mjs';

const root = new URL('../', import.meta.url);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const loadPosts = () => JSON.parse(readFileSync(new URL('blog/posts.json', root), 'utf8'));

// width and height straight from the JPEG's SOF marker, so the photoset rows line up without a layout jump
export function jpegSize(path) {
  const b = readFileSync(new URL(path, root));
  for (let i = 2; i < b.length;) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  throw new Error(`no size in ${path}`);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`; };

const CSS = `
  [hidden] { display: none !important; }
  /* the header, same as the wall's (index.html .topstrip / .dymo, and the spray name's size, tilt and spot): the crowned name top left, the PETOSKEY, MI and HOME label-maker tapes top right (Pat 2026-11-16) */
  .topstrip { position: relative; z-index: 10; padding: 4px 0 0; min-height: 150px; }
  .topstrip .name { position: absolute; left: 3vw; top: 4px; display: block; width: min(445px, 60vw); transform: rotate(-5deg); }
  .topstrip .name img { display: block; width: 100%; height: auto; }
  .topstrip .tape-link { position: absolute; top: 0; right: 0; padding: 18px 16px 6px; display: flex; align-items: center; gap: 14px; }
  .topstrip .tag-petoskey { width: 190px; height: auto; transform: rotate(2deg); }
  /* the way home: a label-maker tape like PETOSKEY, MI (Pat 2026-11-16) */
  .topstrip .tag-link { display: block; }
  .topstrip .tag-home { display: block; width: 80px; height: auto; transform: rotate(-2deg); }
  .topstrip .tag-link:focus-visible { outline: 3px solid var(--red); outline-offset: 4px; }
  .dymo {
    display: inline-block; padding: 9px 20px 8px; border-radius: 5px; white-space: nowrap;
    background: var(--ink) linear-gradient(rgba(255, 255, 255, .07) 0 3px, transparent 3px);
    color: #e9e6df; text-decoration: none; text-transform: uppercase;
    font: 700 26px/1 "Arial Narrow", "Helvetica Neue", Arial, sans-serif; font-stretch: condensed; letter-spacing: .14em;
    text-shadow: 0 0 .6px #fff; transform: rotate(-2deg); box-shadow: 1px 2px 0 rgba(26, 26, 26, .25);
  }
  .dymo:hover { color: #fff; }
  .dymo:focus-visible, .topstrip .name:focus-visible { outline: 3px solid var(--red); outline-offset: 4px; }
  @media (max-width: 599px) {
    .topstrip { min-height: 0; padding: 0; }
    .topstrip .tape-link { position: relative; display: flex; justify-content: flex-end; padding-top: 12px; }
    .topstrip .name { position: relative; left: -3vw; top: 2px; width: 71vw; transform: rotate(-7deg); }
    .dymo { font-size: 17px; padding: 8px 12px 7px; }
    .topstrip .tag-petoskey { width: 112px; }
    .topstrip .tag-home { width: 47px; }
  }
  main { padding: 8px 16px 90px; }
  .cols { max-width: 1000px; margin: 0 auto; }
  /* the blog's "header": a taped index card, not a header */
  .who { position: relative; width: min(300px, 100%); margin: 14px 0 34px 2vw; padding: 26px 18px 18px; transform: rotate(-1.5deg); border-top: 3px solid var(--red); }
  .who .ava { display: block; width: 74px; height: 74px; margin: 0 0 12px; border-radius: 50%; background: var(--wall) url("../lettering/sticker.svg") center / 92% auto no-repeat; border: 2px solid var(--ink); }
  .who .name { margin: 0 0 4px; font: 900 30px/1 "Arial Black", Arial, sans-serif; letter-spacing: -.01em; }
  .who .handle { margin: 0 0 12px; font-size: 13px; opacity: .75; }
  .who p { margin: 0 0 10px; font-size: 15px; font-weight: 700; }
  .who a { font-weight: 700; }
  .feed { list-style: none; margin: 0; padding: 0; }
  .post { position: relative; width: min(540px, 100%); margin: 0 auto 54px; padding: 12px 12px 14px; }
  .post .tape { top: -12px; }
  .set { margin: 0 0 12px; }
  .row { display: flex; gap: 4px; margin-bottom: 4px; }
  .row a { display: block; min-width: 0; overflow: hidden; background: var(--ink); }
  .row img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .post h2 { margin: 4px 4px 8px; font: 900 22px/1.1 "Arial Black", Arial, sans-serif; letter-spacing: -.01em; }
  .post h2 a { text-decoration: none; }
  .post .big { margin: 10px 4px 6px; font: 900 clamp(38px, 9vw, 56px)/.95 "Arial Black", Arial, sans-serif; letter-spacing: -.02em; }
  .post .stamp { display: inline-block; margin: 6px 0 16px 8px; padding: 4px 12px 2px; border: 4px solid var(--red); color: var(--red); font: 900 30px/1 "Arial Black", Arial, sans-serif; text-transform: uppercase; transform: rotate(-7deg); }
  .post p { margin: 0 4px 10px; font-size: 16px; }
  .meta { margin: 14px 4px 0; padding-top: 10px; border-top: 1px dashed var(--ink); font-size: 13px; }
  .meta .tags a { color: var(--red); text-decoration: none; margin-right: 10px; white-space: nowrap; }
  .meta .when { display: block; margin-top: 6px; opacity: .8; }
  .meta .when a { color: var(--ink); }
  .back { display: inline-block; margin: 6px 0 0 4vw; padding: 8px 12px; background: var(--paper); transform: rotate(1.5deg); font-weight: 700; }
  @media (min-width: 900px) {
    main { padding-top: 48px; }
    .cols { display: flex; gap: 56px; align-items: flex-start; }
    .who { position: sticky; top: 48px; flex: 0 0 300px; margin: 14px 0 0; }
    .feed { flex: 1 1 auto; min-width: 0; }
  }
`;

function photoset(post, base = '') {
  const photos = post.photos.map((p) => ({ ...p, ...jpegSize(`blog/photos/${p.file}`) }));
  const rows = post.rows?.length ? post.rows : photos.map(() => 1);
  if (rows.reduce((a, b) => a + b, 0) !== photos.length) throw new Error(`${post.slug}: rows ${rows} do not add up to ${photos.length} photos`);
  let i = 0;
  return `<div class="set">\n${rows.map((n) => {
    const row = photos.slice(i, i += n);
    // widths follow each photo's aspect ratio, so the whole row shares one height and nothing is cropped
    // (flex-grow x100: a lone portrait photo has a ratio under 1, and grow values under 1 leave the row part empty)
    const sum = row.reduce((a, p) => a + p.w / p.h, 0);
    return `  <div class="row" style="aspect-ratio:${sum.toFixed(3)} / 1">${row.map((p) =>
      `<a href="${base}photos/${p.file}" style="flex:${(100 * p.w / p.h).toFixed(1)} 1 0"><img src="${base}photos/${p.file}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async"></a>`).join('')}</div>`;
  }).join('\n')}\n</div>`;
}

function postHTML(post, i, { link = true, base = '' } = {}) {
  const r = rng('blog:' + post.slug);
  r(); r(); // posts sit straight and centered (Pat 2026-11-16); keep the draws so tape spots stay put
  const title = link ? `<a href="${base}${post.slug}.html">${esc(post.title)}</a>` : esc(post.title);
  const tape = r() < 0.5 ? 'tape' : 'tape gaffer';
  return `<li class="scrap post" id="${post.slug}" data-tags="${esc(post.tags.map((t) => t.replace(/\s+/g, '-')).join(' '))}">
<i class="${tape}" aria-hidden="true" style="left:${(30 + r() * 40).toFixed(0)}%"></i>
${post.photos.length ? photoset(post, base) + '\n' : ''}<h2>${title}</h2>
${post.big ? `<p class="big">${esc(post.big)}</p>\n` : ''}${post.stamp ? `<span class="stamp">${esc(post.stamp)}</span>\n` : ''}${post.body.map((p) => `<p>${esc(p)}</p>`).join('\n')}
<div class="meta"><span class="tags">${post.tags.map((t) => base ? `<span>#${esc(t)}</span>` : `<a href="${link ? '' : './'}#${esc(t.replace(/\s+/g, '-'))}">#${esc(t)}</a>`).join('')}</span><span class="when">${day(post.date)} &middot; ${esc(post.place || 'Petoskey, MI')}</span></div>
</li>`;
}

const WHO = `<div class="scrap who">
  <i class="tape gaffer" aria-hidden="true"></i>
  <i class="ava" role="img" aria-label="Grand Royale crown sticker"></i>
  <p class="name">blog</p>
  <p class="handle">grandroyalepizza</p>
  <p>Pizza research log</p>
  <a href="/">&larr; Home</a>
</div>`;

const page = (title, desc, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#ffffff">
<style>${WALL_CSS}${CSS}</style>
</head>
<body>
<div class="topstrip"><div class="tape-link"><img class="tag-petoskey" src="../lettering/label-petoskey.png" width="386" height="64" alt="Petoskey, MI" decoding="async"><a class="tag-link" href="/"><img class="tag-home" src="../lettering/label-home.png" width="162" height="64" alt="Home" decoding="async"></a></div><a class="name" href="/"><img src="../lettering/wordmark-grand-royale.png" width="1727" height="606" alt="Grand Royale Pizza"></a></div>
${body}
</body>
</html>
`;

// /blog/ is now the homepage (Pat 2026-11-16: "move the blog to the homepage ... so everything is one page";
// "redirect /blog to homepage"). GitHub Pages has no server redirects, so this page sends people on.
export function blogHTML() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Blog: Grand Royale Pizza</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="/#blog">
<meta http-equiv="refresh" content="0; url=/#blog">
<script>location.replace('/#blog');</script>
</head>
<body>
<p><a href="/#blog">The blog lives on the homepage now &rarr;</a></p>
</body>
</html>
`;
}

// the feed on the homepage: the same taped-up posts, over the photo wall (build.mjs puts it in index.html)
export function feedHTML(posts = loadPosts()) {
  return `<ol class="feed">
${posts.map((p, i) => postHTML(p, i, { base: 'blog/' })).join('\n')}
</ol>`;
}

export const FEED_CSS = `
  /* the blog, on the homepage over the wall (Pat 2026-11-16); same posts as blog/<slug>.html */
  #blog { position: relative; z-index: 900; width: min(560px, 100%); margin: 70px 0 0 6vw; }
  #blog .feed-head { margin: 0 0 34px 8px; }
  #blog .feed-head img { display: block; width: 110px; height: auto; transform: rotate(-3deg); }
  #blog .scrap { position: relative; background: var(--paper); }
  #blog .tape { position: absolute; top: -12px; width: 96px; height: 26px; transform: translateX(-50%) rotate(-3deg); background: var(--tape); }
  #blog .tape.gaffer { background: var(--ink); opacity: .93; }
  #blog .feed { list-style: none; margin: 0; padding: 0; }
  #blog .post { width: min(540px, 100%); margin: 0 auto 54px; padding: 12px 12px 14px; box-shadow: 2px 3px 0 rgba(26, 26, 26, .18); }
  #blog .set { margin: 0 0 12px; }
  #blog .row { display: flex; gap: 4px; margin-bottom: 4px; }
  #blog .row a { display: block; min-width: 0; overflow: hidden; background: var(--ink); }
  #blog .row img { display: block; width: 100%; height: 100%; object-fit: cover; }
  #blog .post h2 { margin: 4px 4px 8px; font: 900 22px/1.1 "Arial Black", Arial, sans-serif; letter-spacing: -.01em; }
  #blog .post h2 a { color: var(--ink); text-decoration: none; }
  #blog .post .big { margin: 10px 4px 6px; font: 900 clamp(38px, 9vw, 56px)/.95 "Arial Black", Arial, sans-serif; letter-spacing: -.02em; }
  #blog .post .stamp { display: inline-block; margin: 6px 0 16px 8px; padding: 4px 12px 2px; border: 4px solid var(--red); color: var(--red); font: 900 30px/1 "Arial Black", Arial, sans-serif; text-transform: uppercase; transform: rotate(-7deg); }
  #blog .post p { margin: 0 4px 10px; font-size: 16px; }
  #blog .meta { margin: 14px 4px 0; padding-top: 10px; border-top: 1px dashed var(--ink); font-size: 13px; }
  #blog .meta .tags span { color: var(--red); margin-right: 10px; white-space: nowrap; }
  #blog .meta .when { display: block; margin-top: 6px; opacity: .8; }
  #blog .meta .when a { color: var(--ink); }
  /* desktop: the blog runs down the middle of the page, the wall around it (Pat 2026-11-16: "center the blog") */
  /* a wide white sheet with room around it, so the blog breathes over the wall (Pat 2026-11-16) */
  @media (min-width: 600px) { #blog { width: min(760px, calc(100vw - 48px)); margin: 220px auto 120px; padding: 56px 64px 30px; background: var(--wall); box-shadow: 0 0 0 1px rgba(26, 26, 26, .06); } }
  @media (max-width: 599px) { #blog { margin: 40px 0 0; } }
`;

export function postPageHTML(post, posts = loadPosts()) {
  const i = posts.findIndex((p) => p.slug === post.slug);
  const body = `<main>
<div class="cols">
${WHO}
<ol class="feed">
${postHTML(post, i, { link: false })}
</ol>
</div>
<a class="back" href="/#blog">more from the blog</a>
</main>`;
  return page(`${post.title}: Grand Royale Pizza`, [post.big, ...post.body].filter(Boolean).join(' '), body);
}
