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
7. **Credits are a receipt** at the bottom of the wall, linking every photo's source and license.
