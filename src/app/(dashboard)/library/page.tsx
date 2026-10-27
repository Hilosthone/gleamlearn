'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, FileText, FolderPlus, Layers, PlaySquare, Plus, Sparkles, ClipboardCheck, RotateCcw, Trash2, Upload, ArrowLeft, Pencil } from 'lucide-react';
import { MaterialsPanel } from '@/components/library/MaterialsPanel';
import { PersonalCourseList } from '@/components/library/PersonalCourses';
import { GeneratedResources, MyAssessmentsLibrary } from '@/components/library/LibraryResources';
import { YoutubeSessions } from '@/components/ai/YoutubeSessions';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useUrlParam } from '@/hooks/useUrlParam';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  REVIEW_GRADES,
  addCard,
  createDeck,
  createNote,
  deleteCard,
  deleteDeck,
  deleteNote,
  loadDeck,
  loadDecks,
  loadDueCards,
  loadNotes,
  loadSavedCourses,
  parseTags,
  removeCourseFromLibrary,
  reviewCard,
  updateNote,
  type Note,
} from '@/lib/library';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';
const fmtDate = (iso: string) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');

type Tab = 'courses' | 'mine' | 'lessons' | 'assessments' | 'notes' | 'flashcards' | 'uploads' | 'youtube';
const TABS: { id: Tab; label: string; icon: typeof Bookmark }[] = [
  { id: 'courses', label: 'Saved courses', icon: Bookmark },
  { id: 'mine', label: 'My courses', icon: FolderPlus },
  { id: 'lessons', label: 'Lessons & study material', icon: Sparkles },
  { id: 'assessments', label: 'Quizzes & exams', icon: ClipboardCheck },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'uploads', label: 'Uploaded materials', icon: Upload },
  { id: 'youtube', label: 'YouTube sessions', icon: PlaySquare },
];

