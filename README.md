# Grand Royale Pizza

Website for Grand Royale Pizza (Todd Webb + Pat Carolan). Static site served by GitHub Pages at https://grandroyalepizza.com.

Project notes live in the bees wiki: `wiki/concepts/grand-royale-pizza.md` (epic bees-vo70).

## The wall

The landing page is a bathroom wall of photos and scraps (see `DESIGN.md`). Nothing is laid out by hand:
`index.html` scatters every photo and scrap from `photos/manifest.json` with a seeded random function, so the
wall is the same on every load and changes when photos are added. The sign-up card is the one fixed thing and
nothing is allowed to overlap it.

| Path | What |
|---|---|
| `index.html` | The page, its CSS and the scatter script. |
| `photos/*.jpg` | The photos, already photocopied. |
| `photos/manifest.json` | One entry per photo: file, alt, source_url, author, license, treatment, weight (1-10; 7+ also shows on phones), size, optional marker caption. |
| `photos/ATTRIBUTION.md` | Credits and licenses for every photo. |
| `lettering/` | Lettering as images: stencil, stamps, label-maker tape, marker scrawls, sticker. |
| `assets/` | Sign-up form: `config.js` (endpoint), `signup.js`, `phone.js`. |

## Changing photos

```bash
node tools/photos.mjs     # fetch from Wikimedia Commons + license metadata, photocopy them, write manifest + ATTRIBUTION
node tools/lettering.mjs  # redraw lettering (marker captions come from the manifest's "caption")
node build.mjs            # inline photos/manifest.json into index.html
npm test
```

Edit the `PHOTOS` list in `tools/photos.mjs` (Commons file title, treatment `xerox`/`red`/`color`, weight,
optional caption) and the alt text in `tools/alts.json`. Only public domain, CC0, CC BY and CC BY-SA images.
Originals are cached in `photos/src/` (gitignored). Needs ImageMagick 7 and `rsvg-convert`.

`build.mjs` exists because the page reads its manifest from an inline
`<script type="application/json" id="manifest">`, so it renders from `file://` (headless screenshots) as well as
over HTTP. `fetch('photos/manifest.json')` is only the fallback. `npm test` fails if the inline copy is stale.

## Adding your own photos

```
node tools/own.mjs <image> <slug> color|xerox|red <weight 3-9> "<alt text>" "<title>"
node build.mjs
```

The entry goes to the top of `photos/manifest.json` with license `Own photo`; `tools/photos.mjs` keeps own entries when it regenerates the Wikimedia set.
