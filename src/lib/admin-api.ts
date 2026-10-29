/**
 * ---------------------------------------------------------------------------
 * lib/admin-api.ts — Administrator API client
 * ---------------------------------------------------------------------------
 * Admin-only endpoints (backend: /api/v1/admin/*, guarded by AdminJwtAuthGuard).
 * Uses the shared HTTP core (lib/http-client.ts) with a SEPARATE admin token
 * (session scope 'admin'); learner tokens are never sent to admin routes.
 *
 * Only endpoints whose controllers and response shapes were verified in
 * mycoursea-backend are included. Several backend admin endpoints return
 * placeholder data or report success without acting; those are deliberately
 * NOT exposed here (see docs/IMPLEMENTATION_CHANGELOG.md, Batch 17).
 *
 * Authorization is enforced by the backend. Holding a token in the browser does
 * not grant access: the admin UI renders privileged data only after the backend
 * returns it (GET /admin/auth/me on entry).
 */

import { createHttpClient, type HttpRequestOptions } from './http-client.ts';
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from './config.ts';
import { clearStoredToken, getStoredToken, notifySessionExpired, setStoredToken } from './session.ts';

export { ApiError } from './api-error.ts';

const adminHttp = createHttpClient({
  baseUrl: API_BASE_URL,
  getToken: () => getStoredToken('admin'),
  timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
  onUnauthorized: () => {
    clearStoredToken('admin');
    notifySessionExpired('admin');
  },
});

type Options = Omit<HttpRequestOptions, 'method' | 'body'>;

// ==========================================
// TYPES (from backend admin services)
// ==========================================

/** Admin record as returned by /admin/auth/login and /admin/auth/me (passwordHash is stripped by the backend). */
export interface AdminProfile {
  id: string;
  email: string;
  fullName?: string | null;
  role: string;
  isActive: boolean;
  /** Permissions granted to this admin's role by the backend policy (UI hints only; the server enforces). */
  permissions?: AdminPermissionName[];
  createdAt?: string;
  updatedAt?: string;
}

/** Mirrors mycoursea-backend src/admin/auth/admin-permissions.ts (names only; the grants live on the server). */
export type AdminPermissionName =
  | 'admin.self'
  | 'users.view'
  | 'users.manage'
  | 'users.delete'
  | 'analytics.view'
  | 'content.manage'
  | 'moderation.manage'
  | 'notifications.send'
  | 'finance.view'
  | 'finance.manage'
  | 'security.view'
  | 'system.view'
  | 'settings.manage'
  | 'roles.manage'
  | 'data.export';

interface Envelope<T> {
  status: 'success';
  data: T;
  message?: string;
}

export interface AdminLoginResponse {
  status: 'success';
  message: string;
  accessToken: string;
  data: AdminProfile;
}

/**
 * Overview from GET /admin/dashboard. Only `users.total` and `users.new` are computed
 * from the database; the backend currently fills the remaining fields with constants,
 * estimates or zeros, so the UI must not present them as real metrics.
 */
export interface AdminDashboardOverview {
  users: { total: number; new: number; [key: string]: number };
  learning: Record<string, number>;
  revenue: Record<string, number | string>;
}

