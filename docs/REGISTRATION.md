# Registration and Onboarding

Status **2026-10-23**. Code: `src/components/auth/registration/`, `src/lib/registration/`, `src/app/auth/signup/page.tsx`, `src/app/onboarding/page.tsx`. Tests: `src/lib/__tests__/registration.test.mjs`.

## Journey

```
/auth/signup (6-step wizard) ──POST /auth/signup (once)──> /auth/verify-email?email=&delivery= ──> /onboarding (only missing steps) ──> /dashboard
        │  draft: this tab always; this device only if opted in (7 days)       │ resend code                 │ skipped if already answered
        └─ already signed in? → "You already have an account" (verify / continue / sign out)
```

## Backend contract (verified earlier against `src/auth/dto/signup.dto.ts` and live HTTP; not re-read on 2026-10-23 because the backend folder wasn't accessible in this session)

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

**Errors:** 400 validation (mapped to fields and the first affected step); 409 "already registered"; 429 throttled (2/s, 10/min per IP).

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
| Already signed in and returning to `/auth/signup` | "You already have an account": verify the email (if unverified), continue, or sign out to create another account |
| Verification interrupted | `/auth/verify-email` can be reopened at any time. "Send a new code" uses `POST /auth/resend-verification`; the delivery state is shown honestly. |
| Onboarding interrupted | `/onboarding` reads `GET /auth/me` and shows **only the steps still missing** (`onboardingPlan`). Saving sends only the answers from the steps that were shown (`onlyShownAnswers`), so registration data is never overwritten with defaults. |

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
5. **The signup DTO doesn't restrict extra fields** (the global ValidationPipe has `whitelist: false`). The signup service destructures the body into `...onboardingData`, which it appears to spread into the new user (seen 2026-10-12; **to be confirmed** when the backend folder is accessible). The frontend sends only allowlisted fields, but the backend should strip or allowlist too (a security hardening item).

## Not verified

- **In a real browser:** no browser automation was available. The logic is unit-tested (23 tests in `registration.test.mjs`), and the build and server render were checked over HTTP. **Manual check:** complete each path on a phone-width and a desktop window, refresh mid-way, close and reopen with "Save progress" ticked, switch off the network on "Create account", then use "Check whether my account was created".
- **Live sign-up with the new optional fields** (for example the exam path without `educationType`) wasn't run today, because the backend folder wasn't accessible. The same endpoint and fields were verified live on 2026-10-20.
