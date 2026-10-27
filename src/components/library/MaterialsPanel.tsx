'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, FileText, Loader2, RotateCcw, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  MATERIAL_ACCEPT,
  checkMaterialFile,
  deleteMaterial,
  formatBytes,
  loadMaterials,
  materialLink,
  uploadMaterial,
  type Material,
} from '@/lib/learner-content';
import { addTextMaterial, retryMaterial } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const fmtDate = (iso: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

/** The learner's own uploaded files (all of them, or those of one personal course). */
export function MaterialsPanel({ personalCourseId, onChanged }: { personalCourseId?: string; onChanged?: () => void }) {
  const list = useApiQuery(() => loadMaterials(personalCourseId), [personalCourseId]);
  const inputRef = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const refresh = () => {
    list.retry();
    onChanged?.();
  };
  // files still being read are checked again every few seconds
  const { retry: reload } = list;
  const processing = (list.data ?? []).some((m) => m.status === 'PROCESSING');
  useEffect(() => {
    if (!processing) return;
    const t = setInterval(reload, 3000);
    return () => clearInterval(t);
  }, [processing, reload]);
  const [paste, setPaste] = useState<{ title: string; text: string } | null>(null);
  const addText = useAsyncAction(async (_signal: AbortSignal, d: { title: string; text: string }) => {
    const res = await addTextMaterial(d.title.trim() || 'Pasted text', d.text, personalCourseId);
    setPaste(null);
    refresh();
    return res;
  });
  const retry = useAsyncAction(async (_signal: AbortSignal, m: Material) => {
    await retryMaterial(m.id);
    refresh();
  });
  const upload = useAsyncAction(async (_signal: AbortSignal, f: File) => {
    controller.current = new AbortController();
    setProgress(0);
    const res = await uploadMaterial(f, personalCourseId, { onProgress: setProgress, signal: controller.current.signal });
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
    refresh();
    return res;
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, m: Material) => {
    if (!window.confirm(`Delete “${m.name}”? This cannot be undone.`)) return;
    await deleteMaterial(m.id);
    refresh();
  });
  const open = useAsyncAction(async (_signal: AbortSignal, m: Material) => {
    const url = await materialLink(m.id); // a fresh link each time: they expire after a few minutes
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  if (list.error?.kind === 'not_implemented') {
    return <FeatureUnavailable title="Uploaded materials aren't available yet" description="Your own files can't be stored on this server yet." />;
  }

  const items = list.data ?? [];
  return (
    <div className="space-y-4">
      <div className={`${card} p-5 space-y-3`}>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upload a learning material</h3>
        <p className="text-xs text-gray-500">PDF, Word (.docx) or plain text, up to 15 MB. Only you can open your files.</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 focus-within:ring-2 focus-within:ring-[var(--color-brand-blue)]">
          <Upload className="w-4 h-4" aria-hidden="true" /> Choose a file
          <input
            ref={inputRef}
            type="file"
            accept={MATERIAL_ACCEPT}
            className="sr-only"
            disabled={upload.isPending}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              upload.reset();
              const p = f ? checkMaterialFile(f) : null;
              setProblem(p);
              setFile(p ? null : f);
            }}
          />
        </label>
        {problem && <Alert variant="error">{problem}</Alert>}
        {file && (
          <div className="space-y-2">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {file.name} · {formatBytes(file.size)}
            </p>
            {upload.isPending && (
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
                <div className="h-full bg-[var(--color-brand-blue)] transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
            {upload.isSlow && <SlowNotice />}
            {upload.error && upload.error.kind !== 'aborted' && <ErrorState error={upload.error} compact />}
            {upload.error?.kind === 'aborted' && <p className="text-xs text-gray-500">Upload cancelled. Nothing was saved.</p>}
            <div className="flex gap-2">
              <Button type="button" size="sm" isLoading={upload.isPending} onClick={() => void upload.run(file)}>
                {upload.error && upload.error.kind !== 'aborted' ? 'Try again' : 'Upload'}
              </Button>
              {upload.isPending ? (
                <Button type="button" size="sm" variant="outline" onClick={() => controller.current?.abort()}>
                  <X className="w-3.5 h-3.5" aria-hidden="true" /> Cancel
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`${card} p-5 space-y-3`}>
        {!paste ? (
          <Button type="button" size="sm" variant="outline" onClick={() => { addText.reset(); setPaste({ title: '', text: '' }); }}>
            Paste text instead
          </Button>
        ) : (
          <form className="space-y-3" aria-label="Paste text" onSubmit={(e) => { e.preventDefault(); void addText.run(paste); }}>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
              <input className={input} value={paste.title} maxLength={255} onChange={(e) => setPaste({ ...paste, title: e.target.value })} placeholder="e.g. Chapter 3 notes" />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Text</span>
              <textarea className={`${input} min-h-40`} value={paste.text} maxLength={200000} onChange={(e) => setPaste({ ...paste, text: e.target.value })} />
            </label>
            {addText.error && <ErrorState error={addText.error} compact />}
            <div className="flex gap-2">
              <Button type="submit" size="sm" isLoading={addText.isPending} disabled={paste.text.trim().length < 20}>Save text</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setPaste(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </div>

      {(remove.error || open.error || retry.error) && <ErrorState error={(remove.error ?? open.error ?? retry.error)!} compact />}
      {list.isLoading ? (
        <LoadingState label="Loading your materials…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} />
      ) : items.length === 0 ? (
        <EmptyState icon={FileText} title="No uploaded materials yet" description="Files you upload appear here." />
      ) : (
        <ul className="space-y-2" aria-label="Uploaded materials">
          {items.map((m) => (
            <MaterialRow key={m.id} m={m} busy={remove.isPending || open.isPending || retry.isPending} onOpen={() => void open.run(m)} onDelete={() => void remove.run(m)} onRetry={() => void retry.run(m)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MaterialRow({ m, busy, onOpen, onDelete, onRetry }: { m: Material; busy: boolean; onOpen: () => void; onDelete: () => void; onRetry: () => void }) {
  return (
    <li className={`${card} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.name}</p>
          <p className="text-[11px] text-gray-500">
            {m.typeLabel}
            {m.sourceType !== 'text' && ` · ${formatBytes(m.sizeBytes)}`} · added {fmtDate(m.uploadedAt)} ·{' '}
            {m.status === 'READY' ? (
              <span className="font-semibold text-emerald-600">Ready</span>
            ) : m.status === 'PROCESSING' ? (
              <span className="font-semibold text-amber-600 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> Reading text…</span>
            ) : (
              <span className="font-semibold text-red-600">Failed</span>
            )}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {m.sourceType !== 'text' && (
            <button type="button" onClick={onOpen} disabled={busy} aria-label={`Open ${m.name}`} className="p-2.5 rounded-xl text-gray-400 hover:text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50">
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={onDelete} disabled={busy} aria-label={`Delete ${m.name}`} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {m.status === 'FAILED' && m.processingError && <p className="text-xs text-red-700 dark:text-red-400">{m.processingError}</p>}
      <div className="flex flex-wrap gap-2">
        {m.status === 'READY' && (
          <Link href={`/learn/materials/${encodeURIComponent(m.id)}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--color-brand-blue)] text-white text-xs font-semibold hover:opacity-90">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Learn from it
          </Link>
        )}
        {m.status === 'FAILED' && m.sourceType !== 'text' && (
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Try again
          </Button>
        )}
      </div>
    </li>
  );
}
