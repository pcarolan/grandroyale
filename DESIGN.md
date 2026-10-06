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

**The wall keeps going (2026-10-05).** Under the first wall there is more wall, and nothing says so: no "more",
no arrow, no footer. An invisible marker sits at the bottom; when you scroll near it, another strip of wall about
a screen and a half tall gets stuck up below, from the old yearbooks and clippings in `photos/archive/` (inlined by
`node build.mjs`). Same paper, same tears, same tilt and overlap, same phone rule (weight 7+), placed by the same
seeded scatter as the first wall (strip k uses seed 1993 + k, the archive reshuffled whenever it runs out), so it
never ends and never repeats the same way. Now and then a photo gets its year typed on a scrap; every third strip,
the Petoskey label or the red stamp turns up again. The first strip carries a second typed scrap, "more credits",
for the archive. Things just appear. Nothing moves.
