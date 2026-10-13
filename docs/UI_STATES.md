# UI States

Shared conventions for loading, slow, offline, error, empty and success states. Components live in `src/components/ui/states/index.tsx` and `src/components/ui/Alert.tsx`; hooks live in `src/hooks/`.

_Last updated: 2026-10-12 (Batch 17)._

## 1. Building blocks

| Piece | Use it for |
|---|---|
| `useApiQuery(fetcher, deps)` | Loading data. Returns `{ data, error, status, isLoading, isRefreshing, isSlow, retry }`. Aborts on unmount and when deps change; a stale response never overwrites newer state. Data already shown is kept while refreshing and when a refresh fails. |
| `useAsyncAction(action)` | User-triggered operations (submit, save, delete, generate). Ignores repeat calls while one is in flight, never auto-retries, aborts on unmount. |
| `useSlowFlag(active)` | `true` after 8 s (`SLOW_REQUEST_THRESHOLD_MS`) of a still-running operation. |
| `useOnlineStatus()` | `navigator.onLine`, kept in sync with `online`/`offline` events. |
| `<QueryState query isEmpty empty loading>{(data) => …}</QueryState>` | The standard order: skeleton → error with retry → empty → content. |
| `<LoadingState layout="list" \| "cards" \| "table" \| "detail" />` | Skeletons shaped like the real content (`role="status"`, one screen-reader announcement). |
| `<SlowNotice />` | A calm "taking longer than usual, no need to resend" message. |
| `<EmptyState title description action />` | Explains the empty result and offers the next action. |
| `<ErrorState error onRetry signInHref compact />` | Error card or compact banner, with the recovery action matched to `error.kind`. |
| `<OfflineBanner />` | A global banner while the browser is offline (learner dashboard and admin layouts). |
| `<ConfirmDialog />` | A native `<dialog>` confirmation for destructive actions, with optional typed confirmation |
| `<Alert variant="error" \| "success" \| "info" \| "warning" \| "offline" />` | Inline form and status messages (`role="alert"` for errors). |
| `<Button isLoading>` (existing) | Disables itself and shows a spinner while pending. |

## 2. Rules

**Loading**
- Show a skeleton that matches the final layout, so it doesn't jump. Never show a blank screen.
- Disable submit buttons while pending (`Button isLoading` / `disabled`), and ignore repeat submits (`useAsyncAction`, or a guard such as `if (isSubmitting) return`).
- Keep entered form values while a request is pending and when it fails. Clear them only after the server confirms success.

**Slow network**
- After 8 s, show `SlowNotice` once; don't flash it repeatedly. A slow request is **not** a failure.
- AI operations have a 150 s client timeout, so the UI waits rather than reporting an error while the server is still generating.

**Offline and connection loss**
- `OfflineBanner` reflects the browser's own offline state.
- A request with no HTTP response becomes `kind: 'network'` and shows "You appear to be offline" with a retry.
- A backend or AI outage is different: the server answered with a 502, 503 or 504, and is shown as "Service temporarily unavailable" or "This took too long".

**Errors**
- Match the recovery action to the error kind:
  - `unauthorized` → **Sign in again** (learner: `/auth/login`; admin: the admin sign-in page).
  - Transient (`network`, `timeout`, `rate_limited`, `ai_unavailable`, `server`) → **Try again**.
  - `validation` → field messages, with no retry button.
  - `forbidden` / `not_found` → explain, with no retry button.
- Show only `ApiError.message` or `recoveryHint()`. Never show stack traces, raw responses, database text or provider details.
- A mutation that timed out may still have been applied by the server. Do **not** auto-retry it. Tell the user it may have completed and let them refresh or check before trying again. This is the duplicate-record protection until the backend supports idempotency keys.

**Empty**
- Say why nothing is shown (for example "No quizzes yet") and offer the next step (for example "Generate a quiz from a document").

**Success and partial success**
- Confirm success only after the server responds successfully. Never show an AI result as successful unless the backend returned it.
- When part of an operation fails (for example a refresh after data was loaded), keep the existing content and show a compact `ErrorState` above it.

**Accessibility**
- Errors use `role="alert"`; loading, slow and success messages use `role="status"`.
- Icons are `aria-hidden`; inputs have labels (the existing `Input` component).
- Interactive elements are native buttons or links, never a `<button>` nested inside an `<a>`.

## 3. Where the states are applied today

| Area | States in use |
|---|---|
| Change password (Settings → Account) | Field validation, pending and disabled button, slow notice, error by kind (incorrect current password on its field, sign in again, offline), success |
| Forgot password | Validation, pending, slow, error by kind, neutral success |
| Reset password | Validation, invalid or expired code on its field, pending, slow, error by kind, success with a link to sign-in |
| Learner dashboard layout | `OfflineBanner` |
| Admin console session gate | Skeleton while the backend confirms the session. 401/403 → admin sign-in with "session ended". 503 → "admin authentication not configured" with retry. Network/server → error with retry. `OfflineBanner` in the admin layout. |
| Admin sign-in | Field validation, pending, slow notice (cold start), errors: bad credentials, not configured, offline |
| Admin overview | Card skeletons, error with retry, two real metrics only, plus an explanation of the unavailable metrics |
| Admin users list | Debounced search (400 ms), table skeleton, empty state (none yet / no match), error with retry, pagination disabled while loading, data kept during refresh |
| Admin user detail | Detail skeleton, 404 or error with retry, unsupported actions disabled with the reason, delete behind a typed-confirmation `ConfirmDialog` (pending, slow, error, and a "may have completed" note on timeout), success screen |
| Admin "not connected" sections | An explicit "Not yet connected" state with no simulated data |
| Learner data pages (dashboard, library, practice, exams, AI, …) | **Not yet**. These pages still render local mock data and make no API calls. States will be applied as each page is wired to the backend; applying them to mock data would misrepresent the app. |

## 4. Testing

`npm test` covers the request and error rules: timeouts, cancellation, retry policy, 401 handling, error kinds, single-flight and the AI-endpoint policy. React hooks and components have no automated DOM tests, because the project has no DOM test environment and none was added (that would need new dependencies). They are covered by type-checking and the production build.
