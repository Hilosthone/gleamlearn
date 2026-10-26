'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, GraduationCap, MessageSquare, Plus, Send, Sparkles, Trash2, User, Wand2, Square } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState, SlowNotice } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import {
  TOOLS,
  createTutorSession,
  deleteConversation,
  endTutorSession,
  loadConversation,
  loadConversations,
  loadTutorSession,
  loadTutorSessions,
  runTool,
  sendChat,
  sendTutorMessage,
  type ChatMessage,
  type ToolId,
  type ToolResult,
} from '@/lib/ai';
import { relativeTime } from '@/lib/notifications';
import { loadCompanion } from '@/lib/profile';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600';

type Tab = 'chat' | 'tutor' | 'tools' | 'companion';
const TABS: { id: Tab; label: string; icon: typeof Bot }[] = [
  { id: 'chat', label: 'Assistant', icon: MessageSquare },
  { id: 'tutor', label: 'Tutor sessions', icon: GraduationCap },
  { id: 'tools', label: 'Study tools', icon: Wand2 },
  { id: 'companion', label: 'Companion', icon: Bot },
];

/** The AI hub: real assistant conversations, tutor sessions and study tools through the backend (previously scripted demo screens). */
export default function AiHub() {
  const [tab, setTab] = useState<Tab>('chat');
  const companion = useApiQuery(() => loadCompanion(), []);
  const name = companion.data?.name || 'GleamLearn AI';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-[#111827] p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" aria-hidden="true" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 border-2 border-purple-400 flex items-center justify-center shadow-lg shrink-0">
            <Bot className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{name}</h1>
            <p className="text-xs text-purple-200 mt-1">Ask questions, study with a tutor, or use a study tool. Answers appear in full once they are ready.</p>
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="AI sections" className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              tab === t.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'chat' && <Assistant />}
        {tab === 'tutor' && <Tutor />}
        {tab === 'tools' && <Tools />}
        {tab === 'companion' && <CompanionPanel companion={companion} />}
      </div>
    </div>
  );
}

// Shared message thread -------------------------------------------------------------------------------------

function Thread({ messages, pending, aiName }: { messages: ChatMessage[]; pending: string | null; aiName: string }) {
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'nearest' }); // block body: an effect's return value is treated as its cleanup
  }, [messages.length, pending]);
  return (
    <ol className="space-y-4" aria-label="Messages">
      {messages.map((m) => (
        <Bubble key={m.id} from={m.from} text={m.text} label={m.from === 'learner' ? 'You' : aiName} />
      ))}
      {pending !== null && (
        <>
          <Bubble from="learner" text={pending} label="You" />
          <li role="status" className="text-xs text-gray-500 pl-11">{aiName} is answering…</li>
        </>
      )}
      <li ref={end} aria-hidden="true" />
    </ol>
  );
}

