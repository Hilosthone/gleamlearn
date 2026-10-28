'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Box, FileText, FolderOpen, Loader2, PlaySquare, Type, Upload } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { GenerateForm, type GenerateSource } from '@/components/learning/GenerateForm';
import { MATERIAL_ACCEPT, checkMaterialFile, loadMaterials, loadPersonalCourses, uploadMaterial } from '@/lib/learner-content';
import { addTextMaterial, waitForMaterial, type LearningKind, type MaterialState } from '@/lib/self-learning';

const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

type Mode = 'upload' | 'paste' | 'material' | 'course' | 'youtube' | 'topic';
const MODES: { id: Mode; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Upload a file', icon: Upload },
  { id: 'paste', label: 'Paste text', icon: Type },
  { id: 'material', label: 'My materials', icon: FileText },
  { id: 'course', label: 'My course', icon: FolderOpen },
  { id: 'youtube', label: 'YouTube video', icon: PlaySquare },
  { id: 'topic', label: 'A topic (visual lesson)', icon: Box },
];

interface Props {
  /** Limit what can be generated (e.g. only quizzes on Practice). */
  kinds?: LearningKind[];
  defaultKind?: LearningKind;
  initialMode?: Mode;
  heading?: string;
}

/**
 * Start learning from the learner's own material: upload (PDF, Word, text), paste, an earlier material, one of
 * their courses, or a YouTube video — then choose what to generate. Works without any GleamLearn-published content.
 */
export function StartLearning({ kinds, defaultKind, initialMode = 'upload', heading = 'Start learning from your own material' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [courseId, setCourseId] = useState('');
  const [source, setSource] = useState<(GenerateSource & { label: string }) | null>(null);
  const courses = useApiQuery(() => loadPersonalCourses(), []);

  const pick = (m: Mode) => {
    setMode(m);
    setSource(null);
  };

  return (
    <section className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs p-5 sm:p-6 space-y-5" aria-label={heading}>
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white">{heading}</h2>
        <p className="text-xs text-gray-500 mt-1">GleamLearn turns what you give it into lessons, notes, flashcards, quizzes and mock exams, saved to your account.</p>
      </div>

      <div role="tablist" aria-label="Where your material comes from" className="flex gap-1.5 overflow-x-auto pb-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => pick(m.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 min-h-10 ${
              mode === m.id ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <m.icon className="w-3.5 h-3.5" aria-hidden="true" /> {m.label}
          </button>
        ))}
      </div>

      {mode !== 'youtube' && mode !== 'course' && (courses.data ?? []).length > 0 && (
        <label className="block space-y-1 max-w-sm">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Add to one of your courses (optional)</span>
          <select className={input} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">No course</option>
            {(courses.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
      )}

      <div role="tabpanel">
        {mode === 'upload' && <UploadStep courseId={courseId || undefined} onReady={(m) => setSource({ sourceType: 'material', sourceId: m.id, label: m.name })} />}
        {mode === 'paste' && <PasteStep courseId={courseId || undefined} onReady={(m) => setSource({ sourceType: 'material', sourceId: m.id, label: m.name })} />}
        {mode === 'material' && <MaterialStep onPick={(id, name) => setSource(id ? { sourceType: 'material', sourceId: id, label: name } : null)} />}
        {mode === 'course' && (
          <CourseStep
            courses={courses.data ?? []}
            loading={courses.isLoading}
            onPick={(id, title) => {
              setCourseId(id);
              setSource(id ? { sourceType: 'course', sourceId: id, label: title } : null);
            }}
          />
        )}
        {mode === 'topic' && <TopicStep onReady={(topic) => setSource(topic ? { sourceType: 'topic', text: topic, label: topic } : null)} />}
        {mode === 'youtube' && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Learn from a video in the AI workspace: watch it, ask questions about it and generate study material from its transcript.{' '}
            <Link href="/ai?tab=youtube" className="font-semibold text-[var(--color-brand-blue)] underline">Open YouTube learning</Link>
          </p>
        )}
      </div>

      {source && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <GenerateForm
            key={`${source.sourceType}:${source.sourceId ?? source.text}`}
            heading={`From “${source.label}”`}
            source={source}
            personalCourseId={courseId || undefined}
            // a topic on its own can only make a visual lesson (the backend refuses other kinds)
            kinds={source.sourceType === 'topic' ? ['visual_lesson'] : kinds}
            defaultKind={source.sourceType === 'topic' ? 'visual_lesson' : defaultKind}
          />
        </div>
      )}
    </section>
  );
}

