'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Loader2, RotateCcw } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { GeneratedFrom } from '@/components/learning/GeneratedFrom';
import { loadMaterial, loadMaterialText, retryMaterial } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/** One of the learner's materials: its processing state, its text, and what to learn from it. */
export default function MaterialPage() {
  const { materialId } = useParams<{ materialId: string }>();
  const material = useApiQuery(() => loadMaterial(materialId), [materialId]);
  const ready = material.data?.status === 'READY';
  const text = useApiQuery(() => loadMaterialText(materialId), [materialId, ready], { enabled: ready });
  const retry = useAsyncAction(async () => {
    await retryMaterial(materialId);
    material.retry();
  });

  // while the text is being extracted, check again every few seconds
  const { retry: reload } = material;
  const processing = material.data?.status === 'PROCESSING';
  useEffect(() => {
    if (!processing) return;
    const t = setInterval(reload, 2500);
    return () => clearInterval(t);
  }, [processing, reload]);

  const [showAll, setShowAll] = useState(false);
  const m = material.data;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> Learn
      </Link>
      {material.isLoading ? (
        <LoadingState layout="detail" label="Loading material…" />
      ) : material.error && !m ? (
        <ErrorState error={material.error} onRetry={material.retry} />
      ) : m ? (
        <>
          <section className={`${card} p-5 sm:p-6 space-y-3`} aria-labelledby="material-title">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-[var(--color-brand-blue)] shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <h1 id="material-title" className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white break-words">{m.name}</h1>
                <p className="text-xs text-gray-500">
                  {m.sourceType === 'text' ? 'Pasted text' : 'Uploaded file'}
                  {m.textChars > 0 && ` · ${m.textChars.toLocaleString()} characters of text`}
                  {m.personalCourseId && (
                    <>
                      {' · '}
                      <Link className="text-[var(--color-brand-blue)] hover:underline" href={`/my-courses/${encodeURIComponent(m.personalCourseId)}`}>
                        Open its course
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
            {m.status === 'PROCESSING' && (
              <p role="status" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Reading the text from your file…
              </p>
            )}
            {m.status === 'FAILED' && (
              <Alert variant="error" title="The text could not be read">
                {m.processingError ?? 'Processing failed.'}
              </Alert>
            )}
            {m.status === 'FAILED' && m.sourceType !== 'text' && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" isLoading={retry.isPending} onClick={() => void retry.run()}>
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Try again
                </Button>
                <Link href="/learn?start=paste" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline self-center">
                  Paste the text instead
                </Link>
              </div>
            )}
            {retry.error && <ErrorState error={retry.error} compact />}
            {ready && text.data && (
              <div className="space-y-2">
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line break-words">{showAll ? text.data : text.data.slice(0, 800)}</p>
                {text.data.length > 800 && (
                  <button type="button" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show less' : 'Show all text'}
                  </button>
                )}
              </div>
            )}
          </section>

          {ready && (
            <section className={`${card} p-5 sm:p-6`}>
              <GenerateForm heading="Learn from this material" source={{ sourceType: 'material', sourceId: m.id }} personalCourseId={m.personalCourseId ?? undefined} />
            </section>
          )}
          <GeneratedFrom filter={{ materialId: m.id }} />
        </>
      ) : null}
    </div>
  );
}
