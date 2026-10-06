# Scans the wall is waiting for

The _why pass (CRIT.md, 2026-10-06) wants real hands on the wall. No new scans existed, so the stand-ins below
use what we had: two scraps cut from Cecilia's one sketch, and typed Courier where a pencil note should be.
Nothing here is faked handwriting. When a scan arrives, swap it in and delete its line.

**How to scan:** pencil or black marker on plain white paper, 600 dpi, grayscale, flat light, no shadow.
Send the whole sheet; we crop. One person per scrap (no mixing hands on one sheet).

## From Cecilia (pencil, the resident; CRIT #1)

| Drawing | Size on paper | Replaces / goes | Where on the wall |
|---|---|---|---|
| - the slice asleep (eyes shut, crown slipping) | about 3 x 3 in | new scrap | low on the wall, near the `MENU (not yet)` scrap |
| - the slice pointing at something, arm out | about 3 x 4 in | replaces `scraps/cecilia-dice.jpg` | on the sign-up card's top edge (`data-near="card"`); on phones top-left, pointing down at the card |
| - the slice holding a phone upside down | about 3 x 4 in | replaces `scraps/cecilia-tip.jpg` | beside the thank-you card, bottom right; also on 404.html next to the box |
| - a small slice, any pose, for the 404 | about 2 x 2 in | new | 404.html, looking at the box in the grass |

## From Pat or Todd (pencil or sharpie marginalia; CRIT #3)

Short asides, one per scrap of paper (an index card cut in thirds is perfect), in your own writing.
They get taped onto the photo they talk about. Today these jokes live in typed captions and alt text.

| Note (write it however you'd say it) | Who | Size | Taped to |
|---|---|---|---|
| - "found 2019" with an arrow | whoever found it | about 2 x 1 in | `petoskey-stone.jpg` |
| - "not our oven (yet)" | Todd | about 3 x 1 in | `slice-paper-plate.jpg` or `two-slices.jpg` |
| - "this one's Todd's dad" (only if it's true; otherwise skip) | Pat | about 3 x 1 in | one of the 1980 Petosegan yearbook crops |
| - "yes. soon." | Pat or Todd | about 2 x 1 in | under `1980_petosegan_mock-elections_01-2.jpg` ("Won't You Be Mine?"), near the card |
| - "we'll take this booth" | Pat | about 3 x 1 in | `victory-lanes.jpg` |
| - "Todd, probably" in Todd's own hand (replaces caption 19) | Todd | about 3 x 1 in | `1980_petosegan_dance-candids_01-1.jpg` |
| - the MENU (not yet) scrap, rewritten by hand | Todd | half a sheet | replaces the typed `.menu` scrap in index.html |

## Swapping one in

1. Save the scan to `scraps/<name>.jpg` (grayscale, longest side 600px, under 60 KB:
   `magick in.jpg -colorspace Gray -resize 600x600 -strip -quality 70 scraps/<name>.jpg`).
2. Point the `<img>` in `index.html` (or `tools/pages.mjs` for 404/credits) at it.
3. Add it to the Cecilia line in `tools/pages.mjs` credits, `node build.mjs`, `npm test`.