/** The learner's own library: saved courses, notes and flashcard decks (previously invented items and counts). */
export default function LibraryPage() {
  // ?tab=youtube etc. (links from search and other pages) opens that section until the learner picks another
  const wanted = useUrlParam('tab');
  const [picked, setTab] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (TABS.some((t) => t.id === wanted) ? (wanted as Tab) : 'courses');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Everything you study with: courses, lessons and notes you made, quizzes and exams, flashcards, files and videos.</p>
      </div>

      <div role="tablist" aria-label="Library sections" className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              tab === t.id
                ? 'bg-[var(--color-brand-blue)] text-white shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'courses' && <SavedCourses />}
        {tab === 'notes' && <Notes />}
        {tab === 'flashcards' && <Flashcards />}
        {tab === 'mine' && <PersonalCourseList />}
        {tab === 'uploads' && <MaterialsPanel />}
        {tab === 'lessons' && <GeneratedResources />}
        {tab === 'assessments' && <MyAssessmentsLibrary />}
        {tab === 'youtube' && <YoutubeSessions />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

function SavedCourses() {
  const list = useApiQuery(() => loadSavedCourses(), []);
  const remove = useAsyncAction(async (_signal: AbortSignal, courseId: string) => {
    await removeCourseFromLibrary(courseId);
    list.retry();
  });

  if (list.isLoading) return <LoadingState label="Loading saved courses…" />;
  if (list.error && !list.data) return <ErrorState error={list.error} onRetry={list.retry} />;
  const items = list.data ?? [];
  if (items.length === 0)
    return (
      <EmptyState
        icon={Bookmark}
        title="No saved courses yet"
        description="Open a course and choose “Save to library” to keep it here."
        action={<Link href="/learn" className="text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">Browse courses</Link>}
      />
    );

  return (
    <div className="space-y-3">
      {remove.error && <ErrorState error={remove.error} compact />}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((c) => (
          <li key={c.courseId} className={`${card} p-5 flex flex-col gap-2`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {c.available ? (
                  <Link href={`/learn/${encodeURIComponent(c.courseId)}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-[var(--color-brand-blue)]">
                    {c.title}
                  </Link>
                ) : (
                  <p className="text-sm font-bold text-gray-500">{c.title}</p>
                )}
                {c.savedAt && <p className="text-[11px] text-gray-500 mt-0.5">Saved {fmtDate(c.savedAt)}</p>}
              </div>
              <button
                type="button"
                onClick={() => void remove.run(c.courseId)}
                disabled={remove.isPending}
                aria-label={`Remove ${c.title} from library`}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {c.description && <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{c.description}</p>}
          </li>
        ))}
      </ul>
      {list.error && <Alert variant="warning">Showing the last loaded list; the latest could not be loaded.</Alert>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

interface NoteDraft {
  id: string | null; // null: new note
  title: string;
  content: string;
  tags: string;
}
const emptyDraft: NoteDraft = { id: null, title: '', content: '', tags: '' };

function Notes() {
  const list = useApiQuery(() => loadNotes(), []);
  const [draft, setDraft] = useState<NoteDraft | null>(null);

  const save = useAsyncAction(async (_signal: AbortSignal, d: NoteDraft) => {
    const body = { title: d.title.trim(), content: d.content.trim(), tags: parseTags(d.tags) };
    const res = d.id ? await updateNote(d.id, body) : await createNote(body);
    setDraft(null);
    list.retry();
    return res;
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await deleteNote(id);
    list.retry();
  });

  const edit = (n: Note) => {
    save.reset();
    setDraft({ id: n.id, title: n.title, content: n.content, tags: n.tags.join(', ') });
  };
  const canSave = Boolean(draft && draft.title.trim() && draft.content.trim());

  return (
    <div className="space-y-4">
      {!draft && (
        <Button type="button" size="sm" onClick={() => { save.reset(); setDraft(emptyDraft); }}>
          <Plus className="w-4 h-4" aria-hidden="true" /> New note
        </Button>
      )}

      {draft && (
        <form
          className={`${card} p-5 space-y-3`}
          aria-label={draft.id ? 'Edit note' : 'New note'}
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) void save.run(draft);
          }}
        >
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Title</span>
            <input className={input} value={draft.title} maxLength={255} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Note</span>
            <textarea className={`${input} min-h-32`} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tags (comma-separated, optional)</span>
            <input className={input} value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
          </label>
          {save.isSlow && <SlowNotice />}
          {save.error && <ErrorState error={save.error} compact />}
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={save.isPending} disabled={!canSave}>
              {draft.id ? 'Save changes' : 'Save note'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setDraft(null)} disabled={save.isPending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {remove.error && <ErrorState error={remove.error} compact />}
      {list.isLoading ? (
        <LoadingState label="Loading notes…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} />
      ) : (list.data ?? []).length === 0 ? (
        !draft && <EmptyState icon={FileText} title="No notes yet" description="Notes you write are saved to your account." />
      ) : (
        <ul className="space-y-3">
          {(list.data ?? []).map((n) => (
            <li key={n.id} className={`${card} p-5 space-y-2`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{n.title}</h3>
                  {n.updatedAt && <p className="text-[11px] text-gray-500">Updated {fmtDate(n.updatedAt)}</p>}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => edit(n)} aria-label={`Edit ${n.title}`} className="p-2 rounded-xl text-gray-400 hover:text-[var(--color-brand-blue)] hover:bg-blue-50 dark:hover:bg-blue-950/30">
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove.run(n.id)}
                    disabled={remove.isPending}
                    aria-label={`Delete ${n.title}`}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">{n.content}</p>
              {n.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {n.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {list.error && list.data && <Alert variant="warning">Showing the last loaded notes; the latest could not be loaded.</Alert>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

function Flashcards() {
  const [openDeck, setOpenDeck] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  if (reviewing) return <Review onDone={() => setReviewing(false)} />;
  if (openDeck) return <DeckDetail id={openDeck} onBack={() => setOpenDeck(null)} />;
  return <DeckList onOpen={setOpenDeck} onReview={() => setReviewing(true)} />;
}

function DeckList({ onOpen, onReview }: { onOpen: (id: string) => void; onReview: () => void }) {
  const decks = useApiQuery(() => loadDecks(), []);
  const due = useApiQuery(() => loadDueCards(), []);
  const [form, setForm] = useState<{ title: string; description: string } | null>(null);

  const create = useAsyncAction(async (_signal: AbortSignal, f: { title: string; description: string }) => {
    const res = await createDeck({ title: f.title.trim(), description: f.description.trim(), category: '' });
    setForm(null);
    decks.retry();
    return res;
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await deleteDeck(id);
    decks.retry();
    due.retry();
  });

  const dueCount = due.data?.length;

  return (
    <div className="space-y-4">
      <div className={`${card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Review today</h2>
          <p className="text-xs text-gray-500" aria-live="polite">
            {due.isLoading ? 'Checking due cards…' : due.error ? 'Due cards could not be loaded.' : dueCount ? `${dueCount} card${dueCount === 1 ? '' : 's'} due` : 'No cards are due.'}
          </p>
        </div>
        {due.error ? (
          <Button type="button" size="sm" variant="outline" onClick={due.retry}>Try again</Button>
        ) : (
          <Button type="button" size="sm" onClick={onReview} disabled={!dueCount}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" /> Start review
          </Button>
        )}
      </div>

      {!form ? (
        <Button type="button" size="sm" variant="outline" onClick={() => { create.reset(); setForm({ title: '', description: '' }); }}>
          <Plus className="w-4 h-4" aria-hidden="true" /> New deck
        </Button>
      ) : (
        <form
          className={`${card} p-5 space-y-3`}
          aria-label="New deck"
          onSubmit={(e) => {
            e.preventDefault();
            if (form.title.trim()) void create.run(form);
          }}
        >
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deck title</span>
            <input className={input} value={form.title} maxLength={255} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description (optional)</span>
            <input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          {create.error && <ErrorState error={create.error} compact />}
          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={create.isPending} disabled={!form.title.trim()}>Create deck</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setForm(null)} disabled={create.isPending}>Cancel</Button>
          </div>
        </form>
      )}

      {remove.error && <ErrorState error={remove.error} compact />}
      {decks.isLoading ? (
        <LoadingState label="Loading decks…" />
      ) : decks.error && !decks.data ? (
        <ErrorState error={decks.error} onRetry={decks.retry} />
      ) : (decks.data ?? []).length === 0 ? (
        <EmptyState icon={Layers} title="No flashcard decks yet" description="Create a deck, add cards, then review them here." />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(decks.data ?? []).map((d) => (
            <li key={d.id} className={`${card} p-5 flex items-start justify-between gap-3`}>
              <button type="button" onClick={() => onOpen(d.id)} className="text-left min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900 dark:text-white hover:text-[var(--color-brand-blue)]">{d.title}</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{d.cards.length} card{d.cards.length === 1 ? '' : 's'}</span>
                {d.description && <span className="block text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{d.description}</span>}
              </button>
              <button
                type="button"
                onClick={() => void remove.run(d.id)}
                disabled={remove.isPending}
                aria-label={`Delete deck ${d.title}`}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeckDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const deck = useApiQuery(() => loadDeck(id), [id]);
  const [q, setQ] = useState('');
  const [a, setA] = useState('');

  const add = useAsyncAction(async () => {
    const res = await addCard(id, q.trim(), a.trim());
    setQ('');
    setA('');
    deck.retry();
    return res;
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, cardId: string) => {
    await deleteCard(cardId);
    deck.retry();
  });

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> All decks
      </button>
      {deck.isLoading ? (
        <LoadingState layout="detail" label="Loading deck…" />
      ) : deck.error && !deck.data ? (
        <ErrorState error={deck.error} onRetry={deck.retry} />
      ) : deck.data ? (
        <>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{deck.data.title}</h2>
            {deck.data.description && <p className="text-xs text-gray-500">{deck.data.description}</p>}
          </div>
          <form
            className={`${card} p-5 space-y-3`}
            aria-label="Add card"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim() && a.trim()) void add.run();
            }}
          >
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Question</span>
              <textarea className={input} value={q} onChange={(e) => setQ(e.target.value)} required />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Answer</span>
              <textarea className={input} value={a} onChange={(e) => setA(e.target.value)} required />
            </label>
            {add.error && <ErrorState error={add.error} compact />}
            <Button type="submit" size="sm" isLoading={add.isPending} disabled={!q.trim() || !a.trim()}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Add card
            </Button>
          </form>
          {remove.error && <ErrorState error={remove.error} compact />}
          {deck.data.cards.length === 0 ? (
            <EmptyState icon={Layers} title="This deck has no cards" description="Add a question and answer above." />
          ) : (
            <ul className="space-y-2">
              {deck.data.cards.map((c) => (
                <li key={c.id} className={`${card} p-4 flex items-start justify-between gap-3`}>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-pre-line">{c.question}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line">{c.answer}</p>
                    {c.nextReviewDate && <p className="text-[10px] text-gray-400">Next review {fmtDate(c.nextReviewDate)}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove.run(c.id)}
                    disabled={remove.isPending}
                    aria-label={`Delete card ${c.question}`}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}

/** Cards due today, one at a time: reveal the answer, then grade it. The server schedules the next review (SM-2). */
function Review({ onDone }: { onDone: () => void }) {
  // Loaded once: graded cards move out of today's queue on the server, so the session works through this snapshot
  const due = useApiQuery(() => loadDueCards(), []);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);

  const grade = useAsyncAction(async (_signal: AbortSignal, cardId: string, quality: number) => {
    const res = await reviewCard(cardId, quality);
    setShown(false);
    setIndex((i) => i + 1);
    return res;
  });

  const back = (
    <button type="button" onClick={onDone} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" /> All decks
    </button>
  );
  if (due.isLoading) return <div className="space-y-4">{back}<LoadingState layout="detail" label="Loading due cards…" /></div>;
  if (due.error && !due.data) return <div className="space-y-4">{back}<ErrorState error={due.error} onRetry={due.retry} /></div>;

  const cards = due.data ?? [];
  const current = cards[index];
  if (!current)
    return (
      <div className="space-y-4">
        {back}
        <EmptyState icon={RotateCcw} title={cards.length ? 'Review complete' : 'No cards are due'} description={cards.length ? `You reviewed ${cards.length} card${cards.length === 1 ? '' : 's'}.` : 'Come back when cards are due.'} />
      </div>
    );

  return (
    <div className="space-y-4">
      {back}
      <p className="text-xs text-gray-500">
        Card {index + 1} of {cards.length}
        {current.deckTitle && ` · ${current.deckTitle}`}
      </p>
      <div className={`${card} p-6 space-y-4`} aria-live="polite">
        <p className="text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line">{current.question}</p>
        {shown ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line border-t border-gray-100 dark:border-gray-800 pt-4">{current.answer}</p>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => setShown(true)}>Show answer</Button>
        )}
      </div>
      {shown && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="How well did you remember?">
          {REVIEW_GRADES.map((g) => (
            <Button key={g.label} type="button" size="sm" variant={g.quality >= 4 ? 'primary' : 'outline'} disabled={grade.isPending} onClick={() => void grade.run(current.id, g.quality)}>
              {g.label}
            </Button>
          ))}
        </div>
      )}
      {grade.error && <ErrorState error={grade.error} compact />}
    </div>
  );
}
