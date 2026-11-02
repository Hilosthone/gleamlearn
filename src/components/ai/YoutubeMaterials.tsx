'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ClipboardList, FileText, GraduationCap, Layers, ListChecks, Sparkles, type LucideIcon } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { GenerateForm } from '@/components/learning/GenerateForm';
import { hrefFor, kindInfo, loadLearnerAssessments, loadResources, resourceHref } from '@/lib/self-learning';
import { showToast } from '@/lib/toast';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

interface Item {
  id: string;
  title: string;
  detail: string;
  href: string;
}

/** Material groups on a video's page, in this order; an empty group is not shown. */
export const MATERIAL_GROUPS: { id: string; title: string; icon: LucideIcon; kinds: string[] }[] = [
  { id: 'lessons', title: 'Lessons and explanations', icon: BookOpen, kinds: ['lesson', 'visual_lesson', 'explanation'] },
  { id: 'notes', title: 'Summaries, notes and key concepts', icon: FileText, kinds: ['summary', 'notes', 'key_concepts'] },
  { id: 'flashcards', title: 'Flashcards', icon: Layers, kinds: ['flashcards'] },
  { id: 'assessments', title: 'Quizzes and mock exams', icon: ClipboardList, kinds: ['quiz', 'exam'] },
  { id: 'plans', title: 'Study and course plans', icon: ListChecks, kinds: ['study_plan', 'course_plan'] },
];

function Section({ title, icon: Icon, count, open, onToggle, children }: { title: string; icon: LucideIcon; count?: number; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const panelId = useId();
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-900/60">
          <Icon className="w-4 h-4 text-purple-600 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white">{title}</span>
          {count !== undefined && <span className="text-[11px] font-semibold text-gray-500 tabular-nums">{count}</span>}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Everything made from one YouTube session, grouped in expandable sections, with the form to make more. New
 * material appears in its section straight away (the learner stays on the video).
 */
export function YoutubeMaterials({ sessionId, personalCourseId, ready }: { sessionId: string; personalCourseId: string | null; ready: boolean }) {
  const data = useApiQuery(async () => {
    const [resources, assessments] = await Promise.all([loadResources({ youtubeSessionId: sessionId }), loadLearnerAssessments(undefined, personalCourseId ?? undefined)]);
    const byKind = new Map<string, Item[]>();
    const add = (kind: string, item: Item) => byKind.set(kind, [...(byKind.get(kind) ?? []), item]);
    for (const r of resources) {
      add(r.kind, { id: r.id, title: r.title, detail: `${r.kind === 'course_plan' ? 'Course plan' : (kindInfo(r.kind)?.label ?? r.kind)}${r.completed ? ' · done' : ''}`, href: resourceHref(r) });
    }
    for (const a of assessments.filter((x) => x.youtubeSessionId === sessionId)) {
      add(a.kind, { id: a.id, title: a.title, detail: `${a.kind === 'exam' ? 'Mock exam' : 'Quiz'} · ${a.questionCount} questions${a.bestScore !== null ? ` · best ${a.bestScore}%` : ''}`, href: `/practice/${encodeURIComponent(a.id)}` });
    }
    return MATERIAL_GROUPS.map((g) => ({ ...g, items: g.kinds.flatMap((k) => byKind.get(k) ?? []) })).filter((g) => g.items.length);
  }, [sessionId, personalCourseId]);

  const groups = data.data ?? [];
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (id: string) => open[id] ?? (id === 'make' ? groups.length === 0 : groups[0]?.id === id);
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !isOpen(id) }));

  return (
    <section className={`${card} p-4 sm:p-5 space-y-3`} aria-label="Study material from this video">
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Study material from this video</h2>
      {ready ? (
        <Section title="Make study material" icon={Sparkles} open={isOpen('make')} onToggle={() => toggle('make')}>
          <GenerateForm
            source={{ sourceType: 'youtube', sourceId: sessionId }}
            personalCourseId={personalCourseId ?? undefined}
            defaultKind="summary"
            onDone={(r) => {
              showToast({ tone: 'success', title: r.reused ? 'Already made' : 'Ready', message: r.title, href: hrefFor(r), actionLabel: 'Open it' });
              data.retry();
            }}
          />
        </Section>
      ) : (
        <p className="text-xs text-gray-500">Add a transcript first (fetch it, upload a caption file or paste it); then you can make lessons, notes, flashcards, quizzes and mock exams from it.</p>
      )}

      {data.isLoading ? (
        <LoadingState rows={2} label="Loading what you made…" />
      ) : data.error && !data.data ? (
        data.error.kind === 'not_implemented' ? null : <ErrorState error={data.error} onRetry={data.retry} compact />
      ) : (
        groups.map((g) => (
          <Section key={g.id} title={g.title} icon={g.id === 'assessments' ? GraduationCap : g.icon} count={g.items.length} open={isOpen(g.id)} onToggle={() => toggle(g.id)}>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {g.items.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} className="block p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[var(--color-brand-blue)]">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{i.title}</span>
                    <span className="block text-[11px] text-gray-500">{i.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}
    </section>
  );
}
