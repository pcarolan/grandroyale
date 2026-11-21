# Sign-up backend

Two forms post to one Apps Script web app, bound to one Google Sheet ("Grand Royale SMS list"). Each form writes to its own tab:

| Form | Page | Tab | Row |
|---|---|---|---|
| SMS sign-up | homepage card | the first tab (or a tab named `sms`, if you add one) | `timestamp, phone, consent, source`, once per phone |
| Bar owner pop up sign-up (`form=lead`) | `/cook` | `leads` (made on the first sign-up) | `timestamp, lead_status` (always `New`), then one column per field, `lead_source` last. One row per sign-up |

Leads need a last name and an email; everything else is optional. A hidden `website` field is a bot trap: if it's filled, nothing is written. `lead_source` is `cook-page`, or `cook-page:<tag>` when the link carried `?src=<tag>` (e.g. a flyer's QR code: `grandroyalepizza.com/cook/?src=flyer`).

## Updating the live script (after any change to Code.gs)

1. Open the Sheet, then **Extensions > Apps Script**.
2. Replace the code with [`Code.gs`](Code.gs) and save.
3. **Deploy > Manage deployments**, pick the existing deployment, click the pencil (**Edit**), set **Version: New version**, then **Deploy**. Don't make a new deployment: the URL in `assets/config.js` must stay the same.
4. Check: sign up on `/cook` with your own email. A `leads` tab appears with your row. Sign up on the homepage too and confirm the number still lands in the first tab.

# SMS sign-up backend (first setup)

The landing page posts phone numbers to a Google Apps Script web app, which writes them to a Google Sheet. **That Sheet is the SMS list.** Later it feeds the text sender (Twilio or similar) that announces when pies are ready for pickup. Each row is `timestamp, phone, consent, source`; numbers are stored once, in E.164 (`+12315550199`).

## Deploy (about 5 minutes)

1. Create a new Google Sheet (e.g. "Grand Royale SMS list").
2. In the Sheet, open **Extensions > Apps Script**.
3. Delete the starter code, paste in [`Code.gs`](Code.gs), and save.
4. Click **Deploy > New deployment**, choose type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, then **Deploy** and approve the permissions prompt.
5. Copy the web app URL (ends in `/exec`) into `assets/config.js`:
   ```js
   window.GR_CONFIG = { FORM_ENDPOINT: "https://script.google.com/macros/s/.../exec" };
   ```
6. Commit and push to `main`. GitHub Pages republishes grandroyalepizza.com within a minute or two.

## Check it

- Open the `/exec` URL in a browser: it should return `{"ok":true,"service":"grand-royale-signup"}`.
- Sign up on the site with your own number and confirm a row appears in the Sheet. Signing up again with the same number adds no new row.

## Notes

- The browser posts with `mode: 'no-cors'` because Apps Script does not send CORS headers. The page can't read the response, so any completed request shows the success state; the Sheet is the source of truth.
- Editing `Code.gs` later requires **Deploy > Manage deployments > Edit > New version**, or the live URL keeps running the old code. Keep the same deployment so the URL in `config.js` doesn't change.
- Submitting a number is the opt-in record (the page always posts `consent=yes`; there is no checkbox). By the owner's decision (2026-09-30) the page carries no rates or opt-out fine print, so the texts themselves should carry the opt-out instructions (e.g. "Reply STOP to opt out" in the first message). Keep whatever the SMS provider registered (e.g. the A2P 10DLC campaign) in step with this.
