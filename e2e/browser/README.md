# Browser tests: registration

`registration.mjs` drives the real registration UI in headless Chrome over the DevTools Protocol (`cdp.mjs`; no npm dependencies, Node 22+). It runs against a **local** backend only, and refuses deployed URLs.

## Run

1. Start the backend on a disposable database, with the SMTP sink. See `mycoursea-backend/test/live/README.md` (`smtp_sink.py` on 2525, `start-backend.mjs` on 5055).
2. Build and serve the frontend against that backend:
   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5055/api/v1 npx next build
   npx next start -p 3917
   ```
   Run a normal `npx next build` afterwards, so `.next` points at your usual API again.
3. Run `node e2e/browser/registration.mjs`. Optional settings: `BASE_URL`, `API_URL`, `MAIL_DIR`, `CHROME_PATH`.

## Labels

- **real:** the real frontend and the real local backend.
- **mocked:** the sign-up request was failed on purpose with the DevTools `Fetch` domain, before it left the browser ("Request" stage) or after the backend had answered ("Response" stage). No response bodies are faked.
- **browser:** no backend call is involved (layout, keyboard, motion, drafts, WebGL).

## Accounts and limits

Accounts are throw-away `@example.test` addresses, and passwords are never printed. Each run creates 3 accounts (plus one refused duplicate) and stays under the backend's per-IP limits: sign-up 10/min, login 5/min, forgot/reset 3/min.

## Known warning

The dashboard's Navbar and page both load XP, coins and streak, so each dashboard load sends 2 requests to each endpoint. The backend allows 3 requests per second per route. When the script opens the dashboard several times within a second, some of these requests get a 429. This is reported as a warning, not a failure.
