// src/components/admin/content/CatalogForms.tsx
'use client';

import React, { useId, useState } from 'react';
import type { AdminCatalogCourse, AdminCatalogLesson, AdminCatalogTopic, CourseInput, LessonInput, TopicInput } from '@/lib/admin-api';
import {
  LIMITS,
  TRACK_SUGGESTIONS,
  changedFields,
  toFormString,
  validateCourse,
  validateLesson,
  validateTopic,
  type CourseFormValues,
  type FieldErrors,
  type LessonFormValues,
  type TopicFormValues,
  type Validated,
} from '@/lib/admin-content-form';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ErrorState, SlowNotice } from '@/components/ui/states';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

function TextArea({ label, error, helperText, id, className = '', ...props }: TextAreaProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const noteId = `${fieldId}-note`;
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || helperText ? noteId : undefined}
        className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border ${
          error ? 'border-[var(--color-brand-red)]' : 'border-gray-300 dark:border-[#1F2937] focus:border-[var(--color-brand-blue)]'
        } text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/20 text-sm ${className}`}
        {...props}
      />
      {error ? (
        <span id={noteId} className="text-xs text-[var(--color-brand-red)] font-medium">{error}</span>
      ) : helperText ? (
        <span id={noteId} className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>
      ) : null}
    </div>
  );
}

/**
 * Shared form behaviour: client validation, single submission while pending, slow notice,
 * server error display and a "no changes" guard for edits. Never retries automatically.
 */
function useCatalogForm<V extends object, P extends object, K extends string>(opts: {
  initial: V;
  validate: (values: V) => Validated<P, K>;
  original?: Partial<Record<keyof P, unknown>>;
  clearable?: Array<keyof P>;
  submit: (signal: AbortSignal, payload: Partial<P>) => Promise<unknown>;
}) {
  const [values, setValues] = useState<V>(opts.initial);
  const [errors, setErrors] = useState<FieldErrors<K>>({});
  const [notice, setNotice] = useState('');
  const action = useAsyncAction(async (signal, payload: Partial<P>) => opts.submit(signal, payload));

  const set = (key: keyof V) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
    setNotice('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (action.isPending) return;
    const result = opts.validate(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    const payload = opts.original ? changedFields(opts.original, result.value, opts.clearable) : result.value;
    if (Object.keys(payload).length === 0) {
      setNotice('Nothing has changed.');
      return;
    }
    await action.run(payload);
  };

  const footer = (submitLabel: string, onCancel?: () => void) => (
    <div className="space-y-3">
      {notice && <Alert variant="info">{notice}</Alert>}
      {action.isSlow && <SlowNotice />}
      {action.error && <ErrorState error={action.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      {action.error && (action.error.kind === 'timeout' || action.error.kind === 'network') && !opts.original && (
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          The item may already have been created. Reload the course before trying again to avoid a duplicate.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" disabled={action.isPending} onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={action.isPending}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );

  return { values, errors, set, onSubmit, footer, isPending: action.isPending };
}

interface FormProps<Record, Input> {
  /** Existing record when editing; omit to create. */
  original?: Record;
  submitLabel: string;
  onSubmit: (payload: Partial<Input>, signal: AbortSignal) => Promise<unknown>;
  onCancel?: () => void;
}

export function CourseForm({ original, submitLabel, onSubmit, onCancel }: FormProps<AdminCatalogCourse, CourseInput>) {
  const prefix = useId();
  const form = useCatalogForm<CourseFormValues, CourseInput, keyof CourseFormValues>({
    initial: {
      title: toFormString(original?.title),
      description: toFormString(original?.description),
      track: toFormString(original?.track) || (original ? '' : TRACK_SUGGESTIONS[0]),
      level: toFormString(original?.level),
      departmentId: toFormString(original?.departmentId),
    },
    validate: validateCourse,
    original: original as Partial<Record<keyof CourseInput, unknown>> | undefined,
    clearable: ['description', 'level'],
    submit: (signal, payload) => onSubmit(payload, signal),
  });
  const { values, errors, set } = form;
  return (
    <form noValidate onSubmit={form.onSubmit} className="space-y-4" aria-busy={form.isPending}>
      <Input id={`${prefix}-title`} label="Title" value={values.title} onChange={set('title')} maxLength={LIMITS.title} error={errors.title} required />
      <TextArea
        id={`${prefix}-description`}
        label="Description (optional)"
        rows={3}
        value={values.description}
        onChange={set('description')}
        maxLength={LIMITS.description}
        error={errors.description}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            id={`${prefix}-track`}
            label="Track"
            list={`${prefix}-tracks`}
            value={values.track}
            onChange={set('track')}
            maxLength={LIMITS.track}
            error={errors.track}
            helperText="Free text, e.g. Secondary or University. Course search can filter by it."
            required
          />
          <datalist id={`${prefix}-tracks`}>
            {TRACK_SUGGESTIONS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <Input
          id={`${prefix}-level`}
          label="Level (optional)"
          value={values.level}
          onChange={set('level')}
          maxLength={LIMITS.level}
          error={errors.level}
          placeholder="e.g. SS 2 or 200L"
        />
      </div>
      <Input
        id={`${prefix}-department`}
        label="Department ID (optional)"
        value={values.departmentId}
        onChange={set('departmentId')}
        error={errors.departmentId}
        helperText={
          original?.departmentId
            ? 'Must be an existing department. Clearing this field does not remove the current department.'
            : 'Must be an existing department ID. Leave empty if the course is not tied to a department.'
        }
        autoComplete="off"
        spellCheck={false}
      />
      {form.footer(submitLabel, onCancel)}
    </form>
  );
}

export function TopicForm({ original, submitLabel, onSubmit, onCancel }: FormProps<AdminCatalogTopic, TopicInput>) {
  const prefix = useId();
  const form = useCatalogForm<TopicFormValues, TopicInput, keyof TopicFormValues>({
    initial: {
      title: toFormString(original?.title),
      description: toFormString(original?.description),
      order: toFormString(original?.order),
    },
    validate: validateTopic,
    original: original as Partial<Record<keyof TopicInput, unknown>> | undefined,
    clearable: ['description'],
    submit: (signal, payload) => onSubmit(payload, signal),
  });
  const { values, errors, set } = form;
  return (
    <form noValidate onSubmit={form.onSubmit} className="space-y-4" aria-busy={form.isPending}>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <Input id={`${prefix}-title`} label="Topic title" value={values.title} onChange={set('title')} maxLength={LIMITS.title} error={errors.title} required />
        <Input id={`${prefix}-order`} label="Order" inputMode="numeric" value={values.order} onChange={set('order')} error={errors.order} placeholder="Auto" />
      </div>
      <TextArea
        id={`${prefix}-description`}
        label="Description (optional)"
        rows={2}
        value={values.description}
        onChange={set('description')}
        maxLength={LIMITS.description}
        error={errors.description}
      />
      {form.footer(submitLabel, onCancel)}
    </form>
  );
}

export function LessonForm({ original, submitLabel, onSubmit, onCancel }: FormProps<AdminCatalogLesson, LessonInput>) {
  const prefix = useId();
  const form = useCatalogForm<LessonFormValues, LessonInput, keyof LessonFormValues>({
    initial: {
      title: toFormString(original?.title),
      content: toFormString(original?.content),
      orderIndex: toFormString(original?.orderIndex),
    },
    validate: validateLesson,
    original: original as Partial<Record<keyof LessonInput, unknown>> | undefined,
    clearable: ['content'],
    submit: (signal, payload) => onSubmit(payload, signal),
  });
  const { values, errors, set } = form;
  return (
    <form noValidate onSubmit={form.onSubmit} className="space-y-4" aria-busy={form.isPending}>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-4">
        <Input id={`${prefix}-title`} label="Lesson title" value={values.title} onChange={set('title')} maxLength={LIMITS.title} error={errors.title} required />
        <Input
          id={`${prefix}-position`}
          label="Position"
          inputMode="numeric"
          value={values.orderIndex}
          onChange={set('orderIndex')}
          error={errors.orderIndex}
          placeholder="Auto"
        />
      </div>
      <TextArea
        id={`${prefix}-content`}
        label="Content (optional)"
        rows={8}
        value={values.content}
        onChange={set('content')}
        maxLength={LIMITS.lessonContent}
        error={errors.content}
        helperText="Stored exactly as entered. The learner web app does not display lesson content yet."
        className="font-mono"
      />
      {form.footer(submitLabel, onCancel)}
    </form>
  );
}
