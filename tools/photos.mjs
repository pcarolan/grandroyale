// Fetch the wall's photos from Wikimedia Commons with license metadata, run the
// grand-royal-raw photocopy treatment, write photos/manifest.json + photos/ATTRIBUTION.md.
// Usage: node tools/photos.mjs            (originals cached in photos/src/, gitignored)
// Needs: node 20+, ImageMagick 7 (`magick`).
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const UA = 'grandroyale-photo-wall/1.0 (https://grandroyalepizza.com)';
const PAPER = '#f1ede3', INK = '#1a1a1a', RED = '#d62718';

// treatment: xerox (black toner) | red (red toner) | color (snapshot print)
// weight: 1-10; items >= 6 also show on phones.
export const PHOTOS = [
  { slug: 'slice-paper-plate', title: 'File:Brozinni Pizzeria Speedway - June 2022 - Sarah Stierch 08.jpg', t: 'xerox', w: 8, cap: 'royale with cheese' },
  { slug: 'dollar-slice-sign', title: 'File:1.50 dollar pizza (3).jpg', t: 'red', w: 7 },
  { slug: 'two-slices', title: 'File:NewYorkSlices.jpg', t: 'xerox', w: 4 },
  { slug: 'square-slice', title: 'File:L&B Spumoni Gardens pizza (41436).jpg', t: 'color', w: 9, cap: 'brooklyn' },
  { slug: 'upside-down-box', title: 'File:Pizza Box (49522718298).jpg', t: 'xerox', w: 6 },
  { slug: 'box-in-the-grass', title: 'File:Discarded pizza box, Cregganconroe - geograph.org.uk - 3579577.jpg', t: 'xerox', w: 3 },
  { slug: 'sticker-wall', title: 'File:Stickerwalls1.jpg', t: 'color', w: 8 },
  { slug: 'red-stools', title: 'File:Slim Jims Liquor Store, Islington, N1 (3590013603).jpg', t: 'xerox', w: 4 },
  { slug: 'bar-sink', title: 'File:MollysTardSink.jpg', t: 'xerox', w: 6, cap: 'wash your hands' },
  { slug: 'rheingold-neon', title: 'File:Little Italy, Manhattan, New York (3936792597).jpg', t: 'xerox', w: 3 },
  { slug: 'donuts-cold-beer', title: 'File:Homer simpson heaven (16121420046).jpg', t: 'color', w: 5 },
  { slug: 'payphone-fence', title: 'File:Telefonautomat New York 2018.jpg', t: 'xerox', w: 7, cap: 'call us (no)' },
  { slug: 'payphones-snow', title: 'File:Phone Booth (12686386395).jpg', t: 'xerox', w: 3 },
  { slug: 'smiley-payphone', title: 'File:Happy Pay Phone, Manhattan April 2025.jpg', t: 'xerox', w: 4 },
  { slug: 'boombox-shoulder', title: 'File:Chicago Pride Parade 1985 033.jpg', t: 'red', w: 7 },
  { slug: 'boombox', title: 'File:Sharp GF-777 Boombox - Ghettoblaster (edited and cropped).jpg', t: 'xerox', w: 4 },
  { slug: 'loose-tape', title: 'File:Noname blank compact cassette, loose tape (1).jpg', t: 'xerox', w: 3 },
  { slug: 'mixtape-notes', title: 'File:Mix tape sleeve notes.jpg', t: 'xerox', w: 5 },
  { slug: 'old-skateboard', title: 'File:1990s skateboard in Tornio 20190608 001.jpg', t: 'color', w: 5 },
  { slug: 'night-ollie', title: 'File:Ollie monster by Olivier Bareau.jpg', t: 'xerox', w: 6 },
  { slug: 'ollie-sequence', title: 'File:Ollie skateboarding trick.jpg', t: 'xerox', w: 4 },
  { slug: 'crowd-surf', title: 'File:Mosh (1428617892).jpg', t: 'xerox', w: 9 },
  { slug: 'red-pit', title: 'File:TH - Mosh Pit (5370149877).jpg', t: 'red', w: 5 },
  { slug: 'pit-bw', title: 'File:TH - Mosh Pit (5370150223).jpg', t: 'xerox', w: 3 },
  { slug: 'no-moshing-sign', title: 'File:No moshing sign, Bumbershoot 2010.jpg', t: 'xerox', w: 6 },
  { slug: 'club-shutter', title: 'File:CBGB the day after.JPG', t: 'xerox', w: 5 },
  { slug: 'subway-bikes', title: 'File:Alfred Gonzalez "A Ride on the 6".jpg', t: 'xerox', w: 6 },
  { slug: 'subway-riders', title: 'File:Alfred Gonzalez "People".jpg', t: 'xerox', w: 3 },
  { slug: 'brooklyn-stoops', title: 'File:SMALL, WELL-CARED-FOR GARDENS WITH WROUGHT-IRON FENCES ADORN THESE HOUSES ON 3RD STREET NEAR PROSPECT PARK, BROOKLYN - NARA - 551729.jpg', t: 'xerox', w: 4 },
  { slug: 'bodega-ice', title: 'File:McKibbin Street bodega ice fridge Brooklyn 2022.jpg', t: 'xerox', w: 4 },
  { slug: 'east-village-1998', title: 'File:East Village, New York City, 1998.jpg', t: 'xerox', w: 5 },
  { slug: 'petoskey-stone', title: 'File:Petoskey stone Hexagonaria percarinata 2.jpg', t: 'color', w: 6, cap: 'petoskey stone', author: 'Jtmichcock at English Wikipedia' },
  { slug: 'stone-hunting', title: 'File:Looking For Petoskey Stones.jpg', t: 'xerox', w: 5 },
  { slug: 'lake-ice-1911', title: 'File:342. C. Ice Formations on shoreline of Lake Michigan, Muskegon, Michigan, 1911 (26801547200).jpg', t: 'xerox', w: 4 },
  { slug: 'lake-in-january', title: 'File:Winter on Lake Michigan (16662112762).jpg', t: 'xerox', w: 7, cap: 'the lake in january' },
  { slug: 'petoskey-postcard', title: 'File:Greetings from Petoskey, Michigan - Large Letter Postcard (8046722768).jpg', t: 'color', w: 8 },
  { slug: 'petoskey-light', title: 'File:Petoskey Light.jpg', t: 'red', w: 4 },
];

