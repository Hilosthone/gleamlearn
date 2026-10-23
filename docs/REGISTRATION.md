# Registration and Onboarding

Status **2026-10-23**. Code: `src/components/auth/registration/`, `src/lib/registration/`, `src/app/auth/signup/page.tsx`, `src/app/onboarding/page.tsx`. Tests: `src/lib/__tests__/registration.test.mjs`.

## Journey

```
/auth/signup (6-step wizard) ──POST /auth/signup (once)──> /auth/verify-email?email=&delivery= ──> /onboarding (only missing steps) ──> /dashboard
        │  draft: this tab always; this device only if opted in (7 days)       │ resend code                 │ skipped if already answered
        └─ already signed in? → "You already have an account" (verify / continue / sign out)
```

## Backend contract (re-verified 2026-10-23 against `src/auth/dto/signup.dto.ts` and `AuthService.signup` in `src/auth/auth.service.ts`, and by browser runs against a local backend)

| Field | Rule | Sent for |
|---|---|---|
| `fullName`, `username`, `email`, `password`, `confirmPassword` | Required. `email` must be a valid email; `password` at least 6 characters; the confirmation must match. Column limits: name 150, username 100, email 255. | All paths |
| `dateOfBirth`, `country` | Optional strings | All paths, only when entered |
| `educationType` | Optional string; documented values `'Secondary'` and `'University'` | Secondary → `Secondary`; University → `University`; **Exam → not sent** |
| `secondarySchool`, `secondaryClass`, `secondaryStream` | Optional | Secondary only |
| `university`, `faculty`, `department`, `courseOfStudy`, `level` | Optional | University only |
| `examAimOrGoals` | Optional string | Goals (all paths) plus exams, timeframe and subjects (exam path), composed into one line |
| `preferredStudyTime` | Optional | All paths, only when chosen |

**Response:** `201 { accessToken, verificationEmail: 'sent'|'pending'|'failed', data }`. The learner is signed in (the token is stored), but the email isn't verified yet.

**Errors:**
- 400: validation errors, mapped to fields and the first affected step.
- 409 "Email or username is already registered".
- **409 "Passwords do not match":** the backend uses the same status for a confirmation mismatch. The wizard tells the two apart by the message, and shows the mismatch as a field error on the security step.
- 429: throttled (2/s, 10/min per IP).

The backend copies each accepted field into the new user explicitly, so unknown body fields are ignored.

**Options:** `GET /academic-levels` is public and provides the class, level and stream lists. If it fails, the fields become free text. The examination list (`GET /examinations`) **requires sign-in**, so it can't be used during registration. The exam step offers the examples WAEC, NECO, JAMB/UTME and Post-UTME, plus free entry.

## Three paths

| Path | Required by the wizard (product rules) | Optional |
|---|---|---|
| Secondary school | Current class | School, stream |
| University | University or institution | Faculty, department, course, level |
| Exam preparation | At least one examination | Timeframe, subjects |

Every path also has an optional goals and study-time step.

- **Switching path** keeps the values typed for the other path in memory, so switching back restores them. They are **never sent**: `buildSignupPayload` builds an explicit object for the selected path only, and drops empty optional fields.

## Saving and resuming

- **This tab:** progress (non-secret fields only) is kept in `sessionStorage`, so a refresh doesn't lose it.
- **This device:** only if the learner ticks "Save progress on this device". The draft goes to `localStorage` for 7 days, with an on-screen notice that their name, email and study details are stored on the device. Unticking removes the device copy immediately.
- **Never stored:** password, password confirmation, tokens, codes. Terms consent is re-confirmed on return.
- **On return:** "Continue registration" (back to the saved step, never "Review"; values are re-validated) or "Start over" (deletes the draft). Expired drafts and drafts from a newer app version are discarded, with a short explanation. Malformed drafts are discarded silently. A draft is never submitted automatically.
- **After a successful sign-up** the draft is deleted.

## Interruptions

| Situation | Behaviour |
|---|---|
| Double click or Enter while submitting | Ignored. A single in-flight guard means one request. |
| 400 | Field errors shown, and the wizard jumps to the first affected step |
| 409 | "Already registered": sign in, or use a different email and username |
| Network lost or timeout during sign-up | **Outcome unknown.** No automatic retry. "Check whether my account was created" signs in with the same credentials (existing `POST /auth/login`). Success means the account exists, and the learner continues to verification. 401 means it wasn't created, and creating it now is safe (a duplicate would get 409 anyway). Still offline: a message to try again. |
| Already signed in and returning to `/auth/signup` | While the stored session is checked (`GET /auth/me`), "Checking your account…" is shown instead of the form. Then "You already have an account": verify the email (if unverified), continue, or sign out to create another account. An expired session shows the form. |
| Browser Back / Forward | Back moves to the previous step, including from step 2 back to step 1 (which has no URL hash). Forward is allowed only when every step before the target is valid; otherwise the address is put back to the current step. |
| Verification interrupted | `/auth/verify-email` can be reopened at any time. "Send a new code" uses `POST /auth/resend-verification`; the delivery state is shown honestly. |
| Onboarding interrupted | `/onboarding` reads `GET /auth/me` and shows **only the steps still missing** (`onboardingPlan`). Until that answer arrives, it shows "Loading your profile…", so a slow backend never shows steps that were already answered. If the request fails, all steps are shown. Saving sends only the answers from the steps that were shown (`onlyShownAnswers`), so registration data is never overwritten with defaults. |

## Visual design and 3D

