# API Integration

How the GleamLearn web client talks to the backend (`mycoursea-backend`). The browser never calls the AI service (`gleamlearn-ai-service`) directly; AI features go through backend endpoints, and the backend holds the internal AI credentials.

_Last verified: 2026-10-12 (Batch 18)._

## 1. Layers

| Module | Responsibility |
|---|---|
| `src/lib/config.ts` | The single source for `API_BASE_URL` (`NEXT_PUBLIC_API_URL`, falling back to the previous hard-coded production URL), timeouts and the slow-request threshold. Browser-visible; no secrets. |
| `src/lib/http-client.ts` | **The only HTTP implementation.** `createHttpClient(config)` provides: base URL, JSON and FormData bodies, bearer token, timeout, caller cancellation, typed errors, safe retries, and a 401 notification. |
| `src/lib/api-error.ts` | `ApiError` (extends `Error`): `status`, `kind`, `details`, `isTransient`; plus `recoveryHint(kind)`. |
| `src/lib/session.ts` | Token storage for the separate `learner` and `admin` scopes, and the `gleamlearn:session-expired` event. |
| `src/lib/api.ts` | Learner endpoint groups (`authApi`, `usersApi`, `quizzesApi`, …; 316 endpoint methods). Uses a learner `HttpClient` instance. |
| `src/lib/ai-endpoints.ts` | `isAiOperation(path)`: which endpoints run AI generation (long timeout, no auto-retry). |
| `src/lib/admin-api.ts` | Admin endpoint groups, on the same `http-client` with the admin token (Batch 17+). |
| `src/hooks/useApiQuery.ts`, `useAsyncAction.ts`, `useSlowFlag.ts`, `useOnlineStatus.ts` | React bindings for loading, mutations, slow-request detection and connectivity. |

Do not call `fetch` directly from pages or components. Add a method to the relevant `*Api` group instead.

## 2. Request behaviour

| Concern | Behaviour |
|---|---|
| Base URL | `API_BASE_URL` + endpoint (for example `/auth/login`). All backend routes are under `/api/v1`. |
| Auth | `Authorization: Bearer <token>` from `session.getStoredToken(scope)`, or an explicit `token` option. Learner key: `accessToken` (pre-existing). Admin key: `gleamlearn.adminAccessToken`. A stored token is only a credential to send; the **backend** authorizes every request. |
| Bodies | Plain objects are sent as JSON with `Content-Type: application/json`. `FormData` is sent as-is, and the browser sets the multipart boundary. No `Content-Type` when there is no body. |
| Timeout | 30 s by default. AI operations (`isAiOperation`) get 150 s, because the backend allows 120 s for AI calls plus a possible Render cold start. Per call: `timeoutMs`; `0` disables it. |
| Cancellation | Pass `signal`. `useApiQuery` and `useAsyncAction` abort on unmount and when inputs change. A cancelled request rejects with `kind: 'aborted'`, which the UI never shows as an error. |
| Retries | Only for idempotent requests (GET/HEAD, or `idempotent: true`), and only for transient failures: network, timeout, 408, 429, 502, 503 and 504. Up to 2 retries with exponential backoff and full jitter (base 500 ms, cap 5 s). `Retry-After` is honoured (capped). **Never** for POST/PATCH/DELETE by default, **never** for AI operations, and never for 4xx validation, auth or not-found. |
| 401 | Not retried. The client's `onUnauthorized` dispatches `gleamlearn:session-expired` with `{ scope }`. The UI offers "Sign in again". |
| Response parsing | Body read as text, then JSON-parsed. Empty or non-JSON bodies become `null`. |

## 3. Errors

The backend (NestJS) returns `{ statusCode, message, error? }`, where `message` may be an array (validation).

