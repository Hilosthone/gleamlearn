'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { errorMessage } from '@/lib/api-error';
import { toApiError } from '@/lib/async-state';
import { SEARCH_TYPE_LABEL, searchEverything, type SearchHit } from '@/lib/self-learning';

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: SearchHit[]; unavailable: string[] }
  | { status: 'error'; message: string };

/**
 * Search everything the learner can open: GleamLearn courses plus their own courses, files, lessons, quizzes, notes,
 * flashcards and YouTube sessions. Opens with the button, "/" or Ctrl/Cmd+K; arrow keys move, Enter opens.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  // keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => inputRef.current?.focus());
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
        returnFocus.current?.focus?.();
      };
    }
  }, [open]);

  // debounced search; an older request is cancelled when the text changes
  useEffect(() => {
    const term = q.trim();
    if (!open || term.length < MIN_CHARS) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      setState({ status: 'loading' });
      searchEverything(term, ctrl.signal)
        .then((r) => {
          setState({ status: 'done', results: r.results, unavailable: r.unavailableTypes });
          setActive(0);
        })
        .catch((err) => {
          if (ctrl.signal.aborted) return;
          const e = toApiError(err);
          setState({ status: 'error', message: e.kind === 'not_implemented' ? 'Search is not available on this server yet.' : errorMessage(e) });
        });
    }, DEBOUNCE_MS);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [q, open]);

  // too little text shows the hint, whatever an earlier search returned
  const view = useMemo<State>(() => (q.trim().length < MIN_CHARS ? { status: 'idle' } : state), [q, state]);
  const results = useMemo(() => (view.status === 'done' ? view.results : []), [view]);
  const groups = useMemo(() => {
    const out: { type: string; items: { hit: SearchHit; index: number }[] }[] = [];
    results.forEach((hit, index) => {
      let g = out.find((x) => x.type === hit.type);
      if (!g) out.push((g = { type: hit.type, items: [] }));
      g.items.push({ hit, index });
    });
    return out;
  }, [results]);
  // the visual order (grouped) decides what arrow keys move through
  const ordered = useMemo(() => groups.flatMap((g) => g.items.map((i) => i.hit)), [groups]);

  const close = () => {
    setOpen(false);
    setQ('');
  };
  const go = (hit: SearchHit | undefined) => {
    if (!hit) return;
    close();
    router.push(hit.href);
  };
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (ordered.length ? (a + 1) % ordered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (ordered.length ? (a - 1 + ordered.length) % ordered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(ordered[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-keyshortcuts="Control+K Meta+K /"
        className="flex items-center gap-2 p-2 md:pl-3 md:pr-2 md:py-1.5 rounded-xl text-gray-600 dark:text-gray-300 md:bg-gray-50 md:dark:bg-gray-900 md:border md:border-gray-200 md:dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
      >
        <Search className="w-5 h-5 md:w-4 md:h-4" aria-hidden="true" />
        <span className="hidden md:inline text-xs text-gray-500">Search</span>
        <kbd className="hidden lg:inline text-[10px] font-semibold text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:p-4 sm:pt-[10vh] bg-black/40 backdrop-blur-xs" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label="Search" className="w-full h-full sm:h-auto sm:max-w-xl bg-white dark:bg-[#111827] sm:rounded-3xl sm:border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col sm:max-h-[75vh]">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                role="combobox"
                aria-expanded={ordered.length > 0}
                aria-controls={listId}
                aria-activedescendant={ordered.length ? optionId(active) : undefined}
                aria-autocomplete="list"
                aria-label="Search courses, lessons, quizzes, notes and more"
                className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none py-1"
                placeholder="Search courses, lessons, quizzes, notes…"
                value={q}
                maxLength={100}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
              />
              {view.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-purple-600 shrink-0" aria-hidden="true" />}
              <button type="button" onClick={close} aria-label="Close search" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2" aria-live="polite">
              {view.status === 'idle' && <p className="p-4 text-xs text-gray-500">Type at least {MIN_CHARS} characters. Only your own items and published GleamLearn courses are searched.</p>}
              {view.status === 'loading' && results.length === 0 && <p className="p-4 text-xs text-gray-500">Searching…</p>}
              {view.status === 'error' && <p className="p-4 text-xs text-red-600" role="alert">{view.message}</p>}
              {view.status === 'done' && results.length === 0 && <p className="p-4 text-xs text-gray-500">Nothing found for “{q.trim()}”.</p>}
              {ordered.length > 0 && (
                <ul id={listId} role="listbox" aria-label="Search results" className="space-y-3">
                  {groups.map((g) => (
                    <li key={g.type} role="presentation">
                      <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400" aria-hidden="true">{SEARCH_TYPE_LABEL[g.type] ?? g.type}</p>
                      <ul role="group" aria-label={SEARCH_TYPE_LABEL[g.type] ?? g.type}>
                        {g.items.map(({ hit }) => {
                          const i = ordered.indexOf(hit);
                          return (
                            <li
                              key={`${hit.type}-${hit.id}`}
                              id={optionId(i)}
                              role="option"
                              aria-selected={i === active}
                              onMouseEnter={() => setActive(i)}
                              onClick={() => go(hit)}
                              className={`px-3 py-2 rounded-xl cursor-pointer ${i === active ? 'bg-purple-50 dark:bg-purple-950/40' : ''}`}
                            >
                              <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">{hit.title}</p>
                              {hit.subtitle && <p className="text-[11px] text-gray-500 break-words">{hit.subtitle}</p>}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
              {view.status === 'done' && view.unavailable.length > 0 && (
                <p className="px-3 pt-2 text-[11px] text-gray-400">Some sections couldn&apos;t be searched on this server: {view.unavailable.map((t) => SEARCH_TYPE_LABEL[t] ?? t).join(', ')}.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