/** User as returned by GET /admin/users[/:id] (secrets removed by the backend). */
export interface AdminUser {
  id: string;
  fullName?: string | null;
  username?: string | null;
  email: string;
  country?: string | null;
  educationType?: string | null;
  university?: string | null;
  faculty?: string | null;
  department?: string | null;
  level?: string | null;
  secondarySchool?: string | null;
  secondaryClass?: string | null;
  isEmailVerified?: boolean;
  isRestricted?: boolean;
  restrictionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserList {
  users: AdminUser[];
  pagination: Pagination;
}

/** GET /admin/dashboard/counts — exact database counts; null when a count could not be computed. */
export interface AdminVerifiedCounts {
  counts: Record<
    | 'learners'
    | 'newLearnersLast30Days'
    | 'learnerCourses'
    | 'quizzes'
    | 'tests'
    | 'exams'
    | 'uploadedFiles'
    | 'youtubeResources'
    | 'aiTutorSessions'
    | 'aiAssistantConversations'
    | 'xpAwarded'
    | 'coinsAwarded',
    number | null
  >;
  unavailable: string[];
  generatedAt: string;
}

/** GET /admin/settings — values stored by the backend. NOTE: the platform does not read them yet. */
export interface AdminSystemSettings {
  id: string;
  xpRewards: Record<string, number>;
  coinRewards: Record<string, number>;
  streakRecoveryLimit: number;
  freeAiLimit: number;
  premiumAiLimit: number;
  maxUploadSizeMb: number;
  supportedFileTypes: string[];
  notificationSettings: Record<string, boolean>;
  maintenanceMode: boolean;
  updatedAt?: string;
}

export interface AdminUserAction {
  id: string;
  targetUserId: string;
  actionType: string;
  performedAt?: string;
}

export interface AdminUserActivity {
  userId: string;
  actionHistory: AdminUserAction[];
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number; // backend maximum: 100
  search?: string;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ==========================================
// ADMIN AUTH — /api/v1/admin/auth
// ==========================================

export const adminAuthApi = {
  /** POST /admin/auth/login. On success the admin token is stored under the admin scope only. */
  async login(email: string, password: string, options?: Options): Promise<AdminLoginResponse> {
    const res = await adminHttp.request<AdminLoginResponse>('/admin/auth/login', {
      ...options,
      method: 'POST',
      body: { email, password },
    });
    if (!res?.accessToken) {
      throw new Error('The server did not return an admin session.');
    }
    setStoredToken('admin', res.accessToken);
    return res;
  },

  /** GET /admin/auth/me — the backend's confirmation that the stored token is a valid, active admin. */
  me: (options?: Options) => adminHttp.request<Envelope<AdminProfile>>('/admin/auth/me', options),

  /** POST /admin/auth/logout (stateless on the backend), then forget the local token. */
  async logout(): Promise<void> {
    try {
      await adminHttp.request('/admin/auth/logout', { method: 'POST', timeoutMs: 5_000 });
    } catch {
      // The token is discarded locally regardless; the backend keeps no session state.
    } finally {
      clearStoredToken('admin');
    }
  },

  hasStoredSession: () => getStoredToken('admin') !== null,
};

// ==========================================
// DASHBOARD — /api/v1/admin/dashboard
// ==========================================

export const adminDashboardApi = {
  overview: (options?: Options) => adminHttp.request<Envelope<AdminDashboardOverview>>('/admin/dashboard', options),
  /** Requires `analytics.view`. */
  counts: (options?: Options) => adminHttp.request<Envelope<AdminVerifiedCounts>>('/admin/dashboard/counts', options),
};

// ==========================================
// SETTINGS — /api/v1/admin/settings (requires settings.manage: Super Admin)
// ==========================================

export const adminSettingsApi = {
  /** Read-only use: the stored values are not applied by the platform yet, so the console does not edit them. */
  get: (options?: Options) => adminHttp.request<Envelope<AdminSystemSettings>>('/admin/settings', options),
};

// ==========================================
// USERS — /api/v1/admin/users
// ==========================================

export const adminUsersApi = {
  /** GET /admin/users?page&limit&search (search matches email, username or full name). */
  list: (params: AdminUsersQuery = {}, options?: Options) =>
    adminHttp.request<Envelope<AdminUserList>>(
      `/admin/users${query({ page: params.page, limit: params.limit, search: params.search?.trim() })}`,
      options,
    ),

  get: (id: string, options?: Options) =>
    adminHttp.request<Envelope<AdminUser>>(`/admin/users/${encodeURIComponent(id)}`, options),

  /** GET /admin/users/:id/activity — the admin action history recorded for this user. */
  activity: (id: string, options?: Options) =>
    adminHttp.request<Envelope<AdminUserActivity>>(`/admin/users/${encodeURIComponent(id)}/activity`, options),

  /** PATCH /admin/users/:id/verify | unverify — sets isEmailVerified (requires users.manage). */
  setEmailVerified: (id: string, verified: boolean, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string; data: { userId: string; isEmailVerified: boolean } }>(
      `/admin/users/${encodeURIComponent(id)}/${verified ? 'verify' : 'unverify'}`,
      { ...options, method: 'PATCH' },
    ),

  /**
   * PATCH /admin/users/:id/suspend | unsuspend (users.manage). Sets the enforced restriction flag:
   * a suspended learner cannot sign in and existing sessions stop working immediately.
   */
  setSuspended: (id: string, suspended: boolean, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string; data: { userId: string; isRestricted: boolean } }>(
      `/admin/users/${encodeURIComponent(id)}/${suspended ? 'suspend' : 'unsuspend'}`,
      { ...options, method: 'PATCH' },
    ),

  /**
   * POST /admin/users/:id/restrict { reason } | POST /admin/users/:id/unrestrict (users.manage).
   * Same enforced flag as suspend, with an admin-supplied reason; recorded in the security audit log.
   * Lifting a restriction also lifts a suspension.
   */
  setRestricted: (id: string, restricted: boolean, reason?: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string; data: { userId: string; isRestricted: boolean; reason?: string } }>(
      `/admin/users/${encodeURIComponent(id)}/${restricted ? 'restrict' : 'unrestrict'}`,
      { ...options, method: 'POST', ...(restricted ? { body: { reason } } : {}) },
    ),

  // DELETE /admin/users/:id is intentionally not exposed: the backend disables permanent deletion (501)
  // until a reviewed data-retention plan exists.
};

// ==========================================
// LEARNING CONTENT — /api/v1/admin/content (content.manage)
// The canonical learner catalog: courses → topics, lessons (the tables the learner app reads).
// ==========================================

export interface AdminCatalogCourse {
  id: string;
  title: string;
  description?: string | null;
  track: string;
  level?: string | null;
  departmentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  topicCount?: number;
  lessonCount?: number;
  enrollmentCount?: number;
}

export interface AdminCatalogTopic {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
}

export interface AdminCatalogLesson {
  id: string;
  courseId: string;
  title: string;
  content?: string | null;
  orderIndex: number;
}

export interface AdminCatalogCourseDetail extends AdminCatalogCourse {
  topics: AdminCatalogTopic[];
  lessons: AdminCatalogLesson[];
}

export interface CourseInput {
  title: string;
  description?: string;
  track: string;
  level?: string;
  departmentId?: string;
}
export interface TopicInput {
  title: string;
  description?: string;
  order?: number;
}
export interface LessonInput {
  title: string;
  content?: string;
  orderIndex?: number;
}

type Ok<T> = { status: 'success'; message?: string; data: T };

const enc = encodeURIComponent;

export const adminContentApi = {
  listCourses: (params: { page?: number; limit?: number; search?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ courses: AdminCatalogCourse[]; pagination: Pagination }>>(
      `/admin/content/courses${query({ page: params.page, limit: params.limit, search: params.search?.trim() })}`,
      options,
    ),
  getCourse: (id: string, options?: Options) => adminHttp.request<Ok<AdminCatalogCourseDetail>>(`/admin/content/courses/${enc(id)}`, options),
  createCourse: (input: CourseInput, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogCourse>>('/admin/content/courses', { ...options, method: 'POST', body: input }),
  updateCourse: (id: string, input: Partial<CourseInput>, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogCourse>>(`/admin/content/courses/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  /** Only empty courses can be deleted; otherwise the backend answers 409 with the counts. */
  deleteCourse: (id: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string }>(`/admin/content/courses/${enc(id)}`, { ...options, method: 'DELETE' }),

  createTopic: (courseId: string, input: TopicInput, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogTopic>>(`/admin/content/courses/${enc(courseId)}/topics`, { ...options, method: 'POST', body: input }),
  updateTopic: (id: string, input: Partial<TopicInput>, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogTopic>>(`/admin/content/topics/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  deleteTopic: (id: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string }>(`/admin/content/topics/${enc(id)}`, { ...options, method: 'DELETE' }),

  createLesson: (courseId: string, input: LessonInput, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogLesson>>(`/admin/content/courses/${enc(courseId)}/lessons`, { ...options, method: 'POST', body: input }),
  updateLesson: (id: string, input: Partial<LessonInput>, options?: Options) =>
    adminHttp.request<Ok<AdminCatalogLesson>>(`/admin/content/lessons/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  deleteLesson: (id: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string }>(`/admin/content/lessons/${enc(id)}`, { ...options, method: 'DELETE' }),
};

// ==========================================
// ASSESSMENTS — /api/v1/{quizzes|tests|exams} (content.manage)
// The quizzes, tests and exams learners take. Learner reads strip the answer key; these admin reads
// (GET /:kind/manage/all, /:kind/manage/:id) return the stored records, answer keys included.
// ==========================================

export type AssessmentKind = 'quizzes' | 'tests' | 'exams';

export interface AdminAssessmentQuestion {
  question?: string;
  options?: unknown[];
  correctAnswer?: unknown;
  explanation?: string;
  [key: string]: unknown;
}

export interface AdminAssessment {
  id: string;
  title?: string | null;
  description?: string | null;
  courseId?: string | null;
  questions?: AdminAssessmentQuestion[] | null;
  durationMinutes?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssessmentInput {
  title: string;
  description?: string;
  questions: { question: string; options: string[]; correctAnswer: string; explanation?: string }[];
  durationMinutes?: number;
}

export const adminAssessmentsApi = {
  list: (kind: AssessmentKind, options?: Options) => adminHttp.request<AdminAssessment[]>(`/${kind}/manage/all`, options),
  get: (kind: AssessmentKind, id: string, options?: Options) => adminHttp.request<AdminAssessment>(`/${kind}/manage/${enc(id)}`, options),
  create: (kind: AssessmentKind, input: AssessmentInput, options?: Options) =>
    adminHttp.request<AdminAssessment>(`/${kind}`, { ...options, method: 'POST', body: input }),
  update: (kind: AssessmentKind, id: string, input: AssessmentInput, options?: Options) =>
    adminHttp.request<AdminAssessment>(`/${kind}/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  remove: (kind: AssessmentKind, id: string, options?: Options) =>
    adminHttp.request<unknown>(`/${kind}/${enc(id)}`, { ...options, method: 'DELETE' }),
};

// ==========================================
// MODERATION — /api/v1/admin/reports, /api/v1/admin/ai/generated-content (moderation.manage)
// ==========================================

export interface AdminReportRecord {
  id: string;
  status?: string;
  reason?: string | null;
  description?: string | null;
  reportedItemType?: string | null;
  reportedItemId?: string | null;
  reporterId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminAiContentRecord {
  id: string;
  status?: string;
  contentType?: string | null;
  contentPayload?: string | null;
  generatedByUserId?: string | null;
  createdAt?: string;
  [key: string]: unknown;
}

export const adminModerationApi = {
  listReports: (params: { page?: number; status?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ reports: AdminReportRecord[]; pagination: Pagination }>>(`/admin/reports${query({ page: params.page, limit: 20, status: params.status })}`, options),
  resolveReport: (id: string, options?: Options) => adminHttp.request<Ok<AdminReportRecord>>(`/admin/reports/${enc(id)}/resolve`, { ...options, method: 'PATCH' }),
  rejectReport: (id: string, options?: Options) => adminHttp.request<Ok<AdminReportRecord>>(`/admin/reports/${enc(id)}/reject`, { ...options, method: 'PATCH' }),
  listAiContent: (params: { page?: number; status?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ contents: AdminAiContentRecord[]; pagination: Pagination }>>(`/admin/ai/generated-content${query({ page: params.page, limit: 20, status: params.status })}`, options),
  approveAiContent: (id: string, options?: Options) => adminHttp.request<Ok<AdminAiContentRecord>>(`/admin/ai/generated-content/${enc(id)}/approve`, { ...options, method: 'PATCH' }),
  rejectAiContent: (id: string, options?: Options) => adminHttp.request<Ok<AdminAiContentRecord>>(`/admin/ai/generated-content/${enc(id)}/reject`, { ...options, method: 'PATCH' }),
  deleteAiContent: (id: string, options?: Options) => adminHttp.request<unknown>(`/admin/ai/generated-content/${enc(id)}`, { ...options, method: 'DELETE' }),
};

// ==========================================
// FEEDBACK — /api/v1/admin/feedback (moderation.manage)
// ==========================================

export interface AdminFeedbackRecord {
  id: string;
  userId: string;
  rating: number;
  message: string;
  createdAt: string;
}

export const adminFeedbackApi = {
  list: (params: { page?: number; rating?: number } = {}, options?: Options) =>
    adminHttp.request<Ok<{ feedback: AdminFeedbackRecord[]; summary: { count: number; averageRating: number | null }; pagination: Pagination }>>(
      `/admin/feedback${query({ page: params.page, limit: 20, rating: params.rating })}`,
      options,
    ),
};

// ==========================================
// SCHOOL DIRECTORY — GET /api/v1/admin/institutions; writes on /institutions, /faculties, /departments (content.manage)
// Learners see these as suggestions when they edit their school details.
// ==========================================

export type InstitutionType = 'Secondary' | 'University' | 'Institute';
export interface AdminDepartment {
  id: string;
  name: string;
  facultyId: string;
}
export interface AdminFaculty {
  id: string;
  name: string;
  institutionId: string;
  departments: AdminDepartment[];
}
export interface AdminInstitution {
  id: string;
  name: string;
  type: string;
  state: string | null;
  country: string | null;
  faculties: AdminFaculty[];
}
export interface InstitutionInput {
  name: string;
  type: InstitutionType;
  state?: string;
  country?: string;
}

export const adminAcademicApi = {
  list: (options?: Options) => adminHttp.request<AdminInstitution[]>('/admin/institutions', options),
  createInstitution: (input: InstitutionInput, options?: Options) => adminHttp.request<AdminInstitution>('/institutions', { ...options, method: 'POST', body: input }),
  updateInstitution: (id: string, input: InstitutionInput, options?: Options) => adminHttp.request<AdminInstitution>(`/institutions/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  deleteInstitution: (id: string, options?: Options) => adminHttp.request<unknown>(`/institutions/${enc(id)}`, { ...options, method: 'DELETE' }),
  createFaculty: (input: { name: string; institutionId: string }, options?: Options) => adminHttp.request<AdminFaculty>('/faculties', { ...options, method: 'POST', body: input }),
  updateFaculty: (id: string, input: { name: string; institutionId: string }, options?: Options) => adminHttp.request<AdminFaculty>(`/faculties/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  deleteFaculty: (id: string, options?: Options) => adminHttp.request<unknown>(`/faculties/${enc(id)}`, { ...options, method: 'DELETE' }),
  createDepartment: (input: { name: string; facultyId: string }, options?: Options) => adminHttp.request<AdminDepartment>('/departments', { ...options, method: 'POST', body: input }),
  updateDepartment: (id: string, input: { name: string; facultyId: string }, options?: Options) => adminHttp.request<AdminDepartment>(`/departments/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  deleteDepartment: (id: string, options?: Options) => adminHttp.request<unknown>(`/departments/${enc(id)}`, { ...options, method: 'DELETE' }),
  /** GET /academic-levels — the standard levels and streams (defined by the platform, read-only) */
  levels: (options?: Options) => adminHttp.request<{ secondaryLevels: string[]; universityLevels: string[]; secondaryStreams: string[] }>('/academic-levels', options),
};

// ==========================================
// USERS (more) — progress, analytics, password reset, XP / coin adjustments
// ==========================================

export interface AdminUserProgress {
  userId: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  officialAttemptsSubmitted: number;
  ownAssessmentsSubmitted: number;
  personalCourses: number;
  generatedResources: number;
  uploadedMaterials: number;
}
export interface AdminUserAnalytics {
  userId: string;
  xpEarned: number;
  coinsBalance: number;
  currentStreak: number;
  longestStreak: number;
  trackedStudyHours: number;
}

export const adminUserInsightsApi = {
  progress: (id: string, options?: Options) => adminHttp.request<Envelope<AdminUserProgress>>(`/admin/users/${enc(id)}/progress`, options),
  analytics: (id: string, options?: Options) => adminHttp.request<Envelope<AdminUserAnalytics>>(`/admin/users/${enc(id)}/analytics`, options),
  /** PATCH /admin/users/:id/reset-password { newPassword (8+) } — users.manage; recorded in the audit log */
  resetPassword: (id: string, newPassword: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message: string }>(`/admin/users/${enc(id)}/reset-password`, { ...options, method: 'PATCH', body: { newPassword } }),
  /** POST /admin/users/:id/xp | coins { amount (may be negative), reason (5+) } — users.manage; audit-logged */
  adjust: (id: string, kind: 'xp' | 'coins', amount: number, reason: string, options?: Options) =>
    adminHttp.request<{ status: 'success'; message?: string; data?: unknown }>(`/admin/users/${enc(id)}/${kind}`, { ...options, method: 'POST', body: { amount, reason } }),
};

// ==========================================
// GAMIFICATION — /api/v1/admin/gamification (analytics.view); computed from the XP, coin and streak tables
// ==========================================

export interface AdminXpOverview {
  totalXpGenerated: number;
  learnersWithXp: number;
  averageXpPerEarner: number | null;
  topXpEarner: { userId: string; email: string; xp: number } | null;
}
export interface AdminCoinsOverview {
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalCoinsCirculating: number;
}
export interface AdminStreaksOverview {
  activeStreaksCount: number;
  longestActiveStreak: number | null;
  averageActiveStreakDays: number | null;
  longestStreakEver: number;
}
export interface AdminLeaderboardRow {
  rank: number;
  userId: string;
  email: string;
  xp: number;
  coins: number;
  streak: number;
}

export const adminGamificationApi = {
  xp: (options?: Options) => adminHttp.request<Ok<AdminXpOverview>>('/admin/gamification/xp', options),
  coins: (options?: Options) => adminHttp.request<Ok<AdminCoinsOverview>>('/admin/gamification/coins', options),
  streaks: (options?: Options) => adminHttp.request<Ok<AdminStreaksOverview>>('/admin/gamification/streaks', options),
  leaderboard: (page = 1, options?: Options) =>
    adminHttp.request<Ok<{ leaderboard: AdminLeaderboardRow[]; pagination: Pagination }>>(`/admin/gamification/leaderboards${query({ page, limit: 20 })}`, options),
};

// ==========================================
// SECURITY & AUDIT — /admin/security (security.view), /admin/audit-logs (security.view), /admin/activity (analytics.view),
// /admin/access (roles.manage)
// ==========================================

export interface AdminLogEntry {
  id: string;
  adminId?: string | null;
  userId?: string | null;
  category?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  timestamp: string;
}
export interface AdminSecurityEvent {
  id: string;
  severity?: string;
  eventType?: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}
export interface AdminRestrictedUser {
  id: string;
  username?: string | null;
  email: string;
  fullName?: string | null;
  restrictionReason?: string | null;
  updatedAt?: string;
}
export interface AdminAccessModel {
  roles: { role: string; permissions: AdminPermissionName[] }[];
  accounts: { id: string; email: string; fullName?: string | null; role: string; isActive: boolean; createdAt?: string }[];
}
export const ACTIVITY_CATEGORIES = ['users', 'learning', 'assessments', 'ai', 'payments'] as const;

export const adminSecurityApi = {
  events: (params: { page?: number; severity?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ securityEvents: AdminSecurityEvent[]; pagination: Pagination }>>(`/admin/security/events${query({ page: params.page, limit: 20, severity: params.severity })}`, options),
  restrictedUsers: (options?: Options) => adminHttp.request<Ok<{ suspiciousUsersCount: number; users: AdminRestrictedUser[] }>>('/admin/security/suspicious-users', options),
  auditLogs: (params: { page?: number; category?: string; action?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ auditLogs: AdminLogEntry[]; pagination: Pagination }>>(`/admin/audit-logs${query({ page: params.page, limit: 20, category: params.category, action: params.action })}`, options),
  auditLog: (id: string, options?: Options) => adminHttp.request<Ok<AdminLogEntry>>(`/admin/audit-logs/${enc(id)}`, options),
  /** GET /admin/activity[/:category] — analytics.view */
  activity: (params: { page?: number; category?: (typeof ACTIVITY_CATEGORIES)[number] } = {}, options?: Options) =>
    adminHttp.request<Ok<{ activities: AdminLogEntry[]; pagination: Pagination }>>(`/admin/activity${params.category ? `/${params.category}` : ''}${query({ page: params.page, limit: 20 })}`, options),
  access: (options?: Options) => adminHttp.request<Ok<AdminAccessModel>>('/admin/access', options),
};

// ==========================================
// SYSTEM — /admin/system (system.view). Health is real; the other metrics answer 501 (no source connected).
// ==========================================

export interface AdminSystemHealth {
  serverStatus: string;
  timestamp: string;
  uptimeSeconds: number;
  database: { connected: boolean };
  system: { platform: string; nodeVersion: string; cpuArch: string; totalMemoryMb: number; freeMemoryMb: number; heapUsedMb: number };
}
export const SYSTEM_METRICS = ['queues', 'storage', 'ai', 'errors'] as const;

export const adminSystemApi = {
  health: (options?: Options) => adminHttp.request<Ok<AdminSystemHealth>>('/admin/system/health', options),
  metric: (name: (typeof SYSTEM_METRICS)[number], options?: Options) => adminHttp.request<Ok<Record<string, unknown>>>(`/admin/system/${name}`, options),
};

// ==========================================
// NOTIFICATIONS — /admin/notifications (notifications.send). Delivered into the learners' notifications.
// ==========================================

export const BROADCAST_TARGETS = [
  ['EVERYONE', 'Every learner'],
  ['SECONDARY_STUDENTS', 'Secondary school learners'],
  ['UNIVERSITY_STUDENTS', 'University learners'],
  ['SPECIFIC_INSTITUTION', 'One school or university'],
  ['SPECIFIC_DEPARTMENT', 'One department'],
] as const;
export interface AdminNotificationRecord {
  id: string;
  title: string;
  message: string;
  targetType: string;
  targetId?: string | null;
  senderAdminId?: string | null;
  createdAt?: string;
  deliveredCount?: number;
}

export const adminNotificationsApi = {
  history: (page = 1, options?: Options) =>
    adminHttp.request<Ok<{ notifications: AdminNotificationRecord[]; pagination: Pagination }>>(`/admin/notifications${query({ page, limit: 20 })}`, options),
  sendToUser: (input: { userId: string; title: string; message: string }, options?: Options) =>
    adminHttp.request<Ok<AdminNotificationRecord>>('/admin/notifications', { ...options, method: 'POST', body: input }),
  broadcast: (input: { target: string; targetId?: string; title: string; message: string }, options?: Options) =>
    adminHttp.request<Ok<AdminNotificationRecord>>('/admin/notifications/broadcast', { ...options, method: 'POST', body: input }),
  /** removes the history record only; delivered notifications stay with the learners */
  removeRecord: (id: string, options?: Options) => adminHttp.request<unknown>(`/admin/notifications/${enc(id)}`, { ...options, method: 'DELETE' }),
};

// ==========================================
// FINANCE, SUBSCRIPTIONS, ANALYTICS — payments are not live; most answer 501 and the console shows that.
// ==========================================

export const ANALYTICS_SECTIONS = ['overview', 'students', 'courses', 'subjects', 'exams', 'quizzes', 'tests', 'learning', 'retention', 'streaks'] as const;
export const FINANCE_SECTIONS = ['overview', 'revenue', 'transactions', 'subscriptions', 'refunds', 'revenue/daily', 'revenue/monthly'] as const;

export const adminInsightsApi = {
  analytics: (section: (typeof ANALYTICS_SECTIONS)[number], options?: Options) => adminHttp.request<Ok<Record<string, unknown>>>(`/admin/analytics/${section}`, options),
  finance: (section: (typeof FINANCE_SECTIONS)[number], options?: Options) => adminHttp.request<Ok<Record<string, unknown>>>(`/admin/finance/${section}`, options),
  subscriptions: (page = 1, options?: Options) =>
    adminHttp.request<Ok<{ subscriptions: Record<string, unknown>[]; pagination: Pagination }>>(`/admin/subscriptions${query({ page, limit: 20 })}`, options),
  dashboardSection: (section: 'users' | 'activity' | 'revenue' | 'learning' | 'engagement', options?: Options) =>
    adminHttp.request<Ok<Record<string, unknown>>>(`/admin/dashboard/${section}`, options),
};

// ==========================================
// EXPORTS — /admin/export/:kind?format= (data.export: Super Admin). Downloaded as a file.
// ==========================================

export const EXPORT_KINDS = [
  ['users', 'Learner accounts', 'Name, username, email, education type, university, verification and restriction status, sign-up date'],
  ['analytics', 'Account totals', 'Registered, verified and restricted account counts'],
  ['activity', 'Admin activity log', 'Up to 1,000 recorded administrative actions'],
  ['transactions', 'Payment transactions', 'Payments are not live, so this export is unavailable'],
] as const;

export class AdminExportError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Fetches the export with the admin token and hands it to the browser as a download. */
export async function downloadAdminExport(kind: string, format: 'csv' | 'json'): Promise<{ filename: string; bytes: number }> {
  const token = getStoredToken('admin');
  const res = await fetch(`${API_BASE_URL}/admin/export/${enc(kind)}?format=${format}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; code?: string } | null;
    throw new AdminExportError(body?.message || `Export failed (${res.status}).`, res.status, body?.code);
  }
  const blob = await res.blob();
  const filename = /filename="?([^";]+)"?/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? `${kind}-export.${format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return { filename, bytes: blob.size };
}

// ==========================================
// QUESTION BANK — the shared `questions` table learners practise from.
// GET /questions/manage/all (admin read); POST/PATCH/DELETE /questions (content.manage).
// ==========================================

export interface BankQuestion {
  id: string;
  subject?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  type?: string | null;
  examination?: string | null;
  year?: number | null;
  source?: string | null;
  questionText: string;
  options?: string[] | null;
  correctAnswer: string;
  explanation?: string | null;
  createdAt?: string;
}
export type BankQuestionInput = Omit<BankQuestion, 'id' | 'createdAt'>;

export const adminQuestionBankApi = {
  list: (params: { page?: number; search?: string; subject?: string; examination?: string } = {}, options?: Options) =>
    adminHttp.request<Ok<{ questions: BankQuestion[]; pagination: Pagination }>>(
      `/questions/manage/all${query({ page: params.page, limit: 20, search: params.search?.trim(), subject: params.subject?.trim(), examination: params.examination?.trim() })}`,
      options,
    ),
  create: (input: BankQuestionInput, options?: Options) => adminHttp.request<BankQuestion>('/questions', { ...options, method: 'POST', body: input }),
  update: (id: string, input: BankQuestionInput, options?: Options) => adminHttp.request<BankQuestion>(`/questions/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  remove: (id: string, options?: Options) => adminHttp.request<unknown>(`/questions/${enc(id)}`, { ...options, method: 'DELETE' }),
};

// moderation details (GET/PATCH /admin/reports/:id, GET /admin/ai/generated-content/:id)
export const adminModerationDetailApi = {
  report: (id: string, options?: Options) => adminHttp.request<Ok<AdminReportRecord>>(`/admin/reports/${enc(id)}`, options),
  /** PATCH /admin/reports/:id { reason?, description? } — the moderator's re-categorisation or notes */
  updateReport: (id: string, input: { reason?: string; description?: string }, options?: Options) =>
    adminHttp.request<Ok<AdminReportRecord>>(`/admin/reports/${enc(id)}`, { ...options, method: 'PATCH', body: input }),
  aiContent: (id: string, options?: Options) => adminHttp.request<Ok<AdminAiContentRecord>>(`/admin/ai/generated-content/${enc(id)}`, options),
};
