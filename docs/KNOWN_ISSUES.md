# Known Issues (frontend)

Status as of **2026-10-20**. Backend issues live in `mycoursea-backend/docs/KNOWN_ISSUES.md`; the production recovery steps are in `mycoursea-backend/docs/PRODUCTION_RECOVERY.md`.

## 🟥 Production sign-up and login do not work yet

Two independent problems; both must be fixed before the deployed journey can work:

1. **The deployed site is an old build.** (Backend issue 2, a separate problem, follows below.)
   - `https://gleamlearn.vercel.app` serves commit `5d879ae` (2026-10-11), the head of `origin/main`. It still has the **simulated** login (`setTimeout` → `/dashboard`).
   - `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` and `/admin/login` return 404 there. The CDN reported the page cached for about 9 days on 2026-10-20.
   - **The real authentication work is commit `dff2b87` (2026-10-13).** It is on `origin/devbranch` and on the local `main`, but **local `main` has not been pushed**, so Vercel never built it.
   - **To fix (needs approval):** push `main` (or merge `devbranch` into `main` on GitHub) so Vercel deploys it. This is only useful once backend issue 2 is fixed.
2. **The deployed backend returns 500 for every learner-account lookup:** the learner table `public.users` **does not exist** in Supabase (owner-confirmed 2026-10-20). See the backend's `docs/PRODUCTION_RECOVERY.md` (revision 2); the read-only catalog SQL is in `docs/diagnostics/users-schema-inspection.sql`.

## 🟧 Local development talks to the production backend

- `.env.local` sets `NEXT_PUBLIC_API_URL` to the **production** Render backend. So `npm run dev` signs up and logs in against production, which currently fails because of issue 2.
- That also mixes local testing with production data.
- **Recommended** (owner edits the file; it isn't changed automatically): `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`, with the local backend running against the local PostgreSQL. Keep the production URL only in Vercel's environment settings.

## 🟧 Email delivery

- The sign-up and verify screens show what the backend reports about the verification email: sent, still on its way, or couldn't be sent.
- **Production email is blocked until a domain is owned and verified in Resend** (backend `docs/EMAIL.md`). Until then, everyone except the Resend account owner sees "couldn't be sent", which is the honest state.

## 🟧 Screens that are not connected yet (2026-10-25)

- **Now honest:** `/library/upload`, `/library/processing`, `/library/generated-class/[id]` and `/learn/lesson/[id]/ai-mode` used to **simulate** success: a timed fake processing sequence, a hard-coded class, "Class regenerated successfully!", and scripted "AI" replies. They now show `FeatureUnavailable`.
- **Still static (later batches):** `/library` (its "generated class" cards are invented and lead to the honest screens above), `/ai`, `/practice`, `/exams`, `/progress`, `/history`, `/planner`, `/notifications` and the profile part of `/settings`.
- **Backend 501 `FEATURE_UNAVAILABLE`** maps to the error kind `not_implemented`. It's not transient, has no "try again", and is never auto-retried.

## Not verified

- Registration, verification, onboarding, login, logout and password reset are now browser-tested in headless Chrome against a local backend (`e2e/browser/`, 2026-10-23). Not covered: real mobile devices, screen readers, Safari, Firefox and the production deployment.

## 🟨 Dashboard loads learner stats twice

The Navbar and the dashboard page both call `loadLearnerStats()`, so each dashboard load sends 2 requests each to `/xp`, `/coins` and `/streak`. The backend allows 3 per second per route, so opening the dashboard again within a second gets some 429s, shown as "unavailable" stats. The fix is to share one query (for example, through the session provider). It isn't changed yet because it's outside the registration work.

## 🟧 Registration: backend gaps (see `docs/REGISTRATION.md` → "Backend gaps")

- **No examination-preparation `educationType`.** Exam learners are registered without one, with their exams stored in `examAimOrGoals`. The smallest fix needs no migration.
- **`GET /examinations` requires sign-in,** so the wizard can't list the real supported exams.
- **No onboarding-completed flag:** onboarding infers what's missing from profile fields.
- **No age or minors policy:** this is a product and legal decision, not invented here.
- **A password mismatch returns 409,** the same status as "already registered". The frontend tells them apart by the message.
