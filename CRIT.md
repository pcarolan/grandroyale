# grandroyalepizza.com: a crit in the manner of _why

*A crit written "in the manner of" _why the lucky stiff (the Poignant Guide, Shoes, Hackety Hack, "The Little Coder's Predicament"). Not him; a borrowed hat. He is not making any of these claims.*

---

## What I'd tape to my own wall

- **The Petoskey stone on a paper towel.** A fossil on a napkin, labelled `petoskey stone` in marker like a kid's rock collection. Best caption on the site because it says nothing.
- **"Won't You Be Mine?"**: two 1980 seniors holding a hand-lettered sign, xeroxed red. It's the ask of the whole page and nobody planned that. Keep it near the card.
- **The sombrero boys with the stuffed bull, the cowboy-hat disco kid, the Burger King letter jackets.** Ten yearbook crops of *your town* unguarded. Everyone else bought their nostalgia; yours smells like a gym.
- **The sheet of red stickers with one peeled off.** Walls within walls. The missing one is the joke and it lands.
- **The Showbiz Video Club ad and the C. Joy's Arcade clipping**, free slush puppies, "next to Walenta's." Found paper, whole. Not a texture of raw; the actual receipt.
- **The tape.** One strip per thing, nothing taped that doesn't need holding. Restraint on a loud wall is tenderness.
- **Cecilia's slice.** Pencil pizza, dice crown, drips, signed. The only thing a *hand* made for *this* place. Also the whole problem; see below.

## Where it loses me

**The first three seconds on a phone.** Red wordmark, a postcard, a label-maker strip with two men's names, then an index card: *Send us your number and we'll let you know when we're cooking our next batch.* That's a form that learned to talk. No one who makes pizza says "our next batch" to a friend; it's a brewery newsletter. At the bottom of the page someone wrote `PIZZA.` with a period. *That* person should write the card.

**There is no character.** I had foxes, and a cat with an attitude, and an elephant who interrupted. Not because mascots sell; because a stranger needs *someone* in the room. The wall is 52 beautiful photographs and nobody's home. Cecilia's slice is the exception, and it hangs *once*, a photo among photos, empty caption, weight 7; on a phone it's two-thirds down, after Burger King. You have a fox. You hung it in the back hallway.

**The hand that made it is invisible.** The marker captions (`royale with cheese`, `wash your hands`, `call us (no)`) are deadpan and good, but a script draws them. A convincing handwriting robot is still a robot. One real pencil line on the whole site, and it's a child's. The wall says "many hands over many years"; the source says `tools/hand.mjs`.

**Is it funny on purpose?** Twice: `call us (no)` and `wash your hands`. The upside-down box has its joke *in the photo* and no one points. The missing sticker is a setup with no punchline (where did it go?). Forty-eight photos are mute.

**The sign-up is a form, not a friend.** Placeholder `(231) 555-0199`, the fictional exchange: a tiny lie on a wall of true things. Button `Text me when the pizza's on` is the best line; keep it. Success: `You're on the list`. A *list*. Error: `Enter a 10-digit US number`. Terms of Service talking.