| `ApiError.kind` | Source | Typical UI recovery |
|---|---|---|
| `validation` | 400, 422 | Inline field or form message; no retry button |
| `unauthorized` | 401 | "Sign in again" |
| `forbidden` | 403 | Explain; no retry |
| `not_found` | 404 | Explain; link back |
| `conflict` | 409 | Explain |
| `payload_too_large` / `unsupported` | 413 / 415 | Explain the file limits or types |
| `rate_limited` | 429 | "Wait a moment"; retry |
| `ai_unavailable` | 502, 503 (the backend maps AI-service failures to these) | Retry later |
| `timeout` | 504, or the client timeout | Retry. For a non-idempotent operation, the server may still have completed it; see UI_STATES.md |
| `server` | other 5xx | Retry later |
| `network` | no HTTP response | Offline message; retry |
| `aborted` | caller cancelled | Silent |

`ApiError.message` is the backend's message (already sanitized by the backend: provider details are replaced since backend Batch 9), or a generic hint. Unknown thrown values are normalized to a generic message, so internal text is never shown (`toApiError`).

## 4. Contract verification (frontend ↔ backend)

An automated comparison of `src/lib/api.ts` against the backend's `@Controller` and `@Get/@Post/@Patch/@Put/@Delete` decorators (active code, method + path; run 2026-10-12):

- **First run (2026-10-12):** backend routes 445, frontend endpoint calls 316, frontend calls with no backend route **12**, all flashcards (the backend mounted these controllers without `api/v1`).
- **Fixed in backend Batch 18b:** both flashcards controllers are now mounted on `/api/v1/...` **and** on their original unprefixed paths (same handlers and guard; the old paths are deprecated). **Re-run:** backend routes 457, frontend calls with no backend route: **0**.
- Request and response **payload** shapes are not covered by this check. They are verified per feature when a screen is wired:

| Feature | Verified payload | Evidence |
|---|---|---|
| Change password | `{ oldPassword, newPassword, confirmNewPassword }` | backend `change-password.spec.ts`; **live** (`test/live/frontend-clients.mjs`) |
| Forgot / reset password | `{ email }`; `{ email, token, newPassword, confirmNewPassword }`. **`email` is required since backend Batch 20**: the code is only checked against that account. | backend `one-time-code.spec.ts`, `reset-password.spec.ts`; **live** |
| Verify email | `{ email, token }` (`email` required since backend Batch 20) | **live** (no verify screen exists yet) |
| Admin console clients | all of section 7 | **live**: 31 checks in `test/live/frontend-clients.mjs` |

## 5. Current integration status (honest)

- **Page-by-page status:** see `docs/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`, which uses the LIVE-INTEGRATED / PARTIAL / MOCK / NOT CONNECTED / BLOCKED classification with live evidence.
- **Wired to the backend and live-verified:**
  - Learner authentication (`lib/learner-auth.ts`): sign-up, email verification, sign-in, the session gate and sign-out.
  - Onboarding.
  - Account state: freeze, unfreeze and delete.
  - Forgot and reset password, and change password.
- **Not wired:** the learner content pages (dashboard, learn, practice, exams, library, AI, planner, progress, history, notifications). They are mock-ups, now shown only to signed-in learners.
- **Learner session model:**
  - The token is stored under `accessToken`.
  - `LearnerSessionProvider` confirms it with `GET /auth/me` on load.
  - A 401 from any later request triggers **one re-check** of `/auth/me` before sign-out. This is because some endpoints answer 401 for other reasons, such as change password with a wrong old password.
  - There is no refresh: `refresh-token` is a backend mock. The session ends when the JWT expires (`JWT_EXPIRES_IN`, default 7d).
- **Admin console** (`/admin/*`): wired to the backend and live-verified for sign-in, session and permissions, the overview (12 exact counts), users (list and detail, verification, suspend and restrict), and learning content (full CRUD). User deletion is disabled on the backend. See section 7.

## 6. Configuration

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel / `.env.local` | Backend base **including** `/api/v1`. Set it explicitly per environment; the fallback points at production. |

No secret may be placed in any `NEXT_PUBLIC_*` variable or in client code.

