# Frontend ↔ Backend Integration Audit

**Repositories:** frontend `gleamlearn-landing` (Next.js 16.3.5), backend `mycoursea-backend` (NestJS 12), AI service `gleamlearn-ai-service` (FastAPI → NVIDIA NIM).
**Audit date:** 2026-10-12 (Phase 1), **updated after Phase 2** (learner authentication) **and Phase 3** (learning experience). Re-audit after every phase.

## How statuses are assigned

| Status | Meaning |
|---|---|
| **LIVE-INTEGRATED** | The page calls the real backend, and the exact frontend client code it uses was exercised against a **running** backend (see [Evidence](#evidence-live-runs)). Browser rendering is checked by `next build` only, not by browser automation. |
| **PARTIALLY INTEGRATED** | Some of the page's data or actions are real and verified; the rest is not. |
| **MOCK/DEMO** | The page renders built-in data or simulates the action (`setTimeout`, hard-coded arrays). Nothing is sent to the backend. |
| **NOT CONNECTED** | A placeholder page that says it isn't connected, usually with the verified reason. |
| **BLOCKED** | It can't work yet because a prerequisite is missing (the usual one is real learner sign-in). |
| **STATIC** | Marketing, legal or help content with no data needs. |

Matching endpoint names or passing mocked unit tests is **not** enough for LIVE-INTEGRATED.

## Headline findings

1. **The learning experience is real (Phase 3):** dashboard, Learning Hub, course and lesson pages, and the navbar stats. **Still demo (Phase 4 and later):** the practice, exam, library, AI, planner, progress and history pages render hard-coded data. **Since Phase 2 they are behind a real sign-in gate:** `LearnerSessionProvider` in `src/app/(dashboard)/layout.tsx` confirms the session with `GET /auth/me` before anything renders.
2. **Learner authentication is real (Phase 2).** Sign-up → verify email → sign-in → session gate → sign-out, plus onboarding and account state (freeze, unfreeze, delete), all use the backend. They were verified live with the real modules (`test/live/learner-session.mjs`, 29 checks). The navbar shows the signed-in learner, not hard-coded sample identity.
3. **`src/lib/api.ts` defines a complete learner client** (316 calls; all match a backend route per the contract audit in `docs/API_INTEGRATION.md`), but no page uses it yet.
4. **The admin console is the only area integrated end to end.** Its client calls were exercised against a running backend.
5. **The backend learner API works.** Registration, verification, login, profile, courses, lessons, enrollment, progress, restrictions and password flows were exercised live (54 checks). The gap is the frontend.

## Page matrix: learner area (`src/app/(dashboard)`)

| Route | What it shows now | Backend capability that exists (verified ✅ live / ☑️ source only) | Auth needed | Status | Blockers and notes |
|---|---|---|---|---|---|
| `/dashboard` | Greeting (session); level and XP, coins, streak, study time; continue learning; recent updates | `GET /xp` ✅, `/coins` ✅, `/streak` ✅ (500 before Batch 22), `/study-sessions/stats` ✅ (500 before), `/users/me/courses` ✅, `/notifications` ✅ | Learner | **LIVE-INTEGRATED** | A failing stat shows "—", never a made-up figure. The old semester goal, daily goal, rewards and "exam simulation" widgets were removed: they had no backend. `GET /recommendations` needs the AI service (Phase 6). |
| `/learn` | My courses (with progress) and the catalog, with search and track filter | `GET /users/me/courses` ✅ (progress computed from lessons since Batch 22), `GET /courses` ✅, `GET /courses/search` ✅ (500 before Batch 22) | Learner | **LIVE-INTEGRATED** | The 'Examination' and 'Custom' filters were removed (no backend equivalent). |
| `/learn/[courseId]` | Course, topics, lessons with the learner's completion, enrol/leave, continue | `GET /courses/:id` ✅, `/courses/:id/lessons` ✅, `/lessons/:id/progress` ✅, `/users/me/courses` ✅, `POST/DELETE /courses/:id/enroll` ✅ | Learner | **LIVE-INTEGRATED** | Progress is fetched per lesson (one request each). |
| `/learn/lesson/[lessonId]` | The lesson, start recorded once, mark complete, previous/next | `GET /lessons/:id` ✅, `POST /lessons/:id/start` ✅, `/complete` ✅, `GET /lessons/:id/progress` ✅ | Learner | **LIVE-INTEGRATED** | Content is rendered as **plain-text paragraphs only** (no HTML), so markup in lesson text never runs. Markdown formatting isn't rendered yet. |
| `/learn/lesson/[lessonId]/ai-mode` | Simulated AI (`setTimeout`) | `POST /ai/explain` ☑️, `/ai-tutor/*` ☑️ | Learner | MOCK/DEMO | Phase 6. NestJS → FastAPI verified by unit tests only. |
| `/practice` (PracticeHub, QuizSetup, QuizPage, QuizResult, QuestionReview) | Built-in quizzes and answers | `GET /quizzes` ☑️, `POST /quizzes/:id/start` ☑️, `POST /quizzes/:id/submit` ☑️ (server-side grading, B3), `GET /quizzes/:id/results` ☑️, `GET /quizzes/attempts` ☑️, `POST /quizzes/generate*` ☑️ (AI) | Learner | MOCK/DEMO | Phase 4. **B6:** quizzes, tests and exams have no owner column, so any learner can edit or delete any quiz. The migration is drafted and awaiting approval. |
| `/exams` (ExamHub, ExamSetup, ExamInterface, ExamResult, ExamReadiness) | Built-in exams | `/exams/*` ☑️ (incl. `start`, `submit`, `result`, `readiness`, `simulate`), `/examinations` ☑️, `/past-questions*` ☑️ (external ALOC provider; needs `ALOC_API_KEY`) | Learner | MOCK/DEMO | Phase 4. B6 as above. |
| `/library` | Built-in arrays | `GET /library*` ☑️, `GET /files` ☑️, `GET /youtube` ☑️, favorites and saved courses ☑️ | Learner | MOCK/DEMO | Phase 4. **B4:** `files` has no owner column (migration drafted, awaiting approval). |
| `/library/upload` | Upload UI, no request | `POST /files/upload` ☑️ (Cloudinary), `POST /youtube` ☑️ | Learner | MOCK/DEMO | Phase 4 and 6. Needs `CLOUDINARY_*`. |
| `/library/processing` | Simulated progress (`setTimeout`) | `GET /files/:id/status` ☑️, `POST /files/:id/process` ☑️, `GET /youtube/:id/status` ☑️ | Learner | MOCK/DEMO | Phase 6 |
| `/library/generated-class/[classId]` | Built-in generated class | `POST /ai/documents/:id/generate-live-class` ☑️, `GET /ai/documents/:id/generated-content` ☑️ | Learner | MOCK/DEMO | Phase 6 and 7 (visualization) |
| `/ai` (AIAssistant, AIConversation, AITutor, AIClassroom, AICompanionProfile) | Built-in conversations | `POST /ai/chat` ☑️, `/ai/conversations*` ☑️, `/ai-tutor/*` ☑️, `/ai-companion` ☑️, `/ai/voice/*` ☑️ | Learner | MOCK/DEMO | Phase 6 |
| `/planner` | Simulated generation (`setTimeout`) | `/planner/*` ☑️, `/goals/*` ☑️, `/calendar/*` ☑️ | Learner | MOCK/DEMO | Phase 4 |
| `/progress` | Hard-coded scores and achievements | `/progress*` ☑️, `/mastery*` ☑️, `/analytics/*` ☑️, `/achievements/me` ☑️, `/badges/me` ☑️, `/levels/me` ☑️ | Learner | MOCK/DEMO | Phase 4. Check each analytics endpoint for real queries before connecting. |
| `/history` | Built-in arrays | `GET /progress/history` ☑️, `GET /study-sessions/history` ☑️, `GET /quizzes/attempts` ☑️ | Learner | MOCK/DEMO | Phase 4 |
| `/notifications` | Built-in list | `/notifications*` ☑️ | Learner | MOCK/DEMO | Phase 4 |
| `/settings` | Hard-coded profile (a real person's name is hard-coded as sample data) | `GET/PATCH /users/me` ✅, `PATCH /users/me/preferences` ✅ (`preferredLearningPace` not stored), `/privacy-settings` and `/notification-preferences` (**echo only, not saved**), `POST /users/me/freeze` ✅ | Learner | **PARTIALLY INTEGRATED** | `ChangePasswordForm` (`POST /auth/change-password`, ✅ live) now works, because sign-in stores a real token. The profile and preference sections are still mock (Phase 3). |
| `/account-state` | Real status from `GET /auth/me` (`accountStatus`) | `POST /users/me/freeze` ✅, `POST /users/me/unfreeze` ✅, `DELETE /users/me { password }` ✅ (soft delete) | Learner | **LIVE-INTEGRATED** | The only page a frozen account can open. The copy says deletion **retains** data (the old copy claimed it was wiped). |
| `/premium` | Built-in plans | `GET /plans` ☑️; `/subscription/*`, `/payments/*` ☑️ | Learner | MOCK/DEMO | **The payments webhook is a no-op** (`{ received: true }`, no signature check). Payments are not production-capable. Don't connect them without a payment-provider decision. |
| `/support` | Built-in FAQ arrays | `POST /reports` ☑️, `POST /feedback` ☑️ | Learner | MOCK/DEMO | Phase 4 |

## Page matrix: authentication and onboarding

| Route | Frontend call | Backend route | Auth | Status | Notes |
|---|---|---|---|---|---|
| `/auth/login` | `signIn` (`lib/learner-auth.ts`) | `POST /auth/login` ✅ | Public | **LIVE-INTEGRATED** | Email-only (the backend has no username sign-in; the label says so). Generic message for bad credentials; restricted message; frozen → `/account-state`; `?next=` limited to same-site paths. |
| `/auth/signup` | `signUp` | `POST /auth/signup` ✅ | Public | **LIVE-INTEGRATED** | Stores the returned session and goes to `/auth/verify-email`. The Terms and Privacy links now point at the real legal pages. |
| `/auth/verify-email` (new) | `verifyEmail`, `resendVerification` | `POST /auth/verify-email { email, token }` ✅, `POST /auth/resend-verification` ✅ | Public | **LIVE-INTEGRATED** | "Do this later" is offered because the backend doesn't require verification to sign in. |
| `/onboarding` | `buildOnboardingRequests` → `usersApi.updateAcademicProfile`, `updatePreferences`, `aiCompanionApi.create`/`update` | ✅ (all live) | Learner | **LIVE-INTEGRATED** | Saves education details, study time, goal and companion. Learning speed, session length, explanation style, semester, term and subjects are **not stored** (no backend field), and the page says so. Not behind the gate; it redirects to sign-in when there is no session. |
| `/auth/forgot-password` | `authApi.forgotPassword` | `POST /auth/forgot-password` ✅ | Public | **LIVE-INTEGRATED** | It now passes `?email=` to the reset page. |
| `/auth/reset-password` | `authApi.resetPassword({ email, token, newPassword, confirmNewPassword })` | `POST /auth/reset-password` ✅ | Public | **LIVE-INTEGRATED** | **Contract change (Phase 1 security):** `email` is required. |

## Page matrix: admin (`src/app/admin`)

| Route | Frontend calls | Backend routes (permission) | Status | Notes |
|---|---|---|---|---|
| `/admin/login` | `adminAuthApi.login` | `POST /admin/auth/login` | **LIVE-INTEGRATED** | The token is stored under the admin key only (verified live). |
| `/admin` (overview) | `adminDashboardApi.counts` | `GET /admin/dashboard/counts` (`analytics.view`) | **LIVE-INTEGRATED** | All 12 counts computed live (`unavailable: []`). |
| `/admin/users` | `adminUsersApi.list` | `GET /admin/users` (`users.view`) | **LIVE-INTEGRATED** | No secrets in records (verified live) |
| `/admin/users/[id]` | `get`, `activity`, `setEmailVerified`, `setSuspended`, `setRestricted` | `/admin/users/:id*` (`users.view` / `users.manage`) | **LIVE-INTEGRATED** | Suspend and restrict are enforced (verified live). Delete, freeze and force-logout are disabled (501). |
| `/admin/content`, `/admin/content/[id]` | `adminContentApi.*` (11 methods) | `/admin/content/*` (`content.manage`) | **LIVE-INTEGRATED** | Full CRUD, 409 safe deletes, and 400/404 typed errors verified live |
| `/admin/settings` | `adminSettingsApi.get` | `GET /admin/settings` (`settings.manage`) | PARTIALLY INTEGRATED | Read-only. The values are **not read by the platform**, as the page says. Not exercised live. |
| `/admin/profile` | from the session (`/admin/auth/me`) | `GET /admin/auth/me` | **LIVE-INTEGRATED** | Permissions verified live |
| `/admin/assessments` | none | `/admin/questions/*` (`content.manage`) | NOT CONNECTED | Semantics not verified (see B6) |
| `/admin/moderation` | none | `/admin/reports/*`, `/admin/ai-moderation/*` | NOT CONNECTED | Not verified |

## Page matrix: public and marketing pages

| Route | Status | Notes |
|---|---|---|
| `/`, `/welcome`, `/splash` | STATIC | `/splash` uses `setTimeout` only for its animation |
| `/Legal&Help/AcademyIntegrity`, `/PrivacyPolicy`, `/TermsOfService`, `/SupportCenter` | STATIC | |
| `/Legal&Help/ContactUs` | MOCK/DEMO | The submit is simulated (`setTimeout`). No public contact endpoint exists: `POST /feedback` requires a learner token. |

## Backend findings from this audit (Phase 1)

| Finding | Severity | Action |
|---|---|---|
| Any learner could create, edit or delete courses, topics, lessons, institutions, faculties and departments. Course delete cascaded enrollments. | **Critical** | **Fixed.** These routes are admin-only (`content.manage`), deletes are 409-protected, and body fields are allowlisted. Verified live. |
| `verify-email` and `reset-password` matched the 6-digit code across all users, with no per-account limit (account takeover by guessing). | **Critical** | **Fixed.** `email` is required, the comparison is constant-time, and the code is cleared after 5 wrong attempts. The counter is in memory; a durable one needs a migration. Verified live. Compatibility switch: `AUTH_CODE_REQUIRES_EMAIL=false`. |
| Any learner could award any amount of XP to any account (`POST /xp/award`). | **High** | **Fixed.** Admin-only (`users.manage`). Verified live. |
| A hard-coded learner JWT fallback secret was published in the public repository. | **High** | **Fixed.** No fallback; missing `JWT_SECRET` fails closed (sign-in 503, tokens rejected). |
| A hard-coded default Super Admin password was published. | **High** | **Fixed.** No seeding without `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`. |
| A third-party past-questions API key (ALOC) was committed in source. | **High** | **Removed** from code (`ALOC_API_KEY` env only). **The owner must rotate it**: it remains in git history. |
| The two `User` entities map `users.fullName` differently (`varchar(150)` vs `varchar`). TypeORM synchronize drops and re-adds the column on every boot. | **High (data loss if `DB_SYNCHRONIZE=true`)** | Documented (B2). Keep `DB_SYNCHRONIZE` off everywhere except a throwaway database. |
| `POST /auth/refresh-token` returns a fake token. | Medium | Not used by the frontend. Must not be treated as functional (Phase 2). |
| `POST /auth/logout` is stateless; tokens stay valid until they expire. | Medium | Documented; suspend blocks tokens immediately. |
| `POST /payments/webhook` is a no-op with no signature verification. | Medium (no effect today) | Documented. Needs a provider decision. |
| Quizzes, tests, exams (B6) and files (B4) have no owner. | High | Migrations drafted and awaiting approval. |
| `GET /users/me` returned the pending reset code (`verificationOtp`) and `refreshToken` (Phase 2) | **Critical** | **Fixed** and verified live |
| Body `id`/`userId` could retarget saves in notes, flashcards, goals, the planner, notification settings and the AI companion (Phase 2) | **High** | **Fixed** (`stripProtectedFields`); the note hijack is verified live |
| `/exam-prep` listed, read, edited and deleted every user's plans, and create always failed (Phase 2) | **High** | **Fixed** (owner-scoped; DTO mapped to the existing columns), verified live |
| `DELETE /users/me` didn't check the password (Phase 2) | Medium | **Fixed:** `{ password }` required |
| About 55 learner routes (streak, progress, mastery, planner, study sessions, analytics, goals, YouTube) returned 500 for **every** learner: the controllers read `req.user.userId`/`sub` (Phase 3) | **High** (broken features) | **Fixed:** `JwtStrategy` aliases; verified live |
| `GET /courses/search` 500 without filters; enrolled-course progress always 0 (Phase 3) | Medium | **Fixed**; verified live |

## Evidence: live runs

Environment:
- The backend was compiled from the working tree (`nest build`).
- It ran on `127.0.0.1:5055` against a **disposable** database, `gleamlearn_e2e`, on the local Postgres server. It was created for these runs, with schema sync enabled for that database only. The existing local database was never touched.
- SMTP pointed at a local sink with dummy credentials, so no real mail was sent.
- `AI_SERVICE_URL` pointed at a local address, so no remote AI calls were made.
- The admin was the Super Admin seeded into the disposable database.
- Learners were disposable `@example.test` accounts.
- No production system or data was used.

| Run | Script (backend repo, `test/live/`; see its README) | Result |
|---|---|---|
| Backend HTTP workflows | `test/live/backend-workflows.mjs` | **54/54 passed.** Register → verify (email-bound code) → login → `/auth/me`; tampered/no token 401; learner catalog writes 401; XP award 401; admin login → `/admin/auth/me`; token separation both ways; admin creates course, topic and lesson (admin API and legacy routes); learner sees course → details → lessons → enroll → start → complete → progress; 409 safe deletes (admin and legacy); suspend → existing token and login 403 `ACCOUNT_RESTRICTED` → unrestrict; change password; forgot → reset (email required); 5 wrong codes → code cleared |
| Real frontend clients against the live backend | `test/live/frontend-clients.mjs` (imports `src/lib/api.ts` and `src/lib/admin-api.ts`) | **31/31 passed.** `authApi` signup, verifyEmail, login, getMe, forgotPassword, resetPassword, changePassword; `adminAuthApi` login and me; `adminDashboardApi.counts`; `adminUsersApi` list, setRestricted and setSuspended; `ApiError.code === 'ACCOUNT_RESTRICTED'`; `adminContentApi` full CRUD with 400/404/409 typed errors |

| Phase 3: learning experience with the real `learning.ts` | `test/live/learner-learning.mjs` | **23/23.** Catalog, search and track filter; course, topics and lessons; enrol; start and complete; 33% progress on both the course page and the enrolled list; plain-text content; stats; notifications; unenrol |
| Phase 2: learner session with the real frontend modules | `test/live/learner-session.mjs` | **29/29.** Sign-up → verify → sign-in → `/auth/me`; onboarding saves; `/users/me` without secrets; exam-prep and notes ownership; freeze/unfreeze; delete with password; sign-out |

**Not verified live yet:** every AI route (Phase 6), uploads and Cloudinary, YouTube processing, quizzes, tests and exams, flashcards, notifications, payments, and browser rendering of the pages (`next build` plus an HTTP smoke render only).
