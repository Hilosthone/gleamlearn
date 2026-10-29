'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Blocks } from '@/components/learning/Blocks';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { invalidateLearnerStats } from '@/lib/learning';
import { completeResource, deleteResource, kindInfo, loadResource, renameResource } from '@/lib/self-learning';
import { parseVisualLesson, type VisualLesson } from '@/lib/visual-lesson';
import { VisualLessonView } from '@/components/visual/VisualLessonView';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** A generated lesson, summary, notes, study plan, key concepts, explanation — or an interactive visual lesson. */
export default function ResourcePage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const router = useRouter();
  const res = useApiQuery(() => loadResource(resourceId), [resourceId]);
  const complete = useAsyncAction(async () => {
    await completeResource(resourceId);
    invalidateLearnerStats(); // finishing a lesson counts towards today's streak
    res.retry();
  });
  const remove = useAsyncAction(async () => {
    if (!window.confirm('Delete this? It cannot be undone.')) return;
    await deleteResource(resourceId);
    router.push('/library?tab=lessons');
  });
  const [title, setTitle] = useState<string | null>(null); // non-null while renaming
  const rename = useAsyncAction(async () => {
    await renameResource(resourceId, title ?? '');
    setTitle(null);
    res.retry();
  });
  const r = res.data;
  const visual = useMemo((): { lesson: VisualLesson | null; error: string | null } => {
    if (r?.kind !== 'visual_lesson') return { lesson: null, error: null };
    try {
      return { lesson: parseVisualLesson(r.content), error: null };
    } catch (e) {
      return { lesson: null, error: (e as Error).message };
    }
  }, [r]);

  return (
    <div className={`space-y-6 pb-12 animate-in fade-in duration-300 ${r?.kind === 'visual_lesson' ? 'max-w-5xl' : 'max-w-3xl'}`}>
      <Link href={r?.personalCourseId ? `/my-courses/${encodeURIComponent(r.personalCourseId)}` : '/library?tab=lessons'} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> {r?.personalCourseId ? 'Back to the course' : 'Library'}
      </Link>
      {res.isLoading ? (
        <LoadingState layout="detail" label="Loading…" />
      ) : res.error && !r ? (
        <ErrorState error={res.error} onRetry={res.retry} />
      ) : r ? (
        <>
          <article className={`${card} p-5 sm:p-8 space-y-4`} aria-labelledby="resource-title">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">{kindInfo(r.kind)?.label ?? r.kind} · {r.sourceType === 'topic' ? 'AI-generated from general knowledge' : 'AI-generated from your material'}</p>
            {title === null ? (
              <div className="flex items-start justify-between gap-3">
                <h1 id="resource-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words">{r.title}</h1>
                <button type="button" onClick={() => { rename.reset(); setTitle(r.title); }} aria-label="Rename" className="shrink-0 p-2 rounded-xl text-gray-400 hover:text-[var(--color-brand-blue)] hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <form className="space-y-2" aria-label="Rename" onSubmit={(e) => { e.preventDefault(); if (title.trim()) void rename.run(); }}>
                <label className="block space-y-1">
                  <span id="resource-title" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
                  <input autoFocus value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]" />
                </label>
                {rename.error && <ErrorState error={rename.error} compact />}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" isLoading={rename.isPending} disabled={!title.trim()}>Save</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setTitle(null)} disabled={rename.isPending}>Cancel</Button>
                </div>
              </form>
            )}
            {r.truncated && <Alert variant="warning">Your material was long, so only its first part was used for this.</Alert>}
            {r.kind === 'visual_lesson' ? (
              visual.lesson ? (
                <VisualLessonView lesson={visual.lesson} onFinished={r.completed ? undefined : () => void complete.run()} />
              ) : (
                <Alert variant="warning">{visual.error}</Alert>
              )
            ) : (
              <Blocks markdown={r.content} />
            )}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {r.completed ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Completed
                </span>
              ) : (
                <Button type="button" size="sm" variant="success" isLoading={complete.isPending} onClick={() => void complete.run()}>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Mark as complete
                </Button>
              )}
              {r.materialId && (
                <Link href={`/learn/materials/${encodeURIComponent(r.materialId)}`} className="inline-flex items-center px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:border-[var(--color-brand-blue)]">
                  Open the source material
                </Link>
              )}
              {r.youtubeSessionId && (
                <Link href={`/ai/youtube/${encodeURIComponent(r.youtubeSessionId)}`} className="inline-flex items-center px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold hover:border-[var(--color-brand-blue)]">
                  Back to the video
                </Link>
              )}
              <Button type="button" size="sm" variant="outline" isLoading={remove.isPending} onClick={() => void remove.run()}>
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
              </Button>
            </div>
            {(complete.error || remove.error) && <ErrorState error={(complete.error ?? remove.error)!} compact />}
          </article>
          <section className={`${card} p-5 sm:p-6`}>
            <GenerateForm heading="Practise what you learned" source={{ sourceType: 'resource', sourceId: r.id }} personalCourseId={r.personalCourseId ?? undefined} kinds={['quiz', 'flashcards', 'exam', 'summary']} defaultKind="quiz" />
          </section>
        </>
      ) : null}
    </div>
  );
}
