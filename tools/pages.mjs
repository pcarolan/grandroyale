// The other doors in the house: credits.html (a thank-you note listing every photo) and 404.html
// (GitHub Pages serves it for any missing path). Both are written by `node build.mjs` from the manifest,
// on the same wall as index.html (_why crit #6, #7; bees-pyrm.2).
import { readFileSync } from 'node:fs';
import { rng } from './hand.mjs';

const root = new URL('../', import.meta.url);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (p) => 'data:image/jpeg;base64,' + readFileSync(new URL(p, root)).toString('base64');

// the wall: white, faint grain, copy paper, one red, Courier. Same tokens as index.html.
export const WALL_CSS = `
  :root {
    --kraft: #c9a77a;
    --wall: #ffffff;
    --paper: #f1ede3;
    --ink: #1a1a1a;
    --red: #d62718;
    --tape: rgba(238, 229, 200, .78);
    --type: "Courier New", Courier, monospace;
  }
  * { box-sizing: border-box; }
  html { overflow-x: clip; }
  body {
    margin: 0; overflow-x: clip;
    background: var(--wall) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .1 0 0 0 0 .08 0 0 0 0 .05 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E");
    color: var(--ink);
    font: 16px/1.4 var(--type);
    -webkit-text-size-adjust: 100%;
  }
  a { color: var(--ink); }
  a:focus-visible { outline: 3px solid var(--red); outline-offset: 3px; }
  .scrap { position: relative; background: var(--paper); }
  .tape { position: absolute; top: -13px; left: 50%; width: 96px; height: 26px; transform: translateX(-50%) rotate(-3deg); background: var(--tape); pointer-events: none; }
  .tape.gaffer { background: var(--ink); opacity: .93; }
`;

