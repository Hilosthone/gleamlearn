# GleamLearn Frontend: Implementation Changelog

Repository: `gleamlearn-landing` (Next.js 16.3.5, React 19.2.8). This is the web client for the GleamLearn backend (`mycoursea-backend`) and, indirectly, the AI service (`gleamlearn-ai-service`). Each repository keeps its own changelog; cross-service contracts are noted where they apply.

**Status legend:** ✅ verified by the listed checks · 🟡 partially verified · ⬜ not implemented

---

## Baseline audit (2026-10-12, before any change)

- **Working tree:** clean at `5d879ae`, no stashes.
- **Project instructions:** `AGENTS.md` and `CLAUDE.md` say this Next.js version differs from older releases, and to read `node_modules/next/dist/docs/` before writing code. That was done for `useSearchParams` and Client Components; the new pages avoid `useSearchParams`, so they need no Suspense boundary.
- **API layer:** a single client, `src/lib/api.ts` (about 3,400 lines). It wraps `fetch`; the base URL comes from `NEXT_PUBLIC_API_URL`, with a fallback to `https://gleamlearn-backend.onrender.com/api/v1`; the bearer token comes from `localStorage.accessToken`. **No page or component imports it.**
- **Screens:** all dashboard and auth screens are UI mock-ups with local state.
  - `auth/login` simulates sign-in with a 1.2 s timeout and stores no token.
  - "Forgot password?" was a dead `#` link.
  - The settings "Change Password" row was static.
  - No forgot-password or reset-password screens existed.
- **Tests:** none. There was no test runner; only `eslint`, plus `tsc` through Next.
- **Lint baseline:** `src/lib/api.ts` has 390 pre-existing `@typescript-eslint/no-explicit-any` errors; `settings/page.tsx` has 2 errors and 4 warnings. All are pre-existing and unchanged by this work.

---

## Batch 15: Password change and reset integration

**Status:** ✅ Verified by unit tests, type-check, lint (no new findings) and production build. 🟡 Not exercised end to end against a running backend (see Outstanding).

### Problem

The backend requires `confirmNewPassword` (equal to `newPassword`) on both `POST /auth/change-password` and `POST /auth/reset-password` (backend Batches 13–14). The frontend client didn't declare the field, and there was no UI that sent it.

### Implementation

- **Contract** (`src/lib/api.ts`): `ChangePasswordPayload` and `ResetPasswordPayload` now include a required `confirmNewPassword: string`. The reset `token` is documented as the 6-digit emailed code.
- **Error normalization:**
  - `apiRequest` now throws `ApiError` (new `src/lib/api-error.ts`). It **extends `Error` with the same message**, so existing `err.message` handling is unaffected.
  - It adds `status`, `kind` (`validation`, `unauthorized`, `rate_limited`, `ai_unavailable`, `timeout`, `network`, …), `details` (NestJS validation arrays) and `isTransient`.
  - A `fetch` rejection (no HTTP response) becomes `kind: 'network'`, instead of an unhandled `TypeError`.
  - `recoveryHint(kind)` returns user-facing guidance and never includes server internals.
- **Validation** (`src/lib/validation/password.ts`): pure functions mirroring the backend DTO rules.
  - New password: required, ≥ 6 characters.
  - Confirmation: required, must match.
  - Current password: required, and the new password must differ from it.
  - Reset code: exactly 6 digits.
  - Email format.
- **UI:**
  - `ChangePasswordForm` (new) is opened from the existing settings "Update" button (Settings → Account).
    - Field errors are shown inline.
    - The server's "Incorrect old password" (401) appears on the current-password field.
    - A 401 session failure offers "Go to sign in".
    - Duplicate submits are ignored while a request is in flight.
    - Values are kept on failure and cleared only after the server confirms success.
  - `/auth/forgot-password` (new): requests the code, and shows the same neutral confirmation whether or not the account exists (matching the backend).
  - `/auth/reset-password` (new): code, new password and confirmation. An invalid or expired code (400) is shown on the code field; success links to sign-in.
  - `/auth/login`: "Forgot password?" now links to `/auth/forgot-password`.
  - `Alert` (new, `src/components/ui/Alert.tsx`): shared inline status component (`error` uses `role="alert"`; the others use `role="status"`).
- **Tests:** `npm test` (new script) runs Node's built-in test runner (`node --test "src/**/*.test.mjs"`) directly against the TypeScript modules, using Node 24 type stripping. **No new dependencies.**

### Files changed

- Modified:
  - `package.json` (adds the `test` script)
  - `src/lib/api.ts`
  - `src/app/auth/login/page.tsx`
  - `src/app/(dashboard)/settings/page.tsx`
- New:
  - `src/lib/api-error.ts`
  - `src/lib/validation/password.ts`
  - `src/components/ui/Alert.tsx`
  - `src/components/auth/ChangePasswordForm.tsx`
  - `src/app/auth/forgot-password/page.tsx`
  - `src/app/auth/reset-password/page.tsx`
  - `src/lib/__tests__/password-validation.test.mjs`
  - `src/lib/__tests__/api-error.test.mjs`
  - `docs/IMPLEMENTATION_CHANGELOG.md`

### Cross-service contract (verified against backend source and tests)