function UploadStep({ courseId, onReady }: { courseId?: string; onReady: (m: MaterialState) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'reading' | 'ready' | 'failed'>('idle');
  const [failure, setFailure] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const go = useAsyncAction(async (_signal: AbortSignal, f: File) => {
    controller.current = new AbortController();
    setStage('uploading');
    setProgress(0);
    const created = (await uploadMaterial(f, courseId, { onProgress: setProgress, signal: controller.current.signal })) as { id?: string };
    if (!created?.id) throw new Error('The upload could not be confirmed.');
    setStage('reading');
    const m = await waitForMaterial(created.id, { signal: controller.current.signal });
    if (m.status === 'READY') {
      setStage('ready');
      onReady(m);
    } else {
      setStage('failed');
      setFailure(m.status === 'PROCESSING' ? 'This is taking long. Open it later from Library → Uploaded materials.' : (m.processingError ?? 'The text could not be read.'));
    }
    return m;
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">PDF, Word (.docx) or text, up to 15 MB. Scanned PDFs (pictures of pages) cannot be read yet.</p>
      <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm font-semibold cursor-pointer hover:border-[var(--color-brand-blue)] focus-within:ring-2 focus-within:ring-[var(--color-brand-blue)] w-full sm:w-auto justify-center">
        <Upload className="w-4 h-4" aria-hidden="true" /> {file ? file.name : 'Choose a file'}
        <input
          ref={inputRef}
          type="file"
          accept={MATERIAL_ACCEPT}
          className="sr-only"
          disabled={go.isPending}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            const p = f ? checkMaterialFile(f) : null;
            setProblem(p);
            setFile(p ? null : f);
            setStage('idle');
            go.reset();
          }}
        />
      </label>
      {problem && <Alert variant="error">{problem}</Alert>}
      {stage === 'uploading' && (
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden max-w-sm" role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="h-full bg-[var(--color-brand-blue)]" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      {stage === 'reading' && (
        <p role="status" className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Reading the text from your file…
        </p>
      )}
      {stage === 'ready' && <Alert variant="success">Your file is ready. Choose what to learn below.</Alert>}
      {stage === 'failed' && failure && <Alert variant="error" title="The text could not be read">{failure}</Alert>}
      {go.error && go.error.kind !== 'aborted' && <ErrorState error={go.error} compact />}
      {file && stage !== 'ready' && (
        <div className="flex gap-2">
          <Button type="button" size="sm" isLoading={go.isPending} onClick={() => void go.run(file)}>
            Upload and read
          </Button>
          {go.isPending && (
            <Button type="button" size="sm" variant="outline" onClick={() => controller.current?.abort()}>
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function PasteStep({ courseId, onReady }: { courseId?: string; onReady: (m: MaterialState) => void }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const save = useAsyncAction(async () => {
    const m = await addTextMaterial(title.trim() || 'Pasted text', text, courseId);
    onReady(m);
    return m;
  });
  return (
    <form className="space-y-3" aria-label="Paste text" onSubmit={(e) => { e.preventDefault(); void save.run(); }}>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
        <input className={input} value={title} maxLength={255} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis notes" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your text, notes or course outline</span>
        <textarea className={`${input} min-h-40`} value={text} maxLength={200000} onChange={(e) => setText(e.target.value)} />
      </label>
      {save.error && <ErrorState error={save.error} compact />}
      {save.status === 'success' ? (
        <Alert variant="success">Saved. Choose what to learn below.</Alert>
      ) : (
        <Button type="submit" size="sm" isLoading={save.isPending} disabled={text.trim().length < 20}>
          Use this text
        </Button>
      )}
    </form>
  );
}

function MaterialStep({ onPick }: { onPick: (id: string, name: string) => void }) {
  const mats = useApiQuery(() => loadMaterials(), []);
  const ready = (mats.data ?? []).filter((m) => m.status === 'READY');
  if (mats.isLoading) return <p className="text-xs text-gray-500">Loading your materials…</p>;
  if (mats.error && !mats.data) return <ErrorState error={mats.error} onRetry={mats.retry} compact />;
  if (!ready.length) return <p className="text-sm text-gray-600 dark:text-gray-300">You have no ready materials yet. Upload a file or paste text first.</p>;
  return (
    <label className="block space-y-1 max-w-md">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Choose a material</span>
      <select className={input} defaultValue="" onChange={(e) => onPick(e.target.value, ready.find((m) => m.id === e.target.value)?.name ?? '')}>
        <option value="">Choose…</option>
        {ready.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </label>
  );
}

function CourseStep({ courses, loading, onPick }: { courses: { id: string; title: string }[]; loading: boolean; onPick: (id: string, title: string) => void }) {
  if (loading) return <p className="text-xs text-gray-500">Loading your courses…</p>;
  if (!courses.length)
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        You have no courses yet. <Link href="/my-courses" className="font-semibold text-[var(--color-brand-blue)] underline">Create a course</Link> with its outline or topics, then learn from it here.
      </p>
    );
  return (
    <label className="block space-y-1 max-w-md">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Choose a course (its outline, modules, notes and materials are used)</span>
      <select className={input} defaultValue="" onChange={(e) => onPick(e.target.value, courses.find((c) => c.id === e.target.value)?.title ?? '')}>
        <option value="">Choose…</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
    </label>
  );
}

/** A topic to be taught as an interactive visual lesson, from general knowledge (labelled as such on the lesson). */
function TopicStep({ onReady }: { onReady: (topic: string | null) => void }) {
  const [topic, setTopic] = useState('');
  const ok = topic.trim().length >= 3;
  return (
    <form
      className="space-y-2 max-w-xl"
      aria-label="Learn a topic"
      onSubmit={(e) => {
        e.preventDefault();
        onReady(ok ? topic.trim() : null);
      }}
    >
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What do you want to understand?</span>
        <input className={input} value={topic} maxLength={300} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. The structure of a water molecule, projectile motion, the Krebs cycle" />
      </label>
      <p className="text-[11px] text-gray-500">The AI explains it step by step with 3D models, diagrams and graphs, from general knowledge. For lessons from your own notes, upload or paste them instead.</p>
      <Button type="submit" size="sm" disabled={!ok}>Use this topic</Button>
    </form>
  );
}