**After you scroll:** more wall, `PIZZA. / Petoskey, MI / COMING SOON`, tear-tabs, and a 12px `photo credits` in the corner like a legal footnote. It links to `photos/ATTRIBUTION.md`, served raw: no page, no way back. The most generous thing on the site (fifty people's photos, every license named), hidden like a shame.

**Weight.** 52 JPEGs, 2.3 MB, no `loading="lazy"`. A 90s zine was *cheap*; this is a magazine's download on bar Wi-Fi.

**Alt text.** Dutiful museum placards. Alt is the one place the author gets to whisper to a reader who can't see. Where's the whisper?

**The 404.** None. Misspell anything and GitHub's grey Octocat appears. Your bathroom wall ends at a corporate stairwell.

## Ranked changes

1. **Make Cecilia's slice the resident.** Two or three more pencil drawings from her (asleep; pointing at the card; holding a phone upside down), placed *near what they're about*, one at the top on phones.
   *Why:* every page needs someone in it; a kid's slice beats any grown-up logo.
   *Rules:* scanned pencil PNG, black ink, one hand; no vector, no webfont. Fully inside grand-royal-raw.

2. **Rewrite the card in the voice of `PIZZA.`**
   Lede: **"We're not open yet. Leave your number and we'll text you the first night the oven's hot."**
   Label: **"your number"**. Placeholder: **"231 and the rest"** (no fake number).
   Button: **"Text me when the pizza's on"** (unchanged).
   Success: **"Got it. We'll text (231) 555-0199 once, when the pizza's on. No newsletter, we promise."**
   Phone error: **"That's not ten digits. Try again, we'll wait."** Offline: **"Our phone isn't plugged in yet. Come back in a day."** Network: **"Didn't go through. Bad signal or bad luck; try once more."**
   *Why:* a friend asking, not an intake form.
   *Rules:* rule 10 (deadpan, few words). Inside.

3. **Real pencil marginalia, scanned.** Five or six scraps in Pat's or Todd's handwriting ("this one's Todd's dad", "not our oven (yet)", an arrow at the stone: "found 2019"), taped to the photos they annotate.
   *Why:* the hand becomes visible; generator becomes diary.
   *Rules:* lettering-as-image, one ink. Inside. Bends `tools/hand.mjs`'s role: keep it for bulk captions, but the asides must be scanned.

4. **Numbered captions as a running joke.** Give a dozen photos Grand Royal-style numbers and deadpan lines: `3. not our pizza`, `7. also not our pizza`, `12. this is our pizza (artist's rendering)` under Cecilia's slice, `19. Todd, probably`.
   *Why:* a sequence makes the reader hunt; story without plot.
   *Rules:* skill cites 3:031 directly. Inside.

5. **One surprise on tap.** Tap the upside-down box and the photo flips 180 degrees (state swap, no animation).
   *Why:* delight happens *once*, to *you*. Chunky bacon was a surprise, not a slogan.
   *Rules:* rule 12 allows press feedback; a state swap with no transition is within "nearly none." Flag: must not steal a tap meant for the card.

6. **Credits as a thank-you note.** Replace the floating `photo credits` with a torn index card taped at the bottom: *"Everything on this wall is someone else's photo. Thank you. Here's who: →"* linking to a credits **page** (`credits.html`) that is itself a wall of fifty names in Courier, with a link back.
   *Why:* gratitude is the most punk thing on the internet; a raw `.md` wastes it.
   *Rules:* typed scrap, inside rule 10.

7. **A 404 that's part of the wall.** `404.html`: white wall, one taped Polaroid (the crushed box in wet grass), Cecilia's slice looking at it, pencil note: *"nothing here. the pizza isn't either, yet."* Link: `back to the wall`.
   *Why:* every door in the house should look like the house.
   *Rules:* the skill explicitly lists 404 as in scope. Inside.

8. **A plain-text "menu that doesn't exist yet."** A typed scrap, Courier, taped low: `MENU (not yet)` / `cheese ..... soon` / `pepperoni ..... soon` / `the one Todd keeps talking about ..... when he's ready` / `slices after 2am ..... no`.
   *Why:* a menu with no prices is a joke and a vow at once.
   *Rules:* typed scrap, deadpan; the skill's own "NO SLICES AFTER 2AM" stamp idea. Inside.

9. **Mobile first screen: wordmark, Cecilia, card.** Drop the postcard and the names label below the fold at 390px; put the slice at top-left pointing at the card.
   *Why:* three seconds should answer "who's here?" before "who owns it?"
   *Rules:* rule 11 (same wall, fewer things). Inside.

10. **Alt text as whispers.** Keep the description, add the aside: *"Photocopy of a pizza box lid printed: if you are reading this your pizza is upside down. (It is.)"*; *"A polished Petoskey stone on a paper towel. It's a 350-million-year-old coral and it's sitting on a napkin."*
    *Why:* a blind reader deserves the joke too.
    *Rules:* no visual impact. Inside.

11. **`loading="lazy"` on every photo below the first screen and `decoding="async"`.** Resize phone-only crops to 600px.
    *Why:* cheap is a courtesy to bar Wi-Fi.
    *Rules:* invisible. Inside.

12. **Let the missing sticker turn up.** Place it once, physically, on another photo (the payphone), slightly crooked.
    *Why:* the reader who finds it owns the wall a little.
    *Rules:* one more sticker image, same red. Inside.

## Three things not to do

1. **No speech bubbles.** The moment the slice "says hi!" it's a Mailchimp monkey. It's silent and dignified; that's why it works.
2. **No handwriting webfont, no faux-coffee-ring, no "scrawled" CSS.** Pencil is pencil or it's a lie. If there isn't a scan, use Courier.
3. **No confetti, no "Yay!", no emoji in the success state.** Pizza is enough of a reward. Say "Got it" and be quiet.

## Closing

What I wanted a beginner to feel opening the Guide: *someone made this for me, by hand, and they were having a good time.* Your wall has the hand (one, small, pencil) and the good time (fifty photos of a town with its hair down). It hasn't introduced them. Put the kid's drawing at the door. Let the people who taped the photos up admit, in their own writing, that they did it. Then a phone number won't be a form; it'll be two kids holding *Won't You Be Mine?* and the answer, in pencil: `yes. soon.`

Chunky bacon.