## 7. Admin API (`src/lib/admin-api.ts`)

Same HTTP core, **separate session scope**: the admin token is stored under `gleamlearn.adminAccessToken`, never under the learner `accessToken`, and learner tokens are never sent to admin routes. On a 401, the admin token is cleared and `gleamlearn:session-expired` is dispatched with `{ scope: 'admin' }`.

**Access model:**
- The console route group `src/app/admin/(console)` renders nothing privileged until `GET /admin/auth/me` succeeds.
- The backend guard `AdminJwtAuthGuard` decides. It requires a token signed with `ADMIN_JWT_SECRET`, `type: 'admin'`, and an active admin record.
- A token in storage, a URL or a hidden link grants nothing.
- Admin pages are `noindex`.

| Method | Endpoint | Verified response (backend source) | Used by |
|---|---|---|---|
| `adminAuthApi.login` | `POST /admin/auth/login` `{ email, password }` | `{ status, message, accessToken, data: Admin }`; 401 for bad credentials; 503 if `ADMIN_JWT_SECRET` is not configured | `/admin/login` |
| `adminAuthApi.me` | `GET /admin/auth/me` | `{ status, data: Admin }` (no `passwordHash`) | Console session gate, `/admin/profile` |
| `adminAuthApi.logout` | `POST /admin/auth/logout` | Stateless; the local token is always cleared | Sidebar "Sign out" |
| `adminDashboardApi.overview` | `GET /admin/dashboard` | `{ data: { users: { total, new, … }, learning, revenue } }`. **Only `users.total` and `users.new` are real**; the rest are constants, estimates or zeros and are not displayed. | `/admin` |
| `adminUsersApi.list` | `GET /admin/users?page&limit&search` | `{ data: { users, pagination: { total, page, limit, totalPages } } }`; `limit` ≤ 100; search matches email, username and full name | `/admin/users` |
| `adminUsersApi.get` | `GET /admin/users/:id` | `{ data: User }`, with `passwordHash`, `verificationOtp`, `otpExpiresAt` and `refreshToken` removed (backend Batch 17-security) | `/admin/users/[id]` |
| `adminUsersApi.activity` | `GET /admin/users/:id/activity` | `{ data: { userId, actionHistory: [{ id, targetUserId, actionType, performedAt }] } }` | `/admin/users/[id]` |
| `adminUsersApi.setSuspended` | `PATCH /admin/users/:id/suspend` and `/unsuspend` (`users.manage`) | `{ status, message, data: { userId, isRestricted } }`. **Enforced** (backend account-status batch): a restricted learner gets 403 `ACCOUNT_RESTRICTED` at sign-in and on every authenticated request with an existing token. Data is kept. Idempotent. | `/admin/users/[id]` (confirmation dialog) |
| `adminUsersApi.setRestricted` | `POST /admin/users/:id/restrict` `{ reason }` and `POST /admin/users/:id/unrestrict` (`users.manage`) | `{ status, message, data: { userId, isRestricted, reason? } }`. Same enforced flag as suspend, with a stored reason, recorded in the security audit log. Unrestrict also lifts a suspension. | `/admin/users/[id]` (reason required, ≤ 500 characters) |
| `adminUsersApi.setEmailVerified` | `PATCH /admin/users/:id/verify` and `/unverify` (`users.manage`) | `{ status, message, data: { userId, isEmailVerified } }`; really updates the user | `/admin/users/[id]` |
| `adminDashboardApi.counts` | `GET /admin/dashboard/counts` (`analytics.view`) | `{ data: { counts: { learners, newLearnersLast30Days, learnerCourses, quizzes, tests, exams, uploadedFiles, youtubeResources, aiTutorSessions, aiAssistantConversations, xpAwarded, coinsAwarded }, unavailable, generatedAt } }`: exact counts, `null` if not computable | `/admin` |
| `adminSettingsApi.get` | `GET /admin/settings` (`settings.manage`: Super Admin) | `{ data: SystemSettings }`. Stored values that **the platform does not read yet** | `/admin/settings` (read-only) |
| `adminContentApi.listCourses` | `GET /admin/content/courses?page&limit&search` (`content.manage`) | `{ data: { courses: [Course + topicCount, lessonCount, enrollmentCount], pagination } }`; `limit` ≤ 100; search matches the title | `/admin/content` |
| `adminContentApi.getCourse` | `GET /admin/content/courses/:id` | `{ data: Course + topics (sorted by order) + lessons + counts }`; 404 if not found | `/admin/content/[id]` |
| `adminContentApi.createCourse` / `updateCourse` | `POST /admin/content/courses`, `PATCH /admin/content/courses/:id` | `{ status, message, data: Course }`. Fields: `title` (1–200), `description` (≤ 5000), `track` (1–50), `level` (≤ 50), `departmentId` (existing department UUID). An update with no changes → 400. | `/admin/content` (create), `/admin/content/[id]` (edit; only changed fields are sent) |
| `adminContentApi.deleteCourse` | `DELETE /admin/content/courses/:id` | `{ status, message }`. **409** when the course has topics, lessons or enrollments; nothing is deleted. | `/admin/content/[id]` (shown only for empty courses; typed confirmation; 409 handled) |
| `adminContentApi.createTopic` / `updateTopic` / `deleteTopic` | `POST /admin/content/courses/:id/topics`, `PATCH`/`DELETE /admin/content/topics/:id` | Topic: `title` (1–200), `description` (≤ 5000), `order` (integer ≥ 0). Delete → **409** if learner mastery or progress rows reference the topic. | `/admin/content/[id]` |
| `adminContentApi.createLesson` / `updateLesson` / `deleteLesson` | `POST /admin/content/courses/:id/lessons`, `PATCH`/`DELETE /admin/content/lessons/:id` | Lesson: `title` (1–200), `content` (≤ 100 000), `orderIndex` (integer ≥ 0). Delete → **409** if lesson progress exists. | `/admin/content/[id]` |

