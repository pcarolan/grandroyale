// Cut small secondary scraps out of Cecilia's crown slice sketch so the slice can turn up near
// what it's about (_why crit #1, bees-pyrm.2). Stand-ins until Cecilia draws more: see TODO-scans.md.
// Usage: node tools/scraps.mjs   (ImageMagick 7)
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SRC = 'photos/crown-slice-sketch.jpg';   // 862x900 pencil scan
export const SCRAPS = [
  // the three dice on the crown, no slice: sits by the sign-up card
  { out: 'scraps/cecilia-dice.jpg', crop: '620x265+95+15', px: 420 },
  // the tip of the slice, drips and all: sits by the thank-you card
  { out: 'scraps/cecilia-tip.jpg', crop: '250x300+275+590', px: 260 },
];

mkdirSync('scraps', { recursive: true });
for (const s of SCRAPS) {
  execFileSync('magick', [SRC, '-crop', s.crop, '+repage', '-resize', `${s.px}x${s.px}>`, '-colorspace', 'Gray',
    '-strip', '-interlace', 'JPEG', '-quality', '70', s.out]);
  console.log(s.out, execFileSync('magick', ['identify', '-format', '%wx%h %b', s.out]).toString());
}