const strip = (s = '') => s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function meta(title) {
  const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', titles: title, prop: 'imageinfo', iiprop: 'url|extmetadata|size',
    iiurlwidth: '1280', iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription',
  });
  const j = await (await fetch(api, { headers: { 'User-Agent': UA } })).json();
  const p = Object.values(j.query.pages)[0];
  if (!p.imageinfo) throw new Error('not found: ' + title);
  return p.imageinfo[0];
}

function treat(src, out, t, weight) {
  const px = weight >= 6 ? 720 : 560;
  const base = ['-auto-orient', '-resize', `${px}x${px}>`];
  if (t === 'color') {
    execFileSync('magick', [src, ...base, '-modulate', '100,88', '-strip', '-interlace', 'JPEG', '-quality', '64', out]);
    return;
  }
  const ink = t === 'red' ? RED : INK;
  execFileSync('magick', [src, ...base, '-colorspace', 'Gray', '-normalize', '-level', '18%,82%',
    '-sigmoidal-contrast', '7x50%', '-attenuate', '0.5', '+noise', 'Gaussian',
    '+level-colors', `${ink},${PAPER}`, '-strip', '-interlace', 'JPEG', '-quality', '52', out]);
}

mkdirSync('photos/src', { recursive: true });
const alts = JSON.parse(readFileSync('tools/alts.json', 'utf8'));
const manifest = [];
for (const p of PHOTOS) {
  const ii = await meta(p.title);
  const em = ii.extmetadata;
  const src = `photos/src/${p.slug}.jpg`;
  if (!existsSync(src)) {
    const url = ii.thumburl && ii.width > 1280 ? ii.thumburl : ii.url;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    writeFileSync(src, Buffer.from(await res.arrayBuffer()));
    await sleep(1200);
  }
  const file = `${p.slug}.jpg`;
  treat(src, `photos/${file}`, p.t, p.w);
  const [w, h] = execFileSync('magick', ['identify', '-format', '%w %h', `photos/${file}`]).toString().split(' ').map(Number);
  manifest.push({
    file, alt: alts[p.slug] || '', source_url: ii.descriptionurl, title: p.title.replace(/^File:/, ''),
    author: p.author || (strip(em.Artist?.value) || strip(em.Credit?.value) || 'Unknown').replace(/\s*\(\s*talk\s*\)/i, '').replace(/\(\s*(\S+)\s*\)/g, '($1)'),
    license: strip(em.LicenseShortName?.value), license_url: em.LicenseUrl?.value || '',
    treatment: p.t, weight: p.w, w, h, ...(p.cap ? { caption: p.cap } : {}),
  });
  await sleep(400);
}
// Keep the owner's own photos (license "Own photo") that were added by hand to photos/manifest.json.
let own = [];
try { own = JSON.parse(readFileSync('photos/manifest.json', 'utf8')).filter((m) => /^Own (photo|scan)$/.test(m.license)); } catch {}
manifest.unshift(...own);
writeFileSync('photos/manifest.json', JSON.stringify(manifest, null, 1) + '\n');

const md = ['# Photo credits', '',
  'Every photo on the grandroyalepizza.com wall is someone else\'s. The Wikimedia photos are public domain or Creative Commons; the ten 1976-1996 Petoskey-area yearbook and museum scans are archive scans credited to their sources (see the `Archive scan:` rows).',
  'Most were photocopied (grayscale, contrast, noise, one ink color) for the wall; that treatment is a change to the original.',
  'None of them show Grand Royale Pizza. Generated by `node tools/photos.mjs`.', '',
  '| File | Original | Author | License | Treatment |', '|---|---|---|---|---|',
  ...manifest.map((m) => `| ${m.file} | [${m.title.replace(/\|/g, '/')}](${m.source_url}) | ${m.author.replace(/\|/g, '/')} | ${m.license_url ? `[${m.license}](${m.license_url})` : m.license} | ${m.treatment} |`),
  ''];
writeFileSync('photos/ATTRIBUTION.md', md.join('\n'));
console.log(manifest.length, 'photos');
