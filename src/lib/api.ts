/**
 * ---------------------------------------------------------------------------
 * lib/api.ts — Centralized Authentication API Client
 * ---------------------------------------------------------------------------
 * This module encapsulates all HTTP requests to the gleamLearn backend.
 * It manages base URLs, JSON headers, error handling, and automated token injection.
 */

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 'https://gleamlearn-backend.onrender.com/api/v1';

// ==========================================
// UPDATED CORE REQUEST HELPER (Supports FormData for Profile Pictures)
// ==========================================

async function apiRequest<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Automatically attach Bearer token if supplied or found in localStorage
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  // Parse JSON response safely
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return data as T;
}

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

export interface SignupPayload {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  country?: string;
  educationType?: string;
  secondarySchool?: string;
  secondaryClass?: string;
  secondaryStream?: string;
  university?: string;
  faculty?: string;
  department?: string;
  courseOfStudy?: string;
  level?: string;
  examAimOrGoals?: string;
  preferredStudyTime?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  username?: string;
  email?: string;
  dateOfBirth?: string;
  country?: string;
}

// ==========================================
// AUTH API ENDPOINTS
// ==========================================

export const authApi = {
  /**
   * POST /api/v1/auth/signup
   * Register a new user account.
   */
  signup: (payload: SignupPayload) => 
    apiRequest<any>('/auth/signup', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return tokens.
   */
  login: (payload: LoginPayload) => 
    apiRequest<any>('/auth/login', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/logout
   * Log out current user session.
   */
  logout: (token?: string) => 
    apiRequest<any>('/auth/logout', { method: 'POST', token }),

  /**
   * POST /api/v1/auth/refresh-token
   * Generate a new access token using a refresh token.
   */
  refreshToken: (payload: RefreshTokenPayload) => 
    apiRequest<any>('/auth/refresh-token', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/verify-email
   * Verify user email address.
   */
  verifyEmail: (payload: VerifyEmailPayload) => 
    apiRequest<any>('/auth/verify-email', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/resend-verification
   * Resend email verification token.
   */
  resendVerification: (payload: ResendVerificationPayload) => 
    apiRequest<any>('/auth/resend-verification', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/forgot-password
   * Initiate password reset process.
   */
  forgotPassword: (payload: ForgotPasswordPayload) => 
    apiRequest<any>('/auth/forgot-password', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/reset-password
   * Complete password reset.
   */
  resetPassword: (payload: ResetPasswordPayload) => 
    apiRequest<any>('/auth/reset-password', { method: 'POST', body: payload }),

  /**
   * POST /api/v1/auth/change-password
   * Change password for authenticated user.
   */
  changePassword: (payload: ChangePasswordPayload, token?: string) => 
    apiRequest<any>('/auth/change-password', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/auth/me
   * Get profile details of the authenticated user.
   */
  getMe: (token?: string) => 
    apiRequest<any>('/auth/me', { method: 'GET', token }),

  /**
   * PATCH /api/v1/auth/me
   * Update profile details of the authenticated user.
   */
  updateMe: (payload: UpdateProfilePayload, token?: string) => 
    apiRequest<any>('/auth/me', { method: 'PATCH', body: payload, token }),
};

// ==========================================
// NOTIFICATIONS TYPES & INTERFACES
// ==========================================

export interface UpdateNotificationSettingsPayload {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  streakReminders?: boolean;
  announcements?: boolean;
  [key: string]: any;
}

export interface RegisterPushTokenPayload {
  pushToken: string;
  deviceType?: 'ios' | 'android' | 'web';
}

// ==========================================
// NOTIFICATIONS API ENDPOINTS
// ==========================================

export const notificationsApi = {
  /**
   * GET /api/v1/notifications
   * Get all notifications for the authenticated user.
   */
  getAll: (token?: string) => 
    apiRequest<any>('/notifications', { method: 'GET', token }),

  /**
   * GET /api/v1/notifications/unread
   * Get unread notifications count/list.
   */
  getUnread: (token?: string) => 
    apiRequest<any>('/notifications/unread', { method: 'GET', token }),

  /**
   * PATCH /api/v1/notifications/{id}/read
   * Mark a specific notification as read.
   */
  markAsRead: (id: string, token?: string) => 
    apiRequest<any>(`/notifications/${id}/read`, { method: 'PATCH', token }),

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all notifications as read for user.
   */
  markAllAsRead: (token?: string) => 
    apiRequest<any>('/notifications/read-all', { method: 'PATCH', token }),

  /**
   * DELETE /api/v1/notifications/{id}
   * Delete a specific notification item.
   */
  delete: (id: string, token?: string) => 
    apiRequest<any>(`/notifications/${id}`, { method: 'DELETE', token }),

  /**
   * GET /api/v1/notifications/settings
   * Retrieve user notification preferences and settings.
   */
  getSettings: (token?: string) => 
    apiRequest<any>('/notifications/settings', { method: 'GET', token }),

  /**
   * PATCH /api/v1/notifications/settings
   * Update user notification preferences and toggles.
   */
  updateSettings: (payload: UpdateNotificationSettingsPayload, token?: string) => 
    apiRequest<any>('/notifications/settings', { method: 'PATCH', body: payload, token }),

  /**
   * POST /api/v1/notifications/token
   * Register or update device push token for mobile/web notifications.
   */
  registerToken: (payload: RegisterPushTokenPayload, token?: string) => 
    apiRequest<any>('/notifications/token', { method: 'POST', body: payload, token }),

  /**
   * DELETE /api/v1/notifications/token
   * Remove push token on user logout.
   */
  removeToken: (token?: string) => 
    apiRequest<any>('/notifications/token', { method: 'DELETE', token }),
};

// ==========================================
// USERS & PROFILE TYPES & INTERFACES
// ==========================================

export interface UpdateBasicUserPayload {
  fullName?: string;
  username?: string;
  email?: string;
  dateOfBirth?: string;
  country?: string;
}

export interface AcademicProfilePayload {
  educationType?: string;
  secondarySchool?: string;
  secondaryStream?: string;
  university?: string;
  faculty?: string;
  department?: string;
  courseOfStudy?: string;
  levelOrClass?: string;
  examAimOrGoals?: string;
}

export interface PreferencesPayload {
  preferredLearningPace?: string;
  preferredStudyTime?: string;
}

// ==========================================
// USERS & PROFILE API ENDPOINTS
// ==========================================

export const usersApi = {
  /**
   * GET /api/v1/users/me
   * Get current authenticated user profile.
   */
  getMe: (token?: string) => 
    apiRequest<any>('/users/me', { method: 'GET', token }),

  /**
   * PATCH /api/v1/users/me
   * Update basic authenticated user details.
   */
  updateMe: (payload: UpdateBasicUserPayload, token?: string) => 
    apiRequest<any>('/users/me', { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/users/me
   * Soft delete current user account (marks as deleted in backend).
   */
  deleteMe: (token?: string) => 
    apiRequest<any>('/users/me', { method: 'DELETE', token }),

  /**
   * POST /api/v1/users/me/freeze
   * Freeze current user account temporarily.
   */
  freezeAccount: (token?: string) => 
    apiRequest<any>('/users/me/freeze', { method: 'POST', token }),

  /**
   * POST /api/v1/users/me/unfreeze
   * Unfreeze current user account.
   */
  unfreezeAccount: (token?: string) => 
    apiRequest<any>('/users/me/unfreeze', { method: 'POST', token }),

  /**
   * POST /api/v1/users/me/profile-picture
   * Upload or update profile picture (Pass FormData with file).
   */
  uploadProfilePicture: (formData: FormData, token?: string) => 
    apiRequest<any>('/users/me/profile-picture', { method: 'POST', body: formData, token }),

  /**
   * DELETE /api/v1/users/me/profile-picture
   * Remove profile picture.
   */
  removeProfilePicture: (token?: string) => 
    apiRequest<any>('/users/me/profile-picture', { method: 'DELETE', token }),

  /**
   * PATCH /api/v1/users/me/academic-profile
   * Update academic profile (Secondary or University details).
   */
  updateAcademicProfile: (payload: AcademicProfilePayload, token?: string) => 
    apiRequest<any>('/users/me/academic-profile', { method: 'PATCH', body: payload, token }),

  /**
   * PATCH /api/v1/users/me/preferences
   * Update learning preferences and study times.
   */
  updatePreferences: (payload: PreferencesPayload, token?: string) => 
    apiRequest<any>('/users/me/preferences', { method: 'PATCH', body: payload, token }),

  /**
   * PATCH /api/v1/users/me/notification-preferences
   * Update push/email notification settings.
   */
  updateNotificationPreferences: (payload: Record<string, any>, token?: string) => 
    apiRequest<any>('/users/me/notification-preferences', { method: 'PATCH', body: payload, token }),

  /**
   * PATCH /api/v1/users/me/privacy-settings
   * Update profile visibility and privacy controls.
   */
  updatePrivacySettings: (payload: Record<string, any>, token?: string) => 
    apiRequest<any>('/users/me/privacy-settings', { method: 'PATCH', body: payload, token }),

  /**
   * GET /api/v1/users/{username}
   * Get public profile details by username.
   */
  getPublicProfile: (username: string, token?: string) => 
    apiRequest<any>(`/users/${username}`, { method: 'GET', token }),

  /**
   * GET /api/v1/users/{username}/achievements
   * Get unlocked badges and achievements for a user.
   */
  getUserAchievements: (username: string, token?: string) => 
    apiRequest<any>(`/users/${username}/achievements`, { method: 'GET', token }),

  /**
   * GET /api/v1/users/{username}/stats
   * Get learning stats, streak counts, and activity metrics.
   */
  getUserStats: (username: string, token?: string) => 
    apiRequest<any>(`/users/${username}/stats`, { method: 'GET', token }),
};

// ==========================================
// ACADEMIC STRUCTURE & MANAGEMENT TYPES
// ==========================================

export interface InstitutionPayload {
  name: string;
  type: string;
  state: string;
  country: string;
}

export interface FacultyPayload {
  name: string;
  institutionId: string;
}

export interface DepartmentPayload {
  name: string;
  facultyId: string;
}

// ==========================================
// ACADEMIC STRUCTURE & MANAGEMENT API ENDPOINTS
// ==========================================

export const academicApi = {
  /**
   * GET /api/v1/academic-levels
   * Get standardized academic levels for secondary and university tracks.
   */
  getAcademicLevels: (token?: string) => 
    apiRequest<any>('/academic-levels', { method: 'GET', token }),

  /**
   * GET /api/v1/institutions
   * Get all institutions with faculties and departments.
   */
  getInstitutions: (token?: string) => 
    apiRequest<any>('/institutions', { method: 'GET', token }),

  /**
   * POST /api/v1/institutions
   * Create a new institution.
   */
  createInstitution: (payload: InstitutionPayload, token?: string) => 
    apiRequest<any>('/institutions', { method: 'POST', body: payload, token }),

  /**
   * PATCH /api/v1/institutions/{id}
   * Update an institution.
   */
  updateInstitution: (id: string, payload: InstitutionPayload, token?: string) => 
    apiRequest<any>(`/institutions/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/institutions/{id}
   * Delete an institution.
   */
  deleteInstitution: (id: string, token?: string) => 
    apiRequest<any>(`/institutions/${id}`, { method: 'DELETE', token }),

  /**
   * GET /api/v1/faculties
   * Get all faculties.
   */
  getFaculties: (token?: string) => 
    apiRequest<any>('/faculties', { method: 'GET', token }),

  /**
   * POST /api/v1/faculties
   * Create a new faculty.
   */
  createFaculty: (payload: FacultyPayload, token?: string) => 
    apiRequest<any>('/faculties', { method: 'POST', body: payload, token }),

  /**
   * PATCH /api/v1/faculties/{id}
   * Update a faculty.
   */
  updateFaculty: (id: string, payload: FacultyPayload, token?: string) => 
    apiRequest<any>(`/faculties/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/faculties/{id}
   * Delete a faculty.
   */
  deleteFaculty: (id: string, token?: string) => 
    apiRequest<any>(`/faculties/${id}`, { method: 'DELETE', token }),

  /**
   * GET /api/v1/departments
   * Get all departments.
   */
  getDepartments: (token?: string) => 
    apiRequest<any>('/departments', { method: 'GET', token }),

  /**
   * POST /api/v1/departments
   * Create a new department.
   */
  createDepartment: (payload: DepartmentPayload, token?: string) => 
    apiRequest<any>('/departments', { method: 'POST', body: payload, token }),

  /**
   * PATCH /api/v1/departments/{id}
   * Update a department.
   */
  updateDepartment: (id: string, payload: DepartmentPayload, token?: string) => 
    apiRequest<any>(`/departments/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/departments/{id}
   * Delete a department.
   */
  deleteDepartment: (id: string, token?: string) => 
    apiRequest<any>(`/departments/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// COURSES, TOPICS & ENROLLMENTS TYPES
// ==========================================

export interface CoursePayload {
  title: string;
  description: string;
  track: string;
  level: string;
  departmentId: string;
}

export interface TopicPayload {
  title: string;
  description: string;
  order: number;
}

export interface CourseSearchParams {
  q?: string;
  track?: string;
  level?: string;
}

// ==========================================
// COURSES, TOPICS & ENROLLMENTS API ENDPOINTS
// ==========================================

export const coursesApi = {
  /**
   * GET /api/v1/courses
   * Retrieve all available courses.
   */
  getAllCourses: (token?: string) => 
    apiRequest<any>('/courses', { method: 'GET', token }),

  /**
   * GET /api/v1/courses/search
   * Search courses by query string, track, or level.
   */
  searchCourses: (params: CourseSearchParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.track) queryParams.append('track', params.track);
    if (params.level) queryParams.append('level', params.level);
    
    return apiRequest<any>(`/courses/search?${queryParams.toString()}`, { method: 'GET', token });
  },

  /**
   * GET /api/v1/users/me/courses
   * Get current user enrolled courses.
   */
  getEnrolledCourses: (token?: string) => 
    apiRequest<any>('/users/me/courses', { method: 'GET', token }),

  /**
   * POST /api/v1/courses
   * Create a new course.
   */
  createCourse: (payload: CoursePayload, token?: string) => 
    apiRequest<any>('/courses', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/courses/{id}
   * Get a specific course by ID.
   */
  getCourseById: (id: string, token?: string) => 
    apiRequest<any>(`/courses/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/courses/{id}
   * Update an existing course.
   */
  updateCourse: (id: string, payload: CoursePayload, token?: string) => 
    apiRequest<any>(`/courses/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/courses/{id}
   * Delete a course.
   */
  deleteCourse: (id: string, token?: string) => 
    apiRequest<any>(`/courses/${id}`, { method: 'DELETE', token }),

  /**
   * GET /api/v1/courses/{courseId}/topics
   * Get all topics belonging to a specific course.
   */
  getCourseTopics: (courseId: string, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/topics`, { method: 'GET', token }),

  /**
   * POST /api/v1/courses/{courseId}/topics
   * Create a new topic within a course.
   */
  createTopic: (courseId: string, payload: TopicPayload, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/topics`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/topics/{id}
   * Get a specific topic by ID.
   */
  getTopicById: (id: string, token?: string) => 
    apiRequest<any>(`/topics/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/topics/{id}
   * Update an existing topic.
   */
  updateTopic: (id: string, payload: TopicPayload, token?: string) => 
    apiRequest<any>(`/topics/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/topics/{id}
   * Delete a topic.
   */
  deleteTopic: (id: string, token?: string) => 
    apiRequest<any>(`/topics/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/courses/{courseId}/enroll
   * Enroll the authenticated user in a course.
   */
  enrollInCourse: (courseId: string, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/enroll`, { method: 'POST', token }),

  /**
   * DELETE /api/v1/courses/{courseId}/enroll
   * Unenroll the authenticated user from a course.
   */
  unenrollFromCourse: (courseId: string, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/enroll`, { method: 'DELETE', token }),
};

// ==========================================
// STUDENT LIBRARY TYPES
// ==========================================

export interface AddFavoritePayload {
  type: string; // e.g., "MATERIAL", "COURSE", "TOPIC", "QUIZ", etc.
}

// ==========================================
// STUDENT LIBRARY API ENDPOINTS
// ==========================================

export const libraryApi = {
  /**
   * GET /api/v1/library
   * Get summary overview of student library items.
   */
  getOverview: (token?: string) => 
    apiRequest<any>('/library', { method: 'GET', token }),

  /**
   * GET /api/v1/library/courses
   * Get all saved courses in student library.
   */
  getSavedCourses: (token?: string) => 
    apiRequest<any>('/library/courses', { method: 'GET', token }),

  /**
   * GET /api/v1/library/topics
   * Get all saved topics in student library.
   */
  getSavedTopics: (token?: string) => 
    apiRequest<any>('/library/topics', { method: 'GET', token }),

  /**
   * GET /api/v1/library/materials
   * Get all saved study materials in student library.
   */
  getSavedMaterials: (token?: string) => 
    apiRequest<any>('/library/materials', { method: 'GET', token }),

  /**
   * GET /api/v1/library/quizzes
   * Get all saved quizzes in student library.
   */
  getSavedQuizzes: (token?: string) => 
    apiRequest<any>('/library/quizzes', { method: 'GET', token }),

  /**
   * GET /api/v1/library/tests
   * Get all saved tests in student library.
   */
  getSavedTests: (token?: string) => 
    apiRequest<any>('/library/tests', { method: 'GET', token }),

  /**
   * GET /api/v1/library/exams
   * Get all saved exams in student library.
   */
  getSavedExams: (token?: string) => 
    apiRequest<any>('/library/exams', { method: 'GET', token }),

  /**
   * POST /api/v1/library/courses/{courseId}
   * Save a course to the student library.
   */
  saveCourse: (courseId: string, token?: string) => 
    apiRequest<any>(`/library/courses/${courseId}`, { method: 'POST', token }),

  /**
   * DELETE /api/v1/library/courses/{courseId}
   * Remove a saved course from the library.
   */
  removeSavedCourse: (courseId: string, token?: string) => 
    apiRequest<any>(`/library/courses/${courseId}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/library/favorites/{id}
   * Add an item to library favorites.
   */
  addFavorite: (id: string, payload: AddFavoritePayload, token?: string) => 
    apiRequest<any>(`/library/favorites/${id}`, { method: 'POST', body: payload, token }),

  /**
   * DELETE /api/v1/library/favorites/{id}
   * Remove an item from library favorites.
   */
  removeFavorite: (id: string, token?: string) => 
    apiRequest<any>(`/library/favorites/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// FILE & PDF UPLOAD TYPES
// ==========================================

export interface FileQueryParams {
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  mimeType?: string;
}

// ==========================================
// FILE & PDF UPLOAD API ENDPOINTS
// ==========================================

export const filesApi = {
  /**
   * POST /api/v1/files/upload
   * Upload a single course material file (PDF, DOCX, PPTX, TXT, Image).
   * Pass a FormData instance containing the file.
   */
  uploadSingle: (formData: FormData, token?: string) => 
    apiRequest<any>('/files/upload', { method: 'POST', body: formData, token }),

  /**
   * POST /api/v1/files/upload/multiple
   * Upload multiple course material files simultaneously.
   * Pass a FormData instance containing multiple files.
   */
  uploadMultiple: (formData: FormData, token?: string) => 
    apiRequest<any>('/files/upload/multiple', { method: 'POST', body: formData, token }),

  /**
   * GET /api/v1/files
   * Get all uploaded file records with optional status or MIME type filters.
   */
  getAllFiles: (params?: FileQueryParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.mimeType) queryParams.append('mimeType', params.mimeType);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/files?${queryString}` : '/files';

    return apiRequest<any>(endpoint, { method: 'GET', token });
  },

  /**
   * GET /api/v1/files/{id}
   * Get file metadata record by ID.
   */
  getFileById: (id: string, token?: string) => 
    apiRequest<any>(`/files/${id}`, { method: 'GET', token }),

  /**
   * DELETE /api/v1/files/{id}
   * Delete a file record and storage artifact.
   */
  deleteFile: (id: string, token?: string) => 
    apiRequest<any>(`/files/${id}`, { method: 'DELETE', token }),

  /**
   * GET /api/v1/files/{id}/status
   * Check background processing status of a file.
   */
  getFileStatus: (id: string, token?: string) => 
    apiRequest<any>(`/files/${id}/status`, { method: 'GET', token }),

  /**
   * POST /api/v1/files/{id}/process
   * Trigger asynchronous parsing and indexing for an uploaded file.
   */
  processFile: (id: string, token?: string) => 
    apiRequest<any>(`/files/${id}/process`, { method: 'POST', token }),

  /**
   * POST /api/v1/files/{id}/reprocess
   * Reprocess a failed or updated file.
   */
  reprocessFile: (id: string, token?: string) => 
    apiRequest<any>(`/files/${id}/reprocess`, { method: 'POST', token }),
};

// ==========================================
// AI DOCUMENT PROCESSING TYPES
// ==========================================

export interface AiDocumentGenerationPayload {
  customPrompt?: string;
  tone?: 'ACADEMIC' | string;
  language?: string;
  includeVisuals?: boolean;
  videoQuality?: string;
  durationMinutes?: number;
  [key: string]: any;
}

// ==========================================
// AI DOCUMENT PROCESSING API ENDPOINTS
// ==========================================

export const aiDocumentsApi = {
  /**
   * POST /api/v1/ai/documents/{id}/analyze
   * Trigger AI deep analysis on an uploaded document.
   */
  analyzeDocument: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/analyze`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/ai/documents/{id}/analysis
   * Retrieve cached AI analysis results for a document.
   */
  getDocumentAnalysis: (id: string, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/analysis`, { method: 'GET', token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-notes
   * Generate structured lecture notes from document content.
   */
  generateNotes: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-notes`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-summary
   * Generate executive summary from document.
   */
  generateSummary: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-summary`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-flashcards
   * Generate interactive study flashcards.
   */
  generateFlashcards: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-flashcards`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-questions
   * Generate study review questions.
   */
  generateQuestions: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-questions`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-quiz
   * Generate graded quiz assessment.
   */
  generateQuiz: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-quiz`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-test
   * Generate comprehensive midterm test structure.
   */
  generateTest: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-test`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-exam
   * Generate full academic final exam papers.
   */
  generateExam: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-exam`, { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/ai/documents/{id}/create-course
   * Automatically construct a multi-tier course outline and topics from document.
   */
  createCourseFromDocument: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/create-course`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/ai/documents/{id}/generated-content
   * Get all AI-generated assets linked to this document.
   */
  getGeneratedContent: (id: string, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generated-content`, { method: 'GET', token }),

  /**
   * POST /api/v1/ai/documents/{id}/generate-live-class
   * Generate timeline script and visual canvas instructions for an interactive live AI class.
   */
  generateLiveClass: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/generate-live-class`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/ai/documents/{id}/live-class-stream
   * Stream playback sync metadata and session states for the interactive live class player.
   */
  getLiveClassStream: (id: string, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/live-class-stream`, { method: 'GET', token }),

  /**
   * POST /api/v1/ai/documents/{id}/export-pdf
   * Compile generated notes, class scripts, or summaries into a downloadable PDF document.
   */
  exportPdf: (id: string, payload?: AiDocumentGenerationPayload, token?: string) => 
    apiRequest<any>(`/ai/documents/${id}/export-pdf`, { method: 'POST', body: payload, token }),
};

// ==========================================
// NOTES & LEARNING MATERIALS TYPES
// ==========================================

export interface NotePayload {
  title: string;
  content: string;
  courseId?: string;
  tags?: string[];
  [key: string]: any;
}

// ==========================================
// NOTES & LEARNING MATERIALS API ENDPOINTS
// ==========================================

export const notesApi = {
  /**
   * GET /api/v1/notes
   * Retrieve all study notes for the authenticated user.
   */
  getAllNotes: (token?: string) => 
    apiRequest<any>('/notes', { method: 'GET', token }),

  /**
   * POST /api/v1/notes
   * Create a new study note.
   */
  createNote: (payload: NotePayload, token?: string) => 
    apiRequest<any>('/notes', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/notes/{id}
   * Retrieve a single study note by ID.
   */
  getNoteById: (id: string, token?: string) => 
    apiRequest<any>(`/notes/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/notes/{id}
   * Update an existing study note.
   */
  updateNote: (id: string, payload: Partial<NotePayload>, token?: string) => 
    apiRequest<any>(`/notes/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/notes/{id}
   * Delete a study note.
   */
  deleteNote: (id: string, token?: string) => 
    apiRequest<any>(`/notes/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// COURSE LESSONS & PROGRESS TYPES
// ==========================================

export interface LessonPayload {
  title: string;
  content?: string;
  description?: string;
  order?: number;
  durationMinutes?: number;
  [key: string]: any;
}

// ==========================================
// COURSE LESSONS & PROGRESS API ENDPOINTS
// ==========================================

export const lessonsApi = {
  /**
   * GET /api/v1/courses/{courseId}/lessons
   * Get all lessons for a specific course.
   */
  getCourseLessons: (courseId: string, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/lessons`, { method: 'GET', token }),

  /**
   * POST /api/v1/courses/{courseId}/lessons
   * Create a new lesson under a course.
   */
  createLesson: (courseId: string, payload: LessonPayload, token?: string) => 
    apiRequest<any>(`/courses/${courseId}/lessons`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/lessons/{id}
   * Get a single lesson by ID.
   */
  getLessonById: (id: string, token?: string) => 
    apiRequest<any>(`/lessons/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/lessons/{id}
   * Update a lesson.
   */
  updateLesson: (id: string, payload: Partial<LessonPayload>, token?: string) => 
    apiRequest<any>(`/lessons/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/lessons/{id}
   * Delete a lesson.
   */
  deleteLesson: (id: string, token?: string) => 
    apiRequest<any>(`/lessons/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/lessons/{id}/start
   * Mark a lesson as started.
   */
  startLesson: (id: string, token?: string) => 
    apiRequest<any>(`/lessons/${id}/start`, { method: 'POST', token }),

  /**
   * POST /api/v1/lessons/{id}/complete
   * Mark a lesson as completed.
   */
  completeLesson: (id: string, token?: string) => 
    apiRequest<any>(`/lessons/${id}/complete`, { method: 'POST', token }),

  /**
   * GET /api/v1/lessons/{id}/progress
   * Get student progress for a specific lesson.
   */
  getLessonProgress: (id: string, token?: string) => 
    apiRequest<any>(`/lessons/${id}/progress`, { method: 'GET', token }),
};

// ==========================================
// FLASHCARDS TYPES
// ==========================================

export interface FlashcardPayload {
  deckId: string;
  question: string;
  answer: string;
  [key: string]: any;
}

export interface FlashcardReviewPayload {
  quality: number; // e.g., 0-5 rating for Leitner system progression
  [key: string]: any;
}

// ==========================================
// FLASHCARDS API ENDPOINTS
// ==========================================

export const flashcardsApi = {
  /**
   * POST /flashcards
   * Create a new flashcard.
   */
  createFlashcard: (payload: FlashcardPayload, token?: string) => 
    apiRequest<any>('/flashcards', { method: 'POST', body: payload, token }),

  /**
   * GET /flashcards
   * Retrieve all flashcards for the authenticated user.
   */
  getAllFlashcards: (token?: string) => 
    apiRequest<any>('/flashcards', { method: 'GET', token }),

  /**
   * GET /flashcards/review/today
   * Get flashcards due for review today (Spaced Repetition).
   */
  getDueFlashcards: (token?: string) => 
    apiRequest<any>('/flashcards/review/today', { method: 'GET', token }),

  /**
   * GET /flashcards/{id}
   * Get a specific flashcard by ID.
   */
  getFlashcardById: (id: string, token?: string) => 
    apiRequest<any>(`/flashcards/${id}`, { method: 'GET', token }),

  /**
   * PATCH /flashcards/{id}
   * Update an existing flashcard.
   */
  updateFlashcard: (id: string, payload: Partial<FlashcardPayload>, token?: string) => 
    apiRequest<any>(`/flashcards/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /flashcards/{id}
   * Delete a flashcard.
   */
  deleteFlashcard: (id: string, token?: string) => 
    apiRequest<any>(`/flashcards/${id}`, { method: 'DELETE', token }),

  /**
   * POST /flashcards/{id}/review
   * Submit review response for a flashcard (Leitner system progression).
   */
  submitReview: (id: string, payload: FlashcardReviewPayload, token?: string) => 
    apiRequest<any>(`/flashcards/${id}/review`, { method: 'POST', body: payload, token }),
};

// ==========================================
// FLASHCARD DECKS TYPES
// ==========================================

export interface FlashcardDeckPayload {
  title: string;
  description: string;
  category: string;
  [key: string]: any;
}

// ==========================================
// FLASHCARD DECKS API ENDPOINTS
// ==========================================

export const flashcardDecksApi = {
  /**
   * POST /flashcard-decks
   * Create a new flashcard deck.
   */
  createDeck: (payload: FlashcardDeckPayload, token?: string) => 
    apiRequest<any>('/flashcard-decks', { method: 'POST', body: payload, token }),

  /**
   * GET /flashcard-decks
   * Retrieve all flashcard decks for the authenticated user.
   */
  getAllDecks: (token?: string) => 
    apiRequest<any>('/flashcard-decks', { method: 'GET', token }),

  /**
   * GET /flashcard-decks/{id}
   * Get a specific flashcard deck by ID.
   */
  getDeckById: (id: string, token?: string) => 
    apiRequest<any>(`/flashcard-decks/${id}`, { method: 'GET', token }),

  /**
   * PATCH /flashcard-decks/{id}
   * Update an existing flashcard deck.
   */
  updateDeck: (id: string, payload: Partial<FlashcardDeckPayload>, token?: string) => 
    apiRequest<any>(`/flashcard-decks/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /flashcard-decks/{id}
   * Delete a flashcard deck.
   */
  deleteDeck: (id: string, token?: string) => 
    apiRequest<any>(`/flashcard-decks/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// QUESTIONS BANK TYPES
// ==========================================

export interface QuestionPayload {
  courseId: string;
  subject: string;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  type?: 'objective' | 'subjective' | string;
  examination?: string;
  year?: number;
  source?: string;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  [key: string]: any;
}

export interface QuestionQueryParams {
  courseId?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  examination?: string;
  year?: number;
  source?: string;
}

// ==========================================
// QUESTIONS BANK API ENDPOINTS
// ==========================================

export const questionsApi = {
  /**
   * POST /api/v1/questions
   * Create and store a new question record in the main question bank.
   */
  createQuestion: (payload: QuestionPayload, token?: string) => 
    apiRequest<any>('/questions', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/questions
   * Retrieve all questions from the question bank with optional dynamic filters.
   */
  getAllQuestions: (params?: QuestionQueryParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';

    return apiRequest<any>(endpoint, { method: 'GET', token });
  },

  /**
   * GET /api/v1/questions/{id}
   * Get a specific question by ID.
   */
  getQuestionById: (id: string, token?: string) => 
    apiRequest<any>(`/questions/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/questions/{id}
   * Update an existing question.
   */
  updateQuestion: (id: string, payload: Partial<QuestionPayload>, token?: string) => 
    apiRequest<any>(`/questions/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/questions/{id}
   * Delete a question.
   */
  deleteQuestion: (id: string, token?: string) => 
    apiRequest<any>(`/questions/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// QUIZZES SYSTEM TYPES
// ==========================================

export interface QuizQuestionPayload {
  question: string;
  choices: string[];
  answer: string;
  [key: string]: any;
}

export interface QuizOptionsPayload {
  timeLimitMinutes?: number;
  passingScore?: number;
  [key: string]: any;
}

export interface QuizPayload {
  title: string;
  description: string;
  courseId?: string;
  topic?: string;
  questions?: QuizQuestionPayload[];
  options?: QuizOptionsPayload;
  [key: string]: any;
}

export interface QuizSubmitPayload {
  answers: Record<string, string | number | boolean>;
  timeSpentSeconds: number;
  attemptId: string;
  [key: string]: any;
}

// ==========================================
// QUIZZES SYSTEM API ENDPOINTS
// ==========================================

export const quizzesApi = {
  /**
   * GET /api/v1/quizzes
   * Retrieve all saved quizzes.
   */
  getAllQuizzes: (token?: string) => 
    apiRequest<any>('/quizzes', { method: 'GET', token }),

  /**
   * POST /api/v1/quizzes
   * Create a new quiz manually.
   */
  createQuiz: (payload: QuizPayload, token?: string) => 
    apiRequest<any>('/quizzes', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/quizzes/{id}
   * Get quiz by ID.
   */
  getQuizById: (id: string, token?: string) => 
    apiRequest<any>(`/quizzes/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/quizzes/{id}
   * Update an existing quiz.
   */
  updateQuiz: (id: string, payload: Partial<QuizPayload>, token?: string) => 
    apiRequest<any>(`/quizzes/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/quizzes/{id}
   * Delete a quiz.
   */
  deleteQuiz: (id: string, token?: string) => 
    apiRequest<any>(`/quizzes/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/quizzes/generate
   * Generate AI quiz with custom parameters.
   */
  generateAiQuiz: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/quizzes/generate', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/quizzes/generate-from-course
   * Generate quiz from course curriculum.
   */
  generateQuizFromCourse: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/quizzes/generate-from-course', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/quizzes/generate-from-document
   * Generate quiz from an uploaded document.
   */
  generateQuizFromDocument: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/quizzes/generate-from-document', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/quizzes/generate-from-topic
   * Generate quiz focused on a specific topic.
   */
  generateQuizFromTopic: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/quizzes/generate-from-topic', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/quizzes/{id}/start
   * Start a quiz attempt and generate a tracking token.
   */
  startQuizAttempt: (id: string, token?: string) => 
    apiRequest<any>(`/quizzes/${id}/start`, { method: 'POST', token }),

  /**
   * POST /api/v1/quizzes/{id}/submit
   * Submit a quiz attempt for grading and rewards.
   */
  submitQuizAttempt: (id: string, payload: QuizSubmitPayload, token?: string) => 
    apiRequest<any>(`/quizzes/${id}/submit`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/quizzes/{id}/results
   * Get detailed scoring breakdown and feedback for a quiz.
   */
  getQuizResults: (id: string, token?: string) => 
    apiRequest<any>(`/quizzes/${id}/results`, { method: 'GET', token }),

  /**
   * GET /api/v1/quizzes/attempts
   * Get complete history of quiz attempts for authenticated user.
   */
  getUserAttempts: (token?: string) => 
    apiRequest<any>('/quizzes/attempts', { method: 'GET', token }),

  /**
   * GET /api/v1/quizzes/attempts/{id}
   * Get specific quiz attempt details.
   */
  getAttemptById: (id: string, token?: string) => 
    apiRequest<any>(`/quizzes/attempts/${id}`, { method: 'GET', token }),
};

// ==========================================
// XP & GAMIFICATION / COINS & ECONOMY TYPES
// ==========================================

export interface AwardXpPayload {
  userId?: string;
  amount: number;
  reason?: string;
  [key: string]: any;
}

export interface SpendCoinsPayload {
  amount: number;
  source: string; // e.g., "STORE_ITEM_PURCHASE"
  description: string;
  [key: string]: any;
}

// ==========================================
// XP & GAMIFICATION API ENDPOINTS
// ==========================================

export const xpApi = {
  /**
   * GET /api/v1/xp
   * Get XP Overview (total accumulated XP, current level, and progress metrics).
   */
  getXpOverview: (token?: string) => 
    apiRequest<any>('/xp', { method: 'GET', token }),

  /**
   * GET /api/v1/xp/level
   * Get Level Details (tier breakdown, leftover XP, and next level threshold).
   */
  getLevelDetails: (token?: string) => 
    apiRequest<any>('/xp/level', { method: 'GET', token }),

  /**
   * GET /api/v1/xp/history
   * Get XP History (chronological ledger of historical XP changes and reward grants).
   */
  getXpHistory: (token?: string) => 
    apiRequest<any>('/xp/history', { method: 'GET', token }),

  /**
   * GET /api/v1/xp/transactions
   * Get XP Transactions (alias endpoint returning full list of ledger activity).
   */
  getXpTransactions: (token?: string) => 
    apiRequest<any>('/xp/transactions', { method: 'GET', token }),

  /**
   * POST /api/v1/xp/award
   * Award XP to User (Admin endpoint to manually grant experience points).
   */
  awardXp: (payload: AwardXpPayload, token?: string) => 
    apiRequest<any>('/xp/award', { method: 'POST', body: payload, token }),
};

// ==========================================
// COINS & ECONOMY API ENDPOINTS
// ==========================================

export const coinsApi = {
  /**
   * GET /api/v1/coins
   * Get coin balance overview.
   */
  getCoinBalance: (token?: string) => 
    apiRequest<any>('/coins', { method: 'GET', token }),

  /**
   * GET /api/v1/coins/history
   * Get coin transaction history.
   */
  getCoinHistory: (token?: string) => 
    apiRequest<any>('/coins/history', { method: 'GET', token }),

  /**
   * GET /api/v1/coins/transactions
   * Get coin transactions list (alias endpoint for ledger entries auditing).
   */
  getCoinTransactions: (token?: string) => 
    apiRequest<any>('/coins/transactions', { method: 'GET', token }),

  /**
   * POST /api/v1/coins/spend
   * Spend coins securely for purchases or store items.
   */
  spendCoins: (payload: SpendCoinsPayload, token?: string) => 
    apiRequest<any>('/coins/spend', { method: 'POST', body: payload, token }),
};

// ==========================================
// TESTS & ASSESSMENTS SYSTEM TYPES
// ==========================================

export interface TestPayload {
  title?: string;
  description?: string;
  courseId?: string;
  questions?: any[];
  [key: string]: any;
}

export interface TestSubmitPayload {
  answers: Record<string, string | number | boolean>;
  timeSpentSeconds?: number;
  attemptId?: string;
  [key: string]: any;
}

// ==========================================
// TESTS & ASSESSMENTS SYSTEM API ENDPOINTS
// ==========================================

export const testsApi = {
  /**
   * GET /api/v1/tests
   * Retrieve all tests.
   */
  getAllTests: (token?: string) => 
    apiRequest<any>('/tests', { method: 'GET', token }),

  /**
   * POST /api/v1/tests
   * Create a new test manually.
   */
  createTest: (payload: TestPayload, token?: string) => 
    apiRequest<any>('/tests', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/tests/{id}
   * Get test by ID.
   */
  getTestById: (id: string, token?: string) => 
    apiRequest<any>(`/tests/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/tests/{id}
   * Update a test.
   */
  updateTest: (id: string, payload: Partial<TestPayload>, token?: string) => 
    apiRequest<any>(`/tests/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/tests/{id}
   * Delete a test.
   */
  deleteTest: (id: string, token?: string) => 
    apiRequest<any>(`/tests/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/tests/generate
   * Generate AI test with custom topic prompts.
   */
  generateAiTest: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/tests/generate', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/tests/generate-from-course
   * Generate test from course curriculum.
   */
  generateTestFromCourse: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/tests/generate-from-course', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/tests/generate-from-document
   * Generate test from an uploaded document.
   */
  generateTestFromDocument: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/tests/generate-from-document', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/tests/{id}/start
   * Start a test attempt and return a unique attempt token.
   */
  startTestAttempt: (id: string, token?: string) => 
    apiRequest<any>(`/tests/${id}/start`, { method: 'POST', token }),

  /**
   * POST /api/v1/tests/{id}/submit
   * Submit a test attempt for grading and score calculation.
   */
  submitTestAttempt: (id: string, payload: TestSubmitPayload, token?: string) => 
    apiRequest<any>(`/tests/${id}/submit`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/tests/{id}/results
   * Get detailed scoring breakdown and analytical feedback for a test.
   */
  getTestResults: (id: string, token?: string) => 
    apiRequest<any>(`/tests/${id}/results`, { method: 'GET', token }),

  /**
   * GET /api/v1/tests/attempts
   * Get complete history of test attempts taken by the authenticated user.
   */
  getUserTestAttempts: (token?: string) => 
    apiRequest<any>('/tests/attempts', { method: 'GET', token }),

  /**
   * GET /api/v1/tests/attempts/{id}
   * Get specific test attempt details.
   */
  getTestAttemptById: (id: string, token?: string) => 
    apiRequest<any>(`/tests/attempts/${id}`, { method: 'GET', token }),
};

// ==========================================
// EXAMINATIONS SYSTEM TYPES
// ==========================================

export interface ExamPayload {
  title?: string;
  description?: string;
  courseId?: string;
  durationMinutes?: number;
  questions?: any[];
  [key: string]: any;
}

export interface ExamSubmitPayload {
  answers: Record<string, string | number | boolean>;
  timeSpentSeconds?: number;
  attemptId?: string;
  [key: string]: any;
}

// ==========================================
// EXAMINATIONS SYSTEM API ENDPOINTS
// ==========================================

export const examsApi = {
  /**
   * GET /api/v1/exams
   * Retrieve all formal examinations and timed assessments.
   */
  getAllExams: (token?: string) => 
    apiRequest<any>('/exams', { method: 'GET', token }),

  /**
   * POST /api/v1/exams
   * Create a new examination manually.
   */
  createExam: (payload: ExamPayload, token?: string) => 
    apiRequest<any>('/exams', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/exams/{id}
   * Get examination data by ID.
   */
  getExamById: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/exams/{id}
   * Update an existing examination.
   */
  updateExam: (id: string, payload: Partial<ExamPayload>, token?: string) => 
    apiRequest<any>(`/exams/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/exams/{id}
   * Delete an examination.
   */
  deleteExam: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/exams/generate
   * Generate AI examination based on custom topic prompts.
   */
  generateAiExam: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/exams/generate', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/exams/generate-from-course
   * Generate exam tailored to a course curriculum.
   */
  generateExamFromCourse: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/exams/generate-from-course', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/exams/generate-from-document
   * Generate exam from an uploaded document.
   */
  generateExamFromDocument: (payload?: Record<string, any>, token?: string) => 
    apiRequest<any>('/exams/generate-from-document', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/exams/{id}/start
   * Start an official proctored examination session attempt.
   */
  startExamAttempt: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}/start`, { method: 'POST', token }),

  /**
   * POST /api/v1/exams/{id}/submit
   * Submit an exam attempt for grading and score calculation.
   */
  submitExamAttempt: (id: string, payload: ExamSubmitPayload, token?: string) => 
    apiRequest<any>(`/exams/${id}/submit`, { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/exams/{id}/result
   * Get comprehensive breakdown of exam performance and topic mastery.
   */
  getExamResult: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}/result`, { method: 'GET', token }),

  /**
   * GET /api/v1/exams/history
   * Retrieve history of all official exam attempts taken by the student.
   */
  getStudentExamHistory: (token?: string) => 
    apiRequest<any>('/exams/history', { method: 'GET', token }),

  /**
   * GET /api/v1/exams/attempts/{id}
   * Get specific exam attempt details and response logs.
   */
  getExamAttemptById: (id: string, token?: string) => 
    apiRequest<any>(`/exams/attempts/${id}`, { method: 'GET', token }),

  /**
   * POST /api/v1/exams/{id}/simulate
   * Initialize an AI-driven simulation environment under realistic exam constraints.
   */
  simulateExam: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}/simulate`, { method: 'POST', token }),

  /**
   * GET /api/v1/exams/{id}/readiness
   * Calculate and evaluate student preparation metrics for official exams.
   */
  getExamReadiness: (id: string, token?: string) => 
    apiRequest<any>(`/exams/${id}/readiness`, { method: 'GET', token }),
};

// ==========================================
// EXAMINATION PREPARATION & PAST QUESTIONS TYPES
// ==========================================

export interface PastQuestionQueryParams {
  subject?: string;
  year?: number | string;
  topic?: string;
  type?: string;     // e.g., "jamb", "waec"
  limit?: number;    // e.g., pagination limit
  [key: string]: any;
}

export interface ExamPrepPayload {
  title?: string;
  examType?: string; // e.g., "jamb"
  subjects?: string[];
  targetDate?: string; // e.g., ISO date string
  notes?: string;
  [key: string]: any;
}

// ==========================================
// EXAMINATION BOARDS API ENDPOINTS
// ==========================================

export const examinationBoardsApi = {
  /**
   * GET /api/v1/examinations
   * Retrieve all supported standardized examination boards (e.g., WAEC, JAMB, NECO, SAT).
   */
  getAllExaminationBoards: (token?: string) => 
    apiRequest<any>('/examinations', { method: 'GET', token }),

  /**
   * GET /api/v1/examinations/{id}
   * Get detailed information regarding a specific standardized examination board.
   */
  getExaminationBoardById: (id: string, token?: string) => 
    apiRequest<any>(`/examinations/${id}`, { method: 'GET', token }),
};

// ==========================================
// PAST QUESTIONS API ENDPOINTS
// ==========================================

export const pastQuestionsApi = {
  /**
   * GET /api/v1/past-questions
   * Retrieve past questions with optional query filters (subject, year, topic, type, limit).
   */
  getPastQuestions: (params?: PastQuestionQueryParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/past-questions?${queryString}` : '/past-questions';

    return apiRequest<any>(endpoint, { method: 'GET', token });
  },

  /**
   * GET /api/v1/past-questions/years
   * Retrieve a list of all distinct years available in the local repository.
   */
  getPastQuestionYears: (token?: string) => 
    apiRequest<any>('/past-questions/years', { method: 'GET', token }),

  /**
   * GET /api/v1/past-questions/subjects
   * Retrieve a list of all distinct academic subjects available in the local database.
   */
  getPastQuestionSubjects: (token?: string) => 
    apiRequest<any>('/past-questions/subjects', { method: 'GET', token }),

  /**
   * GET /api/v1/past-questions/topics
   * Retrieve a list of all distinct topics covered across the past questions database.
   */
  getPastQuestionTopics: (token?: string) => 
    apiRequest<any>('/past-questions/topics', { method: 'GET', token }),

  /**
   * GET /api/v1/past-questions/{id}
   * Get a single past question along with options, correct answers, and explanation.
   */
  getPastQuestionById: (id: string, token?: string) => 
    apiRequest<any>(`/past-questions/${id}`, { method: 'GET', token }),
};

// ==========================================
// EXAM PREPARATION PLANS API ENDPOINTS
// ==========================================

export const examPrepApi = {
  /**
   * POST /api/v1/exam-prep
   * Create a personalized study schedule and target prep plan for an upcoming examination.
   */
  createExamPrepPlan: (payload: ExamPrepPayload, token?: string) => 
    apiRequest<any>('/exam-prep', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/exam-prep
   * Retrieve all saved examination preparation plans for the authenticated user.
   */
  getAllExamPrepPlans: (token?: string) => 
    apiRequest<any>('/exam-prep', { method: 'GET', token }),

  /**
   * GET /api/v1/exam-prep/{id}
   * Get details of a specific examination preparation plan by ID.
   */
  getExamPrepPlanById: (id: string, token?: string) => 
    apiRequest<any>(`/exam-prep/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/exam-prep/{id}
   * Update target dates, subjects, or study layouts for an existing prep plan.
   */
  updateExamPrepPlan: (id: string, payload: Partial<ExamPrepPayload>, token?: string) => 
    apiRequest<any>(`/exam-prep/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/exam-prep/{id}
   * Permanently remove an examination preparation plan from the system.
   */
  deleteExamPrepPlan: (id: string, token?: string) => 
    apiRequest<any>(`/exam-prep/${id}`, { method: 'DELETE', token }),
};

// ==========================================
// ASSESSMENT ANALYTICS TYPES
// ==========================================

export interface AnalyticsOverviewParams {
  startDate?: string;
  endDate?: string;
  courseId?: string;
  [key: string]: any;
}

// ==========================================
// ASSESSMENT ANALYTICS API ENDPOINTS
// ==========================================

export const analyticsApi = {
  /**
   * GET /api/v1/analytics/overview
   * Get performance overview with optional date and course filters.
   */
  getPerformanceOverview: (params?: AnalyticsOverviewParams, token?: string) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/analytics/overview?${queryString}` : '/analytics/overview';

    return apiRequest<any>(endpoint, { method: 'GET', token });
  },

  /**
   * GET /api/v1/analytics/courses
   * Get aggregated course analytics across all enrolled courses.
   */
  getAggregatedCourseAnalytics: (token?: string) => 
    apiRequest<any>('/analytics/courses', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/courses/{id}
   * Get detailed analytics and metrics for a specific course by ID.
   */
  getCourseAnalyticsById: (id: string, token?: string) => 
    apiRequest<any>(`/analytics/courses/${id}`, { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/topics
   * Get topic-by-topic mastery distribution, progress, and coverage percentages.
   */
  getTopicAnalytics: (token?: string) => 
    apiRequest<any>('/analytics/topics', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/weak-topics
   * Identify weak topics requiring targeted revision based on low assessment scores.
   */
  getWeakTopics: (token?: string) => 
    apiRequest<any>('/analytics/weak-topics', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/strong-topics
   * Identify strong topics where the student demonstrates high proficiency and mastery.
   */
  getStrongTopics: (token?: string) => 
    apiRequest<any>('/analytics/strong-topics', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/quiz-performance
   * Get performance history, averages, and metrics specifically for quizzes.
   */
  getQuizPerformance: (token?: string) => 
    apiRequest<any>('/analytics/quiz-performance', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/test-performance
   * Get performance history, averages, and metrics specifically for AI-generated tests.
   */
  getTestPerformance: (token?: string) => 
    apiRequest<any>('/analytics/test-performance', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/exam-performance
   * Get performance history, averages, and metrics specifically for formal examinations.
   */
  getExamPerformance: (token?: string) => 
    apiRequest<any>('/analytics/exam-performance', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/time-spent
   * Track total study and assessment time spent across the platform in seconds and hours.
   */
  getTimeSpentMetrics: (token?: string) => 
    apiRequest<any>('/analytics/time-spent', { method: 'GET', token }),

  /**
   * GET /api/v1/analytics/mastery
   * Calculate overall platform mastery percentage and structural performance breakdown.
   */
  getOverallMastery: (token?: string) => 
    apiRequest<any>('/analytics/mastery', { method: 'GET', token }),
};

// ==========================================
// LEARNING PROGRESS & MASTERY TYPES
// ==========================================

export interface UpdateProgressPayload {
  courseId?: string;
  topicId?: string;
  completionPercentage?: number;
  lastAccessedActivity?: string;
  [key: string]: any;
}

// ==========================================
// LEARNING PROGRESS API ENDPOINTS
// ==========================================

export const progressApi = {
  /**
   * GET /api/v1/progress
   * Retrieves overall completion metrics and progress statistics across all tracked courses.
   */
  getOverallProgress: (token?: string) => 
    apiRequest<any>('/progress', { method: 'GET', token }),

  /**
   * GET /api/v1/progress/courses/{id}
   * Fetches detailed completion status and progress metrics for a specific course.
   */
  getCourseProgressById: (id: string, token?: string) => 
    apiRequest<any>(`/progress/courses/${id}`, { method: 'GET', token }),

  /**
   * GET /api/v1/progress/topics/{id}
   * Fetches learning progress and milestone completion data for a specific topic.
   */
  getTopicProgressById: (id: string, token?: string) => 
    apiRequest<any>(`/progress/topics/${id}`, { method: 'GET', token }),

  /**
   * POST /api/v1/progress/update
   * Records or updates student progress percentages and recent activity for a course or topic.
   */
  updateProgress: (payload: UpdateProgressPayload, token?: string) => 
    apiRequest<any>('/progress/update', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/progress/history
   * Retrieves the chronological audit trail of learning updates and milestone achievements.
   */
  getProgressHistory: (token?: string) => 
    apiRequest<any>('/progress/history', { method: 'GET', token }),
};

// ==========================================
// MASTERY METRICS API ENDPOINTS
// ==========================================

export const masteryApi = {
  /**
   * GET /api/v1/mastery
   * Calculates the overall platform mastery score and proficiency distribution across subjects.
   */
  getOverallMasteryMetrics: (token?: string) => 
    apiRequest<any>('/mastery', { method: 'GET', token }),

  /**
   * GET /api/v1/mastery/courses/{id}
   * Retrieves granular topic mastery metrics for a specific course ID.
   */
  getCourseMasteryById: (id: string, token?: string) => 
    apiRequest<any>(`/mastery/courses/${id}`, { method: 'GET', token }),

  /**
   * GET /api/v1/mastery/topics/{id}
   * Retrieves the exact proficiency score and mastery tier for a single topic.
   */
  getTopicMasteryById: (id: string, token?: string) => 
    apiRequest<any>(`/mastery/topics/${id}`, { method: 'GET', token }),
};

// ==========================================
// STUDY GOALS TYPES
// ==========================================

export interface StudyGoalPayload {
  title: string;
  description?: string;
  goalType?: string; // e.g., "course_completion"
  targetValue?: number;
  targetDate?: string; // e.g., "2026-12-31"
  [key: string]: any;
}

// ==========================================
// STUDY GOALS API ENDPOINTS
// ==========================================

export const goalsApi = {
  /**
   * GET /api/v1/goals
   * Retrieve all personalized study goals and targets created by the user.
   */
  getAllGoals: (token?: string) => 
    apiRequest<any>('/goals', { method: 'GET', token }),

  /**
   * POST /api/v1/goals
   * Create a new study objective with custom targets, deadlines, and categories.
   */
  createGoal: (payload: StudyGoalPayload, token?: string) => 
    apiRequest<any>('/goals', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/goals/{id}
   * Get details of a specific study goal by ID.
   */
  getGoalById: (id: string, token?: string) => 
    apiRequest<any>(`/goals/${id}`, { method: 'GET', token }),

  /**
   * PATCH /api/v1/goals/{id}
   * Update an existing study goal's fields, targets, or descriptions.
   */
  updateGoal: (id: string, payload: Partial<StudyGoalPayload>, token?: string) => 
    apiRequest<any>(`/goals/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * DELETE /api/v1/goals/{id}
   * Permanently remove a study goal from the database.
   */
  deleteGoal: (id: string, token?: string) => 
    apiRequest<any>(`/goals/${id}`, { method: 'DELETE', token }),

  /**
   * POST /api/v1/goals/{id}/complete
   * Mark a study goal status as completed and sync final metrics.
   */
  completeGoal: (id: string, token?: string) => 
    apiRequest<any>(`/goals/${id}/complete`, { method: 'POST', token }),

  /**
   * GET /api/v1/goals/{id}/progress
   * Calculate exact completion percentage and status breakdown for a goal.
   */
  getGoalProgress: (id: string, token?: string) => 
    apiRequest<any>(`/goals/${id}/progress`, { method: 'GET', token }),
};

// ==========================================
// AI STUDY PLANNER TYPES
// ==========================================

export interface GeneratePlannerPayload {
  targetId?: string;
  deadline?: string; // e.g., "2026-12-15"
  intensity?: 'light' | 'moderate' | 'intensive' | string;
  [key: string]: any;
}

export interface UpdatePlannerItemPayload {
  title?: string;
  scheduledDate?: string; // e.g., "2026-09-20"
  startTime?: string;     // e.g., "10:00 AM"
  endTime?: string;       // e.g., "11:30 AM"
  [key: string]: any;
}

// ==========================================
// AI STUDY PLANNER API ENDPOINTS
// ==========================================

export const plannerApi = {
  /**
   * POST /api/v1/planner/generate
   * Trigger AI scheduling engine to build a custom study roadmap based on deadlines and subjects.
   */
  generatePlanner: (payload: GeneratePlannerPayload, token?: string) => 
    apiRequest<any>('/planner/generate', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/planner
   * Fetch the complete study schedule timeline for the authenticated user.
   */
  getAllPlannerSessions: (token?: string) => 
    apiRequest<any>('/planner', { method: 'GET', token }),

  /**
   * GET /api/v1/planner/today
   * Fetch all scheduled study sessions and tasks assigned for the current day.
   */
  getTodayAgenda: (token?: string) => 
    apiRequest<any>('/planner/today', { method: 'GET', token }),

  /**
   * GET /api/v1/planner/week
   * Fetch study sessions scheduled for the current week.
   */
  getWeeklySchedule: (token?: string) => 
    apiRequest<any>('/planner/week', { method: 'GET', token }),

  /**
   * GET /api/v1/planner/month
   * Fetch study sessions scheduled across the current month.
   */
  getMonthlySchedule: (token?: string) => 
    apiRequest<any>('/planner/month', { method: 'GET', token }),

  /**
   * PATCH /api/v1/planner/{id}
   * Modify specific properties, times, or dates of a scheduled study task.
   */
  updatePlannerItem: (id: string, payload: Partial<UpdatePlannerItemPayload>, token?: string) => 
    apiRequest<any>(`/planner/${id}`, { method: 'PATCH', body: payload, token }),

  /**
   * POST /api/v1/planner/{id}/complete
   * Update a planner task status to completed and record learning milestone achievement.
   */
  completePlannerSession: (id: string, token?: string) => 
    apiRequest<any>(`/planner/${id}/complete`, { method: 'POST', token }),

  /**
   * POST /api/v1/planner/{id}/skip
   * Flag a scheduled session as skipped so the AI planner can take it into account.
   */
  skipPlannerSession: (id: string, token?: string) => 
    apiRequest<any>(`/planner/${id}/skip`, { method: 'POST', token }),

  /**
   * POST /api/v1/planner/regenerate
   * Analyze missed or skipped sessions and dynamically rebuild/redistribute the remaining schedule.
   */
  regeneratePlanner: (token?: string) => 
    apiRequest<any>('/planner/regenerate', { method: 'POST', token }),
};

// ==========================================
// STUDY SESSIONS TYPES
// ==========================================

export interface StartStudySessionPayload {
  title: string;
  courseId?: string;
  [key: string]: any;
}

// ==========================================
// STUDY SESSIONS API ENDPOINTS
// ==========================================

export const studySessionsApi = {
  /**
   * POST /api/v1/study-sessions/start
   * Initializes a live proctored or tracked study session timer for the student.
   */
  startStudySession: (payload: StartStudySessionPayload, token?: string) => 
    apiRequest<any>('/study-sessions/start', { method: 'POST', body: payload, token }),

  /**
   * POST /api/v1/study-sessions/{id}/pause
   * Pauses the timing accumulator for an active study session.
   */
  pauseStudySession: (id: string, token?: string) => 
    apiRequest<any>(`/study-sessions/${id}/pause`, { method: 'POST', token }),

  /**
   * POST /api/v1/study-sessions/{id}/resume
   * Resumes tracking time for a paused study session.
   */
  resumeStudySession: (id: string, token?: string) => 
    apiRequest<any>(`/study-sessions/${id}/resume`, { method: 'POST', token }),

  /**
   * POST /api/v1/study-sessions/{id}/complete
   * Finalizes a study session, calculates total accumulated duration, and records metrics.
   */
  completeStudySession: (id: string, token?: string) => 
    apiRequest<any>(`/study-sessions/${id}/complete`, { method: 'POST', token }),

  /**
   * GET /api/v1/study-sessions
   * Fetches the complete history of all sessions (active, paused, completed) for the user.
   */
  getAllStudySessions: (token?: string) => 
    apiRequest<any>('/study-sessions', { method: 'GET', token }),

  /**
   * GET /api/v1/study-sessions/today
   * Fetches all sessions logged for the current day alongside daily aggregate study duration.
   */
  getTodayStudySessions: (token?: string) => 
    apiRequest<any>('/study-sessions/today', { method: 'GET', token }),

  /**
   * GET /api/v1/study-sessions/history
   * Retrieves chronological records of all successfully completed study sessions.
   */
  getStudySessionHistory: (token?: string) => 
    apiRequest<any>('/study-sessions/history', { method: 'GET', token }),

  /**
   * GET /api/v1/study-sessions/stats
   * Calculates aggregate metrics including total completed sessions and total study hours.
   */
  getStudySessionStats: (token?: string) => 
    apiRequest<any>('/study-sessions/stats', { method: 'GET', token }),
};

// ==========================================
// STREAKS TYPES
// ==========================================

export interface StreakCheckInPayload {
  activitySource?: string; // e.g., "study_session"
  [key: string]: any;
}

export interface StreakRecoverPayload {
  recoveryMethod?: string; // e.g., "standard_token"
  [key: string]: any;
}

// ==========================================
// STREAKS API ENDPOINTS
// ==========================================

export const streaksApi = {
  /**
   * GET /api/v1/streak
   * Get current streak summary (streak count, longest streak, recovery tokens, check-in status).
   */
  getStreakSummary: (token?: string) => 
    apiRequest<any>('/streak', { method: 'GET', token }),

  /**
   * GET /api/v1/streak/history
   * Get chronological check-in logs for engagement analysis.
   */
  getStreakHistory: (token?: string) => 
    apiRequest<any>('/streak/history', { method: 'GET', token }),

  /**
   * GET /api/v1/streak/calendar
   * Get calendar check-in map (array of check-in dates for grid UI widgets).
   */
  getStreakCalendar: (token?: string) => 
    apiRequest<any>('/streak/calendar', { method: 'GET', token }),

  /**
   * POST /api/v1/streak/check-in
   * Perform daily streak check-in to register activity and increment counters.
   */
  checkInStreak: (payload?: StreakCheckInPayload, token?: string) => 
    apiRequest<any>('/streak/check-in', { method: 'POST', body: payload, token }),

  /**
   * GET /api/v1/streak/recovery
   * Check streak recovery availability (inspects available recovery tokens).
   */
  checkRecoveryAvailability: (token?: string) => 
    apiRequest<any>('/streak/recovery', { method: 'GET', token }),

  /**
   * POST /api/v1/streak/recover
   * Recover a broken streak by consuming a recovery token.
   */
  recoverStreak: (payload?: StreakRecoverPayload, token?: string) => 
    apiRequest<any>('/streak/recover', { method: 'POST', body: payload, token }),
};

// ==========================================
// LEVELS, ACHIEVEMENTS & BADGES TYPES
// ==========================================

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  [key: string]: any;
}

export interface BadgeItem {
  id: string;
  name: string;
  imageUrl?: string;
  criteria?: string;
  [key: string]: any;
}

// ==========================================
// LEVELS & RANKS API ENDPOINTS
// ==========================================

export const levelsApi = {
  /**
   * GET /api/v1/levels
   * Get all system levels and progression configuration.
   */
  getAllLevels: (token?: string) => 
    apiRequest<any>('/levels', { method: 'GET', token }),

  /**
   * GET /api/v1/levels/me
   * Get current authenticated user level and XP progress.
   */
  getMyLevel: (token?: string) => 
    apiRequest<any>('/levels/me', { method: 'GET', token }),
};

// ==========================================
// ACHIEVEMENTS API ENDPOINTS
// ==========================================

export const achievementsApi = {
  /**
   * GET /api/v1/achievements
   * Get global achievements catalog.
   */
  getAllAchievements: (token?: string) => 
    apiRequest<any>('/achievements', { method: 'GET', token }),

  /**
   * GET /api/v1/achievements/me
   * Get authenticated user unlocked achievements.
   */
  getMyAchievements: (token?: string) => 
    apiRequest<any>('/achievements/me', { method: 'GET', token }),

  /**
   * GET /api/v1/achievements/{id}
   * Get specific achievement details by unique ID.
   */
  getAchievementById: (id: string, token?: string) => 
    apiRequest<any>(`/achievements/${id}`, { method: 'GET', token }),
};

// ==========================================
// BADGES API ENDPOINTS
// ==========================================

export const badgesApi = {
  /**
   * GET /api/v1/badges
   * Get all system available badges catalog.
   */
  getAllBadges: (token?: string) => 
    apiRequest<any>('/badges', { method: 'GET', token }),

  /**
   * GET /api/v1/badges/me
   * Get authenticated user unlocked badges.
   */
  getMyBadges: (token?: string) => 
    apiRequest<any>('/badges/me', { method: 'GET', token }),
};

// ==========================================
// LEADERBOARDS TYPES
// ==========================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalXp: number;
  [key: string]: any;
}

export interface LeaderboardResponse {
  status: string;
  scope?: string;
  filterValue?: string;
  leaderboard: LeaderboardEntry[];
  [key: string]: any;
}

// ==========================================
// LEADERBOARDS API ENDPOINTS
// ==========================================

export const leaderboardsApi = {
  /**
   * GET /api/v1/leaderboards/global
   * Get global XP leaderboard standings.
   */
  getGlobalLeaderboard: (token?: string) => 
    apiRequest<LeaderboardResponse>('/leaderboards/global', { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/country
   * Get country-specific leaderboard standings.
   */
  getCountryLeaderboard: (countryName: string, token?: string) => 
    apiRequest<LeaderboardResponse>(`/leaderboards/country?name=${encodeURIComponent(countryName)}`, { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/school
   * Get school-specific leaderboard standings.
   */
  getSchoolLeaderboard: (schoolName: string, token?: string) => 
    apiRequest<LeaderboardResponse>(`/leaderboards/school?name=${encodeURIComponent(schoolName)}`, { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/university
   * Get university-specific leaderboard standings.
   */
  getUniversityLeaderboard: (universityName: string, token?: string) => 
    apiRequest<LeaderboardResponse>(`/leaderboards/university?name=${encodeURIComponent(universityName)}`, { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/department
   * Get department-specific leaderboard standings.
   */
  getDepartmentLeaderboard: (departmentName: string, token?: string) => 
    apiRequest<LeaderboardResponse>(`/leaderboards/department?name=${encodeURIComponent(departmentName)}`, { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/course
   * Get course-specific leaderboard standings.
   */
  getCourseLeaderboard: (courseId: string, token?: string) => 
    apiRequest<LeaderboardResponse>(`/leaderboards/course?courseId=${encodeURIComponent(courseId)}`, { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/friends
   * Get friends network leaderboard standings.
   */
  getFriendsLeaderboard: (token?: string) => 
    apiRequest<LeaderboardResponse>('/leaderboards/friends', { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/weekly
   * Get weekly XP leaderboard standings.
   */
  getWeeklyLeaderboard: (token?: string) => 
    apiRequest<LeaderboardResponse>('/leaderboards/weekly', { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/monthly
   * Get monthly XP leaderboard standings.
   */
  getMonthlyLeaderboard: (token?: string) => 
    apiRequest<LeaderboardResponse>('/leaderboards/monthly', { method: 'GET', token }),

  /**
   * GET /api/v1/leaderboards/me
   * Get authenticated user current rank and standing across the platform.
   */
  getMyRank: (token?: string) => 
    apiRequest<any>('/leaderboards/me', { method: 'GET', token }),
};