**Error codes:** `ApiError.code` carries the backend's machine-readable `code` when present. The learner API sends `ACCOUNT_RESTRICTED` and `ACCOUNT_FROZEN` with 403 (kind `forbidden`).

**Learner catalog caveat:** `/admin/content` edits the same `courses`/`topics`/`lessons` the learner API serves, but the web app's `/learn` pages still render hard-coded sample courses. This is stated on the admin page.

**Permissions:** `GET /admin/auth/me` returns `data.permissions`, the server-side grants for the admin's role. The UI hides sections and controls the admin can't use (`useAdminSession().can`, `RequirePermission`). The **backend enforces** every route with default deny and returns **403** (`ApiError.kind === 'forbidden'`, which doesn't end the session).

**Deliberately not exposed:**

| Backend endpoint | Reason |
|---|---|
| `PATCH /admin/users/:id/freeze`, `/unfreeze`; `POST /admin/users/:id/force-logout` | The backend answers **501**. Freezing is controlled by the learner; individual tokens can't be revoked (suspending blocks existing tokens instead). Shown disabled. |
| `DELETE /admin/users/:id` | **Disabled on the backend (501), even for Super Admin.** A hard delete would CASCADE-delete 8 tables and orphan about 25 others that store `userId` without a foreign key. Not exposed by the client; shown disabled with the reason. |
| `GET /admin/users/:id/progress`, `/analytics` | They return constant zeros |
| `GET /admin/dashboard` (other than `users.total` and `users.new`), `/admin/dashboard/*`, `/admin/analytics/*` | Hard-coded figures; use `/admin/dashboard/counts` |
| `/admin/courses/*` | Writes a separate `admin_courses` table that learners never see. Replaced by `/admin/content/*`, which manages the learner catalog. |
| Questions, reports, AI moderation | Permissioned, but not verified or connected yet |
