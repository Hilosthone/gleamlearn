'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, ExternalLink, RotateCcw, Send, User } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { GeneratedFrom } from '@/components/learning/GeneratedFrom';
import {
  answerParts,
  askVideo,
  embedUrl,
  formatClock,
  loadSessionMessages,
  loadYoutubeSession,
  refetchTranscript,
  setTranscript,
  type SessionMessage,
} from '@/lib/self-learning';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600';

/** One saved YouTube session: the video, its transcript, grounded Q&A with timestamps, and generated material. */
export function YoutubeWorkspace({ id }: { id: string }) {
  const session = useApiQuery(() => loadYoutubeSession(id), [id]);
  const messages = useApiQuery(() => loadSessionMessages(id), [id]);
  const [start, setStart] = useState<number | undefined>(undefined);
  const [seekKey, setSeekKey] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState('');
  const [pasted, setPasted] = useState('');
  const [local, setLocal] = useState<SessionMessage[]>([]);

  const seek = (seconds: number) => {
    setStart(seconds);
    setSeekKey((k) => k + 1); // reloads the embed at that time
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const ask = useAsyncAction(async (_signal: AbortSignal, q: string) => {
    const pair = await askVideo(id, q);
    setLocal((prev) => [...prev, ...pair]);
    setQuestion('');
    return pair;
  });
  const savePaste = useAsyncAction(async () => {
    await setTranscript(id, pasted);
    setPasted('');
    session.retry();
  });
  const refetch = useAsyncAction(async () => {
    await refetchTranscript(id);
    session.retry();
  });

  const back = (
    <Link href="/ai?tab=youtube" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> YouTube sessions
    </Link>
  );
  if (session.isLoading) return <div className="space-y-4">{back}<LoadingState layout="detail" label="Loading session…" /></div>;
  if (session.error && !session.data) return <div className="space-y-4">{back}<ErrorState error={session.error} onRetry={session.retry} /></div>;
  const s = session.data!;
  const thread = [...(messages.data ?? []), ...local.filter((m) => !(messages.data ?? []).some((x) => x.id === m.id))];
  const ready = s.transcriptStatus === 'ready';

  return (
    <div className="space-y-6 pb-12">
      {back}
      <div>
        <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white break-words">{s.title}</h1>
        <p className="text-xs text-gray-500">
          {[s.channelTitle, s.goal && `Goal: ${s.goal}`, s.level].filter(Boolean).join(' · ')}{' '}
          {s.personalCourseId && (
            <Link href={`/my-courses/${encodeURIComponent(s.personalCourseId)}`} className="text-purple-600 hover:underline">· Open its course</Link>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 items-start">
        {/* Video and transcript */}
        <div className="space-y-4 min-w-0">
          <div ref={playerRef} className={`${card} overflow-hidden`}>
            {s.embeddable === false ? (
              <div className="p-6 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">The owner of this video doesn&apos;t allow it to be played on other websites.</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:underline">
                  Watch on YouTube <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <div className="aspect-video w-full bg-black">
                <iframe
                  key={seekKey}
                  src={embedUrl(s.videoId, start)}
                  title={s.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            )}
          </div>

          <section className={`${card} p-4 sm:p-5 space-y-3`} aria-label="Transcript">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Transcript</h2>
              {ready && <span className="text-[11px] text-gray-500">{s.transcriptSource === 'learner' ? 'Pasted by you' : "From the video's captions"}</span>}
            </div>
            {ready ? (
              s.segments.length ? (
                <ol className="max-h-80 overflow-y-auto space-y-1 pr-1">
                  {s.segments.map((seg, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <button type="button" onClick={() => seek(seg.start)} className="shrink-0 font-mono text-purple-600 hover:underline" aria-label={`Play from ${formatClock(seg.start)}`}>
                        {formatClock(seg.start)}
                      </button>
                      <span className="text-gray-700 dark:text-gray-300 break-words">{seg.text}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-80 overflow-y-auto break-words">{s.transcriptText}</p>
              )
            ) : (
              <div className="space-y-3">
                <Alert variant="warning" title="No transcript yet">
                  {s.transcriptError ?? 'This video has no transcript we could use.'} The AI only answers from a transcript, so it won&apos;t guess what the video says.
                </Alert>
                <Button type="button" size="sm" variant="outline" isLoading={refetch.isPending} onClick={() => void refetch.run()}>
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Try YouTube&apos;s captions again
                </Button>
                {refetch.error && <ErrorState error={refetch.error} compact />}
                <form className="space-y-2" aria-label="Paste a transcript" onSubmit={(e) => { e.preventDefault(); void savePaste.run(); }}>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Or paste the transcript or your notes (lines starting with [mm:ss] become timestamps)</span>
                    <textarea className={`${input} min-h-32`} value={pasted} maxLength={200000} onChange={(e) => setPasted(e.target.value)} />
                  </label>
                  {savePaste.error && <ErrorState error={savePaste.error} compact />}
                  <Button type="submit" size="sm" variant="purple" isLoading={savePaste.isPending} disabled={pasted.trim().length < 20}>Save transcript</Button>
                </form>
              </div>
            )}
          </section>
        </div>

        {/* Ask the AI about the video */}
        <div className="space-y-4 min-w-0">
          <section className={`${card} p-4 sm:p-5 space-y-3`} aria-label="Questions about the video">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Ask about the video</h2>
            {messages.isLoading ? (
              <LoadingState rows={2} label="Loading your questions…" />
            ) : thread.length === 0 ? (
              <p className="text-xs text-gray-500">{ready ? 'Ask anything about the video. Answers come only from its transcript, with timestamps you can play.' : 'Add a transcript first; then ask questions here.'}</p>
            ) : (
              <ol className="space-y-3 max-h-[28rem] overflow-y-auto pr-1" aria-label="Questions and answers">
                {thread.map((m) => (
                  <li key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${m.role === 'user' ? 'bg-[var(--color-brand-blue)]' : 'bg-purple-600'}`} aria-hidden="true">
                      {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </span>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line break-words ${m.role === 'user' ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200'}`}>
                      <span className="sr-only">{m.role === 'user' ? 'You' : 'AI'}: </span>
                      {m.role === 'user'
                        ? m.content
                        : answerParts(m.content, m.citations).map((p, i) =>
                            'text' in p ? (
                              <React.Fragment key={i}>{p.text}</React.Fragment>
                            ) : (
                              <button key={i} type="button" onClick={() => seek(p.seconds)} className="font-mono font-semibold text-purple-600 underline mx-0.5" aria-label={`Play from ${p.label}`}>
                                {p.label}
                              </button>
                            ),
                          )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {ask.isSlow && <SlowNotice message="The AI is still reading the transcript. No need to resend." />}
            {ask.error && <ErrorState error={ask.error} compact />}
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (question.trim() && ready) void ask.run(question.trim());
              }}
            >
              <label className="flex-1">
                <span className="sr-only">Your question</span>
                <textarea rows={2} className={`${input} resize-none`} value={question} disabled={!ready} maxLength={2000} onChange={(e) => setQuestion(e.target.value)} placeholder={ready ? 'e.g. What happens in the Calvin cycle?' : 'Add a transcript first'} />
              </label>
              <Button type="submit" size="sm" variant="purple" isLoading={ask.isPending} disabled={!ready || !question.trim()}>
                <Send className="w-4 h-4" aria-hidden="true" /> Ask
              </Button>
            </form>
          </section>

          {ready && (
            <section className={`${card} p-4 sm:p-5`}>
              <GenerateForm heading="Make study material from this video" source={{ sourceType: 'youtube', sourceId: id }} personalCourseId={s.personalCourseId ?? undefined} defaultKind="summary" />
            </section>
          )}
        </div>
      </div>
      <GeneratedFrom filter={{ youtubeSessionId: id }} title="Made from this video" />
    </div>
  );
}
