# Known Issues (frontend)

Status as of **2026-10-20**. Backend issues live in `mycoursea-backend/docs/KNOWN_ISSUES.md`; the production recovery steps are in `mycoursea-backend/docs/PRODUCTION_RECOVERY.md`.

## 🟥 Production sign-up and login do not work yet

Two independent problems; both must be fixed before the deployed journey can work:

1. **The deployed site is an old build.** (Backend issue 2, a separate problem, follows below.)
   - `https://gleamlearn.vercel.app` serves commit `5d879ae` (2026-10-11), the head of `origin/main`. It still has the **simulated** login (`setTimeout` → `/dashboard`).
   - `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` and `/admin/login` return 404 there. The CDN reported the page cached for about 9 days on 2026-10-20.
   - **The real authentication work is commit `dff2b87` (2026-10-13).** It is on `origin/devbranch` and on the local `main`, but **local `main` has not been pushed**, so Vercel never built it.
   - **To fix (needs approval):** push `main` (or merge `devbranch` into `main` on GitHub) so Vercel deploys it. This is only useful once backend issue 2 is fixed.
2. **The deployed backend returns 500 for every learner-account lookup.** Its `public.users` table in Supabase doesn't match the code. See the backend's `docs/PRODUCTION_RECOVERY.md`; the read-only SQL is in `docs/diagnostics/users-schema-inspection.sql`.

## 🟧 Local development talks to the production backend

- `.env.local` sets `NEXT_PUBLIC_API_URL` to the **production** Render backend. So `npm run dev` signs up and logs in against production, which currently fails because of issue 2.
- That also mixes local testing with production data.
- **Recommended** (owner edits the file; it isn't changed automatically): `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`, with the local backend running against the local PostgreSQL. Keep the production URL only in Vercel's environment settings.

## 🟧 Email delivery

- The sign-up and verify screens now show what the backend reports about the verification email: sent, still on its way, or couldn't be sent.
- If production SMTP is blocked, learners will see "could not send" instead of a false "we sent you a code". Fixing delivery itself is a backend and hosting decision.

## Not verified

- Browser-level end-to-end runs: no browser automation was available. The flows are verified at the module and HTTP level against a running local backend; see `TESTING` in the backend `test/live/README.md`.
