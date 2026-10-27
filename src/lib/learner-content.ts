/**
 * ---------------------------------------------------------------------------
 * lib/learner-content.ts — Personal courses and uploaded materials (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (2026-10-27; learner JWT; every record belongs to the signed-in learner, others get 404):
 *   GET/POST /personal-courses, GET/PATCH/DELETE /personal-courses/:id (detail includes modules and materials)
 *   POST /personal-courses/:id/modules, PATCH/DELETE /personal-courses/:id/modules/:moduleId  { title, notes, isCompleted }
 *   GET /materials[?personalCourseId=], POST /materials (multipart "file", PDF/DOCX/TXT ≤ 15 MB, checked by content)
 *   GET /materials/:id/access → { url (expires in minutes), expiresAt }, DELETE /materials/:id
 *   Materials are processed (text extracted) after upload: status PROCESSING → READY or FAILED (retry with
 *        POST /materials/:id/process). Learning from them goes through lib/self-learning.ts.
 * Personal courses are private: they never appear in the catalogue and cannot be published.
 * All routes answer 501 until the tables exist (docs/migrations/proposed/2026-10-27_learner_content.sql).
 */

import { materialsApi, personalCoursesApi, resolveApiUrl, type PersonalCourseInput, type UploadOptions } from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);
const rows = (res: unknown): Raw[] => (Array.isArray(res) ? (res.filter((x) => x && typeof x === 'object') as Raw[]) : []);

// Personal courses -----------------------------------------------------------------------------------------------

export interface PersonalCourseSummary {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  level: string;
  examGoals: string[];
  objectives: string[];
  moduleCount: number;
  completedModules: number;
  materialCount: number;
  percent: number;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  notes: string;
  isCompleted: boolean;
}

export interface PersonalCourseDetail extends PersonalCourseSummary {
  modules: CourseModule[];
  materials: Material[];
}

function toSummary(r: Raw): PersonalCourseSummary {
  const moduleCount = num(r.moduleCount);
  const completedModules = num(r.completedModules);
  return {
    id: str(r.id),
    title: str(r.title) || 'Untitled course',
    description: str(r.description),
    subjects: strings(r.subjects),
    level: str(r.level),
    examGoals: strings(r.examGoals),
    objectives: strings(r.objectives),
    moduleCount,
    completedModules,
    materialCount: num(r.materialCount),
    percent: moduleCount ? Math.round((completedModules / moduleCount) * 100) : 0,
    updatedAt: str(r.updatedAt) || str(r.createdAt),
  };
}

export const toPersonalCourses = (res: unknown): PersonalCourseSummary[] => rows(res).filter((r) => typeof r.id === 'string').map(toSummary);

export function toPersonalCourseDetail(res: unknown): PersonalCourseDetail {
  const r = (res ?? {}) as Raw;
  if (typeof r.id !== 'string') throw new Error('This course could not be read.');
  const modules = rows(r.modules)
    .filter((m) => typeof m.id === 'string')
    .map((m) => ({ id: m.id as string, title: str(m.title) || 'Untitled module', notes: str(m.notes), isCompleted: m.isCompleted === true }));
  const completed = modules.filter((m) => m.isCompleted).length;
  return {
    ...toSummary({ ...r, moduleCount: modules.length, completedModules: completed }),
    modules,
    materials: toMaterials(r.materials),
    materialCount: rows(r.materials).length,
  };
}

/** The exams the recommendations understand; offered as suggestions, any text is accepted. */
export const EXAM_GOAL_SUGGESTIONS = ['WAEC', 'NECO', 'JAMB', 'Post-UTME', 'GCE', 'BECE'];

/** "Biology, chemistry ,, Biology" → ["Biology", "chemistry"] (unique, max 10, each ≤ 60 characters). */
export function parseList(input: string): string[] {
  return Array.from(new Set(input.split(',').map((t) => t.trim().slice(0, 60)).filter(Boolean))).slice(0, 10);
}

export interface CourseDraft {
  title: string;
  description: string;
  subjects: string;
  level: string;
  examGoals: string;
  /** one per line: topics or learning objectives (the course outline) */
  objectives?: string;
}