| Frontend call | Body sent | Backend DTO and checks | Backend test evidence |
|---|---|---|---|
| `authApi.changePassword` → `POST /auth/change-password` (JWT) | `{ oldPassword, newPassword, confirmNewPassword }` | `ChangePasswordDto`: all required, `newPassword` ≥ 6. Mismatch → 400 "New passwords do not match"; wrong current password → 401 "Incorrect old password" | `src/auth/change-password.spec.ts` (7 tests, including an HTTP test that accepts exactly these three keys) |
| `authApi.forgotPassword` → `POST /auth/forgot-password` | `{ email }` | Same response whether or not the user exists; emails a 6-digit code valid for 10 minutes | — (unchanged backend behaviour) |
| `authApi.resetPassword` → `POST /auth/reset-password` | `{ token, newPassword, confirmNewPassword }` | `ResetPasswordDto`: all required. Unknown or expired code → 400 "Invalid or expired password reset code" | `src/auth/reset-password.spec.ts` (9 tests) |

The UI maps responses by status, with message checks only where the backend uses one status for two meanings: a 401 from the session versus "Incorrect old password", and a 400 validation error versus an invalid code.

### Testing and verification

| Command | Result |
|---|---|
| `npm test` | ✅ 14 tests, 0 failures. Change: matching ✓; mismatch, missing confirmation, missing current password, short password and reuse are all rejected. Reset: valid ✓; mismatch and missing confirmation rejected; code must be exactly 6 digits. Email format. `ApiError`: still an `Error` with the same message; validation arrays become `details`; status-to-kind mapping; non-JSON bodies; transient flags. |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint` on changed and new files, compared per file with `HEAD` | ✅ no new findings. New files: 0. `api.ts`: 390 errors at `HEAD` and now (pre-existing `any`), with 1 fewer warning. `settings/page.tsx`: 2 errors and 4 warnings, unchanged. |
| `npx next build` | ✅ exit 0; `/auth/forgot-password` and `/auth/reset-password` prerendered as static |

### Outstanding issues and assumptions

- **Sign-in is still simulated.** `auth/login` stores no `accessToken`, so in the running app `changePassword` reaches the backend without a token and gets 401. The form handles that ("Please sign in again"). The flow becomes fully functional once real sign-in is wired; that is out of this batch's scope.
- **Not verified end to end** against a running backend. That would need a local backend plus database, and an SMTP setup or the reset code. The contract was verified statically and by the backend's HTTP tests.
- No React component tests: the project has no DOM test environment, and none was added (no new dependencies). The form logic lives in the tested pure modules.
- The backend's reset-code generation and logging have issues reported to the backend changelog: `Math.random`, and the code being printed to logs when mail fails.

### Configuration

`NEXT_PUBLIC_API_URL` should point to the backend's `/api/v1` base. If it is unset, the client falls back to the hard-coded production URL in `src/lib/api.ts` (pre-existing behaviour; to be revisited in the API-client batch).

---

## Batch 16: Shared request handling and reusable UI states

**Status:** ✅ Unit tests, type-check, lint (no new findings) and build all pass. 🟡 Hooks and components have no DOM tests (no DOM test environment; none added).

### What changed

- **One HTTP core.** New `src/lib/http-client.ts`. `apiRequest` in `src/lib/api.ts` now delegates to it; its signature and all 316 endpoint methods are unchanged. The core provides:
  - Timeouts: 30 s by default; 150 s for AI operations (`src/lib/ai-endpoints.ts`).
  - Caller cancellation through `signal`.
  - Typed `ApiError` for every failure, with new kinds `timeout` and `aborted`.
  - Retries **only** for idempotent requests (GET/HEAD, or an explicit `idempotent: true`) on transient failures: at most 2, with exponential backoff, full jitter and `Retry-After`. **No** retries for POST/PATCH/DELETE or AI operations.
  - A 401 notification (`gleamlearn:session-expired`).
- **Config and session:**
  - `src/lib/config.ts`: the single place for `API_BASE_URL` and timeouts. The fallback URL is identical to before.
  - `src/lib/session.ts`: separate learner and admin token keys, plus the session-expired event; SSR-safe.
- **Hooks:**
  - `useApiQuery`: abort on unmount or input change, keep data while refreshing, `retry`.
  - `useAsyncAction`: single-flight, no auto-retry, abort on unmount.
  - `useSlowFlag` and `useOnlineStatus`.
  - These follow the React Compiler lint rules (`useEffectEvent`, state adjusted during render), with no lint suppressions apart from caller-supplied deps.
- **Components:** `LoadingState`, `SlowNotice`, `EmptyState`, `ErrorState`, `OfflineBanner` and `QueryState` (`src/components/ui/states/index.tsx`).
- **Applied to:**
  - `OfflineBanner` in the learner dashboard layout.
  - `SlowNotice` on change password, forgot password and reset password.
- **Contract check:** frontend vs backend routes (see `docs/API_INTEGRATION.md`, section 4). 12 flashcards calls have no matching backend route, because the backend controllers lack the `api/v1` prefix. Reported as a backend proposal; not changed.
- **Documentation:** new `docs/API_INTEGRATION.md` and `docs/UI_STATES.md`.

### Files changed

- Modified:
  - `src/lib/api.ts`
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/auth/ChangePasswordForm.tsx`
  - `src/app/auth/forgot-password/page.tsx`
  - `src/app/auth/reset-password/page.tsx`
  - `tsconfig.json` (adds `allowImportingTsExtensions`, valid with the existing `noEmit: true`, so that modules can import `./x.ts` and be tested directly by Node)
