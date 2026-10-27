'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaySquare, Plus, Trash2 } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { loadPersonalCourses } from '@/lib/learner-content';
import { createYoutubeSession, deleteYoutubeSession, loadYoutubeSessions, youtubeIdFrom } from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600';

/** The learner's YouTube learning sessions: create one from a link, reopen or delete earlier ones. */
export function YoutubeSessions() {
  const router = useRouter();
  const sessions = useApiQuery(() => loadYoutubeSessions(), []);
  const courses = useApiQuery(() => loadPersonalCourses(), []);
  const [form, setForm] = useState({ url: '', title: '', goal: '', level: '', personalCourseId: '' });
  const videoId = youtubeIdFrom(form.url);

  const create = useAsyncAction(async () => {
    const s = await createYoutubeSession({
      url: form.url.trim(),
      ...(form.title.trim() ? { title: form.title.trim() } : {}),
      ...(form.goal.trim() ? { goal: form.goal.trim() } : {}),
      ...(form.level.trim() ? { level: form.level.trim() } : {}),
      ...(form.personalCourseId ? { personalCourseId: form.personalCourseId } : {}),
    });
    router.push(`/ai/youtube/${encodeURIComponent(s.id)}`);
    return s;
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    if (!window.confirm('Delete this session and its questions and answers?')) return;
    await deleteYoutubeSession(id);
    sessions.retry();
  });

  if (sessions.error?.kind === 'not_implemented') {
    return <FeatureUnavailable title="YouTube learning isn't available yet" description="Sessions can't be saved on this server yet." />;
  }

  return (
    <div className="space-y-6">
      <form
        className={`${card} p-5 sm:p-6 space-y-3`}
        aria-label="New YouTube session"
        onSubmit={(e) => {
          e.preventDefault();
          if (videoId) void create.run();
        }}
      >
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Learn from a YouTube video</h2>
        <p className="text-xs text-gray-500">Watch the video here, ask the AI about it and turn it into notes, flashcards, quizzes or a mock exam. The AI only uses the video&apos;s transcript.</p>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">YouTube link</span>
          <input className={input} value={form.url} inputMode="url" onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=…" />
        </label>
        {form.url.trim() && !videoId && <p className="text-xs text-red-600">That doesn&apos;t look like a YouTube video link.</p>}
        {videoId && (
          // eslint-disable-next-line @next/next/no-img-element -- YouTube's public thumbnail, a preview only
          <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="Video thumbnail" className="w-48 max-w-full rounded-xl" />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Session name (optional)</span>
            <input className={input} value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your goal (optional)</span>
            <input className={input} value={form.goal} maxLength={300} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Understand the Calvin cycle" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Class or level (optional)</span>
            <input className={input} value={form.level} maxLength={100} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          </label>
          {(courses.data ?? []).length > 0 && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Add to one of your courses</span>
              <select className={input} value={form.personalCourseId} onChange={(e) => setForm({ ...form, personalCourseId: e.target.value })}>
                <option value="">No course</option>
                {(courses.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {create.error && <ErrorState error={create.error} compact />}
        <Button type="submit" size="sm" variant="purple" isLoading={create.isPending} disabled={!videoId}>
          <Plus className="w-4 h-4" aria-hidden="true" /> Create session
        </Button>
      </form>

      {remove.error && <ErrorState error={remove.error} compact />}
      {sessions.isLoading ? (
        <LoadingState layout="cards" rows={2} label="Loading your sessions…" />
      ) : sessions.error && !sessions.data ? (
        <ErrorState error={sessions.error} onRetry={sessions.retry} />
      ) : !(sessions.data ?? []).length ? (
        <EmptyState icon={PlaySquare} title="No YouTube sessions yet" description="Paste a link above to start one. Your sessions, questions and generated material are saved." />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Your YouTube sessions">
          {(sessions.data ?? []).map((s) => (
            <li key={s.id} className={`${card} overflow-hidden flex flex-col`}>
              <Link href={`/ai/youtube/${encodeURIComponent(s.id)}`} className="block">
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's public thumbnail */}
                <img src={s.thumbnailUrl ?? `https://i.ytimg.com/vi/${s.videoId}/mqdefault.jpg`} alt="" className="w-full aspect-video object-cover" />
              </Link>
              <div className="p-4 space-y-1 flex-1 flex flex-col">
                <Link href={`/ai/youtube/${encodeURIComponent(s.id)}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-purple-600 break-words">{s.title}</Link>
                <p className="text-[11px] text-gray-500">{s.transcriptStatus === 'ready' ? 'Transcript ready' : 'No transcript yet'}{s.goal ? ` · ${s.goal}` : ''}</p>
                <div className="mt-auto pt-2 flex justify-end">
                  <button type="button" onClick={() => void remove.run(s.id)} disabled={remove.isPending} aria-label={`Delete ${s.title}`} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Alert variant="info">Transcripts come from YouTube&apos;s captions when a video has them. If a video has none, you can paste the transcript or your notes instead.</Alert>
    </div>
  );
}
