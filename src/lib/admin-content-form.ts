/**
 * ---------------------------------------------------------------------------
 * lib/admin-content-form.ts — Client-side validation for the admin catalog forms
 * ---------------------------------------------------------------------------
 * Mirrors the backend DTO limits in src/admin/content/dto/admin-content.dto.ts so most
 * mistakes are caught before a request is sent. The backend still validates everything.
 *
 * Each validator takes raw form strings and returns either the cleaned payload or
 * per-field messages. Update helpers return only the fields that changed, because the
 * backend rejects an update with no changes.
 *
 * Kept dependency-free (no path aliases) so it can be unit-tested with `node --test`.
 */

import type { CourseInput, LessonInput, TopicInput } from './admin-api.ts';

export const LIMITS = {
  title: 200,
  description: 5000,
  track: 50,
  level: 50,
  lessonContent: 100_000,
} as const;

/** Suggested tracks (free text on the backend; these are the examples its API documentation gives). */
export const TRACK_SUGGESTIONS = ['Secondary', 'University'] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;
export type Validated<T, K extends string> = { ok: true; value: T } | { ok: false; errors: FieldErrors<K> };

export interface CourseFormValues {
  title: string;
  description: string;
  track: string;
  level: string;
  departmentId: string;
}
export interface TopicFormValues {
  title: string;
  description: string;
  order: string;
}
export interface LessonFormValues {
  title: string;
  content: string;
  orderIndex: string;
}

function required(value: string, label: string, max: number): string | undefined {
  if (!value) return `${label} is required.`;
  if (value.length > max) return `${label} must be at most ${max} characters.`;
  return undefined;
}
function optionalMax(value: string, label: string, max: number): string | undefined {
  return value.length > max ? `${label} must be at most ${max} characters.` : undefined;
}
/** '' → undefined (not sent); otherwise a whole number ≥ 0. */
function optionalOrder(value: string, label: string): { error?: string; value?: number } {
  if (value === '') return {};
  if (!/^\d+$/.test(value)) return { error: `${label} must be a whole number of 0 or more.` };
  const n = Number(value);
  return Number.isSafeInteger(n) ? { value: n } : { error: `${label} is too large.` };
}
function finish<T, K extends string>(errors: FieldErrors<K>, value: T): Validated<T, K> {
  return Object.values(errors).some(Boolean) ? { ok: false, errors } : { ok: true, value };
}
function compact<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')) as T;
}

export function validateCourse(raw: CourseFormValues): Validated<CourseInput, keyof CourseFormValues> {
  const v = {
    title: raw.title.trim(),
    description: raw.description.trim(),
    track: raw.track.trim(),
    level: raw.level.trim(),
    departmentId: raw.departmentId.trim(),
  };
  const errors: FieldErrors<keyof CourseFormValues> = {
    title: required(v.title, 'Title', LIMITS.title),
    description: optionalMax(v.description, 'Description', LIMITS.description),
    track: required(v.track, 'Track', LIMITS.track),
    level: optionalMax(v.level, 'Level', LIMITS.level),
    departmentId: v.departmentId && !UUID.test(v.departmentId) ? 'Department ID must be a valid ID (UUID), or left empty.' : undefined,
  };
  return finish(errors, compact(v) as CourseInput);
}

export function validateTopic(raw: TopicFormValues): Validated<TopicInput, keyof TopicFormValues> {
  const title = raw.title.trim();
  const description = raw.description.trim();
  const order = optionalOrder(raw.order.trim(), 'Order');
  const errors: FieldErrors<keyof TopicFormValues> = {
    title: required(title, 'Title', LIMITS.title),
    description: optionalMax(description, 'Description', LIMITS.description),
    order: order.error,
  };
  return finish(errors, compact({ title, description, order: order.value }) as TopicInput);
}

export function validateLesson(raw: LessonFormValues): Validated<LessonInput, keyof LessonFormValues> {
  const title = raw.title.trim();
  // Lesson content is kept as typed (leading indentation / Markdown matters); only blank content is dropped
  const content = raw.content.trim() ? raw.content : '';
  const orderIndex = optionalOrder(raw.orderIndex.trim(), 'Position');
  const errors: FieldErrors<keyof LessonFormValues> = {
    title: required(title, 'Title', LIMITS.title),
    content: optionalMax(content, 'Content', LIMITS.lessonContent),
    orderIndex: orderIndex.error,
  };
  return finish(errors, compact({ title, content, orderIndex: orderIndex.value }) as LessonInput);
}

/**
 * Fields in `next` that differ from `original`. A field the admin cleared is sent as ''
 * (strings) so the backend stores the empty value; numeric/ID fields that were cleared are
 * not sent, because the backend cannot clear them through this endpoint.
 */
export function changedFields<T extends object>(original: Partial<Record<keyof T, unknown>>, next: T, clearable: Array<keyof T> = []): Partial<T> {
  const out: Partial<T> = {};
  const keys = new Set<keyof T>([...(Object.keys(next) as Array<keyof T>), ...clearable]);
  for (const key of keys) {
    const before = original[key] ?? undefined;
    const after = next[key];
    if (after === undefined) {
      if (clearable.includes(key) && before !== undefined && before !== null && before !== '') out[key] = '' as T[keyof T];
      continue;
    }
    if (after !== before) out[key] = after;
  }
  return out;
}

/** Form values for editing an existing record ('' for missing values). */
export function toFormString(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
