// src/app/admin/(console)/academic/page.tsx
'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminAcademicApi, type AdminFaculty, type AdminInstitution, type InstitutionType } from '@/lib/admin-api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ADMIN_LOGIN_PATH } from '@/components/admin/AdminSessionProvider';
import { RequirePermission } from '@/components/admin/RequirePermission';

const card = 'bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';
const input =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]';
const TYPES: InstitutionType[] = ['University', 'Institute', 'Secondary'];
const iconBtn = 'p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50';

/**
 * The school directory (GET /admin/institutions; writes on /institutions, /faculties, /departments). Learners see
 * these names as suggestions when they edit their school details, and the school, university and department
 * leaderboards match on them. Requires content.manage.
 */
export default function AdminAcademicPage() {
  return (
    <RequirePermission permission="content.manage">
      <Directory />
    </RequirePermission>
  );
}

/** One-line name editor used for faculties and departments. */
function NameForm({ label, initial, busy, onSave, onCancel }: { label: string; initial: string; busy: boolean; onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial);
  return (
    <form className="flex flex-wrap items-center gap-2" aria-label={label} onSubmit={(e) => { e.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
      <input className={`${input} flex-1 min-w-40`} value={name} maxLength={200} autoFocus aria-label={label} onChange={(e) => setName(e.target.value)} />
      <Button type="submit" size="sm" isLoading={busy} disabled={!name.trim()}>Save</Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
    </form>
  );
}

type Editing = { kind: 'institution' | 'faculty' | 'department' | 'new-faculty' | 'new-department'; id: string } | null;

function Directory() {
  const list = useApiQuery((signal) => adminAcademicApi.list({ signal }), []);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Editing>(null);
  const [form, setForm] = useState<{ name: string; type: InstitutionType; state: string; country: string } | null>(null);

  const act = useAsyncAction(async (_signal: AbortSignal, run: () => Promise<unknown>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    await run();
    setEditing(null);
    setForm(null);
    list.retry();
  });
  const institutions = [...(list.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  const saveInstitution = (i: AdminInstitution | null) => {
    if (!form || !form.name.trim()) return;
    const body = { name: form.name.trim(), type: form.type, ...(form.state.trim() ? { state: form.state.trim() } : {}), ...(form.country.trim() ? { country: form.country.trim() } : {}) };
    void act.run(() => (i ? adminAcademicApi.updateInstitution(i.id, body) : adminAcademicApi.createInstitution(body)));
  };
  const institutionForm = (i: AdminInstitution | null) =>
    form && (
      <form className={`${card} p-5 space-y-3`} aria-label={i ? `Edit ${i.name}` : 'New institution'} onSubmit={(e) => { e.preventDefault(); saveInstitution(i); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Name</span>
            <input className={input} value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Type</span>
            <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InstitutionType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t === 'Secondary' ? 'Secondary school' : t}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">State (optional)</span>
            <input className={input} value={form.state} maxLength={100} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Country (optional)</span>
            <input className={input} value={form.country} maxLength={100} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" isLoading={act.isPending} disabled={!form.name.trim()}>Save</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => { setForm(null); setEditing(null); }} disabled={act.isPending}>Cancel</Button>
        </div>
      </form>
    );

  const facultyRow = (i: AdminInstitution, f: AdminFaculty) => (
    <li key={f.id} className="space-y-1.5">
      {editing?.kind === 'faculty' && editing.id === f.id ? (
        <NameForm label={`Rename faculty ${f.name}`} initial={f.name} busy={act.isPending} onCancel={() => setEditing(null)} onSave={(name) => void act.run(() => adminAcademicApi.updateFaculty(f.id, { name, institutionId: i.id }))} />
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{f.name}</p>
          <div className="flex shrink-0">
            <button type="button" className={iconBtn} aria-label={`Rename faculty ${f.name}`} onClick={() => setEditing({ kind: 'faculty', id: f.id })}><Pencil className="w-3.5 h-3.5" aria-hidden="true" /></button>
            <button type="button" className={`${iconBtn} hover:text-red-600`} disabled={act.isPending || f.departments.length > 0} title={f.departments.length ? 'Remove its departments first' : undefined} aria-label={`Delete faculty ${f.name}`} onClick={() => void act.run(() => adminAcademicApi.deleteFaculty(f.id), `Delete ${f.name}?`)}><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      )}
      <ul className="pl-4 border-l border-gray-100 dark:border-gray-800 space-y-1">
        {[...f.departments].sort((a, b) => a.name.localeCompare(b.name)).map((d) => (
          <li key={d.id}>
            {editing?.kind === 'department' && editing.id === d.id ? (
              <NameForm label={`Rename department ${d.name}`} initial={d.name} busy={act.isPending} onCancel={() => setEditing(null)} onSave={(name) => void act.run(() => adminAcademicApi.updateDepartment(d.id, { name, facultyId: f.id }))} />
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-700 dark:text-gray-300">{d.name}</p>
                <div className="flex shrink-0">
                  <button type="button" className={iconBtn} aria-label={`Rename department ${d.name}`} onClick={() => setEditing({ kind: 'department', id: d.id })}><Pencil className="w-3.5 h-3.5" aria-hidden="true" /></button>
                  <button type="button" className={`${iconBtn} hover:text-red-600`} disabled={act.isPending} aria-label={`Delete department ${d.name}`} onClick={() => void act.run(() => adminAcademicApi.deleteDepartment(d.id), `Delete ${d.name}?`)}><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                </div>
              </div>
            )}
          </li>
        ))}
        <li>
          {editing?.kind === 'new-department' && editing.id === f.id ? (
            <NameForm label={`New department in ${f.name}`} initial="" busy={act.isPending} onCancel={() => setEditing(null)} onSave={(name) => void act.run(() => adminAcademicApi.createDepartment({ name, facultyId: f.id }))} />
          ) : (
            <button type="button" onClick={() => setEditing({ kind: 'new-department', id: f.id })} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-brand-blue)] hover:underline">
              <Plus className="w-3 h-3" aria-hidden="true" /> Add department
            </button>
          )}
        </li>
      </ul>
    </li>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">School directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schools, universities, faculties and departments.</p>
        </div>
        {!form && (
          <Button type="button" size="sm" onClick={() => { act.reset(); setEditing(null); setForm({ name: '', type: 'University', state: '', country: 'Nigeria' }); }}>
            <Plus className="w-4 h-4" aria-hidden="true" /> New institution
          </Button>
        )}
      </div>
      <Alert variant="info">
        Learners see these names as suggestions when they edit their school details, and the school, university and department leaderboards match on the name a learner
        saves. Renaming here does not change names learners have already saved. To protect what is linked, an institution or faculty can only be deleted once it is empty, and a department only once no course uses it.
      </Alert>
      {act.error && <ErrorState error={act.error} compact signInHref={ADMIN_LOGIN_PATH} />}
      {form && !editing && institutionForm(null)}
      {list.isLoading ? (
        <LoadingState label="Loading the directory…" />
      ) : list.error && !list.data ? (
        <ErrorState error={list.error} onRetry={list.retry} signInHref={ADMIN_LOGIN_PATH} />
      ) : institutions.length === 0 ? (
        <EmptyState icon={Building2} title="The directory is empty" description="Add the schools and universities your learners attend." />
      ) : (
        <ul className="space-y-3" aria-label="Institutions">
          {institutions.map((i) =>
            form && editing?.kind === 'institution' && editing.id === i.id ? (
              <li key={i.id}>{institutionForm(i)}</li>
            ) : (
              <li key={i.id} className={`${card} p-5 space-y-3`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" className="flex items-start gap-2 text-left min-w-0" aria-expanded={!!open[i.id]} onClick={() => setOpen({ ...open, [i.id]: !open[i.id] })}>
                    {open[i.id] ? <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-extrabold text-gray-900 dark:text-white break-words">{i.name}</span>
                      <span className="block text-[11px] text-gray-500">
                        {[i.type === 'Secondary' ? 'Secondary school' : i.type, i.state, i.country].filter(Boolean).join(' · ')} · {i.faculties.length} facult{i.faculties.length === 1 ? 'y' : 'ies'}
                      </span>
                    </span>
                  </button>
                  <div className="flex shrink-0">
                    <button type="button" className={iconBtn} aria-label={`Edit ${i.name}`} onClick={() => { act.reset(); setEditing({ kind: 'institution', id: i.id }); setForm({ name: i.name, type: (TYPES as string[]).includes(i.type) ? (i.type as InstitutionType) : 'University', state: i.state ?? '', country: i.country ?? '' }); }}><Pencil className="w-4 h-4" aria-hidden="true" /></button>
                    <button type="button" className={`${iconBtn} hover:text-red-600`} disabled={act.isPending || i.faculties.length > 0} title={i.faculties.length ? 'Remove its faculties first' : undefined} aria-label={`Delete ${i.name}`} onClick={() => void act.run(() => adminAcademicApi.deleteInstitution(i.id), `Delete ${i.name}?`)}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                  </div>
                </div>
                {open[i.id] && (
                  <ul className="pl-6 space-y-3">
                    {[...i.faculties].sort((a, b) => a.name.localeCompare(b.name)).map((f) => facultyRow(i, f))}
                    <li>
                      {editing?.kind === 'new-faculty' && editing.id === i.id ? (
                        <NameForm label={`New faculty in ${i.name}`} initial="" busy={act.isPending} onCancel={() => setEditing(null)} onSave={(name) => void act.run(() => adminAcademicApi.createFaculty({ name, institutionId: i.id }))} />
                      ) : (
                        <button type="button" onClick={() => setEditing({ kind: 'new-faculty', id: i.id })} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-brand-blue)] hover:underline">
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add faculty
                        </button>
                      )}
                    </li>
                  </ul>
                )}
              </li>
            ),
          )}
        </ul>
      )}
      <AcademicLevels />
    </div>
  );
}

/** GET /academic-levels — the levels and streams learners choose from (defined by the platform; not editable). */
function AcademicLevels() {
  const q = useApiQuery((signal) => adminAcademicApi.levels({ signal }), []);
  if (q.isLoading) return <LoadingState layout="list" rows={1} label="Loading academic levels…" />;
  if (q.error) return <ErrorState error={q.error} onRetry={q.retry} signInHref={ADMIN_LOGIN_PATH} />;
  const d = q.data!;
  return (
    <section className={`${card} p-5 space-y-3`} aria-label="Academic levels">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">Academic levels</h2>
      <p className="text-[11px] text-gray-500">The standard levels learners pick in their profile. They are defined by the platform, so they are shown here for reference.</p>
      {([['Secondary', d.secondaryLevels], ['University', d.universityLevels], ['Secondary streams', d.secondaryStreams]] as const).map(([label, list]) => (
        <p key={label} className="text-xs text-gray-700 dark:text-gray-300"><strong>{label}:</strong> {list.join(', ') || '—'}</p>
      ))}
    </section>
  );
}