const page = (title, extra, css, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${extra}<meta name="theme-color" content="#ffffff">
<style>${WALL_CSS}${css}</style>
</head>
<body>
${body}
</body>
</html>
`;

// ---- credits.html: a thank-you note, then a wall of typed slips, one per photo ----
export function creditsHTML(manifest) {
  const r = rng('credits');
  const slips = manifest.map((m, i) => {
    // no rows: every slip its own width, drop, nudge and tilt
    const rot = ((r() - 0.5) * 10).toFixed(1), dy = ((r() - 0.5) * 70).toFixed(0), w = (170 + r() * 160).toFixed(0), ml = ((r() - 0.4) * 44).toFixed(0);
    const title = esc(m.title || m.file);
    const source = m.source_url ? `<a href="${esc(m.source_url)}">${title}</a>` : title;
    const license = m.license_url ? `<a href="${esc(m.license_url)}">${esc(m.license)}</a>` : esc(m.license);
    return `<li class="scrap slip" style="width:${w}px;margin-left:${ml}px;transform:translateY(${dy}px) rotate(${rot}deg)"><span class="n">${i + 1}.</span> <b>${esc(m.author)}</b><br>${source}<br>${license}<br><span class="f">${esc(m.file)}</span></li>`;
  }).join('\n');
  const css = `
  main { padding: 40px 16px 80px; }
  .note { width: min(460px, 100%); margin: 24px 0 36px 4vw; padding: 30px 24px 22px; transform: rotate(-1.5deg); border-top: 3px solid var(--red); }
  .note p { margin: 0 0 12px; font-size: 17px; font-weight: 700; }
  .note p.big { font: 900 34px/1 "Arial Black", Arial, sans-serif; margin-bottom: 16px; }
  ol { list-style: none; margin: 0; padding: 0; }
  .slip { display: inline-block; vertical-align: top; margin: 10px 14px 18px 0; padding: 12px 12px 14px; font-size: 13px; line-height: 1.4; overflow-wrap: anywhere; }
  .slip .n { color: var(--red); font-weight: 700; }
  .slip .f { font-size: 11px; opacity: .7; }
  .back { display: inline-block; margin: 40px 0 0 6vw; padding: 8px 12px; background: var(--paper); transform: rotate(1.5deg); font-weight: 700; }
  @media (max-width: 599px) { .slip { width: calc(100% - 24px) !important; margin: 10px 0 22px 8px !important; } }
`;
  const body = `<main>
<div class="scrap note">
  <i class="tape gaffer" aria-hidden="true"></i>
  <p class="big">Thank you.</p>
  <p>Almost everything on this wall is someone else's photo. Here's who, and where we found it. Most of them we photocopied, which is a change to the original; none of them show our pizza.</p>
  <p>The pencil slice is Cecilia Carolan's (crown-slice-sketch.jpg, and the tip we cut from it for the 404 page: scraps/cecilia-tip.jpg).</p>
  <p><a href="./">back to the wall</a></p>
</div>
<ol>
${slips}
</ol>
<a class="back" href="./">back to the wall</a>
</main>`;
  return page('Photo credits: Grand Royale Pizza', '<meta name="description" content="Who took the photos on the Grand Royale Pizza wall, and their licenses. Thank you.">\n', css, body);
}

// ---- 404.html: one taped Polaroid, Cecilia's slice looking at it, one typed line ----
export function notFoundHTML() {
  const css = `
  main { position: relative; min-height: 100vh; padding: 12vh 16px 60px; }
  .polaroid { width: min(340px, 70vw); margin: 0 0 0 clamp(16px, 22vw - 40px, 360px); padding: 12px 12px 54px; transform: rotate(4deg); }
  .polaroid img { display: block; width: 100%; height: auto; mix-blend-mode: multiply; }
  .tip { position: relative; display: block; width: 92px; height: auto; margin: -40px 0 0 max(4px, calc(22vw - 70px)); transform: rotate(-24deg); mix-blend-mode: multiply; }
  .line { width: min(330px, 78vw); margin: 18px 0 0 clamp(16px, 30vw - 60px, 440px); padding: 16px 18px 18px; transform: rotate(-1.5deg); font-size: 18px; font-weight: 700; }
  .line p { margin: 0 0 12px; }
`;
  const body = `<main>
<div class="scrap polaroid">
  <i class="tape gaffer" aria-hidden="true"></i>
  <img src="${inline('photos/box-in-the-grass.jpg')}" width="560" height="420" alt="Photocopy of a crushed, empty pizza box lying in wet grass. Somebody was here before you.">
</div>
<img class="tip" src="${inline('scraps/cecilia-tip.jpg')}" width="217" height="260" alt="The tip of Cecilia's pencil pizza slice, looking at the box.">
<div class="scrap line">
  <i class="tape" aria-hidden="true"></i>
  <p>nothing here. the pizza isn't either, yet.</p>
  <a href="/">back to the wall</a>
</div>
</main>`;
  return page('Nothing here: Grand Royale Pizza', '<meta name="robots" content="noindex">\n', css, body);
}

// ---- cook/index.html: the page for bar owners (GR-697). A taped flyer with the offer, and the sign-up on a
// big index card. Posts to the same Apps Script as the SMS card, with form=lead, into the Sheet's "leads" tab.
export const LEAD = {
  titles: ['Owner, CEO/President', 'Executive Chef or Chef', 'Food and Beverage (Professional or Mgr/Exec)', 'General or Operation Manager', 'Business Development', 'Marketing', 'Sales', 'Purchasing', 'Buyer', 'Distributor Manager', 'Consultant', 'Other'],
  countries: ['United States', 'Canada', 'Other'],
  states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  volumes: ['Fewer than 6 a day', '6 to 15 a day', '15 to 23 a day', 'More than 23 a day'],
  businesses: ['Hotel, Resort, Casino', 'Restaurant & Coffee Shop', 'Bar, Brewery, Nightlife', 'Big Crowd Venue, Amusement Park', 'Sport or Recreation Center', 'Student, Employee Dining', 'Convenience Store & Deli', 'Catering & Food Truck', 'Convention Center', 'Airport & Cruiseline', 'Food Manufacturer', 'Food Distributor', 'Other'],
  tasted: ['Yes', 'No'],
  heard: ['Search Engine', 'Peer Referral', 'Social Media', 'Distributor', 'Tradeshow: NRA', 'Tradeshow: Bar & Nightclub', 'Tradeshow: Canadian', 'Tradeshow: Other', 'Publication: Bar Magazine', 'TV ad: Bar Rescue Episode', 'Other'],
};

export function cookHTML() {
  const opts = (list, pick = '') => `<option value="">pick one</option>` + list.map((o) => `<option${o === pick ? ' selected' : ''}>${esc(o)}</option>`).join('');
  const text = (id, label, extra = '') => `<p class="f"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text"${extra}></p>`;
  const pick = (id, label, list, sel) => `<p class="f"><label for="${id}">${label}</label><select id="${id}" name="${id}">${opts(list, sel)}</select></p>`;
  const css = `
  [hidden] { display: none !important; }
  main { position: relative; padding: 18px 16px 90px; max-width: 1100px; }
  .name { display: block; width: min(420px, 74vw); margin: 0 0 8px -6px; transform: rotate(-5deg); }
  .name img { display: block; width: 100%; height: auto; }
  .name:focus-visible { outline: 3px solid var(--red); outline-offset: 4px; }
  .flyer { width: min(520px, 100%); margin: 26px 0 0 2vw; padding: 26px 22px 20px; transform: rotate(-1.2deg); }
  .flyer h1 { margin: 0 0 14px; font: 900 44px/0.95 "Arial Black", Arial, sans-serif; letter-spacing: -.01em; }
  .flyer p { margin: 0 0 12px; font-size: 17px; font-weight: 700; }
  .offer { width: min(480px, 100%); margin: 34px 0 0 clamp(0px, 14vw - 40px, 220px); padding: 26px 22px 18px; transform: rotate(1.4deg); border-top: 3px solid var(--red); }
  .offer h2 { margin: 0 0 12px; font: 900 30px/1 "Arial Black", Arial, sans-serif; }
  .offer h2 em { font-style: normal; color: var(--red); }
  .offer p { margin: 0 0 12px; font-size: 17px; font-weight: 700; }
  .offer ol { margin: 0 0 12px; padding-left: 26px; font-size: 17px; font-weight: 700; }
  .offer li { margin-bottom: 6px; }
  .offer .small { font-size: 14px; font-weight: 400; }
  /* the sign-up: one big index card, taped up, rules and a red line like a real one */
  #lead-card { position: relative; z-index: 10; width: min(640px, 100%); margin: 44px 0 0 clamp(0px, 4vw, 60px); padding: 30px 22px 26px; transform: rotate(-.6deg);
    background: var(--paper) repeating-linear-gradient(transparent 0 31px, rgba(31, 63, 176, .18) 31px 32px); border-top: 3px solid var(--red);
    box-shadow: -18px 16px 0 rgba(26, 26, 26, .12); }
  #lead-card h2 { margin: 0 0 6px; font: 900 28px/1 "Arial Black", Arial, sans-serif; }
  #lead-card .note { margin: 0 0 18px; font-weight: 700; }
  #lead-card fieldset { margin: 18px 0 4px; padding: 0; border: 0; }
  #lead-card legend { padding: 0; margin-bottom: 8px; font: 900 17px/1.2 "Arial Black", Arial, sans-serif; }
  .f { margin: 0 0 12px; }
  .two { display: flex; gap: 12px; }
  .two .f { flex: 1 1 0; min-width: 0; }
  .f label { display: block; margin-bottom: 3px; font-size: 14px; font-weight: 700; }
  .f label b { color: var(--red); }
  .f input, .f select { display: block; width: 100%; min-height: 46px; padding: 8px 10px; font: 700 17px/1.2 var(--type); color: var(--ink); background: #fff; border: 2px solid var(--ink); border-radius: 0; }
  .f select { appearance: none; -webkit-appearance: none; padding-right: 30px;
    background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%231a1a1a' stroke-width='2'/%3E%3C/svg%3E") right 10px center no-repeat; }
  .f input:focus, .f select:focus, #lead-card button:focus { outline: 3px solid var(--red); outline-offset: 2px; }
  .f input[aria-invalid="true"] { border-color: var(--red); border-width: 3px; }
  .trap { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  #lead-card .error { margin: 10px 0 0; padding-left: 10px; border-left: 4px solid var(--red); font-weight: 700; }
  #lead-card button { display: block; width: 100%; min-height: 58px; margin-top: 18px; padding: 10px 14px; font: 900 22px/1.1 "Arial Black", Arial, sans-serif;
    color: var(--paper); background: var(--red); border: 0; border-radius: 0; cursor: pointer; transform: rotate(.5deg); }
  #lead-card button:active { transform: rotate(.5deg) translateY(2px); }
  #lead-card button:disabled { opacity: .7; }
  #lead-card .success h2:focus { outline: none; }
  #lead-card .success p { font-size: 18px; font-weight: 700; }
  .back { display: inline-block; margin: 40px 0 0 6vw; padding: 8px 12px; background: var(--paper); transform: rotate(1.5deg); font-weight: 700; }
  @media (max-width: 599px) {
    .flyer h1 { font-size: 34px; }
    .two { display: block; }
    #lead-card { padding: 26px 14px 22px; transform: none; }
  }
`;
  const body = `<main>
<a class="name" href="/"><img src="../lettering/wordmark-grand-royale.png" width="1727" height="606" alt="Grand Royale Pizza, back to the wall"></a>

<div class="scrap flyer">
  <i class="tape gaffer" aria-hidden="true"></i>
  <h1>Your bar sells pizza now.</h1>
  <p>We make frozen pizza in northern Michigan for bars with no kitchen. We loan you the oven and the freezer, and teach your staff. Your bartender bakes a pie in minutes. No kitchen, no cook.</p>
  <p>You sell pies to the room, and frozen pies to go.</p>
</div>

<div class="scrap offer">
  <i class="tape" aria-hidden="true"></i>
  <h2>First, a free <em>pop up.</em></h2>
  <ol>
    <li>Pick a night you're open.</li>
    <li>We bring the oven and the pies, bake them at your bar and hand them out to your crowd.</li>
    <li>You watch what happens to the room.</li>
    <li>You keep one sheet of paper: what a pie costs you, what to charge for it, and what a night like that would make you.</li>
  </ol>
  <p class="small">The pop up costs you nothing. Northern Michigan bars for now, Petoskey first.</p>
</div>

<div class="scrap" id="lead-card">
  <i class="tape gaffer" aria-hidden="true"></i>
  <form id="lead" novalidate>
    <h2>Book a pop up</h2>
    <p class="note">Leave your name and email. We'll get in touch to pick a night. Everything past that is optional, but it helps.</p>
    <p class="trap" aria-hidden="true"><label for="website">Leave this empty</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></p>
    <input type="hidden" id="lead_source" name="lead_source" value="cook-page">
    <div class="two">
      ${text('first_name', 'First name', ' autocomplete="given-name"')}
      ${text('last_name', 'Last name <b>*</b>', ' autocomplete="family-name" required aria-required="true" aria-describedby="lead-error"')}
    </div>
    <p class="f"><label for="email">Email <b>*</b></label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" required aria-required="true" aria-describedby="lead-error"></p>
    <p class="f"><label for="phone">Phone number</label><input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="231 and the rest" aria-describedby="lead-error"></p>
    ${pick('title', 'Title', LEAD.titles)}

    <fieldset>
      <legend>The bar</legend>
      ${text('company', 'Company name', ' autocomplete="organization"')}
      ${text('address', 'Business address', ' autocomplete="address-line1"')}
      ${text('suite', 'Building / suite', ' autocomplete="address-line2"')}
      <div class="two">
        ${text('city', 'City', ' autocomplete="address-level2"')}
        ${text('zip', 'Postal / zip code', ' autocomplete="postal-code"')}
      </div>
      <div class="two">
        ${pick('state', 'State / region / province', LEAD.states)}
        ${pick('country', 'Country', LEAD.countries, 'United States')}
      </div>
      ${pick('business_type', 'Type of food business', LEAD.businesses)}
      ${pick('pizzas_per_day', 'How many pizzas could you sell?', LEAD.volumes)}
      ${text('distributor', 'Your current food distributor')}
    </fieldset>

    <fieldset>
      <legend>And</legend>
      ${pick('tasted', 'Have you tasted our pizza?', LEAD.tasted)}
      ${pick('heard', 'How did you hear about us?', LEAD.heard)}
    </fieldset>

    <p class="error" id="lead-error" role="alert" hidden></p>
    <button type="submit">Book my pop up</button>
  </form>
  <div class="success" id="lead-success" hidden>
    <h2 tabindex="-1">Got it.</h2>
    <p>We'll email <strong id="lead-email"></strong> to pick a night for the pop up.</p>
  </div>
</div>

<a class="back" href="/">back to the wall</a>
</main>
<script src="../assets/config.js"></script>
<script type="module" src="../assets/lead.js"></script>`;
  const desc = 'Grand Royale Pizza for bars in northern Michigan: we loan the oven, you sell the pizza. Book a free pop up at your bar.';
  const head = `<meta name="description" content="${desc}">
<link rel="canonical" href="https://grandroyalepizza.com/cook/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Grand Royale Pizza">
<meta property="og:url" content="https://grandroyalepizza.com/cook/">
<meta property="og:title" content="A free pizza pop up at your bar">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://grandroyalepizza.com/lettering/wordmark-grand-royale.png">
`;
  return page('A free pop up at your bar: Grand Royale Pizza', head, css, body);
}
