# GleamLearn endpoint integration matrix

**Generated** by `node scripts/integration-inventory.mjs --md=<file>` (the tables below) from the actual code of `mycoursea-backend` and this frontend. Regenerate it after each batch; do not edit the tables by hand.

## How to read it

| Status | Meaning |
|---|---|
| **WIRED** | A typed client function exists in `src/lib/*.ts` and is referenced from code reachable through imports from an app route (`page.tsx`/`layout.tsx`). Static evidence of wiring only — whether the screen works is verified separately (browser suites, see `docs/INTEGRATION_REPORT.md`). |
| **CLIENT ONLY** | A client function exists but nothing reachable from a route uses it. |
| **FRONTEND MISSING** | No client function calls this route. |

- **Learner** = learner/public routes. **Admin** = routes under `/admin/*`, or any route guarded by `@AdminOnly(permission)` (admin JWT plus that permission), wherever its path is.
- **Guard** is the decorator on the handler or its controller (`JwtAuthGuard`, `AdminOnly(…)`, `AdminJwtAuthGuard`, `none` = public).
- Paths are relative to `/api/v1`; `:p` is a path parameter.

## Totals (2026-10-29, after the admin console batches A–I)

| | Routes | WIRED | CLIENT ONLY | FRONTEND MISSING |
|---|---|---|---|---|
| Learner / public | 342 | 206 | 120 | 16 |
| Admin (incl. `@AdminOnly` management routes outside `/admin`) | 169 | 91 | 22 | 56 |
| **All** | **511** | **297** | **142** | **72** |

Raw detector counts. Many admin routes are called with paths built at runtime, which the detector cannot see; `docs/ADMIN_INTEGRATION_MATRIX.md` classifies every admin route. Two routes were added for the console: `GET /admin/access` and `GET /questions/manage/all`.

### Admin — Academic Structure & Management (10: 10 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/institutions` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.list` | `app/admin/(console)/academic/page.tsx` |
| POST | `/institutions` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.createInstitution`<br>`academicApi.createInstitution` | `app/admin/(console)/academic/page.tsx` |
| PATCH | `/institutions/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.updateInstitution`<br>`academicApi.updateInstitution` | `app/admin/(console)/academic/page.tsx` |
| DELETE | `/institutions/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.deleteInstitution`<br>`academicApi.deleteInstitution` | `app/admin/(console)/academic/page.tsx` |
| POST | `/faculties` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.createFaculty`<br>`academicApi.createFaculty` | `app/admin/(console)/academic/page.tsx` |
| PATCH | `/faculties/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.updateFaculty`<br>`academicApi.updateFaculty` | `app/admin/(console)/academic/page.tsx` |
| DELETE | `/faculties/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.deleteFaculty`<br>`academicApi.deleteFaculty` | `app/admin/(console)/academic/page.tsx` |
| POST | `/departments` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.createDepartment`<br>`academicApi.createDepartment` | `app/admin/(console)/academic/page.tsx` |
| PATCH | `/departments/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.updateDepartment`<br>`academicApi.updateDepartment` | `app/admin/(console)/academic/page.tsx` |
| DELETE | `/departments/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminAcademicApi.deleteDepartment`<br>`academicApi.deleteDepartment` | `app/admin/(console)/academic/page.tsx` |

### Admin — Admin - Learning Content (11: 11 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/content/courses` | AdminJwtAuthGuard | WIRED | `adminContentApi.listCourses` | `app/admin/(console)/content/page.tsx` |
| POST | `/admin/content/courses` | AdminJwtAuthGuard | WIRED | `adminContentApi.createCourse` | `app/admin/(console)/content/page.tsx` |
| GET | `/admin/content/courses/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.getCourse` | `app/admin/(console)/content/[id]/page.tsx` |
| PATCH | `/admin/content/courses/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.updateCourse` | `app/admin/(console)/content/[id]/page.tsx` |
| DELETE | `/admin/content/courses/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.deleteCourse` | `app/admin/(console)/content/[id]/page.tsx` |
| POST | `/admin/content/courses/:p/topics` | AdminJwtAuthGuard | WIRED | `adminContentApi.createTopic` | `app/admin/(console)/content/[id]/page.tsx` |
| PATCH | `/admin/content/topics/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.updateTopic` | `app/admin/(console)/content/[id]/page.tsx` |
| DELETE | `/admin/content/topics/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.deleteTopic` | `app/admin/(console)/content/[id]/page.tsx` |
| POST | `/admin/content/courses/:p/lessons` | AdminJwtAuthGuard | WIRED | `adminContentApi.createLesson` | `app/admin/(console)/content/[id]/page.tsx` |
| PATCH | `/admin/content/lessons/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.updateLesson` | `app/admin/(console)/content/[id]/page.tsx` |
| DELETE | `/admin/content/lessons/:p` | AdminJwtAuthGuard | WIRED | `adminContentApi.deleteLesson` | `app/admin/(console)/content/[id]/page.tsx` |

### Admin — Admin AI Content Moderation (5: 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/ai/generated-content` | AdminJwtAuthGuard | WIRED | `adminModerationApi.listAiContent` | `components/admin/OverviewExtras.tsx`<br>`app/admin/(console)/moderation/page.tsx` |
| GET | `/admin/ai/generated-content/:p` | AdminJwtAuthGuard | WIRED | `adminModerationDetailApi.aiContent` | `app/admin/(console)/moderation/page.tsx` |
| PATCH | `/admin/ai/generated-content/:p/approve` | AdminJwtAuthGuard | WIRED | `adminModerationApi.approveAiContent` | `app/admin/(console)/moderation/page.tsx` |
| PATCH | `/admin/ai/generated-content/:p/reject` | AdminJwtAuthGuard | WIRED | `adminModerationApi.rejectAiContent` | `app/admin/(console)/moderation/page.tsx` |
| DELETE | `/admin/ai/generated-content/:p` | AdminJwtAuthGuard | WIRED | `adminModerationApi.deleteAiContent` | `app/admin/(console)/moderation/page.tsx` |

