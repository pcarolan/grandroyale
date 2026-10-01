# SMS sign-up backend

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
- The consent text on the page is the opt-in record for the sender. Don't change it without updating whatever the SMS provider registered (e.g. the A2P 10DLC campaign).