- New:
  - `src/lib/http-client.ts`
  - `src/lib/config.ts`
  - `src/lib/session.ts`
  - `src/lib/ai-endpoints.ts`
  - `src/lib/async-state.ts`
  - `src/hooks/useApiQuery.ts`
  - `src/hooks/useAsyncAction.ts`
  - `src/hooks/useSlowFlag.ts`
  - `src/hooks/useOnlineStatus.ts`
  - `src/components/ui/states/index.tsx`
  - `src/lib/__tests__/http-client.test.mjs`
  - `src/lib/__tests__/request-policy.test.mjs`
  - `docs/API_INTEGRATION.md`
  - `docs/UI_STATES.md`

### Compatibility

- **Errors:** still thrown as `Error` subclasses with the same messages.
- **Requests now time out:** 30 s by default, 150 s for AI. Before, there was no timeout at all.
- **GET requests retry** transient failures up to twice; before, there were no retries.
- **`Content-Type`** is no longer sent on requests without a body.
- **Response parsing:** bodies are read as text and then parsed; an empty body becomes `null`, as before.

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ 34 tests, 0 failures. Covers: success with bearer token; JSON vs FormData headers; typed HTTP errors with validation details; network → `network`; timeout → `timeout`; caller abort → `aborted` and no retry; an already-aborted signal makes no request; GET retry with jittered backoff (250 ms, 500 ms) and a retry limit; POST never retried unless `idempotent`; 404 not retried; 429 `Retry-After`; 401 notifies once with no retry; empty or non-JSON bodies; backoff caps; AI-endpoint policy (11 AI paths and 7 ordinary ones); single-flight; unknown-error sanitization; cancellation detection; plus the 14 Batch 15 tests. |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint` on changed and new files, compared per file with `HEAD` | ✅ no new findings. The 4 React Compiler findings in my first version of the hooks were fixed, not suppressed. Pre-existing: `api.ts` 390 errors; `settings/page.tsx` 2 errors and 4 warnings. |
| `npx next build` | ✅ exit 0 |

### Outstanding

- The learner data pages still use mock data; the states will be applied when each page is wired.
- No DOM-level tests for the hooks and components.
- Idempotency keys for mutations (to make safe retries of POSTs possible) would need backend support. Not implemented.

---

## Batch 17: Admin console (layout, session and first verified features)

**Status:** ✅ Unit tests, type-check, lint and production build. 🟡 Not exercised against a running backend; that needs `ADMIN_JWT_SECRET` configured and an admin account.

### Backend contracts inspected first (`mycoursea-backend`)

- 19 admin controllers under `/api/v1/admin/*`.
- The admin auth flow: `login` → `{ accessToken, data }`; `me`; stateless `logout`; `refresh` returns a placeholder; `forgot-password` sends nothing.
- `AdminJwtAuthGuard` and the role model. There is **no per-route role or permission check**: any active admin can use every admin route.
- **Security problems found and fixed in the backend before connecting the UI** (backend Batch 17-security):
  - The admin password reset accepted learner tokens.
  - The `/admin/export/*` routes were unauthenticated.
  - Admin and learner tokens shared a secret and had no type claim.
  - Admin user responses leaked the live one-time code and the refresh token.
- **Placeholder backend behaviour (not exposed as functional):**
  - The dashboard computes only `users.total` and `users.new`; everything else is constants, estimates or zeros.
  - `suspend`, `freeze` and `verify` (and their reversals) return success without changing the user.
  - User `progress` and `analytics` return zeros.

### Implementation

- **`src/lib/admin-api.ts`:** admin endpoint groups on the **shared** `http-client` (no second client), with the admin session scope.
  - **Auth:** `login`, `me`, `logout`.
  - **Dashboard:** `overview`.
  - **Users:** `list`, `get`, `activity`, `remove`.
  - Response types come from the backend services.
- **Routes**, all under `src/app/admin/` and separate from the learner `(dashboard)` group and its navigation:
  - `admin/layout.tsx`: `noindex` metadata.
  - `admin/(auth)/login`: admin sign-in. It uses `useSearchParams` inside a `Suspense` boundary, as the bundled Next.js docs require.
  - `admin/(console)/layout.tsx`: `AdminSessionProvider` plus `AdminShell`.
  - Console pages:
    - `admin/(console)/page.tsx`: overview.
    - `users/page.tsx`: list.
    - `users/[id]/page.tsx`: detail, using `useParams`.
    - `profile/page.tsx`: the current admin.
    - `content`, `assessments`, `moderation`, `settings`: **"Not yet connected"**, each listing the existing backend endpoints that are awaiting verification.
- **Session gate (`AdminSessionProvider`):**
  - No stored admin token → go to `/admin/login`.
  - Otherwise `GET /admin/auth/me` runs **before anything privileged renders**.
  - 401/403 → clear the token and go to sign-in with "session ended".
  - 503 → explain that admin authentication isn't configured, with retry.
  - Network or server error → error state with retry.
  - Any later admin 401 (through the `gleamlearn:session-expired` event) ends the session across the console.
  - **No frontend flag or route grants access; the backend decides.**
- **Layout (`AdminShell`):**
  - Its own sidebar, mobile drawer (Escape closes it) and top bar, with the admin name and role.
  - It reuses the learner visual system: brand tokens, card radius and borders, the sidebar link style, the logo, dark mode and `OfflineBanner`.
  - Navigation lives in `admin-nav.ts`; unconnected sections carry a "Soon" badge.
- **Shared UI:** new `ConfirmDialog`, a native `<dialog>` with focus handling, Escape, and optional typed confirmation. The existing `src/components/ui/Modal.tsx` is an empty file and was left untouched.

### Features connected

| Page | Behaviour |
|---|---|
| Overview | **Real** registered-learner total and the number of new learners in the last 30 days. Other metrics are explained as unavailable instead of being shown. |
| Users | Debounced search (email, username, name), pagination of 20 per page (backend cap 100), a desktop table and mobile list, verified and restricted badges, empty, error and loading states |
| User detail | Profile fields (secrets are removed server-side) and the admin action history. **Suspend, freeze, verify and their reversals are shown disabled**, with the reason. **Delete** works, behind a typed-email confirmation, and is never retried; on timeout the user is told the deletion may already have happened. |
| My admin profile | Data from `/admin/auth/me` |

### Files

- New:
  - `src/lib/admin-api.ts`
  - `src/components/admin/AdminSessionProvider.tsx`
  - `src/components/admin/AdminShell.tsx`
  - `src/components/admin/admin-nav.ts`
  - `src/components/admin/NotConnected.tsx`
  - `src/components/ui/ConfirmDialog.tsx`
  - `src/app/admin/layout.tsx`
  - `src/app/admin/(auth)/login/page.tsx`
  - `src/app/admin/(console)/layout.tsx`
  - `src/app/admin/(console)/page.tsx`
  - `src/app/admin/(console)/users/page.tsx`
  - `src/app/admin/(console)/users/[id]/page.tsx`
  - `src/app/admin/(console)/profile/page.tsx`
  - `src/app/admin/(console)/content/page.tsx`
  - `src/app/admin/(console)/assessments/page.tsx`
  - `src/app/admin/(console)/moderation/page.tsx`
  - `src/app/admin/(console)/settings/page.tsx`
  - `src/lib/__tests__/admin-api.test.mjs`
- Updated: `docs/API_INTEGRATION.md` (section 7), `docs/UI_STATES.md`

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ 42 tests, 0 failures. The 8 new admin tests: the token is stored only under the admin key; admin requests send the admin token, not the learner one (query encoding included); a 401 clears only the admin token and dispatches an admin session-expired event; 503 keeps the token; delete is a single, unretried DELETE with an encoded id; logout clears the token even offline; a login response without a token is a failure; nav active-state matching. |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src/app/admin src/components/admin src/components/ui/ConfirmDialog.tsx src/lib/admin-api.ts` | ✅ 0 problems |
| Whole-project `npx eslint src`, compared with a single run on an unmodified `HEAD` worktree | ✅ **No new problems.** `HEAD`: 419 errors and 105 warnings (82 files). Now: 419 errors and 104 warnings (120 files). No existing file has more problems; all new files are clean; `src/lib/api.ts` has 1 fewer warning. All 419 errors are pre-existing (mostly `no-explicit-any` in `api.ts`). |
| `npx next build` | ✅ exit 0. `/admin`, `/admin/login`, `/admin/users`, `/admin/users/[id]`, `/admin/profile` and the four "not connected" sections are built. |

### Blockers and unfinished work

- **Backend deployment is required** for real use: backend Batch 17-security needs `ADMIN_JWT_SECRET` set on Render. Without it, admin sign-in correctly shows "not configured" (503).
- **No role-based restrictions** in the backend: every active admin can delete users. Restricting this needs backend permission checks.
- **Admin password change and reset:** not available. There is no working backend flow, and the reset endpoint is intentionally disabled.
- **Content, assessments, moderation and settings:** their backend endpoints exist but are not yet verified or connected.
- **Learner sign-in** is still simulated; that is separate from the admin console.
- **No DOM-level tests** for the admin pages (no DOM test environment).

---

## Batch 18: Permission-aware admin console and next verified sections

**Status:** ✅ Unit tests, type-check, lint and build. 🟡 Not exercised against a running backend.

### Backend changes this depends on

- **Batch 18-security:**
  - Per-role permissions, enforced server-side with default deny on all guarded admin routes.
  - Suspend, freeze, restrict and force-logout now return **501** instead of a fake success.
  - Verify and unverify are now real.
  - Delete is Super Admin only.
  - Admin refresh and forgot-password return 501.
- **Batch 18b:** flashcards routes also under `/api/v1`.
- **Batch 18c:** `/admin/auth/me` returns `permissions`; new `GET /admin/dashboard/counts`.

### Implementation

- **Permissions in the UI** come from the server: `AdminProfile.permissions`, from `/admin/auth/me`.
  - `useAdminSession().can(p)`.
  - Navigation shows only permitted sections (`visibleNavItems`).
  - `RequirePermission` shows "Not available for your role" when a section is opened by URL.
  - **The backend remains the boundary:** it returns 403 regardless of the UI, and the client reports that as `kind: 'forbidden'` without ending the session.
- **Overview:** 12 exact database figures from `/admin/dashboard/counts` (for roles with `analytics.view`); an unavailable figure is labelled "Unavailable". The placeholder analytics endpoints are explained and not shown.
- **User detail:**
  - **Mark email as verified / Revoke verification** are real actions (`users.manage`), with pending, slow, error and success states, and a re-fetch so the page shows server state.
  - Suspend, freeze, restrict and force-logout are shown **disabled**, with the reason (the backend answers 501).
  - **Delete** appears only for `users.delete` (Super Admin). Its confirmation lists what the backend cascades.
  - **Timeout handling:** after a timeout or network failure, "Check and delete" is offered. A 404 on that retry is reported as "already deleted by your previous attempt" rather than as an error, so there is no blind duplicate and no false failure.
- **Platform settings:** read-only (`settings.manage`), labelled **"Stored, not yet applied"**, because the backend never reads these values. Editing is not offered.
- **Learning content:** still not connected, now with the **verified reason**: admin courses live in a separate `admin_courses` table that learners never see.
- **Profile:** shows the server-reported role permissions. Admin password change is stated as unavailable.

### Files

- New:
  - `src/components/admin/RequirePermission.tsx`
- Modified:
  - `src/lib/admin-api.ts` (`AdminPermissionName`, `permissions`, `AdminVerifiedCounts`, `AdminSystemSettings`, `adminDashboardApi.counts`, `adminSettingsApi.get`, `adminUsersApi.setEmailVerified`)
  - `src/components/admin/AdminSessionProvider.tsx` (`can`)
  - `src/components/admin/admin-nav.ts` (per-item permission, `visibleNavItems`)
  - `src/components/admin/AdminShell.tsx`
  - `src/components/admin/NotConnected.tsx` (`reason`)
  - `src/app/admin/(console)/page.tsx`
  - `src/app/admin/(console)/users/page.tsx`
  - `src/app/admin/(console)/users/[id]/page.tsx`
  - `src/app/admin/(console)/settings/page.tsx`
  - `src/app/admin/(console)/content/page.tsx`
  - `src/app/admin/(console)/assessments/page.tsx`
  - `src/app/admin/(console)/moderation/page.tsx`
  - `src/app/admin/(console)/profile/page.tsx`
  - `src/lib/__tests__/admin-api.test.mjs`

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **45 tests**, 0 failures. New: counts, settings, verify and unverify endpoints and methods; a 403 becomes a typed `forbidden` error with no logout; nav visibility for Content Admin, all-permission and no-permission cases. |
| `npx tsc --noEmit` | ✅ exit 0 |
| Whole-project `npx eslint src`, compared with an unmodified `HEAD` worktree | ✅ **No new problems.** `HEAD` 419 errors / 105 warnings; now 419 / 104. No file is worse; all new files are clean. |
| `npx next build` | ✅ exit 0 (all 9 admin routes) |

### Not production-ready (honest status)

- **Learner sign-in** is still simulated (no token stored), so learner flows can't be verified end to end.
- **Admin sign-in** is implemented against the real backend contract but **has not been exercised against a running backend**. It needs the backend deployed with `ADMIN_JWT_SECRET` (configured by the owner; not verified on Render from here).
- **Content, assessments and moderation** are not connected. Their endpoints are permissioned, but their data or semantics haven't been verified as effective.
- **No admin-account management endpoints** exist (create admins, change roles).

## Batch 19: Enforced account restrictions, disabled deletion, admin content management (2026-10-12)

**Status:** ✅ Unit tests, type-check, lint and build. 🟡 Not exercised against a running backend (no live admin session from here).

### Backend changes this depends on (backend changelog, same date)

- **Account status enforcement:** suspended or restricted learners get 403 `ACCOUNT_RESTRICTED` at sign-in and on every authenticated request. Frozen learners can sign in but are limited to viewing their profile, unfreezing and signing out (403 `ACCOUNT_FROZEN` elsewhere).
- Admin **suspend/unsuspend** and **restrict/unrestrict** are now real (`users.manage`). Freeze, unfreeze and force-logout remain 501.
- **`DELETE /admin/users/:id` is disabled (501) for every role**, pending a data-retention review: a hard delete cascades 8 tables and orphans about 25.
- **New `/api/v1/admin/content/*`** (`content.manage`): learner catalog courses, topics and lessons, with safe deletes (409 when learner data depends on the item).

### Implementation

- **`ApiError.code`:** the backend's machine-readable `code` (e.g. `ACCOUNT_RESTRICTED`, `ACCOUNT_FROZEN`), or `null`. Additive; existing callers are unaffected.
- **`admin-api.ts`:**
  - Added `adminUsersApi.setSuspended` and `adminUsersApi.setRestricted` (reason in the body for restrict).
  - **Removed** `adminUsersApi.remove`, so the client can't call the disabled endpoint.
  - Added the `adminContentApi` group (11 methods) and its types.
- **User detail (`/admin/users/[id]`):**
  - The restriction status is shown as **enforced**, with the stored reason.
  - **Suspend account**, **Restrict with a reason** and **Lift restriction** are real actions, with a confirmation dialog. Restrict requires a reason of at most 500 characters.
  - The actions have pending, slow, error and success states. After a timeout, the dialog explains that retrying is safe because the calls are idempotent. The record is re-fetched afterwards, so the page shows server state.
  - Freeze, force-logout and **permanent deletion** are shown disabled with their reasons. The delete flow, its dialog and its success screen are removed.
- **Learning content (`/admin/content`):** replaces the `NotConnected` placeholder.
  - **List:** debounced title search, pagination, topic, lesson and enrollment counts, responsive table or list, and loading, empty and error states.
  - **New course:** form that redirects to the new course on success.
- **Course detail (`/admin/content/[id]`):**
  - Edit course details; only changed fields are sent, and "Nothing has changed." is shown instead of sending an empty update the backend would reject.
  - Add, edit and delete **topics** and **lessons** inline.
  - **Delete course** is enabled only when the course has no topics, lessons or enrollments, and requires typing the title.
  - **409 responses** show the backend's explanation; nothing changes.
  - Timed-out deletes offer "Check and delete": a 404 on retry is reported as already deleted.
  - Timed-out creates warn that the item may exist, and to reload before retrying, to avoid duplicates.
- **`lib/admin-content-form.ts`:** pure validation mirroring the backend DTO limits. It trims values, drops empty optional fields, requires whole numbers ≥ 0 for order and position, preserves lesson content formatting, and computes changed fields. Cleared text fields are sent as `''`; ID and number fields are never cleared implicitly.
- **Honest labelling:** the content page states that changes apply immediately (there is no draft or publish step in the catalog), and that the web app's `/learn` pages still show **built-in sample courses**: they don't read this catalog yet (verified: no page uses `coursesApi` or `lessonsApi`). The lesson content field states that it isn't displayed to learners yet.
- **Navigation:** "Learning content" is marked connected.

### Files

- New:
  - `src/lib/admin-content-form.ts`
  - `src/lib/__tests__/admin-content-form.test.mjs`
  - `src/components/admin/content/CatalogForms.tsx`
  - `src/app/admin/(console)/content/[id]/page.tsx`
- Modified:
  - `src/lib/api-error.ts`
  - `src/lib/admin-api.ts`
  - `src/lib/__tests__/admin-api.test.mjs` (delete tests replaced by content-delete, suspend and restrict tests; 403 test now uses suspend)
  - `src/lib/__tests__/api-error.test.mjs`
  - `src/app/admin/(console)/users/[id]/page.tsx`
  - `src/app/admin/(console)/content/page.tsx`
  - `src/components/admin/admin-nav.ts`
  - `docs/API_INTEGRATION.md` (section 7)

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **56 tests**, 0 failures (45 before). New: form validation (6), suspend and restrict endpoints, methods and bodies and no retry, all content endpoints, 409 conflict, single DELETE, `remove` not exposed, `ApiError.code`. |
| `npx tsc --noEmit -p .` | ✅ exit 0 |
| `npx eslint` on the changed files | ✅ 0 problems |
| Whole-project eslint compared with the `HEAD` baseline | ✅ **No new problems:** `HEAD` 419 errors / 105 warnings; now 419 / 104. No file is worse. |
| `npx next build` | ✅ exit 0. `/admin/content` (static) and `/admin/content/[id]` (dynamic) built. |

### Outstanding

- Not exercised against a running backend: the admin login, content CRUD and suspend flows are verified against backend source and backend tests only.
- The learner `/learn` pages need to be connected to `/api/v1/courses` for catalog edits to be visible in the web app.
- **Learner catalog write routes** (`POST/PATCH/DELETE /api/v1/courses…`, `/topics/:id`, `/lessons/:id`) are open to any signed-in learner on the backend. The recommendation to restrict them to admins is awaiting the owner's decision (backend changelog).
- The learner UI doesn't yet show a dedicated screen for `ACCOUNT_RESTRICTED` or `ACCOUNT_FROZEN`. The backend message is shown through the standard error state, and `ApiError.code` is available for a dedicated screen once learner sign-in is real.

## Batch 20 (Phase 1): Integration audit, reset-code contract, live verification (2026-10-12)

**Status:** ✅ Unit tests, type-check, lint and build. ✅ **The real client modules were exercised against a running backend** (disposable local database; 31 checks).

### What changed

- **New `docs/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`:** every page with its API calls, backend capability, auth requirement and status (LIVE-INTEGRATED / PARTIALLY INTEGRATED / MOCK/DEMO / NOT CONNECTED / BLOCKED / STATIC), plus the backend security findings and live evidence.
  - **Main finding:** the whole learner area is still a demo. Sign-in and sign-up are simulated, there is no sign-in gate, and the pages use built-in data.
- **Reset-password contract (backend Batch 20 security fix):**
  - `/auth/reset-password` now has an **Email** field and sends `{ email, token, newPassword, confirmNewPassword }`.
  - The field is prefilled from `?email=`, which `/auth/forgot-password` now adds to its "Enter the code" link.
  - It handles the backend's "Too many incorrect codes" answer (shown on the code field).
  - `useSearchParams` sits inside a Suspense boundary, as this Next.js version requires.
- **Types:** `VerifyEmailPayload` and `ResetPasswordPayload` gain the required `email`. Validation: `validateResetPassword` requires a valid email (new test).

### Files

- New: `docs/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`
- Modified:
  - `src/app/auth/reset-password/page.tsx`
  - `src/app/auth/forgot-password/page.tsx`
  - `src/lib/api.ts` (two payload types only)
  - `src/lib/validation/password.ts`
  - `src/lib/__tests__/password-validation.test.mjs`
  - `docs/API_INTEGRATION.md` (sections 4 and 5)

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **57/57** (56 before; new: email required for reset) |
| `npx tsc --noEmit -p .` | ✅ exit 0 |
| Whole-project eslint compared with the `HEAD` baseline | ✅ **No new problems:** `HEAD` 419 errors / 105 warnings; now 419 / 104 |
| `npx next build` | ✅ exit 0 |
| **Live:** `test/live/frontend-clients.mjs` (backend repo) imports this repo's `src/lib/api.ts` and `src/lib/admin-api.ts` and calls a running backend | ✅ **31/31**. Auth: signup, verifyEmail, login, getMe, forgot, reset with email, changePassword. Admin: login (separate token key), me, counts, users (list, restrict, suspend), the full content CRUD. Typed `ApiError` kinds: 400 validation, 404 not_found, 409 conflict, and 403 forbidden with `code: 'ACCOUNT_RESTRICTED'`. |

### Outstanding (next: Phase 2)

- Replace the simulated sign-in and sign-up with the real backend flow (login, signup, a verify-email screen with `{ email, token }`, and resend).
- Add a learner session gate to the `(dashboard)` layout, a sign-out, and an `ACCOUNT_RESTRICTED` / `ACCOUNT_FROZEN` screen driven by `ApiError.code`.
- `refresh-token` is a backend mock and is not used. Sessions end when the JWT expires (`JWT_EXPIRES_IN`, default 7d).

## Batch 21 (Phase 2): Real learner authentication (2026-10-12)

**Status:** ✅ Unit tests, type-check, lint and build, plus a smoke render of the built routes. ✅ **The real modules were exercised against a running backend** (`test/live/learner-session.mjs`, 29/29, disposable local database).

### What changed

- **`lib/learner-auth.ts` (new):** `signIn`, `signUp`, `verifyEmail`, `resendVerification`, `signOut`, `fetchCurrentLearner`, `hasLearnerSession`, `safeNextPath` (no open redirects), and user-facing error mappers that never reveal whether an email exists.
  - The token is kept under the learner key only.
  - There is no refresh token: the backend's `refresh-token` is a mock.
- **Session gate, `components/auth/LearnerSessionProvider.tsx` (new), wraps `src/app/(dashboard)/layout.tsx`:**
  - Nothing renders until `GET /auth/me` succeeds.
  - No token or a 401 goes to `/auth/login?next=…`.
  - 403 `ACCOUNT_RESTRICTED` shows the restricted screen, and the app is not shown.
  - `accountStatus: 'frozen'` confines the learner to `/account-state`.
  - Network errors, timeouts and 503 show an error with retry, and the token is kept.
  - A later 401 triggers one `/auth/me` re-check before sign-out, so "Incorrect old password" (401) doesn't end the session.
  - It provides `useLearnerSession()` and `useOptionalLearnerSession()`.
- **`/auth/login`:** real sign-in (email only; the backend has no username sign-in), field validation, slow notice, and messages for restricted, rate-limited and unavailable cases. "Session ended" is shown when `?reason=expired`.
- **`/auth/signup`:** real sign-up. It goes to `/auth/verify-email?email=…`. Date of birth is optional, as on the backend. The broken `/terms` and `/privacy` links now go to `/Legal&Help/*`. The overstated "Encrypted & Secured Registration" is replaced with an accurate line.
- **`/auth/verify-email` (new):** email plus code, resend, and handling for the "too many incorrect codes" and "already verified" cases. "Do this later" is offered because sign-in doesn't require verification.
- **`/onboarding`:**
  - Saves the answers through `lib/onboarding-profile.ts` (new): academic profile, study time, goal and AI companion (409 → update).
  - It states which answers aren't stored.
  - An expired session goes to sign-in.
  - Errors are shown with no false success.
- **`/account-state`:** rewritten on the real status.
  - Freeze, unfreeze (it waits for the refreshed status before navigating) and delete (`{ password }`).
  - The old copy claimed deletion "wiped" data; the backend retains it, and the page now says so.
- **Navbar and mobile menu:** "Log Out" really ends the session. The profile menu shows the signed-in learner instead of a hard-coded real person's name and initials. The streak, XP and coin badges are still hard-coded (Phase 3).
- **`lib/api.ts`:** `authApi.getMe` accepts `{ signal }`; `usersApi.deleteMe(password)` sends `{ password }`.

### Files

- New:
  - `src/lib/learner-auth.ts`, `src/lib/onboarding-profile.ts`
  - `src/components/auth/LearnerSessionProvider.tsx`
  - `src/app/auth/verify-email/page.tsx`
  - `src/lib/__tests__/learner-auth.test.mjs` (11 tests)
- Modified:
  - `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`
  - `src/app/onboarding/page.tsx`
  - `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/account-state/page.tsx`
  - `src/components/layout/Navbar.tsx`, `src/components/layout/HamburgerMenu.tsx`
  - `src/lib/api.ts`
  - `docs/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`, `docs/API_INTEGRATION.md`

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **68/68** (57 before) |
| `npx tsc --noEmit -p .` | ✅ exit 0 |
| Whole-project eslint compared with the `HEAD` baseline | ✅ **No new problems:** `HEAD` 419 errors / 105 warnings; now 419 / 99. The old `account-state` page's 5 warnings are gone. The `set-state-in-effect` error in `Navbar.tsx`'s theme effect predates this batch and is unchanged. |
| `npx next build` | ✅ exit 0. New route: `/auth/verify-email`. |
| Smoke render of the built app (`next start`, HTTP only) | ✅ `/auth/login`, `/auth/signup`, `/auth/verify-email`, `/auth/reset-password`, `/onboarding`, `/dashboard`, `/account-state`, `/admin/content` → 200. Gated pages render "Checking your session". |
| **Live** `test/live/learner-session.mjs` (backend repo) | ✅ **29/29**, plus regressions `frontend-clients.mjs` 31/31 and `backend-workflows.mjs` 54/54 |

### Outstanding

- Browser-level verification (no browser automation is available here). The flows are verified at the module and HTTP level.
- Learner content pages are still mock (Phase 3): dashboard widgets, the navbar streak, XP and coins, `/learn`, the settings profile.

## Batch 22 (Phase 3): Real learning experience (2026-10-12)

**Status:** ✅ Unit tests, type-check, lint and build. ✅ **The real module was exercised against a running backend** (`test/live/learner-learning.mjs`, 23/23).

### What changed

- **`lib/learning.ts` (new):** a typed catalog, enrolment, lesson-progress and stats layer.
  - Types are written against the real responses (probed with `test/live/probe-shapes.mjs`).
  - Pure helpers: ordering, previous/next, completion, "continue", plain-text paragraphs, greeting.
  - `loadLearnerStats()` loads XP, coins and streak independently, so one failing endpoint shows as unavailable rather than failing the page.
- **`/learn`:** my courses (backend progress) and the catalog, with debounced search and a track filter. All loading, empty and error states are present. The hard-coded course list and the 'Examination' and 'Custom' filters are gone.
- **`/learn/[courseId]`:** course, topics and lessons with the learner's completion state; enrol and leave (re-fetches the server state); "Start learning" or "Continue" to the first incomplete lesson.
- **`/learn/lesson/[lessonId]`:**
  - Records the start once (only if the backend has none) and offers "Mark as complete".
  - Previous and next follow the course order.
  - **Content is rendered as plain text, never as HTML.**
  - A lesson whose course is missing still renders (lessons have no foreign key to courses).
- **`/dashboard`:** rewritten on real data: greeting, level and XP, coins, streak, study time, continue learning and recent updates. Widgets with no backend (semester goal, daily goal, reward counters, "exam simulation") were removed, not faked. Unavailable stats show "—".
- **Navbar:** the streak, XP and coin badges show the learner's real values ("—" when unavailable) instead of hard-coded numbers.

### Files

- New:
  - `src/lib/learning.ts`
  - `src/lib/__tests__/learning.test.mjs` (8 tests)
- Rewritten:
  - `src/app/(dashboard)/learn/page.tsx`
  - `src/app/(dashboard)/learn/[courseId]/page.tsx`
  - `src/app/(dashboard)/learn/lesson/[lessonId]/page.tsx`
  - `src/app/(dashboard)/dashboard/page.tsx`
- Modified:
  - `src/components/layout/Navbar.tsx`
  - `docs/FRONTEND_BACKEND_INTEGRATION_AUDIT.md`

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **76/76** (68 before) |
| `npx tsc --noEmit -p .` | ✅ exit 0 |
| Whole-project eslint compared with the `HEAD` baseline | ✅ **No new problems:** `HEAD` 419 errors / 105 warnings; now **417 / 87**. The rewritten pages dropped their old unused-variable warnings and two errors. |
| `npx next build` | ✅ exit 0 |
| **Live** `test/live/learner-learning.mjs` (backend repo) | ✅ **23/23**, plus regressions 29/29, 54/54 and 31/31 |

### Outstanding

- Markdown in lesson content is shown as plain text. A safe Markdown renderer (no raw HTML) can be added later.
- Course progress loads one request per lesson. That's fine for small courses; a batched backend endpoint would scale better.
- `/recommendations` is AI-backed (Phase 6).

## Batch 25 (2026-10-20): Deployment-gap diagnosis and honest email-delivery feedback

**Status:** ✅ Unit tests, type-check, lint and build. ✅ **Live:** the real modules ran against a running local backend (`learner-session` 29/29, `learner-learning` 23/23, `frontend-clients` 31/31). 🟥 **Production sign-up/login are NOT fixed**; see `docs/KNOWN_ISSUES.md`.

### Findings (read-only)

- **Vercel serves `origin/main` = `5d879ae` (2026-10-11).** It has the simulated login, and the auth routes return 404.
- The auth integration (`dff2b87`, 2026-10-13) is on `origin/devbranch` and the local `main`. **Local `main` is unpushed.**
- **`.env.local` points `NEXT_PUBLIC_API_URL` at the production Render backend**, so local development calls production. I recommend changing it to the local backend (not changed automatically).

### Changes

- **`lib/learner-auth.ts`:**
  - `signUp` returns `{ user, verificationEmail }`, and `resendVerification` returns the delivery state.
  - New `deliveryOf` and `deliveryNotice`: `sent`, `pending` or `failed`, read from the backend (Batch 24). `unknown` covers older backends.
- **`/auth/signup`:** passes the delivery state to `/auth/verify-email?…&delivery=`.
- **`/auth/verify-email`:** shows the real state. A failed send shows a **warning** ("We could not send the verification email just now…"), never "we sent you a code". Resend updates the banner with the new result.

### Verification

| Command | Result |
|---|---|
| `npm test` | ✅ **78/78** (+2: delivery state; failed or pending sends never claim "we sent") |
| `npx tsc --noEmit -p .` | ✅ |
| eslint | ✅ 417 errors / 87 warnings, unchanged from Batch 22. The changed files have 0. |
| `npx next build` | ✅ |
| Live suites (backend repo `test/live/`) | ✅ 29/29, 23/23, 31/31 |
