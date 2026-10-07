# Design notes: the bathroom wall

The spec is the `grand-royal-raw` skill in the bees repo (`.claude/skills/grand-royal-raw/`), built from reading
Grand Royal issues 1-5. The owner's brief: "i just want a bunch of cool photos like the wall in a bathroom,
polish is the enemy, it should be raw like a 90s zine" and "dont make it look like a magazine though thats too
literal". The earlier two-page magazine spread (masthead, TOC, folios) was rejected and is gone.

What the page takes from Grand Royal is its materials, not its structure:

1. **Photos are the layout.** 38 snapshots (pizza counters, dive bars, payphones, boomboxes, skaters, show
   crowds, Brooklyn, Lake Michigan, Petoskey stones) scattered by a seeded random function with overlap and
   bleed. No grid, no rows, no sections.
2. **Photocopies, one ink.** Most photos are xeroxed in black on off-white paper, four in red, six left as
   color prints (2:068). Black plus red `#d62718` on kraft `#c9a77a` (3:052, 3:140).
3. **Tape holds things up.** Masking tape, black gaffer tape (2:131, 3:140) and staples, one per item.
4. **Walls within the wall.** A sheet of one repeated sticker (2:006) and a six-frame contact strip (1:03).
5. **Lettering is images.** The name is a crowned Sancreek mark (Grand Royal Records look, screen-printed rough, rendered to PNG by tools/lettering.mjs from the vendored OFL font in tools/fonts/) and a sticker, never a header. Marker captions
   and scrawls are drawn by `tools/hand.mjs`, a single-stroke hand that redraws every letter differently.
   Stamps and label-maker tape are made in ImageMagick. Typed scraps use plain Courier.
6. **The form is an index card, taped up, on top.** Nothing may overlap it; the scatter keeps it clear.
7. **Credits are a thank-you card** at the bottom right of the wall, linking to `credits.html` (see the _why pass below).

**Ten archive photos (2026-10-05).** Ten 80s/90s Petoskey-area archive crops (Petosegan and Rayder yearbooks, a
Little Traverse Historical Society parade shot, two video-store ads) joined the wall as ordinary photos,
weights 5-7 so they mix in (three at 7 make the phone cut). Pat picked them from 123 crops ("most of these are cool,
but are too many"); the rest are held, cut and credited, on his desktop in `~/Desktop/petoskey-80s-90s/crops/`.
`archive/pick.json` is the knob. There is no infinite scroll: the wall is one wall (Pat: "get rid of infinite scroll").

## _why pass (2026-10-06)

A design crit "in the manner of" _why the lucky stiff (`CRIT.md`: 12 ranked changes, 3 don'ts) asked for a
stranger to find someone in the room, a friend asking instead of a form, and the people who taped the wall up to
admit it. What changed (bees-pyrm.2):

- **The card talks like the `PIZZA.` flyer.** "We're not open yet. Leave your number and we'll text you the first
  night we fire the oven." Label `your number`, placeholder `231 and the rest` (no fake 555 number), success
  "Got it. We'll text (number) once, when the pizza's on. No newsletter, we promise." Errors: "That's not ten
  digits. Try again, we'll wait." / "Our phone isn't plugged in yet. Come back in a day." / "Didn't go through.
  Bad signal or bad luck; try once more." The crit's "the oven's hot" became "we fire the oven" (no "hot").
- **Cecilia's slice is the resident.** On phones the first screen is the name, the slice (top-left, sized to fit,
  pointing at the card) and the card; the postcard and the names label fall below the fold. The pass first cut two
  scraps from her sketch (dice crown on the card, slice tip at the thank-you card); **Pat removed them the same day**
  ("dont dupe photos", bees-pyrm.6): the sketch appears once on the wall, pinned near the top. Only the 404 keeps the
  slice tip (`tools/scraps.mjs`), since it's a different page.
- **Numbered captions as a running joke** (3:031): twelve marker captions, numbers skipping so the reader hunts,
  from `2. victory lanes` and `3. not our pizza` to `12. this is our pizza (artist's rendering)` under the sketch,
  `19. Todd, probably` and `44. the competition`. `tools/hand.mjs` learned digits. Pat's own captions stay.
- **One surprise on tap.** The upside-down box flips 180 degrees on tap or Enter: a class swap, no transition. It
  shows on phones and is kept 140px away from the card's box.
- **The missing sticker turns up**, crooked, on the payphone.
- **A typed `MENU (not yet)` scrap**, taped low: cheese soon, pepperoni soon, the one Todd keeps talking about
  when he's ready, slices after 2am no.
- **Credits are a thank-you card** pinned bottom right, linking to `credits.html` (a typed note and one slip per
  photo, on the same wall CSS). **404.html** is part of the wall: the box in the wet grass, the slice tip looking at
  it, "nothing here. the pizza isn't either, yet." Both are written by `node build.mjs` (`tools/pages.mjs`).
- **One of each photo, every photo a Polaroid** (Pat, 2026-10-06: "dont dupe photos and bring back the polaroid
  style"; bees-pyrm.6). No file twice in the manifest and no photo twice on index.html (the six-frame contact strip
  is the one deliberate repeat: it's a strip of negatives of the wall). Every photo, color or photocopy, now sits on a
  cream `--paper` sheet with 9px top and sides and a Polaroid bottom (22px; 38px desktop / 30px phone under a marker
  caption, +17/14px per extra caption line), clean-edged, no torn clip-path. The sheet CSS hadn't changed in the
  _why pass; the photocopies had always gone bare 45% of the time. `test/once.test.mjs` pins both rules.
- **Alt text whispers** on eight photos ("... your pizza is upside down. (It is.)").
- **Weight:** everything placed below the first screen loads lazy; every image decodes async.

**Waits on scans** (`TODO-scans.md`): more pencil drawings from Cecilia (asleep, pointing at the card, holding a
phone upside down) to go where the cut scraps were, and Pat's/Todd's handwritten marginalia (CRIT #3), which stay
unwritten rather than faked; the jokes live in typed captions and alt text until then. Also not done: 600px
phone-only crops (CRIT #11, second half).

Don'ts honoured: no speech bubbles, no handwriting webfont or faux scrawl or coffee rings, no confetti, emoji or "Yay!".
- 2026-10-06 (Pat): sign-up card is a tropical pink post-it (--postit #ff7eb9, ink on pink ~8:1); inputs stay cream, button stays red, error rule is ink.