### Admin — Admin Activity Monitoring (6: 1 WIRED, 5 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/activity` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.activity` | `app/admin/(console)/security/page.tsx` |
| GET | `/admin/activity/users` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/activity/learning` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/activity/assessments` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/activity/ai` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/activity/payments` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin Audit Logs (2: 2 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/audit-logs` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.auditLogs` | `app/admin/(console)/security/page.tsx`<br>`components/admin/OverviewExtras.tsx`<br>`app/admin/(console)/gamification/page.tsx` |
| GET | `/admin/audit-logs/:p` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.auditLog` | `app/admin/(console)/security/page.tsx` |

### Admin — Admin Authentication (6: 2 WIRED, 3 FRONTEND MISSING, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/admin/auth/login` | none | WIRED | `res` | `app/onboarding/page.tsx`<br>`lib/learner-auth.ts`<br>`components/auth/registration/RegistrationWizard.tsx` +41 |
| POST | `/admin/auth/logout` | none | WIRED | `logout` | `lib/learner-auth.ts`<br>`lib/api.ts`<br>`app/admin/(console)/users/[id]/page.tsx` +2 |
| POST | `/admin/auth/refresh` | none | FRONTEND MISSING | — | — |
| POST | `/admin/auth/forgot-password` | none | FRONTEND MISSING | — | — |
| POST | `/admin/auth/reset-password` | none | FRONTEND MISSING | — | — |
| GET | `/admin/auth/me` | AdminJwtAuthGuard | CLIENT ONLY | `adminAuthApi.me` | — |

### Admin — Admin Course Management (7: 7 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/courses` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/courses/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/courses` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/courses/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| DELETE | `/admin/courses/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/courses/:p/publish` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/courses/:p/unpublish` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin Dashboard (7: 6 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/dashboard/counts` | AdminJwtAuthGuard | WIRED | `adminDashboardApi.counts` | `app/admin/(console)/page.tsx` |
| GET | `/admin/dashboard` | AdminJwtAuthGuard | CLIENT ONLY | `adminDashboardApi.overview` | — |
| GET | `/admin/dashboard/users` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.dashboardSection` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/dashboard/activity` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.dashboardSection` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/dashboard/revenue` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.dashboardSection` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/dashboard/learning` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.dashboardSection` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/dashboard/engagement` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.dashboardSection` | `app/admin/(console)/analytics/page.tsx` |

### Admin — Admin Gamification Management (6: 6 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/gamification/xp` | AdminJwtAuthGuard | WIRED | `adminGamificationApi.xp` | `app/admin/(console)/gamification/page.tsx` |
| GET | `/admin/gamification/coins` | AdminJwtAuthGuard | WIRED | `adminGamificationApi.coins` | `app/admin/(console)/gamification/page.tsx` |
| GET | `/admin/gamification/streaks` | AdminJwtAuthGuard | WIRED | `adminGamificationApi.streaks` | `app/admin/(console)/gamification/page.tsx` |
| GET | `/admin/gamification/leaderboards` | AdminJwtAuthGuard | WIRED | `adminGamificationApi.leaderboard` | `app/admin/(console)/gamification/page.tsx` |
| POST | `/admin/users/:p/xp` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.adjust` | `components/admin/UserExtras.tsx` |
| POST | `/admin/users/:p/coins` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.adjust` | `components/admin/UserExtras.tsx` |

### Admin — Admin Notifications (4: 4 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/admin/notifications` | AdminJwtAuthGuard | WIRED | `adminNotificationsApi.sendToUser` | `components/admin/UserExtras.tsx`<br>`app/admin/(console)/notifications/page.tsx` |
| POST | `/admin/notifications/broadcast` | AdminJwtAuthGuard | WIRED | `adminNotificationsApi.broadcast` | `app/admin/(console)/notifications/page.tsx` |
| GET | `/admin/notifications` | AdminJwtAuthGuard | WIRED | `adminNotificationsApi.history` | `app/admin/(console)/notifications/page.tsx` |
| DELETE | `/admin/notifications/:p` | AdminJwtAuthGuard | WIRED | `adminNotificationsApi.removeRecord` | `app/admin/(console)/notifications/page.tsx` |

### Admin — Admin Performance Analytics (10: 10 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/analytics/overview` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/students` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/courses` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/subjects` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/exams` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/quizzes` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/tests` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/learning` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/retention` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |
| GET | `/admin/analytics/streaks` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.analytics` | `app/admin/(console)/analytics/page.tsx` |

### Admin — Admin Question Management (7: 7 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/questions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/questions/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/questions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/questions/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| DELETE | `/admin/questions/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/questions/:p/approve` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/questions/:p/reject` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin Reports Management (6: 6 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/feedback` | AdminJwtAuthGuard | WIRED | `adminFeedbackApi.list` | `app/admin/(console)/moderation/page.tsx` |
| GET | `/admin/reports` | AdminJwtAuthGuard | WIRED | `adminModerationApi.listReports` | `app/admin/(console)/question-bank/page.tsx`<br>`components/admin/OverviewExtras.tsx`<br>`app/admin/(console)/moderation/page.tsx` |
| GET | `/admin/reports/:p` | AdminJwtAuthGuard | WIRED | `adminModerationDetailApi.report` | `app/admin/(console)/moderation/page.tsx` |
| PATCH | `/admin/reports/:p` | AdminJwtAuthGuard | WIRED | `adminModerationDetailApi.updateReport` | `app/admin/(console)/moderation/page.tsx` |
| PATCH | `/admin/reports/:p/resolve` | AdminJwtAuthGuard | WIRED | `adminModerationApi.resolveReport` | `app/admin/(console)/moderation/page.tsx` |
| PATCH | `/admin/reports/:p/reject` | AdminJwtAuthGuard | WIRED | `adminModerationApi.rejectReport` | `app/admin/(console)/moderation/page.tsx` |

### Admin — Admin Revenue & Finance (7: 5 WIRED, 2 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/finance/overview` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.finance` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/finance/revenue` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.finance` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/finance/transactions` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.finance` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/finance/subscriptions` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.finance` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/finance/refunds` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.finance` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/finance/revenue/daily` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/finance/revenue/monthly` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin Roles & Permissions (9: 1 WIRED, 8 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/access` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.access` | `app/admin/(console)/security/page.tsx` |
| GET | `/admin/roles` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/roles` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/roles/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/roles/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| DELETE | `/admin/roles/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/permissions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/roles/:p/permissions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| DELETE | `/admin/roles/:p/permissions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin Security & Abuse Management (5: 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/security/events` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.events` | `app/admin/(console)/security/page.tsx` |
| GET | `/admin/security/suspicious-users` | AdminJwtAuthGuard | WIRED | `adminSecurityApi.restrictedUsers` | `app/admin/(console)/security/page.tsx`<br>`components/admin/OverviewExtras.tsx` |
| POST | `/admin/users/:p/restrict` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.adjust` | `components/admin/UserExtras.tsx` |
| POST | `/admin/users/:p/unrestrict` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.adjust` | `components/admin/UserExtras.tsx` |
| POST | `/admin/users/:p/force-logout` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.adjust` | `components/admin/UserExtras.tsx` |

### Admin — Admin Subscription Management (5: 1 WIRED, 4 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/subscriptions` | AdminJwtAuthGuard | WIRED | `adminInsightsApi.subscriptions` | `app/admin/(console)/finance/page.tsx` |
| GET | `/admin/subscriptions/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/subscriptions/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/subscriptions/:p/cancel` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| POST | `/admin/subscriptions/:p/refund` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin System Configuration (2: 1 WIRED, 1 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/settings` | AdminJwtAuthGuard | WIRED | `adminSettingsApi.get` | `app/admin/(console)/settings/page.tsx` |
| PATCH | `/admin/settings` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Admin System Monitoring (5: 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/system/health` | AdminJwtAuthGuard | WIRED | `adminSystemApi.health` | `app/admin/(console)/system/page.tsx`<br>`components/admin/OverviewExtras.tsx` |
| GET | `/admin/system/queues` | AdminJwtAuthGuard | WIRED | `adminSystemApi.metric` | `app/admin/(console)/system/page.tsx` |
| GET | `/admin/system/storage` | AdminJwtAuthGuard | WIRED | `adminSystemApi.metric` | `app/admin/(console)/system/page.tsx` |
| GET | `/admin/system/ai` | AdminJwtAuthGuard | WIRED | `adminSystemApi.metric` | `app/admin/(console)/system/page.tsx` |
| GET | `/admin/system/errors` | AdminJwtAuthGuard | WIRED | `adminSystemApi.metric` | `app/admin/(console)/system/page.tsx` |

### Admin — Admin User Management (14: 6 WIRED, 8 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/users` | AdminJwtAuthGuard | WIRED | `adminUsersApi.list` | `app/admin/(console)/users/page.tsx` |
| GET | `/admin/users/:p` | AdminJwtAuthGuard | WIRED | `adminUsersApi.get` | `app/admin/(console)/users/[id]/page.tsx` |
| GET | `/admin/users/:p/profile` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/users/:p/activity` | AdminJwtAuthGuard | WIRED | `adminUsersApi.activity` | `app/admin/(console)/users/[id]/page.tsx` |
| GET | `/admin/users/:p/progress` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.progress` | `components/admin/UserExtras.tsx` |
| GET | `/admin/users/:p/analytics` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.analytics` | `components/admin/UserExtras.tsx` |
| PATCH | `/admin/users/:p/suspend` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/users/:p/unsuspend` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/users/:p/freeze` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/users/:p/unfreeze` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| DELETE | `/admin/users/:p` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/users/:p/reset-password` | AdminJwtAuthGuard | WIRED | `adminUserInsightsApi.resetPassword` | `components/admin/UserExtras.tsx` |
| PATCH | `/admin/users/:p/verify` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| PATCH | `/admin/users/:p/unverify` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Admin — Course Lessons & Progress (3: 3 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/courses/:p/lessons` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `lessonsApi.createLesson` | — |
| PATCH | `/lessons/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `lessonsApi.updateLesson` | — |
| DELETE | `/lessons/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `lessonsApi.deleteLesson` | — |

### Admin — Courses, Topics & Enrollments (6: 6 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/courses` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.createCourse` | — |
| PATCH | `/courses/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.updateCourse` | — |
| DELETE | `/courses/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.deleteCourse` | — |
| POST | `/courses/:p/topics` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.createTopic` | — |
| PATCH | `/topics/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.updateTopic` | — |
| DELETE | `/topics/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `coursesApi.deleteTopic` | — |

### Admin — Examinations System (5: 3 CLIENT ONLY, 2 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/exams` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `examsApi.createExam` | — |
| GET | `/exams/manage/all` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| GET | `/exams/manage/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| PATCH | `/exams/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `examsApi.updateExam` | — |
| DELETE | `/exams/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `examsApi.deleteExam` | — |

### Admin — File & PDF Upload (2: 1 FRONTEND MISSING, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/files` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| DELETE | `/files/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `filesApi.deleteFile` | — |

### Admin — Questions Bank (4: 4 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/questions` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminQuestionBankApi.create`<br>`questionsApi.createQuestion` | `app/admin/(console)/question-bank/page.tsx` |
| GET | `/questions/manage/all` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminQuestionBankApi.list` | `app/admin/(console)/question-bank/page.tsx` |
| PATCH | `/questions/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminQuestionBankApi.update`<br>`questionsApi.updateQuestion` | `app/admin/(console)/question-bank/page.tsx` |
| DELETE | `/questions/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | WIRED | `adminQuestionBankApi.remove`<br>`questionsApi.deleteQuestion` | `app/admin/(console)/question-bank/page.tsx` |

### Admin — Quizzes System (5: 3 CLIENT ONLY, 2 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/quizzes` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `quizzesApi.createQuiz` | — |
| GET | `/quizzes/manage/all` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| GET | `/quizzes/manage/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| PATCH | `/quizzes/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `quizzesApi.updateQuiz` | — |
| DELETE | `/quizzes/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `quizzesApi.deleteQuiz` | — |

### Admin — Tests & Assessments System (5: 3 CLIENT ONLY, 2 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/tests` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `testsApi.createTest` | — |
| GET | `/tests/manage/all` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| GET | `/tests/manage/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | FRONTEND MISSING | — | — |
| PATCH | `/tests/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `testsApi.updateTest` | — |
| DELETE | `/tests/:p` | AdminOnly(AdminPermission.CONTENT_MANAGE) | CLIENT ONLY | `testsApi.deleteTest` | — |

### Admin — XP & Gamification (1: 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/xp/award` | AdminOnly(AdminPermission.USERS_MANAGE) | CLIENT ONLY | `xpApi.awardXp` | — |

### Admin — admin-export.controller.ts (4: 4 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/admin/export/users` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/export/analytics` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/export/transactions` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/admin/export/activity` | AdminJwtAuthGuard | FRONTEND MISSING | — | — |

### Learner — AI Document Processing (14: 14 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/ai/documents/:p/analyze` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.analyzeDocument` | — |
| GET | `/ai/documents/:p/analysis` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.getDocumentAnalysis` | — |
| POST | `/ai/documents/:p/generate-notes` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateNotes` | — |
| POST | `/ai/documents/:p/generate-summary` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateSummary` | — |
| POST | `/ai/documents/:p/generate-flashcards` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateFlashcards` | — |
| POST | `/ai/documents/:p/generate-questions` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateQuestions` | — |
| POST | `/ai/documents/:p/generate-quiz` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateQuiz` | — |
| POST | `/ai/documents/:p/generate-test` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateTest` | — |
| POST | `/ai/documents/:p/generate-exam` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateExam` | — |
| POST | `/ai/documents/:p/create-course` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.createCourseFromDocument` | — |
| GET | `/ai/documents/:p/generated-content` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.getGeneratedContent` | — |
| POST | `/ai/documents/:p/generate-live-class` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.generateLiveClass` | — |
| GET | `/ai/documents/:p/live-class-stream` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.getLiveClassStream` | — |
| POST | `/ai/documents/:p/export-pdf` | JwtAuthGuard | CLIENT ONLY | `aiDocumentsApi.exportPdf` | — |

### Learner — AI Recommendations (6: 2 WIRED, 4 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/recommendations` | JwtAuthGuard | WIRED | `recommendationsApi.getAllRecommendations` | `lib/next-steps.ts` |
| GET | `/recommendations/courses` | JwtAuthGuard | WIRED | `recommendationsApi.getCourseRecommendations` | `lib/learning.ts` |
| GET | `/recommendations/topics` | JwtAuthGuard | CLIENT ONLY | `recommendationsApi.getTopicRecommendations` | — |
| GET | `/recommendations/quizzes` | JwtAuthGuard | CLIENT ONLY | `recommendationsApi.getQuizRecommendations` | — |
| GET | `/recommendations/revision` | JwtAuthGuard | CLIENT ONLY | `recommendationsApi.getRevisionRecommendations` | — |
| GET | `/recommendations/exams` | JwtAuthGuard | CLIENT ONLY | `recommendationsApi.getExamRecommendations` | — |

### Learner — AI Study Planner (10: 6 WIRED, 4 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/planner` | JwtAuthGuard | WIRED | `plannerApi.createPlannerItem` | `lib/planner.ts` |
| POST | `/planner/generate` | JwtAuthGuard | WIRED | `plannerApi.generatePlanner` | `lib/planner.ts` |
| GET | `/planner` | JwtAuthGuard | WIRED | `plannerApi.getAllPlannerSessions` | `lib/planner.ts` |
| GET | `/planner/today` | JwtAuthGuard | CLIENT ONLY | `plannerApi.getTodayAgenda` | — |
| GET | `/planner/week` | JwtAuthGuard | CLIENT ONLY | `plannerApi.getWeeklySchedule` | — |
| GET | `/planner/month` | JwtAuthGuard | CLIENT ONLY | `plannerApi.getMonthlySchedule` | — |
| PATCH | `/planner/:p` | JwtAuthGuard | CLIENT ONLY | `plannerApi.updatePlannerItem` | — |
| POST | `/planner/:p/complete` | JwtAuthGuard | WIRED | `plannerApi.completePlannerSession` | `lib/planner.ts` |
| POST | `/planner/:p/skip` | JwtAuthGuard | WIRED | `plannerApi.skipPlannerSession` | `lib/planner.ts` |
| POST | `/planner/regenerate` | JwtAuthGuard | WIRED | `plannerApi.regeneratePlanner` | `lib/planner.ts` |

### Learner — AI Tutor (11: 8 WIRED, 3 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/ai-tutor/sessions` | JwtAuthGuard | WIRED | `aiTutorApi.createSession` | `lib/ai.ts` |
| GET | `/ai-tutor/sessions` | JwtAuthGuard | WIRED | `aiTutorApi.getAllSessions` | `lib/history.ts`<br>`lib/ai.ts` |
| GET | `/ai-tutor/sessions/:p` | JwtAuthGuard | WIRED | `aiTutorApi.getSessionById` | `lib/ai.ts` |
| POST | `/ai-tutor/sessions/:p/message` | JwtAuthGuard | WIRED | `aiTutorApi.sendMessage` | `lib/ai.ts` |
| POST | `/ai-tutor/sessions/:p/question` | JwtAuthGuard | CLIENT ONLY | `aiTutorApi.askQuestion` | — |
| POST | `/ai-tutor/sessions/:p/answer` | JwtAuthGuard | CLIENT ONLY | `aiTutorApi.submitAnswer` | — |
| POST | `/ai-tutor/sessions/:p/end` | JwtAuthGuard | WIRED | `aiTutorApi.endSession` | `lib/ai.ts` |
| POST | `/ai-tutor/teach` | JwtAuthGuard | WIRED | `aiTutorApi.teachTopic` | `lib/ai.ts` |
| POST | `/ai-tutor/explain` | JwtAuthGuard | WIRED | `aiTutorApi.explainConcept` | `lib/visual-lesson.ts` |
| POST | `/ai-tutor/generate-diagram` | JwtAuthGuard | WIRED | `aiTutorApi.generateDiagram` | `lib/ai.ts` |
| POST | `/ai-tutor/drawing-instructions` | JwtAuthGuard | CLIENT ONLY | `aiTutorApi.getDrawingInstructions` | — |

### Learner — Academic Structure & Levels (1: 1 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/academic-levels` | none | WIRED | `adminAcademicApi.levels`<br>`academicApi.getAcademicLevels` | `app/admin/(console)/academic/page.tsx`<br>`lib/academic-directory.ts` |

### Learner — Academic Structure & Management (3: 1 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/institutions` | JwtAuthGuard | WIRED | `academicApi.getInstitutions` | `lib/academic-directory.ts` |
| GET | `/faculties` | JwtAuthGuard | CLIENT ONLY | `academicApi.getFaculties` | — |
| GET | `/departments` | JwtAuthGuard | CLIENT ONLY | `academicApi.getDepartments` | — |

### Learner — Achievements (3: 2 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/achievements` | none | WIRED | `achievementsApi.getAllAchievements` | `lib/gamification.ts` |
| GET | `/achievements/me` | AuthGuard('jwt' | WIRED | `achievementsApi.getMyAchievements` | `lib/profile.ts`<br>`lib/gamification.ts` |
| GET | `/achievements/:p` | none | CLIENT ONLY | `achievementsApi.getAchievementById` | — |

### Learner — Assessment Analytics (11: 1 FRONTEND MISSING, 3 CLIENT ONLY, 7 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/analytics/overview` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/analytics/courses` | JwtAuthGuard | CLIENT ONLY | `analyticsApi.getAggregatedCourseAnalytics` | — |
| GET | `/analytics/courses/:p` | JwtAuthGuard | CLIENT ONLY | `analyticsApi.getCourseAnalyticsById` | — |
| GET | `/analytics/topics` | JwtAuthGuard | WIRED | `analyticsApi.getTopicAnalytics` | `lib/exam-prep.ts` |
| GET | `/analytics/weak-topics` | JwtAuthGuard | WIRED | `analyticsApi.getWeakTopics` | `lib/exam-prep.ts` |
| GET | `/analytics/strong-topics` | JwtAuthGuard | WIRED | `analyticsApi.getStrongTopics` | `lib/exam-prep.ts` |
| GET | `/analytics/quiz-performance` | JwtAuthGuard | WIRED | `analyticsApi.getQuizPerformance` | `lib/exam-prep.ts` |
| GET | `/analytics/test-performance` | JwtAuthGuard | WIRED | `analyticsApi.getTestPerformance` | `lib/exam-prep.ts` |
| GET | `/analytics/exam-performance` | JwtAuthGuard | WIRED | `analyticsApi.getExamPerformance` | `lib/exam-prep.ts` |
| GET | `/analytics/time-spent` | JwtAuthGuard | CLIENT ONLY | `analyticsApi.getTimeSpentMetrics` | — |
| GET | `/analytics/mastery` | JwtAuthGuard | WIRED | `analyticsApi.getOverallMastery` | `lib/exam-prep.ts` |

### Learner — Auth (11: 9 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/auth/signup` | none | WIRED | `authApi.signup` | `lib/learner-auth.ts` |
| POST | `/auth/login` | none | WIRED | `authApi.login` | `lib/learner-auth.ts` |
| POST | `/auth/logout` | none | WIRED | `authApi.logout` | `lib/learner-auth.ts` |
| POST | `/auth/refresh-token` | none | CLIENT ONLY | `authApi.refreshToken` | — |
| POST | `/auth/verify-email` | none | WIRED | `authApi.verifyEmail` | `lib/learner-auth.ts` |
| POST | `/auth/resend-verification` | none | WIRED | `authApi.resendVerification` | `lib/learner-auth.ts` |
| POST | `/auth/forgot-password` | none | WIRED | `authApi.forgotPassword` | `app/auth/forgot-password/page.tsx` |
| POST | `/auth/reset-password` | none | WIRED | `authApi.resetPassword` | `app/auth/reset-password/page.tsx` |
| POST | `/auth/change-password` | JwtAuthGuard | WIRED | `authApi.changePassword` | `components/auth/ChangePasswordForm.tsx` |
| GET | `/auth/me` | JwtAuthGuard | WIRED | `authApi.getMe` | `lib/learner-auth.ts` |
| PATCH | `/auth/me` | JwtAuthGuard | CLIENT ONLY | `authApi.updateMe` | — |

### Learner — Badges (2: 2 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/badges` | none | WIRED | `badgesApi.getAllBadges` | `lib/gamification.ts` |
| GET | `/badges/me` | AuthGuard('jwt' | WIRED | `badgesApi.getMyBadges` | `lib/gamification.ts` |

### Learner — Calendar & Schedule (7: 3 CLIENT ONLY, 4 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/calendar` | JwtAuthGuard | CLIENT ONLY | `calendarApi.getAllEvents` | — |
| GET | `/calendar/month` | JwtAuthGuard | WIRED | `calendarApi.getEventsByMonth` | `lib/planner.ts` |
| GET | `/calendar/week` | JwtAuthGuard | CLIENT ONLY | `calendarApi.getEventsByWeek` | — |
| GET | `/calendar/day` | JwtAuthGuard | CLIENT ONLY | `calendarApi.getEventsByDay` | — |
| POST | `/calendar/events` | JwtAuthGuard | WIRED | `calendarApi.createEvent` | `lib/planner.ts` |
| PATCH | `/calendar/events/:p` | JwtAuthGuard | WIRED | `calendarApi.updateEvent` | `lib/planner.ts` |
| DELETE | `/calendar/events/:p` | JwtAuthGuard | WIRED | `calendarApi.deleteEvent` | `lib/planner.ts` |

### Learner — Coins & Economy (4: 2 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/coins` | AuthGuard('jwt' | WIRED | `coinsApi.getCoinBalance` | `lib/learning.ts` |
| GET | `/coins/history` | AuthGuard('jwt' | WIRED | `coinsApi.getCoinHistory` | `lib/gamification.ts` |
| GET | `/coins/transactions` | AuthGuard('jwt' | CLIENT ONLY | `coinsApi.getCoinTransactions` | — |
| POST | `/coins/spend` | AuthGuard('jwt' | CLIENT ONLY | `coinsApi.spendCoins` | — |

### Learner — Course Lessons & Progress (5: 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/courses/:p/lessons` | JwtAuthGuard | WIRED | `lessonsApi.getCourseLessons` | `lib/learning.ts` |
| GET | `/lessons/:p` | JwtAuthGuard | WIRED | `lessonsApi.getLessonById` | `lib/learning.ts` |
| POST | `/lessons/:p/start` | JwtAuthGuard | WIRED | `lessonsApi.startLesson` | `lib/learning.ts` |
| POST | `/lessons/:p/complete` | JwtAuthGuard | WIRED | `lessonsApi.completeLesson` | `lib/learning.ts` |
| GET | `/lessons/:p/progress` | JwtAuthGuard | WIRED | `lessonsApi.getLessonProgress` | `lib/learning.ts` |

### Learner — Courses, Topics & Enrollments (8: 3 CLIENT ONLY, 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/courses/search` | JwtAuthGuard | CLIENT ONLY | `queryParams` | — |
| GET | `/users/me/courses` | JwtAuthGuard | WIRED | `coursesApi.getEnrolledCourses` | `lib/learning.ts` |
| GET | `/courses` | JwtAuthGuard | WIRED | `coursesApi.getAllCourses` | `lib/learning.ts`<br>`lib/library.ts` |
| GET | `/courses/:p` | JwtAuthGuard | WIRED | `coursesApi.getCourseById` | `lib/learning.ts` |
| GET | `/courses/:p/topics` | JwtAuthGuard | CLIENT ONLY | `coursesApi.getCourseTopics` | — |
| GET | `/topics/:p` | JwtAuthGuard | CLIENT ONLY | `coursesApi.getTopicById` | — |
| POST | `/courses/:p/enroll` | JwtAuthGuard | WIRED | `coursesApi.enrollInCourse` | `lib/learning.ts` |
| DELETE | `/courses/:p/enroll` | JwtAuthGuard | WIRED | `coursesApi.unenrollFromCourse` | `lib/learning.ts` |

### Learner — Examination Preparation & Past Questions (12: 8 WIRED, 3 CLIENT ONLY, 1 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/examinations` | JwtAuthGuard | WIRED | `examinationBoardsApi.getAllExaminationBoards` | `lib/exam-prep.ts` |
| GET | `/examinations/:p` | JwtAuthGuard | CLIENT ONLY | `examinationBoardsApi.getExaminationBoardById` | — |
| GET | `/past-questions` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/past-questions/years` | JwtAuthGuard | WIRED | `pastQuestionsApi.getPastQuestionYears` | `lib/exam-prep.ts` |
| GET | `/past-questions/subjects` | JwtAuthGuard | WIRED | `pastQuestionsApi.getPastQuestionSubjects` | `lib/exam-prep.ts` |
| GET | `/past-questions/topics` | JwtAuthGuard | WIRED | `pastQuestionsApi.getPastQuestionTopics` | `lib/exam-prep.ts` |
| GET | `/past-questions/:p` | JwtAuthGuard | CLIENT ONLY | `pastQuestionsApi.getPastQuestionById` | — |
| POST | `/exam-prep` | JwtAuthGuard | WIRED | `examPrepApi.createExamPrepPlan` | `lib/exam-prep.ts` |
| GET | `/exam-prep` | JwtAuthGuard | WIRED | `examPrepApi.getAllExamPrepPlans` | `lib/exam-prep.ts` |
| GET | `/exam-prep/:p` | JwtAuthGuard | CLIENT ONLY | `examPrepApi.getExamPrepPlanById` | — |
| PATCH | `/exam-prep/:p` | JwtAuthGuard | WIRED | `examPrepApi.updateExamPrepPlan` | `lib/exam-prep.ts` |
| DELETE | `/exam-prep/:p` | JwtAuthGuard | WIRED | `examPrepApi.deleteExamPrepPlan` | `lib/exam-prep.ts` |

### Learner — Examinations System (12: 7 WIRED, 5 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/exams` | JwtAuthGuard | WIRED | `examsApi.getAllExams` | `lib/practice.ts` |
| GET | `/exams/history` | JwtAuthGuard | WIRED | `examsApi.getStudentExamHistory` | `lib/practice.ts` |
| GET | `/exams/:p` | JwtAuthGuard | WIRED | `examsApi.getExamById` | `lib/practice.ts` |
| POST | `/exams/generate` | JwtAuthGuard | CLIENT ONLY | `examsApi.generateAiExam` | — |
| POST | `/exams/generate-from-course` | JwtAuthGuard | CLIENT ONLY | `examsApi.generateExamFromCourse` | — |
| POST | `/exams/generate-from-document` | JwtAuthGuard | CLIENT ONLY | `examsApi.generateExamFromDocument` | — |
| POST | `/exams/:p/start` | JwtAuthGuard | WIRED | `examsApi.startExamAttempt` | `lib/practice.ts` |
| POST | `/exams/:p/submit` | JwtAuthGuard | WIRED | `examsApi.submitExamAttempt` | `lib/practice.ts` |
| GET | `/exams/:p/result` | JwtAuthGuard | CLIENT ONLY | `examsApi.getExamResult` | — |
| GET | `/exams/attempts/:p` | JwtAuthGuard | WIRED | `examsApi.getExamAttemptById` | `lib/practice.ts` |
| POST | `/exams/:p/simulate` | JwtAuthGuard | CLIENT ONLY | `examsApi.simulateExam` | — |
| GET | `/exams/:p/readiness` | JwtAuthGuard | WIRED | `examsApi.getExamReadiness` | `lib/practice.ts` |

### Learner — File & PDF Upload (6: 6 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/files/upload` | JwtAuthGuard | CLIENT ONLY | `filesApi.uploadSingle` | — |
| POST | `/files/upload/multiple` | JwtAuthGuard | CLIENT ONLY | `filesApi.uploadMultiple` | — |
| GET | `/files/:p` | JwtAuthGuard | CLIENT ONLY | `filesApi.getFileById` | — |
| GET | `/files/:p/status` | JwtAuthGuard | CLIENT ONLY | `filesApi.getFileStatus` | — |
| POST | `/files/:p/process` | JwtAuthGuard | CLIENT ONLY | `filesApi.processFile` | — |
| POST | `/files/:p/reprocess` | JwtAuthGuard | CLIENT ONLY | `filesApi.reprocessFile` | — |

### Learner — Flashcard Decks (5: 5 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/flashcard-decks` | JwtAuthGuard | WIRED | `flashcardDecksApi.createDeck` | `lib/library.ts` |
| GET | `/flashcard-decks` | JwtAuthGuard | WIRED | `flashcardDecksApi.getAllDecks` | `lib/library.ts` |
| GET | `/flashcard-decks/:p` | JwtAuthGuard | WIRED | `flashcardDecksApi.getDeckById` | `lib/library.ts` |
| PATCH | `/flashcard-decks/:p` | JwtAuthGuard | WIRED | `flashcardDecksApi.updateDeck` | `lib/library.ts` |
| DELETE | `/flashcard-decks/:p` | JwtAuthGuard | WIRED | `flashcardDecksApi.deleteDeck` | `lib/library.ts` |

### Learner — Flashcards (7: 5 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/flashcards` | JwtAuthGuard | WIRED | `flashcardsApi.createFlashcard` | `lib/library.ts` |
| GET | `/flashcards` | JwtAuthGuard | CLIENT ONLY | `flashcardsApi.getAllFlashcards` | — |
| GET | `/flashcards/review/today` | JwtAuthGuard | WIRED | `flashcardsApi.getDueFlashcards` | `lib/library.ts` |
| GET | `/flashcards/:p` | JwtAuthGuard | CLIENT ONLY | `flashcardsApi.getFlashcardById` | — |
| PATCH | `/flashcards/:p` | JwtAuthGuard | WIRED | `flashcardsApi.updateFlashcard` | `lib/library.ts` |
| DELETE | `/flashcards/:p` | JwtAuthGuard | WIRED | `flashcardsApi.deleteFlashcard` | `lib/library.ts` |
| POST | `/flashcards/:p/review` | JwtAuthGuard | WIRED | `flashcardsApi.submitReview` | `lib/library.ts` |

### Learner — Leaderboards (10: 9 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/leaderboards/global` | none | WIRED | `leaderboardsApi.getGlobalLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/country` | none | WIRED | `leaderboardsApi.getCountryLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/school` | none | WIRED | `leaderboardsApi.getSchoolLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/university` | none | WIRED | `leaderboardsApi.getUniversityLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/department` | none | WIRED | `leaderboardsApi.getDepartmentLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/course` | none | WIRED | `leaderboardsApi.getCourseLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/friends` | JwtAuthGuard | CLIENT ONLY | `leaderboardsApi.getFriendsLeaderboard` | — |
| GET | `/leaderboards/weekly` | none | WIRED | `leaderboardsApi.getWeeklyLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/monthly` | none | WIRED | `leaderboardsApi.getMonthlyLeaderboard` | `lib/gamification.ts` |
| GET | `/leaderboards/me` | JwtAuthGuard | WIRED | `leaderboardsApi.getMyRank` | `lib/gamification.ts` |

### Learner — Learning Progress & Mastery (8: 2 WIRED, 6 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/progress` | JwtAuthGuard | WIRED | `progressApi.getOverallProgress` | `lib/gamification.ts` |
| GET | `/progress/courses/:p` | JwtAuthGuard | CLIENT ONLY | `progressApi.getCourseProgressById` | — |
| GET | `/progress/topics/:p` | JwtAuthGuard | CLIENT ONLY | `progressApi.getTopicProgressById` | — |
| POST | `/progress/update` | JwtAuthGuard | CLIENT ONLY | `progressApi.updateProgress` | — |
| GET | `/progress/history` | JwtAuthGuard | CLIENT ONLY | `progressApi.getProgressHistory` | — |
| GET | `/mastery` | JwtAuthGuard | WIRED | `masteryApi.getOverallMasteryMetrics` | `lib/gamification.ts` |
| GET | `/mastery/courses/:p` | JwtAuthGuard | CLIENT ONLY | `masteryApi.getCourseMasteryById` | — |
| GET | `/mastery/topics/:p` | JwtAuthGuard | CLIENT ONLY | `masteryApi.getTopicMasteryById` | — |

### Learner — Learning from your material (6: 6 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/learning/generate` | JwtAuthGuard | WIRED | `learningApi.generate` | `lib/self-learning.ts` |
| GET | `/learning/resources` | JwtAuthGuard | WIRED | `learningApi.resources` | `lib/self-learning.ts` |
| GET | `/learning/resources/:p` | JwtAuthGuard | WIRED | `learningApi.resource` | `lib/self-learning.ts` |
| PATCH | `/learning/resources/:p` | JwtAuthGuard | WIRED | `learningApi.updateResource` | `lib/self-learning.ts` |
| POST | `/learning/resources/:p/complete` | JwtAuthGuard | WIRED | `learningApi.completeResource` | `lib/self-learning.ts` |
| DELETE | `/learning/resources/:p` | JwtAuthGuard | WIRED | `learningApi.deleteResource` | `lib/self-learning.ts` |

### Learner — Levels & Ranks (2: 2 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/levels` | none | WIRED | `levelsApi.getAllLevels` | `lib/gamification.ts` |
| GET | `/levels/me` | AuthGuard('jwt' | WIRED | `levelsApi.getMyLevel` | `lib/gamification.ts` |

### Learner — Notes & Learning Materials (5: 4 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/notes` | JwtAuthGuard | WIRED | `notesApi.getAllNotes` | `lib/library.ts` |
| GET | `/notes/:p` | JwtAuthGuard | CLIENT ONLY | `notesApi.getNoteById` | — |
| POST | `/notes` | JwtAuthGuard | WIRED | `notesApi.createNote` | `lib/library.ts` |
| PATCH | `/notes/:p` | JwtAuthGuard | WIRED | `notesApi.updateNote` | `lib/library.ts` |
| DELETE | `/notes/:p` | JwtAuthGuard | WIRED | `notesApi.deleteNote` | `lib/library.ts` |

### Learner — Notifications (9: 7 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/notifications` | JwtAuthGuard | WIRED | `notificationsApi.getAll` | `lib/learning.ts`<br>`lib/notifications.ts` |
| GET | `/notifications/unread` | JwtAuthGuard | WIRED | `notificationsApi.getUnread` | `lib/notifications.ts` |
| PATCH | `/notifications/:p/read` | JwtAuthGuard | WIRED | `notificationsApi.markAsRead` | `lib/notifications.ts` |
| PATCH | `/notifications/read-all` | JwtAuthGuard | WIRED | `notificationsApi.markAllAsRead` | `lib/notifications.ts` |
| DELETE | `/notifications/:p` | JwtAuthGuard | WIRED | `notificationsApi.delete` | `lib/notifications.ts` |
| GET | `/notifications/settings` | JwtAuthGuard | WIRED | `notificationsApi.getSettings` | `lib/profile.ts` |
| PATCH | `/notifications/settings` | JwtAuthGuard | WIRED | `notificationsApi.updateSettings` | `lib/profile.ts` |
| POST | `/notifications/token` | JwtAuthGuard | CLIENT ONLY | `notificationsApi.registerToken` | — |
| DELETE | `/notifications/token` | JwtAuthGuard | CLIENT ONLY | `notificationsApi.removeToken` | — |

### Learner — Personal AI Assistant (11: 10 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/ai/chat` | JwtAuthGuard | WIRED | `aiAssistantApi.sendChatMessage` | `lib/ai.ts` |
| GET | `/ai/conversations` | JwtAuthGuard | WIRED | `aiAssistantApi.getAllConversations` | `lib/history.ts`<br>`lib/ai.ts` |
| POST | `/ai/conversations` | JwtAuthGuard | CLIENT ONLY | `aiAssistantApi.createConversation` | — |
| GET | `/ai/conversations/:p` | JwtAuthGuard | WIRED | `aiAssistantApi.getConversationById` | `lib/ai.ts` |
| DELETE | `/ai/conversations/:p` | JwtAuthGuard | WIRED | `aiAssistantApi.deleteConversation` | `lib/ai.ts` |
| POST | `/ai/explain` | JwtAuthGuard | WIRED | `aiAssistantApi.explainConcept` | `lib/ai.ts` |
| POST | `/ai/summarize` | JwtAuthGuard | WIRED | `aiAssistantApi.summarizeText` | `lib/ai.ts` |
| POST | `/ai/generate-example` | JwtAuthGuard | WIRED | `aiAssistantApi.generateExample` | `lib/ai.ts` |
| POST | `/ai/generate-practice` | JwtAuthGuard | WIRED | `aiAssistantApi.generatePractice` | `lib/ai.ts` |
| POST | `/ai/evaluate-answer` | JwtAuthGuard | WIRED | `aiAssistantApi.evaluateAnswer` | `lib/ai.ts` |
| POST | `/ai/explain-mistake` | JwtAuthGuard | WIRED | `aiAssistantApi.explainMistake` | `lib/ai.ts` |

### Learner — Personal AI Companion (4: 3 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/ai-companion` | JwtAuthGuard | WIRED | `aiCompanionApi.getAiCompanion` | `lib/profile.ts` |
| POST | `/ai-companion` | JwtAuthGuard | WIRED | `aiCompanionApi.createAiCompanion` | `app/onboarding/page.tsx` |
| PATCH | `/ai-companion` | JwtAuthGuard | WIRED | `aiCompanionApi.updateAiCompanion` | `app/onboarding/page.tsx`<br>`lib/profile.ts` |
| DELETE | `/ai-companion` | JwtAuthGuard | CLIENT ONLY | `aiCompanionApi.deleteAiCompanion` | — |

### Learner — Personal courses (8: 8 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/personal-courses` | JwtAuthGuard | WIRED | `personalCoursesApi.list` | `lib/learner-content.ts` |
| POST | `/personal-courses` | JwtAuthGuard | WIRED | `personalCoursesApi.create` | `lib/learner-content.ts` |
| GET | `/personal-courses/:p` | JwtAuthGuard | WIRED | `personalCoursesApi.get` | `lib/learner-content.ts` |
| PATCH | `/personal-courses/:p` | JwtAuthGuard | WIRED | `personalCoursesApi.update` | `lib/learner-content.ts` |
| DELETE | `/personal-courses/:p` | JwtAuthGuard | WIRED | `personalCoursesApi.remove` | `lib/learner-content.ts` |
| POST | `/personal-courses/:p/modules` | JwtAuthGuard | WIRED | `personalCoursesApi.addModule` | `lib/learner-content.ts` |
| PATCH | `/personal-courses/:p/modules/:p` | JwtAuthGuard | WIRED | `personalCoursesApi.updateModule` | `lib/learner-content.ts` |
| DELETE | `/personal-courses/:p/modules/:p` | JwtAuthGuard | WIRED | `personalCoursesApi.removeModule` | `lib/learner-content.ts` |

### Learner — Questions Bank (2: 1 FRONTEND MISSING, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/questions` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/questions/:p` | JwtAuthGuard | CLIENT ONLY | `questionsApi.getQuestionById` | — |

### Learner — Quizzes System (11: 7 WIRED, 4 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/quizzes` | JwtAuthGuard | WIRED | `quizzesApi.getAllQuizzes` | `lib/practice.ts` |
| GET | `/quizzes/attempts` | JwtAuthGuard | WIRED | `quizzesApi.getUserAttempts` | `lib/practice.ts` |
| GET | `/quizzes/:p` | JwtAuthGuard | WIRED | `quizzesApi.getQuizById` | `lib/practice.ts` |
| POST | `/quizzes/generate` | JwtAuthGuard | WIRED | `quizzesApi.generateAiQuiz` | `lib/practice.ts` |
| POST | `/quizzes/generate-from-course` | JwtAuthGuard | CLIENT ONLY | `quizzesApi.generateQuizFromCourse` | — |
| POST | `/quizzes/generate-from-document` | JwtAuthGuard | CLIENT ONLY | `quizzesApi.generateQuizFromDocument` | — |
| POST | `/quizzes/generate-from-topic` | JwtAuthGuard | CLIENT ONLY | `quizzesApi.generateQuizFromTopic` | — |
| POST | `/quizzes/:p/start` | JwtAuthGuard | WIRED | `quizzesApi.startQuizAttempt` | `lib/practice.ts` |
| POST | `/quizzes/:p/submit` | JwtAuthGuard | WIRED | `quizzesApi.submitQuizAttempt` | `lib/practice.ts` |
| GET | `/quizzes/:p/results` | JwtAuthGuard | CLIENT ONLY | `quizzesApi.getQuizResults` | — |
| GET | `/quizzes/attempts/:p` | JwtAuthGuard | WIRED | `quizzesApi.getAttemptById` | `lib/practice.ts` |

### Learner — Rate Limiting & Protection (1: 1 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/throttler/status` | none | FRONTEND MISSING | — | — |

### Learner — Reports & Feedback (5: 4 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/reports` | JwtAuthGuard | WIRED | `reportsFeedbackApi.submitReport` | `lib/support.ts` |
| GET | `/reports/me` | JwtAuthGuard | WIRED | `reportsFeedbackApi.getMyReports` | `lib/support.ts` |
| POST | `/feedback` | JwtAuthGuard | WIRED | `reportsFeedbackApi.submitFeedback` | `lib/support.ts` |
| POST | `/questions/:p/report` | JwtAuthGuard | WIRED | `reportsFeedbackApi.reportQuestion` | `lib/support.ts` |
| POST | `/content/:p/report` | JwtAuthGuard | CLIENT ONLY | `reportsFeedbackApi.reportContent` | — |

### Learner — Search (7: 1 WIRED, 6 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/search/everything` | JwtAuthGuard | WIRED | `globalSearchApi.everything` | `lib/self-learning.ts` |
| GET | `/search` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/search/courses` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/search/topics` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/search/questions` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/search/materials` | JwtAuthGuard | FRONTEND MISSING | — | — |
| GET | `/search/users` | JwtAuthGuard | FRONTEND MISSING | — | — |

### Learner — Streaks (6: 4 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/streak` | JwtAuthGuard | WIRED | `streaksApi.getStreakSummary` | `lib/learning.ts`<br>`lib/gamification.ts` |
| GET | `/streak/history` | JwtAuthGuard | CLIENT ONLY | `streaksApi.getStreakHistory` | — |
| GET | `/streak/calendar` | JwtAuthGuard | WIRED | `streaksApi.getStreakCalendar` | `lib/gamification.ts` |
| POST | `/streak/check-in` | JwtAuthGuard | WIRED | `streaksApi.checkInStreak` | `lib/gamification.ts` |
| GET | `/streak/recovery` | JwtAuthGuard | CLIENT ONLY | `streaksApi.checkRecoveryAvailability` | — |
| POST | `/streak/recover` | JwtAuthGuard | WIRED | `streaksApi.recoverStreak` | `lib/gamification.ts` |

### Learner — Student Library (11: 8 CLIENT ONLY, 3 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/library` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getOverview` | — |
| GET | `/library/courses` | JwtAuthGuard | WIRED | `libraryApi.getSavedCourses` | `lib/library.ts` |
| GET | `/library/topics` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getSavedTopics` | — |
| GET | `/library/materials` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getSavedMaterials` | — |
| GET | `/library/quizzes` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getSavedQuizzes` | — |
| GET | `/library/tests` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getSavedTests` | — |
| GET | `/library/exams` | JwtAuthGuard | CLIENT ONLY | `libraryApi.getSavedExams` | — |
| POST | `/library/courses/:p` | JwtAuthGuard | WIRED | `libraryApi.saveCourse` | `lib/library.ts` |
| DELETE | `/library/courses/:p` | JwtAuthGuard | WIRED | `libraryApi.removeSavedCourse` | `lib/library.ts` |
| POST | `/library/favorites/:p` | JwtAuthGuard | CLIENT ONLY | `libraryApi.addFavorite` | — |
| DELETE | `/library/favorites/:p` | JwtAuthGuard | CLIENT ONLY | `libraryApi.removeFavorite` | — |

### Learner — Study Goals (7: 5 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/goals` | JwtAuthGuard | WIRED | `goalsApi.getAllGoals` | `lib/planner.ts` |
| POST | `/goals` | JwtAuthGuard | WIRED | `goalsApi.createGoal` | `lib/planner.ts` |
| GET | `/goals/:p` | JwtAuthGuard | CLIENT ONLY | `goalsApi.getGoalById` | — |
| PATCH | `/goals/:p` | JwtAuthGuard | WIRED | `goalsApi.updateGoal` | `lib/planner.ts` |
| DELETE | `/goals/:p` | JwtAuthGuard | WIRED | `goalsApi.deleteGoal` | `lib/planner.ts` |
| POST | `/goals/:p/complete` | JwtAuthGuard | WIRED | `goalsApi.completeGoal` | `lib/planner.ts` |
| GET | `/goals/:p/progress` | JwtAuthGuard | CLIENT ONLY | `goalsApi.getGoalProgress` | — |

### Learner — Study Sessions (8: 7 WIRED, 1 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/study-sessions/start` | JwtAuthGuard | WIRED | `studySessionsApi.startStudySession` | `lib/planner.ts` |
| POST | `/study-sessions/:p/pause` | JwtAuthGuard | WIRED | `studySessionsApi.pauseStudySession` | `lib/planner.ts` |
| POST | `/study-sessions/:p/resume` | JwtAuthGuard | WIRED | `studySessionsApi.resumeStudySession` | `lib/planner.ts` |
| POST | `/study-sessions/:p/complete` | JwtAuthGuard | WIRED | `studySessionsApi.completeStudySession` | `lib/planner.ts` |
| GET | `/study-sessions` | JwtAuthGuard | WIRED | `studySessionsApi.getAllStudySessions` | `lib/planner.ts` |
| GET | `/study-sessions/today` | JwtAuthGuard | CLIENT ONLY | `studySessionsApi.getTodayStudySessions` | — |
| GET | `/study-sessions/history` | JwtAuthGuard | WIRED | `studySessionsApi.getStudySessionHistory` | `lib/gamification.ts` |
| GET | `/study-sessions/stats` | JwtAuthGuard | WIRED | `studySessionsApi.getStudySessionStats` | `lib/learning.ts`<br>`lib/gamification.ts` |

### Learner — Subscriptions & Payments (9: 8 CLIENT ONLY, 1 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/plans` | none | CLIENT ONLY | `subscriptionsPaymentsApi.getAvailablePlans` | — |
| GET | `/subscription` | JwtAuthGuard | WIRED | `subscriptionsPaymentsApi.getCurrentSubscription` | `lib/support.ts` |
| POST | `/subscription/subscribe` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.subscribeToPlan` | — |
| POST | `/subscription/cancel` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.cancelSubscription` | — |
| POST | `/subscription/upgrade` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.upgradeSubscription` | — |
| GET | `/subscription/history` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.getSubscriptionHistory` | — |
| POST | `/payments/initialize` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.initializePayment` | — |
| POST | `/payments/verify` | JwtAuthGuard | CLIENT ONLY | `subscriptionsPaymentsApi.verifyPayment` | — |
| POST | `/payments/webhook` | none | CLIENT ONLY | `subscriptionsPaymentsApi.handlePaymentWebhook` | — |

### Learner — Tests & Assessments System (10: 6 WIRED, 4 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/tests` | JwtAuthGuard | WIRED | `testsApi.getAllTests` | `lib/practice.ts` |
| GET | `/tests/attempts` | JwtAuthGuard | WIRED | `testsApi.getUserTestAttempts` | `lib/practice.ts` |
| GET | `/tests/:p` | JwtAuthGuard | WIRED | `testsApi.getTestById` | `lib/practice.ts` |
| POST | `/tests/generate` | JwtAuthGuard | CLIENT ONLY | `testsApi.generateAiTest` | — |
| POST | `/tests/generate-from-course` | JwtAuthGuard | CLIENT ONLY | `testsApi.generateTestFromCourse` | — |
| POST | `/tests/generate-from-document` | JwtAuthGuard | CLIENT ONLY | `testsApi.generateTestFromDocument` | — |
| POST | `/tests/:p/start` | JwtAuthGuard | WIRED | `testsApi.startTestAttempt` | `lib/practice.ts` |
| POST | `/tests/:p/submit` | JwtAuthGuard | WIRED | `testsApi.submitTestAttempt` | `lib/practice.ts` |
| GET | `/tests/:p/results` | JwtAuthGuard | CLIENT ONLY | `testsApi.getTestResults` | — |
| GET | `/tests/attempts/:p` | JwtAuthGuard | WIRED | `testsApi.getTestAttemptById` | `lib/practice.ts` |

### Learner — Uploaded materials (8: 8 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/materials` | JwtAuthGuard | WIRED | `materialsApi.list` | `lib/learner-content.ts` |
| POST | `/materials` | JwtAuthGuard | WIRED | `form` | `components/PricingSection.tsx`<br>`components/Tutor.tsx`<br>`lib/http-client.ts` +33 |
| GET | `/materials/:p/access` | JwtAuthGuard | WIRED | `materialsApi.access` | `lib/learner-content.ts` |
| DELETE | `/materials/:p` | JwtAuthGuard | WIRED | `materialsApi.remove` | `lib/learner-content.ts` |
| POST | `/materials/text` | JwtAuthGuard | WIRED | `learningApi.addTextMaterial` | `lib/self-learning.ts` |
| GET | `/materials/:p` | JwtAuthGuard | WIRED | `learningApi.material` | `lib/self-learning.ts` |
| GET | `/materials/:p/text` | JwtAuthGuard | WIRED | `learningApi.materialText` | `lib/self-learning.ts` |
| POST | `/materials/:p/process` | JwtAuthGuard | WIRED | `learningApi.processMaterial` | `lib/self-learning.ts` |

### Learner — Usage Limits (4: 1 WIRED, 3 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/usage` | JwtAuthGuard | WIRED | `usageApi.getUsageOverview` | `lib/usage.ts` |
| GET | `/usage/ai` | JwtAuthGuard | CLIENT ONLY | `usageApi.getAiUsage` | — |
| GET | `/usage/documents` | JwtAuthGuard | CLIENT ONLY | `usageApi.getDocumentUsage` | — |
| GET | `/usage/quizzes` | JwtAuthGuard | CLIENT ONLY | `usageApi.getQuizUsage` | — |

### Learner — Users & Profile (12: 7 WIRED, 5 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/users/me` | JwtAuthGuard | WIRED | `usersApi.getMe` | `lib/profile.ts` |
| PATCH | `/users/me` | JwtAuthGuard | WIRED | `usersApi.updateMe` | `lib/profile.ts` |
| DELETE | `/users/me` | JwtAuthGuard | WIRED | `usersApi.deleteMe` | `app/(dashboard)/account-state/page.tsx` |
| POST | `/users/me/freeze` | JwtAuthGuard | WIRED | `usersApi.freezeAccount` | `app/(dashboard)/account-state/page.tsx` |
| POST | `/users/me/unfreeze` | JwtAuthGuard | WIRED | `usersApi.unfreezeAccount` | `app/(dashboard)/account-state/page.tsx` |
| PATCH | `/users/me/academic-profile` | JwtAuthGuard | WIRED | `usersApi.updateAcademicProfile` | `app/onboarding/page.tsx`<br>`lib/profile.ts` |
| PATCH | `/users/me/preferences` | JwtAuthGuard | WIRED | `usersApi.updatePreferences` | `app/onboarding/page.tsx`<br>`lib/profile.ts` |
| PATCH | `/users/me/notification-preferences` | JwtAuthGuard | CLIENT ONLY | `usersApi.updateNotificationPreferences` | — |
| PATCH | `/users/me/privacy-settings` | JwtAuthGuard | CLIENT ONLY | `usersApi.updatePrivacySettings` | — |
| GET | `/users/:p` | none | CLIENT ONLY | `usersApi.getPublicProfile` | — |
| GET | `/users/:p/achievements` | none | CLIENT ONLY | `usersApi.getUserAchievements` | — |
| GET | `/users/:p/stats` | none | CLIENT ONLY | `usersApi.getUserStats` | — |

### Learner — Users (4: 4 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/users/me/avatar` | JwtAuthGuard | WIRED | `avatarApi.get` | `lib/avatar.ts` |
| PUT | `/users/me/avatar` | JwtAuthGuard | WIRED | `avatarApi.choosePreset` | `lib/avatar.ts` |
| POST | `/users/me/profile-picture` | JwtAuthGuard | WIRED | `usersApi.uploadProfilePicture`<br>`form` | `components/PricingSection.tsx`<br>`components/Tutor.tsx`<br>`lib/http-client.ts` +33 |
| DELETE | `/users/me/profile-picture` | JwtAuthGuard | WIRED | `usersApi.removeProfilePicture`<br>`avatarApi.reset` | `lib/avatar.ts` |

### Learner — Voice AI (3: 3 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/ai/voice/transcribe` | JwtAuthGuard | CLIENT ONLY | `voiceAiApi.transcribeAudio` | — |
| POST | `/ai/voice/respond` | JwtAuthGuard | CLIENT ONLY | `voiceAiApi.processVoiceResponse` | — |
| POST | `/ai/voice/synthesize` | JwtAuthGuard | CLIENT ONLY | `voiceAiApi.synthesizeSpeech` | — |

### Learner — XP & Gamification (4: 2 WIRED, 2 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/xp` | AuthGuard('jwt' | WIRED | `xpApi.getXpOverview` | `lib/learning.ts` |
| GET | `/xp/level` | AuthGuard('jwt' | CLIENT ONLY | `xpApi.getLevelDetails` | — |
| GET | `/xp/history` | AuthGuard('jwt' | WIRED | `xpApi.getXpHistory` | `lib/gamification.ts` |
| GET | `/xp/transactions` | AuthGuard('jwt' | CLIENT ONLY | `xpApi.getXpTransactions` | — |

### Learner — YouTube Learning Material (7: 7 CLIENT ONLY)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/youtube` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.submitYouTubeVideo` | — |
| GET | `/youtube` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.getAllYouTubeResources` | — |
| GET | `/youtube/:p` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.getYouTubeResourceById` | — |
| DELETE | `/youtube/:p` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.deleteYouTubeResource` | — |
| GET | `/youtube/:p/status` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.getYouTubeProcessingStatus` | — |
| POST | `/youtube/:p/process` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.processYouTubeVideo` | — |
| POST | `/youtube/:p/reprocess` | JwtAuthGuard | CLIENT ONLY | `youtubeLearningApi.reprocessYouTubeVideo` | — |

### Learner — YouTube learning sessions (8: 8 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| POST | `/youtube-sessions` | JwtAuthGuard | WIRED | `youtubeSessionsApi.create` | `lib/self-learning.ts` |
| GET | `/youtube-sessions` | JwtAuthGuard | WIRED | `youtubeSessionsApi.list` | `lib/self-learning.ts` |
| GET | `/youtube-sessions/:p` | JwtAuthGuard | WIRED | `youtubeSessionsApi.get` | `lib/self-learning.ts` |
| DELETE | `/youtube-sessions/:p` | JwtAuthGuard | WIRED | `youtubeSessionsApi.remove` | `lib/self-learning.ts` |
| PUT | `/youtube-sessions/:p/transcript` | JwtAuthGuard | WIRED | `youtubeSessionsApi.setTranscript` | `lib/self-learning.ts` |
| POST | `/youtube-sessions/:p/transcript/fetch` | JwtAuthGuard | WIRED | `youtubeSessionsApi.refetchTranscript` | `lib/self-learning.ts` |
| GET | `/youtube-sessions/:p/messages` | JwtAuthGuard | WIRED | `youtubeSessionsApi.messages` | `lib/self-learning.ts` |
| POST | `/youtube-sessions/:p/ask` | JwtAuthGuard | WIRED | `youtubeSessionsApi.ask` | `lib/self-learning.ts` |

### Learner — Your quizzes and mock exams (8: 8 WIRED)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/learner-assessments` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.list` | `lib/self-learning.ts` |
| GET | `/learner-assessments/attempts` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.attempts` | `lib/self-learning.ts` |
| GET | `/learner-assessments/attempts/:p` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.attempt` | `lib/self-learning.ts` |
| PATCH | `/learner-assessments/attempts/:p` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.save` | `lib/self-learning.ts` |
| POST | `/learner-assessments/attempts/:p/submit` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.submit` | `lib/self-learning.ts` |
| GET | `/learner-assessments/:p` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.get` | `lib/self-learning.ts` |
| POST | `/learner-assessments/:p/attempts` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.start` | `lib/self-learning.ts` |
| DELETE | `/learner-assessments/:p` | JwtAuthGuard | WIRED | `learnerAssessmentsApi.remove` | `lib/self-learning.ts` |

### Learner — app.controller.ts (1: 1 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/` | none | FRONTEND MISSING | — | — |

### Learner — health.controller.ts (4: 4 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/health` | none | FRONTEND MISSING | — | — |
| GET | `/health/database` | none | FRONTEND MISSING | — | — |
| GET | `/health/redis` | none | FRONTEND MISSING | — | — |
| GET | `/health/ai` | none | FRONTEND MISSING | — | — |

### Learner — storage.module.ts (1: 1 FRONTEND MISSING)

| Method | Path | Guard | Status | Client | Used by |
|---|---|---|---|---|---|
| GET | `/storage/local/:p` | none | FRONTEND MISSING | — | — |
