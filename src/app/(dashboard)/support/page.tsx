'use client';

import React, { useMemo, useState } from 'react';
import { HelpCircle, LifeBuoy, Mail, MessageSquare, Search, Star } from 'lucide-react';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { HELP_ARTICLES, PROBLEM_CATEGORIES, REPORT_STATUS_LABEL, SUPPORT_EMAIL, loadMyReports, mailtoHref, reportsAvailable, submitFeedback, submitProblem } from '@/lib/support';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';

type Tab = 'help' | 'report' | 'feedback';
const TABS: { id: Tab; label: string; icon: typeof HelpCircle }[] = [
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'report', label: 'Report a problem', icon: LifeBuoy },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

/** Help articles that describe the app as it is, and real problem reports / feedback (previously "received" without sending anything). */
export default function SupportPage() {
  const [tab, setTab] = useState<Tab>('help');
  const available = useApiQuery(() => reportsAvailable(), []);

  return (
    <div className="w-full min-h-screen pb-16 space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Answers to common questions, or contact us at <a className="font-semibold text-[var(--color-brand-blue)] hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </div>
      <div role="tablist" aria-label="Support sections" className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
        {tab === 'help' && <Help />}
        {tab !== 'help' &&
          (available.isLoading ? (
            <LoadingState layout="detail" label="Checking support options…" />
          ) : available.error ? (
            <ErrorState error={available.error} onRetry={available.retry} />
          ) : tab === 'report' ? (
            <ReportTab online={available.data === true} />
          ) : (
            <Feedback online={available.data === true} />
          ))}
      </div>
    </div>
  );
}

function Help() {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? HELP_ARTICLES.filter((a) => `${a.topic} ${a.title} ${a.body}`.toLowerCase().includes(s)) : HELP_ARTICLES;
  }, [q]);
  return (
    <div className="space-y-4">
      <label className="relative block max-w-md">
        <span className="sr-only">Search help</span>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input className={`${input} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search help…" />
      </label>
      {shown.length === 0 ? (
        <p className="text-sm text-gray-500">No articles match. Email us at {SUPPORT_EMAIL}.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shown.map((a) => (
            <li key={a.id} className={`${card} p-5 space-y-1`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-blue)]">{a.topic}</p>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">{a.title}</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OfflineNote() {
  return (
    <Alert variant="info">
      Sending from the app isn&apos;t available yet. “Email us” opens your email app with your message filled in, addressed to {SUPPORT_EMAIL}.
    </Alert>
  );
}

function ReportTab({ online }: { online: boolean }) {
  const [sent, setSent] = useState(0);
  return (
    <div className="space-y-6">
      <Report online={online} onSent={() => setSent((n) => n + 1)} />
      {online && <MyReports version={sent} />}
    </div>
  );
}

/** GET /reports/me: what the learner reported and what moderators decided. */
function MyReports({ version }: { version: number }) {
  const reports = useApiQuery(() => loadMyReports(), [version]);
  return (
    <section className={`${card} p-6 space-y-3 max-w-2xl`} aria-label="Your reports">
      <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">Your reports</h2>
      {reports.isLoading ? (
        <LoadingState layout="list" rows={2} />
      ) : reports.error ? (
        <ErrorState error={reports.error} onRetry={reports.retry} compact />
      ) : !reports.data?.length ? (
        <p className="text-xs text-gray-500">You haven&apos;t reported anything.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {reports.data.map((r) => (
            <li key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{r.reason}</p>
                {r.details && <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 break-words">{r.details}</p>}
                {r.createdAt && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>}
              </div>
              <span
                className={`shrink-0 self-start px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  r.status === 'RESOLVED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : r.status === 'REJECTED'
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                }`}
              >
                {REPORT_STATUS_LABEL[r.status] ?? r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Report({ online, onSent }: { online: boolean; onSent: () => void }) {
  const [category, setCategory] = useState<string>(PROBLEM_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const send = useAsyncAction(async () => {
    const res = await submitProblem(category, description);
    setDescription('');
    onSent();
    return res;
  });
  const ready = description.trim().length >= 10;

  return (
    <form className={`${card} p-6 space-y-4 max-w-2xl`} aria-label="Report a problem" onSubmit={(e) => { e.preventDefault(); if (ready && online) void send.run(); }}>
      {!online && <OfflineNote />}
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What is it about?</span>
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {PROBLEM_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">What happened? (at least 10 characters)</span>
        <textarea className={`${input} min-h-32`} value={description} maxLength={4000} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {send.error && <ErrorState error={send.error} compact />}
      {send.status === 'success' && <Alert variant="success">Your report was sent. Thank you.</Alert>}
      {online ? (
        <Button type="submit" size="sm" isLoading={send.isPending} disabled={!ready}>Send report</Button>
      ) : (
        <a
          aria-disabled={!ready}
          href={ready ? mailtoHref(`Problem report: ${category}`, description.trim()) : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${ready ? 'bg-[var(--color-brand-blue)] text-white hover:opacity-90' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 pointer-events-none'}`}
        >
          <Mail className="w-4 h-4" aria-hidden="true" /> Email us
        </a>
      )}
    </form>
  );
}

function Feedback({ online }: { online: boolean }) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const send = useAsyncAction(async () => {
    const res = await submitFeedback(rating, message);
    setMessage('');
    setRating(0);
    return res;
  });
  const ready = rating >= 1 && message.trim() !== '';

  return (
    <form className={`${card} p-6 space-y-4 max-w-2xl`} aria-label="Feedback" onSubmit={(e) => { e.preventDefault(); if (ready && online) void send.run(); }}>
      {!online && <OfflineNote />}
      <fieldset className="space-y-1">
        <legend className="text-xs font-semibold text-gray-700 dark:text-gray-300">How would you rate GleamLearn?</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`} aria-pressed={rating === n} className="p-1">
              <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Your feedback or idea</span>
        <textarea className={`${input} min-h-28`} value={message} maxLength={4000} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {send.error && <ErrorState error={send.error} compact />}
      {send.status === 'success' && <Alert variant="success">Thanks — your feedback was sent.</Alert>}
      {online ? (
        <Button type="submit" size="sm" isLoading={send.isPending} disabled={!ready}>Send feedback</Button>
      ) : (
        <a
          aria-disabled={!ready}
          href={ready ? mailtoHref(`Feedback (${rating}/5)`, message.trim()) : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${ready ? 'bg-[var(--color-brand-blue)] text-white hover:opacity-90' : 'bg-gray-200 dark:bg-gray-800 text-gray-500 pointer-events-none'}`}
        >
          <Mail className="w-4 h-4" aria-hidden="true" /> Email us
        </a>
      )}
    </form>
  );
}