export function courseInput(d: CourseDraft): PersonalCourseInput {
  return {
    title: d.title.trim(),
    ...(d.description.trim() ? { description: d.description.trim() } : {}),
    subjects: parseList(d.subjects),
    ...(d.level.trim() ? { level: d.level.trim() } : {}),
    examGoals: parseList(d.examGoals),
    objectives: (d.objectives ?? '').split(/\r?\n/).map((t) => t.trim().slice(0, 300)).filter(Boolean).slice(0, 30),
  };
}

export const loadPersonalCourses = async () => toPersonalCourses(await personalCoursesApi.list());
export const loadPersonalCourse = async (id: string) => toPersonalCourseDetail(await personalCoursesApi.get(id));
export const createPersonalCourse = (d: CourseDraft) => personalCoursesApi.create(courseInput(d));
export const updatePersonalCourse = (id: string, d: CourseDraft) => personalCoursesApi.update(id, courseInput(d));
export const deletePersonalCourse = (id: string) => personalCoursesApi.remove(id);
/** Archived courses are hidden from the course list; nothing is deleted. */
export const archivePersonalCourse = (id: string, archived: boolean) => personalCoursesApi.update(id, { archived } as never);
export const addModule = (courseId: string, title: string, notes: string) =>
  personalCoursesApi.addModule(courseId, { title: title.trim(), ...(notes.trim() ? { notes: notes.trim() } : {}) });
export const setModuleDone = (courseId: string, moduleId: string, isCompleted: boolean) => personalCoursesApi.updateModule(courseId, moduleId, { isCompleted });
export const saveModuleNotes = (courseId: string, moduleId: string, notes: string) => personalCoursesApi.updateModule(courseId, moduleId, { notes });
export const deleteModule = (courseId: string, moduleId: string) => personalCoursesApi.removeModule(courseId, moduleId);

// Materials ------------------------------------------------------------------------------------------------------

export interface Material {
  id: string;
  name: string;
  mimeType: string;
  typeLabel: string;
  sizeBytes: number;
  /** PROCESSING (text being extracted), READY, or FAILED (see processingError) */
  status: string;
  sourceType: string;
  textChars: number;
  processingError: string | null;
  personalCourseId: string | null;
  uploadedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'text/plain': 'Text',
};

export function toMaterials(res: unknown): Material[] {
  return rows(res)
    .filter((r) => typeof r.id === 'string')
    .map((r) => ({
      id: r.id as string,
      name: str(r.originalName) || 'Untitled file',
      mimeType: str(r.mimeType),
      typeLabel: str(r.sourceType) === 'text' ? 'Pasted text' : (TYPE_LABELS[str(r.mimeType)] ?? 'File'),
      sizeBytes: num(r.sizeBytes),
      status: str(r.status) || 'READY',
      sourceType: str(r.sourceType) || 'upload',
      textChars: num(r.textChars),
      processingError: str(r.processingError) || null,
      personalCourseId: str(r.personalCourseId) || null,
      uploadedAt: str(r.createdAt),
    }));
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export const MATERIAL_ACCEPT = '.pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
export const MATERIAL_MAX_BYTES = 15 * 1024 * 1024;

/** Quick checks before uploading (the server checks the real contents). Returns the problem, or null. */
export function checkMaterialFile(file: { name: string; type: string; size: number }): string | null {
  const ok = Object.keys(TYPE_LABELS).includes(file.type) || /\.(pdf|docx|txt)$/i.test(file.name);
  if (!ok) return 'Upload a PDF, Word (.docx) or plain-text (.txt) file.';
  if (file.size === 0) return 'That file is empty.';
  if (file.size > MATERIAL_MAX_BYTES) return 'The file must be 15 MB or smaller.';
  return null;
}

export const loadMaterials = async (personalCourseId?: string) => toMaterials(await materialsApi.list(personalCourseId));
export const uploadMaterial = (file: File, personalCourseId?: string, options?: UploadOptions) => materialsApi.upload(file, personalCourseId, options);
export const deleteMaterial = (id: string) => materialsApi.remove(id);

/** A fresh short-lived link for the learner's own file (absolute, ready to open). */
export async function materialLink(id: string): Promise<string> {
  const res = await materialsApi.access(id);
  if (!res?.url) throw new Error('No link was returned for this file.');
  return resolveApiUrl(res.url);
}