- **Colours:** existing tokens, plus `--color-brand-gold` and `--color-brand-brown` (new, additive). Gold marks selected states and the current step.
- **3D:** `RegistrationScene3D` draws one primitive per path (icosahedron, torus knot, octahedron), with no textures or models.
  - It loads only on screens 1024 px or wider with WebGL, via `next/dynamic` with `ssr: false`. **Verified:** the initial `/auth/signup` bundle (13 chunks, about 800 KB) contains no three.js.
  - It ignores pointer events and is `aria-hidden`. It pauses while the tab is hidden, and draws a single static frame when reduced motion is preferred.
  - If WebGL is unavailable or the context is lost, a static gradient is shown instead.
- **Motion:** step changes use Framer Motion (already installed), lasting 180 ms. They're disabled when reduced motion is preferred.

## Accessibility

- Every field has a label. Errors are linked to their field with `aria-invalid`/`aria-describedby` (the shared `Input` now does this).
- An error count is announced on validation. Focus moves to the step heading on each step change, and to the first invalid field on error.
- The progress bar has text for screen readers.
- The password visibility toggle has a label and `aria-pressed`.
- Browser Back moves to the previous step (never forward past validation).

## Backend gaps (need approval; not changed)

1. **There's no examination-preparation category.**
   - Exam learners are sent without `educationType`, so they aren't misclassified. Their exams are stored only inside the free-text `examAimOrGoals`.
   - **Smallest backward-compatible fix:** in `SignupDto` and `UpdateAcademicProfileDto`, allow `educationType ∈ {'Secondary','University','Exam Preparation'}` with `@IsIn` (today it's only `@IsString`). The column is already a plain `varchar`, so **no migration** is needed. Update the Swagger enum and add DTO tests.
   - **Optional, needs a migration:** structured `targetExams` (`jsonb`), `examTimeframe` and `subjects` columns, if exam data should be queryable.
2. **The examination list isn't public.** `GET /examinations` sits behind JWT. A public read-only list (or making that GET public) would let the wizard offer the real supported exams.
3. **There's no "onboarding completed" flag.** Completion is inferred from profile fields.
4. **Age and minors policy:** date of birth is optional, and no age rule exists in the backend or the product. Don't invent one; it needs a product and legal decision (parental consent for under-13s or under-16s, for example).
5. ~~Extra sign-up fields~~ **Resolved (verified 2026-10-23):** `AuthService.signup` builds the new user field by field, so unknown fields are ignored. Optional hardening: the global ValidationPipe still has `whitelist: false`.
6. **A password mismatch returns 409** (the same status as "already registered"). The frontend handles it by message. A 400 would be cleaner, but changing it is a backend change that needs approval.

## Browser verification (2026-10-23)

`e2e/browser/registration.mjs` drives headless Chrome against a local backend on a disposable database. See `e2e/browser/README.md`. Result: **23/23 passed, plus 1 warning.** Labels: real = real frontend plus local backend; mocked = the request was failed on purpose in the browser; browser = no backend involved.

- **Layout (browser):**
  - At 360 px there's no horizontal overflow and no canvas.
  - At 1280 px the 3D canvas loads lazily.
  - With WebGL disabled, the static fallback is shown and the wizard still works.
- **Keyboard and motion (browser):**
  - Radios work with Space and the arrow keys, and Enter submits.
  - Focus moves to the step heading, or to the first invalid field (with `aria-invalid` and `aria-describedby`).
  - With reduced motion, step changes take about 20 ms instead of about 390 ms.
- **Drafts (browser):**
  - By default the draft is kept only in this tab, survives a reload and isn't visible to a new tab.
  - "Save progress on this device" makes it available to a new tab. Unticking deletes the device copy, and "Start over" deletes everything.
  - Expired and malformed drafts are discarded.
  - The password is never stored, and `termsAccepted` is always `false`.
- **Three paths (real):** each payload contains only its path's fields, even after switching paths:
  - Secondary sends `educationType: 'Secondary'` plus school and class.
  - University sends `'University'` plus its fields, with no secondary fields.
  - Exam sends no `educationType` and no university fields; exams, timeframe, subjects and goals go into `examAimOrGoals`.
  - Empty optional fields are omitted. A triple click sends exactly one request.
- **Failures (mocked):**
  - Request failed before reaching the backend: "outcome unknown" banner, no automatic retry. The check (real login, 401) reports "not created", and the second attempt creates the account.
  - Response lost after the account was created: the check (real login) finds the account, the learner continues to verification, and **no second sign-up is sent**.
- **Accounts (real):**
  - 409 duplicate gives "Account already exists".
  - A signed-in learner on `/auth/signup` gets the account panel.
- **Verification and onboarding (real):**
  - The email code from the SMTP sink verifies the account, then onboarding starts.
  - Onboarding shows only the missing steps: 2 for the secondary and exam learners, 4 for the university learner who skipped study time and goal.
  - Finishing goes to `/dashboard`.
- **Session (real):**
  - Log Out clears the session.
  - Logging in returns to `/dashboard`.
  - Forgot password, then the emailed code, then reset, then logging in with the new password all work.
- **Console (browser):** no unexpected errors or exceptions.
- **Warning:** 429s on `/xp`, `/coins`, `/streak` and `/notifications` when the dashboard is opened several times within a second. The Navbar and the page both load the stats, so each dashboard load sends 2 requests to each endpoint, and the limit is 3 per second per route.

**Defects found by these runs and fixed:**
- Browser Back from step 2 did nothing.
- The dashboard Sidebar's "Log Out" left the session token in place.
- Onboarding briefly showed all 6 steps before the profile loaded.
- A signed-in learner briefly saw the empty form.

**Still not verified:**
- Real mobile devices and screen readers (only headless Chrome emulation was used).
- Safari and Firefox.
- The production deployment.
