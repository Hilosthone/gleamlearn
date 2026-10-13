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
