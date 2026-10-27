'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Blocks } from '@/components/learning/Blocks';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { invalidateLearnerStats } from '@/lib/learning';
import { completeResource, deleteResource, kindInfo, loadResource } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** A generated lesson, summary, notes, study plan, key concepts or explanation. */
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
  const r = res.data;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-3xl">
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">{kindInfo(r.kind)?.label ?? r.kind} · AI-generated from your material</p>
            <h1 id="resource-title" className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white break-words">{r.title}</h1>
            {r.truncated && <Alert variant="warning">Your material was long, so only its first part was used for this.</Alert>}
            <Blocks markdown={r.content} />
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
