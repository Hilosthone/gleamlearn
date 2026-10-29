# GleamLearn admin console integration matrix

**Generated** by `node scripts/classify-admin-routes.cjs <inventory.json> <this file>` from the integration inventory (`scripts/integration-inventory.mjs`). Regenerate after changes.

## Totals (2026-10-29)

| Category | Routes |
|---|---|
| Integrated | 122 |
| Integrated through an equivalent route | 13 |
| Partially integrated (no console screen yet) | 4 |
| Deliberately not offered (server refuses or effect not real) | 7 |
| Unintegrated: disconnected silo awaiting your decision | 22 |
| Intentionally server-only | 1 |
| **All admin routes** | **169** |

## Routes

| Method & path | Module | Guard | Category | Note |
|---|---|---|---|---|
| `DELETE /courses/:p` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `DELETE /lessons/:p` | Course Lessons & Progress | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `DELETE /topics/:p` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `GET /admin/dashboard` | Admin Dashboard | AdminJwtAuthGuard | Integrated through an equivalent route | Covered by `GET /admin/dashboard/counts` (exact counts) on the Overview |
| `GET /admin/subscriptions/:p` | Admin Subscription Management | AdminJwtAuthGuard | Integrated through an equivalent route | The subscriptions list shows each full record |
| `GET /admin/users/:p/profile` | Admin User Management | AdminJwtAuthGuard | Integrated through an equivalent route | Same record as `GET /admin/users/:id` |
| `PATCH /courses/:p` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `PATCH /lessons/:p` | Course Lessons & Progress | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `PATCH /topics/:p` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `POST /courses` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `POST /courses/:p/lessons` | Course Lessons & Progress | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `POST /courses/:p/topics` | Courses, Topics & Enrollments | AdminOnly(CONTENT_MANAGE) | Integrated through an equivalent route | Legacy catalogue writes; the console edits the same tables through `/admin/content` |
| `POST /xp/award` | XP & Gamification | AdminOnly(USERS_MANAGE) | Integrated through an equivalent route | Same effect as `POST /admin/users/:id/xp` (used on the learner page, reason required) |
| `DELETE /admin/ai/generated-content/:p` | Admin AI Content Moderation | AdminJwtAuthGuard | Integrated |  |
| `DELETE /admin/content/courses/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `DELETE /admin/content/lessons/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `DELETE /admin/content/topics/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `DELETE /admin/notifications/:p` | Admin Notifications | AdminJwtAuthGuard | Integrated |  |
| `DELETE /departments/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `DELETE /exams/:p` | Examinations System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `DELETE /faculties/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `DELETE /institutions/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `DELETE /questions/:p` | Questions Bank | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `DELETE /quizzes/:p` | Quizzes System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `DELETE /tests/:p` | Tests & Assessments System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /admin/access` | Admin Roles & Permissions | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/activity` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/activity/ai` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/activity/assessments` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/activity/learning` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/activity/payments` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/activity/users` | Admin Activity Monitoring | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/ai/generated-content` | Admin AI Content Moderation | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/ai/generated-content/:p` | Admin AI Content Moderation | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/courses` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/exams` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/learning` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/overview` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/quizzes` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/retention` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/streaks` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/students` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/subjects` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/analytics/tests` | Admin Performance Analytics | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/audit-logs` | Admin Audit Logs | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/audit-logs/:p` | Admin Audit Logs | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/auth/me` | Admin Authentication | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/content/courses` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/content/courses/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/activity` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/counts` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/engagement` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/learning` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/revenue` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/dashboard/users` | Admin Dashboard | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/export/activity` | — | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/export/analytics` | — | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/export/transactions` | — | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/export/users` | — | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/feedback` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/finance/overview` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/finance/refunds` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/finance/revenue` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/finance/revenue/daily` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/finance/revenue/monthly` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `GET /admin/finance/subscriptions` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/finance/transactions` | Admin Revenue & Finance | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/gamification/coins` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/gamification/leaderboards` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/gamification/streaks` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/gamification/xp` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/institutions` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `GET /admin/notifications` | Admin Notifications | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/reports` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/reports/:p` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/security/events` | Admin Security & Abuse Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/security/suspicious-users` | Admin Security & Abuse Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/settings` | Admin System Configuration | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/subscriptions` | Admin Subscription Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/system/ai` | Admin System Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/system/errors` | Admin System Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/system/health` | Admin System Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/system/queues` | Admin System Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/system/storage` | Admin System Monitoring | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/users` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/users/:p` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/users/:p/activity` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/users/:p/analytics` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `GET /admin/users/:p/progress` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `GET /exams/manage/:p` | Examinations System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /exams/manage/all` | Examinations System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /questions/manage/all` | Questions Bank | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `GET /quizzes/manage/:p` | Quizzes System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /quizzes/manage/all` | Quizzes System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /tests/manage/:p` | Tests & Assessments System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `GET /tests/manage/all` | Tests & Assessments System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `PATCH /admin/ai/generated-content/:p/approve` | Admin AI Content Moderation | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/ai/generated-content/:p/reject` | Admin AI Content Moderation | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/content/courses/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/content/lessons/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/content/topics/:p` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/reports/:p` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/reports/:p/reject` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/reports/:p/resolve` | Admin Reports Management | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/users/:p/reset-password` | Admin User Management | AdminJwtAuthGuard | Integrated |  |
| `PATCH /admin/users/:p/suspend` | Admin User Management | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `PATCH /admin/users/:p/unsuspend` | Admin User Management | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `PATCH /admin/users/:p/unverify` | Admin User Management | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `PATCH /admin/users/:p/verify` | Admin User Management | AdminJwtAuthGuard | Integrated | Used by the console with a computed path |
| `PATCH /departments/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `PATCH /exams/:p` | Examinations System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `PATCH /faculties/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `PATCH /institutions/:p` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `PATCH /questions/:p` | Questions Bank | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `PATCH /quizzes/:p` | Quizzes System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `PATCH /tests/:p` | Tests & Assessments System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `POST /admin/auth/login` | Admin Authentication | none | Integrated |  |
| `POST /admin/auth/logout` | Admin Authentication | none | Integrated |  |
| `POST /admin/content/courses` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/content/courses/:p/lessons` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/content/courses/:p/topics` | Admin - Learning Content | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/notifications` | Admin Notifications | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/notifications/broadcast` | Admin Notifications | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/users/:p/coins` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/users/:p/force-logout` | Admin Security & Abuse Management | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/users/:p/restrict` | Admin Security & Abuse Management | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/users/:p/unrestrict` | Admin Security & Abuse Management | AdminJwtAuthGuard | Integrated |  |
| `POST /admin/users/:p/xp` | Admin Gamification Management | AdminJwtAuthGuard | Integrated |  |
| `POST /departments` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `POST /exams` | Examinations System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `POST /faculties` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `POST /institutions` | Academic Structure & Management | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `POST /questions` | Questions Bank | AdminOnly(CONTENT_MANAGE) | Integrated |  |
| `POST /quizzes` | Quizzes System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `POST /tests` | Tests & Assessments System | AdminOnly(CONTENT_MANAGE) | Integrated | Used by the console with a computed path |
| `DELETE /files/:p` | File & PDF Upload | AdminOnly(CONTENT_MANAGE) | Partially integrated (no console screen yet) | Legacy uploaded-files store (superseded by learner materials); no console screen |
| `GET /files` | File & PDF Upload | AdminOnly(CONTENT_MANAGE) | Partially integrated (no console screen yet) | Legacy uploaded-files store (superseded by learner materials); no console screen |
| `POST /admin/auth/forgot-password` | Admin Authentication | none | Partially integrated (no console screen yet) | Admin password recovery by email: no console screen yet (an admin can sign in and is reset by a Super Admin) |
| `POST /admin/auth/reset-password` | Admin Authentication | none | Partially integrated (no console screen yet) | Admin password recovery by email: no console screen yet (an admin can sign in and is reset by a Super Admin) |
| `DELETE /admin/users/:p` | Admin User Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501 by design: permanent deletion awaits a data-retention plan |
| `PATCH /admin/settings` | Admin System Configuration | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Not exposed: the stored settings are not applied by the platform yet, so editing would imply an effect that does not happen (shown read-only) |
| `PATCH /admin/subscriptions/:p` | Admin Subscription Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501: no live subscriptions or payment provider, so nothing could change, be cancelled or be refunded |
| `PATCH /admin/users/:p/freeze` | Admin User Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501 by design: freezing is learner-controlled |
| `PATCH /admin/users/:p/unfreeze` | Admin User Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501 by design: freezing is learner-controlled |
| `POST /admin/subscriptions/:p/cancel` | Admin Subscription Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501: no live subscriptions or payment provider, so nothing could change, be cancelled or be refunded |
| `POST /admin/subscriptions/:p/refund` | Admin Subscription Management | AdminJwtAuthGuard | Deliberately not offered (server refuses or effect not real) | Answers 501: no live subscriptions or payment provider, so nothing could change, be cancelled or be refunded |
| `POST /admin/auth/refresh` | Admin Authentication | none | Intentionally server-only | Token refresh: the console signs in again instead of refreshing (access tokens only) |
| `DELETE /admin/courses/:p` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `DELETE /admin/questions/:p` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `DELETE /admin/roles/:p` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `DELETE /admin/roles/:p/permissions` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `GET /admin/courses` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `GET /admin/courses/:p` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `GET /admin/permissions` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `GET /admin/questions` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `GET /admin/questions/:p` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `GET /admin/roles` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `GET /admin/roles/:p` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `PATCH /admin/courses/:p` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `PATCH /admin/courses/:p/publish` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `PATCH /admin/courses/:p/unpublish` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `PATCH /admin/questions/:p` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `PATCH /admin/questions/:p/approve` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `PATCH /admin/questions/:p/reject` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `PATCH /admin/roles/:p` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `POST /admin/courses` | Admin Course Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision |
| `POST /admin/questions` | Admin Question Management | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data |
| `POST /admin/roles` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
| `POST /admin/roles/:p/permissions` | Admin Roles & Permissions | AdminJwtAuthGuard | Unintegrated: disconnected silo awaiting your decision | Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision |
