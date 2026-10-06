// Cut a small scrap out of Cecilia's crown slice sketch for the 404 page (_why crit #1, bees-pyrm.2).
// Stand-in until Cecilia draws more: see TODO-scans.md.
// Usage: node tools/scraps.mjs   (ImageMagick 7)
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SRC = 'photos/crown-slice-sketch.jpg';   // 862x900 pencil scan
export const SCRAPS = [
  // the tip of the slice, drips and all: on 404.html only. The wall shows the sketch once and no
  // scraps of it (Pat 2026-10-06, "dont dupe photos"; bees-pyrm.6), so the dice crop is gone.
  { out: 'scraps/cecilia-tip.jpg', crop: '250x300+275+590', px: 260 },
];

mkdirSync('scraps', { recursive: true });
for (const s of SCRAPS) {
  execFileSync('magick', [SRC, '-crop', s.crop, '+repage', '-resize', `${s.px}x${s.px}>`, '-colorspace', 'Gray',
    '-strip', '-interlace', 'JPEG', '-quality', '70', s.out]);
  console.log(s.out, execFileSync('magick', ['identify', '-format', '%wx%h %b', s.out]).toString());
}