function Bubble({ from, text, label }: { from: 'learner' | 'ai'; text: string; label: string }) {
  const mine = from === 'learner';
  return (
    <li className={`flex items-start gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${mine ? 'bg-[var(--color-brand-blue)]' : 'bg-purple-600'} text-white`} aria-hidden="true">
        {mine ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-line ${mine ? 'bg-[var(--color-brand-blue)] text-white rounded-tr-sm' : `${card} rounded-tl-sm text-gray-800 dark:text-gray-200`}`}>
        <span className="sr-only">{label}: </span>
        {text}
      </div>
    </li>
  );
}

function Composer({ onSend, busy, disabled, placeholder }: { onSend: (text: string) => Promise<boolean>; busy: boolean; disabled?: boolean; placeholder: string }) {
  const [text, setText] = useState('');
  const submit = async () => {
    const t = text.trim();
    if (!t || busy) return;
    if (await onSend(t)) setText(''); // keep the draft when sending failed
  };
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="flex-1">
        <span className="sr-only">Message</span>
        <textarea
          rows={2}
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder={placeholder}
          className={`${input} resize-none`}
        />
      </label>
      <Button type="submit" size="sm" variant="purple" isLoading={busy} disabled={disabled || !text.trim()}>
        <Send className="w-4 h-4" aria-hidden="true" /> Send
      </Button>
    </form>
  );
}

function SideList({
  title,
  items,
  active,
  onPick,
  onNew,
  newLabel,
  query,
}: {
  title: string;
  items: { id: string; title: string; at: string; status: string | null }[];
  active: string | null;
  onPick: (id: string) => void;
  onNew: () => void;
  newLabel: string;
  query: { isLoading: boolean; error: import('@/lib/api-error').ApiError | null; retry: () => void; data: unknown };
}) {
  return (
    <aside className={`${card} p-4 space-y-3 self-start`} aria-label={title}>
      <Button type="button" size="sm" variant="outline" className="w-full" onClick={onNew}>
        <Plus className="w-4 h-4" aria-hidden="true" /> {newLabel}
      </Button>
      {query.isLoading ? (
        <LoadingState rows={3} label={`Loading ${title.toLowerCase()}…`} />
      ) : query.error && !query.data ? (
        <ErrorState error={query.error} onRetry={query.retry} compact />
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500 px-1">Nothing here yet.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                onClick={() => onPick(i.id)}
                aria-current={active === i.id}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs ${active === i.id ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300' : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
              >
                <span className="block font-semibold truncate">{i.title}</span>
                <span className="block text-[10px] text-gray-400">
                  {relativeTime(i.at)}
                  {i.status === 'ended' && ' · ended'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

// Assistant ---------------------------------------------------------------------------------------------------

function Assistant() {
  const list = useApiQuery(() => loadConversations(), []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const thread = useApiQuery(() => loadConversation(activeId as string), [activeId], { enabled: activeId !== null });
  const [local, setLocal] = useState<ChatMessage[]>([]); // a new conversation's first exchange, before it has an id
  const [pending, setPending] = useState<string | null>(null);

  const send = useAsyncAction(async (_signal: AbortSignal, text: string) => {
    setPending(text);
    try {
      const res = await sendChat(text, activeId);
      if (!activeId && res.conversationId) {
        setLocal(res.messages);
        setActiveId(res.conversationId); // loads the stored conversation
      } else {
        thread.retry();
      }
      list.retry();
      return true;
    } finally {
      setPending(null);
    }
  });
  const remove = useAsyncAction(async (_signal: AbortSignal, id: string) => {
    await deleteConversation(id);
    setActiveId(null);
    list.retry();
  });

  // the hook keeps the previous conversation while the next one loads: only show data for the selected one
  const loaded = thread.data && thread.data.id === activeId ? thread.data : undefined;
  const messages = loaded?.messages ?? local;
  const title = activeId ? (loaded?.title ?? 'Conversation') : 'New conversation';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4">
      <SideList
        title="Conversations"
        items={list.data ?? []}
        active={activeId}
        onPick={(id) => {
          setLocal([]);
          send.reset();
          setActiveId(id);
        }}
        onNew={() => {
          setLocal([]);
          send.reset();
          setActiveId(null);
        }}
        newLabel="New chat"
        query={list}
      />
      <section className={`${card} p-5 space-y-4 min-h-[24rem] flex flex-col`} aria-label={title}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{title}</h2>
          {activeId && (
            <button
              type="button"
              onClick={() => void remove.run(activeId)}
              disabled={remove.isPending}
              aria-label="Delete conversation"
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {remove.error && <ErrorState error={remove.error} compact />}
        <div className="flex-1">
          {activeId && !loaded && !thread.error && local.length === 0 ? (
            <LoadingState rows={2} label="Loading conversation…" />
          ) : activeId && thread.error && !loaded && local.length === 0 ? (
            <ErrorState error={thread.error} onRetry={thread.retry} />
          ) : messages.length === 0 && pending === null ? (
            <EmptyState icon={Sparkles} title="Ask anything about your studies" description="Your conversations are saved to your account. Each message is answered on its own, so include the details the AI needs." />
          ) : (
            <Thread messages={messages} pending={pending} aiName="AI" />
          )}
        </div>
        {send.isSlow && <SlowNotice message="The AI is taking longer than usual. Your message is still being answered — no need to resend it." />}
        {send.error && <ErrorState error={send.error} compact />}
        <Composer onSend={async (t) => Boolean(await send.run(t))} busy={send.isPending} placeholder="Ask a question…" />
      </section>
    </div>
  );
}

// Tutor -------------------------------------------------------------------------------------------------------

function Tutor() {
  const list = useApiQuery(() => loadTutorSessions(), []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  const create = useAsyncAction(async () => {
    const id = await createTutorSession(title.trim());
    setTitle('');
    setCreating(false);
    setActiveId(id);
    list.retry();
    return id;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4">
      <SideList
        title="Tutor sessions"
        items={list.data ?? []}
        active={activeId}
        onPick={(id) => {
          setCreating(false);
          setActiveId(id);
        }}
        onNew={() => {
          create.reset();
          setCreating(true);
          setActiveId(null);
        }}
        newLabel="New session"
        query={list}
      />
      {activeId ? (
        <TutorSession key={activeId} id={activeId} onChanged={list.retry} />
      ) : creating ? (
        <form
          className={`${card} p-5 space-y-3 self-start`}
          aria-label="New tutor session"
          onSubmit={(e) => {
            e.preventDefault();
            void create.run();
          }}
        >
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What do you want to study? (optional)</span>
            <input className={input} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Quadratic equations" />
          </label>
          {create.error && <ErrorState error={create.error} compact />}
          <Button type="submit" size="sm" variant="purple" isLoading={create.isPending}>Start session</Button>
        </form>
      ) : (
        <EmptyState icon={GraduationCap} title="Study with the AI tutor" description="Start a session or open a past one. Sessions and their messages are saved to your account." />
      )}
    </div>
  );
}

function TutorSession({ id, onChanged }: { id: string; onChanged: () => void }) {
  const session = useApiQuery(() => loadTutorSession(id), [id]);
  const [pending, setPending] = useState<string | null>(null);

  const send = useAsyncAction(async (_signal: AbortSignal, text: string) => {
    setPending(text);
    try {
      await sendTutorMessage(id, text);
      session.retry();
      return true;
    } finally {
      setPending(null);
    }
  });
  const end = useAsyncAction(async () => {
    await endTutorSession(id);
    session.retry();
    onChanged();
  });

  if (session.isLoading) return <LoadingState layout="detail" label="Loading session…" />;
  if (session.error && !session.data) return <ErrorState error={session.error} onRetry={session.retry} />;
  const s = session.data;
  if (!s) return null;
  const ended = s.status === 'ended';

  return (
    <section className={`${card} p-5 space-y-4 min-h-[24rem] flex flex-col`} aria-label={s.title}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{s.title}</h2>
          <p className="text-[10px] text-gray-400">{ended ? 'Session ended' : 'Active session'}</p>
        </div>
        {!ended && (
          <Button type="button" size="sm" variant="outline" isLoading={end.isPending} onClick={() => void end.run()}>
            <Square className="w-3.5 h-3.5" aria-hidden="true" /> End session
          </Button>
        )}
      </div>
      {end.error && <ErrorState error={end.error} compact />}
      <div className="flex-1">
        {s.messages.length === 0 && pending === null ? (
          <p className="text-xs text-gray-500">Ask the tutor a question to begin.</p>
        ) : (
          <Thread messages={s.messages} pending={pending} aiName="Tutor" />
        )}
      </div>
      {send.isSlow && <SlowNotice message="The tutor is taking longer than usual. Your message is still being answered — no need to resend it." />}
      {send.error && <ErrorState error={send.error} compact />}
      {ended ? (
        <Alert variant="info">This session has ended. Start a new session to keep studying.</Alert>
      ) : (
        <Composer onSend={async (t) => Boolean(await send.run(t))} busy={send.isPending} placeholder="Ask the tutor…" />
      )}
    </section>
  );
}

// Study tools -------------------------------------------------------------------------------------------------

function Tools() {
  const [toolId, setToolId] = useState<ToolId>('explain');
  const [text, setText] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const tool = TOOLS.find((t) => t.id === toolId) ?? TOOLS[0];

  const run = useAsyncAction(() => runTool(toolId, { input: text.trim(), userAnswer: userAnswer.trim(), correctAnswer: correctAnswer.trim() }));
  const ready = text.trim() !== '' && (tool.kind === 'text' || userAnswer.trim() !== '');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Study tool">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={toolId === t.id}
            onClick={() => {
              setToolId(t.id);
              run.reset();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              toolId === t.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-purple-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form
        className={`${card} p-5 space-y-3`}
        aria-label={tool.label}
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) void run.run();
        }}
      >
        <p className="text-xs text-gray-500">{tool.description}</p>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tool.inputLabel}</span>
          <textarea className={`${input} ${toolId === 'summarize' ? 'min-h-40' : 'min-h-20'}`} value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        {tool.kind === 'answer' && (
          <>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your answer</span>
              <textarea className={`${input} min-h-20`} value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} required />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Expected answer (optional)</span>
              <textarea className={`${input} min-h-16`} value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
            </label>
          </>
        )}
        {run.isSlow && <SlowNotice message="The AI is taking longer than usual. Your request is still in progress — no need to resend it." />}
        {run.error && <ErrorState error={run.error} compact />}
        <Button type="submit" size="sm" variant="purple" isLoading={run.isPending} disabled={!ready}>
          <Sparkles className="w-4 h-4" aria-hidden="true" /> {tool.label}
        </Button>
      </form>

      {run.status === 'success' && run.result && <ToolOutput result={run.result} />}
      <p className="text-[11px] text-gray-500">Results are not saved. Copy anything you want to keep into a note in your library.</p>
    </div>
  );
}

function ToolOutput({ result }: { result: ToolResult }) {
  if (result.kind === 'code')
    return (
      <section className={`${card} p-5 space-y-2`} aria-label="Result">
        <h3 className="text-xs font-bold text-gray-900 dark:text-white">Diagram source (Mermaid)</h3>
        <p className="text-[11px] text-gray-500">Paste this into a Mermaid viewer to see the diagram; it is not drawn here.</p>
        <pre className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-xs overflow-x-auto whitespace-pre">{result.text}</pre>
      </section>
    );
  if (result.kind === 'evaluation') {
    const e = result.evaluation;
    return (
      <section className={`${card} p-5 space-y-3`} aria-label="Result">
        {e.score !== null && <p className="text-2xl font-black text-purple-600">{e.score}/100</p>}
        {e.feedback && <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{e.feedback}</p>}
        {e.strengths.length > 0 && <ResultList title="Strengths" items={e.strengths} />}
        {e.improvements.length > 0 && <ResultList title="To improve" items={e.improvements} />}
      </section>
    );
  }
  return (
    <section className={`${card} p-5`} aria-label="Result">
      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{result.text}</p>
    </section>
  );
}

const ResultList = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="text-xs font-bold text-gray-900 dark:text-white">{title}</h3>
    <ul className="list-disc pl-5 text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  </div>
);

// Companion ---------------------------------------------------------------------------------------------------

function CompanionPanel({ companion }: { companion: ReturnType<typeof useApiQuery<Awaited<ReturnType<typeof loadCompanion>>>> }) {
  if (companion.isLoading) return <LoadingState layout="detail" label="Loading your companion…" />;
  if (companion.error && !companion.data) return <ErrorState error={companion.error} onRetry={companion.retry} />;
  const c = companion.data;
  const rows = c ? ([['Name', c.name], ['Personality', c.personality], ['Teaching style', c.teachingStyle], ['Appearance', c.appearance], ['Voice', c.voice]] as const).filter(([, v]) => v) : [];
  return (
    <section className={`${card} p-6 space-y-4`} aria-label="AI companion">
      {rows.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">You have not set up an AI companion yet.</p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map(([k, v]) => (
            <div key={k} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k}</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <Alert variant="info">Your companion settings are saved to your account, but the AI does not use them in answers yet.</Alert>
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5 rotate-180" aria-hidden="true" /> Change companion in Settings
      </Link>
    </section>
  );
}
