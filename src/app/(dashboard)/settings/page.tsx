'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Settings as SettingsIcon,
  Edit3,
  Award,
  Flame,
  Zap,
  Coins,
  GraduationCap,
  BookOpen,
  Shield,
  Bell,
  Moon,
  Sun,
  Lock,
  Sparkles,
  CheckCircle2,
  Mail, Image as ImageIcon } from 'lucide-react';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { useOptionalLearnerSession } from '@/components/auth/LearnerSessionProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ErrorState, FeatureUnavailable, LoadingState } from '@/components/ui/states';
import { useApiQuery } from '@/hooks/useApiQuery';
import { MyAvatar } from '@/components/profile/Avatar';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { invalidateLearnerStats, sharedLearnerStats } from '@/lib/learning';
import { STUDY_TIMES } from '@/lib/registration/wizard';
import {
  COMPANION_KEYS,
  COMPANION_OPTIONS,
  NOTIFICATION_SETTING_KEYS,
  academicChanges,
  academicFormOf,
  basicChanges,
  basicFormOf,
  changedFields,
  loadAchievementCount,
  loadCompanion,
  loadNotificationSettings,
  loadProfile,
  saveAcademic,
  saveBasic,
  saveCompanion,
  saveNotificationSettings,
  saveStudyTime,
  validateBasic,
  type AcademicForm,
  type BasicForm,
  type Companion,
  type LearnerProfile,
  type NotificationSettings,
} from '@/lib/profile';

type SubView = 'profile' | 'edit' | 'settings';
type SettingsTab = 'picture' | 'appearance' | 'notifications' | 'learning' | 'ai' | 'privacy' | 'account';

const fieldClass =
  'w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';
const card = 'bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs';

/**
 * The learner's real profile and preferences. Previously every value on this page (name, photo, email, XP,
 * coins, streak, achievements, bio) was invented, and no button saved anything except "change password".
 */
export default function ProfileSettingsHub() {
  const [activeView, setActiveView] = useState<SubView>('profile');
  const session = useOptionalLearnerSession();
  const profile = useApiQuery(() => loadProfile(), []);

  const onSaved = async () => {
    profile.retry();
    // The Navbar shows the name from the session. A failed refresh (e.g. throttled) must not turn a saved
    // change into an error: the change is already stored, and the session refreshes on the next page load.
    await session?.refresh().catch(() => undefined);
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50">
            <User className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Profile & Preferences</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your academic profile, preferences and account security.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full sm:w-auto" role="tablist">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'edit', label: 'Edit Profile', icon: Edit3 },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveView(tab.id as SubView)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-xs' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeView === 'settings' ? (
        <SettingsHub profile={profile.data} onSaved={onSaved} />
      ) : profile.isLoading ? (
        <LoadingState layout="detail" label="Loading your profile…" />
      ) : profile.error && !profile.data ? (
        <ErrorState error={profile.error} onRetry={profile.retry} />
      ) : profile.data ? (
        activeView === 'profile' ? (
          <ProfileView profile={profile.data} onEdit={() => setActiveView('edit')} />
        ) : (
          <EditProfile key={profile.data.id + profile.data.username} profile={profile.data} onSaved={onSaved} onDone={() => setActiveView('profile')} />
        )
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Profile view
// ---------------------------------------------------------------------------------------------------------

function ProfileView({ profile, onEdit }: { profile: LearnerProfile; onEdit: () => void }) {
  const stats = useApiQuery(() => sharedLearnerStats(), []);
  const achievements = useApiQuery(() => loadAchievementCount(), []);
  const academic =
    profile.educationType === 'University'
      ? [profile.university, profile.department || profile.faculty, profile.level].filter(Boolean).join(' • ')
      : profile.educationType === 'Secondary'
        ? [profile.secondarySchool, profile.secondaryClass || profile.level, profile.secondaryStream].filter(Boolean).join(' • ')
        : [profile.examAimOrGoals].filter(Boolean).join(' • ');
  const value = (v: number | undefined, unit: string) => (v === undefined ? '—' : `${v.toLocaleString()}${unit}`);
  const statCards = [
    { label: 'Experience XP', icon: Zap, color: 'text-amber-500', value: value(stats.data?.xp?.totalXp, ' XP') },
    { label: 'Coins', icon: Coins, color: 'text-yellow-500', value: value(stats.data?.coins?.balance, '') },
    { label: 'Study streak', icon: Flame, color: 'text-orange-500', value: value(stats.data?.streak?.currentStreak, ' days') },
    { label: 'Achievements', icon: Award, color: 'text-purple-500', value: achievements.data === undefined ? '—' : `${achievements.data} unlocked` },
  ];

  return (
    <div className={`${card} relative overflow-hidden`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <MyAvatar size={104} label="Your profile picture" className="shadow-lg" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{profile.fullName}</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#2563EB]">@{profile.username}</span>
            </div>
            {academic && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-500" aria-hidden="true" /> {academic}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" /> {profile.email}
              {!profile.isEmailVerified && (
                <Link href={`/auth/verify-email?email=${encodeURIComponent(profile.email)}`} className="text-[#2563EB] font-semibold underline ml-1">
                  Verify email
                </Link>
              )}
            </p>
          </div>
        </div>
        <Button type="button" variant="primary" size="md" onClick={onEdit}>
          <Edit3 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} aria-hidden="true" /> {s.label}
            </span>
            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>
      {(stats.error || achievements.error) && <p className="text-[11px] text-gray-400 mt-3">Some statistics could not be loaded right now.</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Edit profile
// ---------------------------------------------------------------------------------------------------------

function EditProfile({ profile, onSaved, onDone }: { profile: LearnerProfile; onSaved: () => Promise<void>; onDone: () => void }) {
  const [basic, setBasic] = useState<BasicForm>(() => basicFormOf(profile));
  const [academic, setAcademic] = useState<AcademicForm>(() => academicFormOf(profile));
  const [basicErrors, setBasicErrors] = useState<Partial<Record<keyof BasicForm, string>>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const save = useAsyncAction(async () => {
    const errors = validateBasic(basic);
    setBasicErrors(errors);
    if (Object.keys(errors).length) return 'invalid' as const;
    const basicDiff = basicChanges(profile, basic);
    const academicDiff = academicChanges(profile, academic);
    if (!Object.keys(basicDiff).length && !Object.keys(academicDiff).length) return 'unchanged' as const;
    if (Object.keys(basicDiff).length) await saveBasic(basicDiff);
    if (Object.keys(academicDiff).length) await saveAcademic(academicDiff);
    await onSaved();
    return 'saved' as const;
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(null);
    const result = await save.run();
    if (result === 'saved') setSaved('Your profile was saved.');
    if (result === 'unchanged') setSaved('Nothing to save: no changes.');
  };
  const setB = (k: keyof BasicForm) => (e: React.ChangeEvent<HTMLInputElement>) => setBasic({ ...basic, [k]: e.target.value });
  const setA = (k: keyof AcademicForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setAcademic({ ...academic, [k]: e.target.value });

  return (
    <form onSubmit={submit} noValidate className={`${card} space-y-8`}>
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Edit Profile</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Only changed details are saved. Your email address cannot be changed here.</p>
      </div>

      <section className="space-y-4" aria-labelledby="basic-heading">
        <h3 id="basic-heading" className="text-sm font-bold text-gray-900 dark:text-white">About you</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input id="pf-fullName" label="Full name" value={basic.fullName} onChange={setB('fullName')} error={basicErrors.fullName} maxLength={150} autoComplete="name" />
          <Input id="pf-username" label="Username" value={basic.username} onChange={setB('username')} error={basicErrors.username} maxLength={100} autoComplete="username" />
          <Input id="pf-country" label="Country (optional)" value={basic.country} onChange={setB('country')} error={basicErrors.country} maxLength={100} autoComplete="country-name" />
          <Input id="pf-dob" label="Date of birth (optional)" type="date" value={basic.dateOfBirth} onChange={setB('dateOfBirth')} error={basicErrors.dateOfBirth} />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="academic-heading">
        <h3 id="academic-heading" className="text-sm font-bold text-gray-900 dark:text-white">Studies</h3>
        <div className="space-y-2">
          <label htmlFor="pf-track" className="text-sm font-medium text-gray-700 dark:text-gray-300">Education track</label>
          <select id="pf-track" value={academic.educationType} onChange={setA('educationType')} className={fieldClass}>
            {!academic.educationType && <option value="">Not set (examination preparation)</option>}
            <option value="Secondary">Secondary school</option>
            <option value="University">University</option>
          </select>
        </div>
        {academic.educationType === 'Secondary' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input id="pf-school" label="School" value={academic.secondarySchool} onChange={setA('secondarySchool')} maxLength={255} />
            <Input id="pf-class" label="Class / level" value={academic.level} onChange={setA('level')} maxLength={255} />
            <Input id="pf-stream" label="Stream" value={academic.secondaryStream} onChange={setA('secondaryStream')} maxLength={255} />
          </div>
        )}
        {academic.educationType === 'University' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="pf-university" label="University" value={academic.university} onChange={setA('university')} maxLength={255} />
            <Input id="pf-faculty" label="Faculty" value={academic.faculty} onChange={setA('faculty')} maxLength={255} />
            <Input id="pf-department" label="Department" value={academic.department} onChange={setA('department')} maxLength={255} />
            <Input id="pf-course" label="Course of study" value={academic.courseOfStudy} onChange={setA('courseOfStudy')} maxLength={255} />
            <Input id="pf-level" label="Level" value={academic.level} onChange={setA('level')} maxLength={255} />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="pf-goals" className="text-sm font-medium text-gray-700 dark:text-gray-300">Goals and target exams (optional)</label>
          <textarea id="pf-goals" rows={3} value={academic.examAimOrGoals} onChange={setA('examAimOrGoals')} maxLength={2000} className={`${fieldClass} resize-none`} />
        </div>
      </section>

      {save.error && <ErrorState error={save.error} compact />}
      {saved && !save.error && (
        <Alert variant="success" title={saved}>
          {saved === 'Your profile was saved.' ? 'The changes are stored on your account.' : ''}
        </Alert>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button type="button" variant="outline" size="md" onClick={onDone} disabled={save.isPending}>
          Back to profile
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={save.isPending}>
          <CheckCircle2 className="w-4 h-4 mr-1.5" aria-hidden="true" /> Save changes
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------------------------------------

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: typeof Sun }[] = [
  { id: 'picture', label: 'Profile picture', icon: ImageIcon },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'ai', label: 'AI Companion', icon: Sparkles },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'account', label: 'Account Security', icon: Lock },
];

function SettingsHub({ profile, onSaved }: { profile: LearnerProfile | undefined; onSaved: () => Promise<void> }) {
  const [tab, setTab] = useState<SettingsTab>('appearance');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <nav className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-1 lg:col-span-1 h-fit" aria-label="Settings sections">
        {SETTINGS_TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <t.icon className="w-4 h-4" aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs lg:col-span-3 space-y-6">
        {tab === 'picture' && <AvatarPicker />}
        {tab === 'appearance' && <AppearanceSettings />}
        {tab === 'notifications' && <NotificationSettingsPanel />}
        {tab === 'learning' && <LearningSettings profile={profile} onSaved={onSaved} />}
        {tab === 'ai' && <CompanionSettings />}
        {tab === 'privacy' && (
          <FeatureUnavailable
            title="Privacy settings aren't available yet"
            description="Profile, leaderboard and activity visibility can't be saved yet, so no options are shown here."
          />
        )}
        {tab === 'account' && <AccountSettings profile={profile} />}
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}

/** Theme is a device preference (same storage key and class as the Navbar toggle). */
function AppearanceSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('theme');
    } catch {
      /* storage unavailable */
    }
    void Promise.resolve().then(() => setTheme(stored === 'light' || stored === 'dark' ? stored : 'system'));
  }, []);
  const apply = (next: 'light' | 'dark' | 'system') => {
    setTheme(next);
    const dark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    try {
      if (next === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable: the choice applies to this visit only */
    }
  };
  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" description="Saved on this device." />
      <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Theme">
        {[
          { id: 'light' as const, label: 'Light', icon: Sun },
          { id: 'dark' as const, label: 'Dark', icon: Moon },
          { id: 'system' as const, label: 'System', icon: SettingsIcon },
        ].map((item) => {
          const selected = theme === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => apply(item.id)}
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                selected ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB] text-[#2563EB] font-black' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              <item.icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const NOTIFICATION_LABELS: Record<keyof NotificationSettings, { title: string; desc: string }> = {
  emailAlerts: { title: 'Email alerts', desc: 'Important account and learning emails.' },
  pushNotifications: { title: 'Push notifications', desc: 'Notifications on devices where you allowed them.' },
  aiTutorReminders: { title: 'AI tutor reminders', desc: 'Reminders from your AI companion.' },
  marketingEmails: { title: 'News and offers', desc: 'Occasional product news.' },
};

/** GET / PATCH /notifications/settings; each switch saves immediately. */
function NotificationSettingsPanel() {
  const settings = useApiQuery(() => loadNotificationSettings(), []);
  const [current, setCurrent] = useState<NotificationSettings | null>(null);
  const values = current ?? settings.data;
  const save = useAsyncAction(async (_signal: AbortSignal, key: keyof NotificationSettings, value: boolean) => {
    setCurrent(await saveNotificationSettings({ [key]: value }));
  });
  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" description="Choose what we may send you. Changes save immediately." />
      {settings.isLoading ? (
        <LoadingState layout="list" rows={4} />
      ) : !values ? (
        settings.error && <ErrorState error={settings.error} onRetry={settings.retry} />
      ) : (
        <div className="space-y-4">
          {NOTIFICATION_SETTING_KEYS.map((key) => (
            <label key={key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 cursor-pointer">
              <span>
                <span className="block text-xs font-bold text-gray-900 dark:text-white">{NOTIFICATION_LABELS[key].title}</span>
                <span className="block text-[11px] text-gray-500">{NOTIFICATION_LABELS[key].desc}</span>
              </span>
              <input
                type="checkbox"
                checked={values[key]}
                disabled={save.isPending}
                onChange={(e) => void save.run(key, e.target.checked)}
                className="w-5 h-5 rounded accent-[#2563EB] cursor-pointer disabled:opacity-50"
              />
            </label>
          ))}
          {save.error && <ErrorState error={save.error} compact />}
        </div>
      )}
    </div>
  );
}

/** PATCH /users/me/preferences: only the preferred study time is stored by the backend. */
function LearningSettings({ profile, onSaved }: { profile: LearnerProfile | undefined; onSaved: () => Promise<void> }) {
  const [studyTime, setStudyTime] = useState(profile?.preferredStudyTime ?? '');
  const [done, setDone] = useState(false);
  const save = useAsyncAction(async () => {
    await saveStudyTime(studyTime);
    await onSaved();
    setDone(true);
  });
  if (!profile) return <LoadingState layout="list" rows={1} />;
  const options = Array.from(new Set([...STUDY_TIMES, ...(profile.preferredStudyTime ? [profile.preferredStudyTime] : [])]));
  return (
    <div className="space-y-6">
      <SectionHeader title="Learning" description="When you usually study. Learning pace, session length and difficulty can't be saved yet." />
      <div className="space-y-2">
        <label htmlFor="pf-study-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred study time</label>
        <select id="pf-study-time" value={studyTime} onChange={(e) => { setStudyTime(e.target.value); setDone(false); }} className={fieldClass}>
          <option value="">Not set</option>
          {options.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {save.error && <ErrorState error={save.error} compact />}
      {done && !save.error && <Alert variant="success">Saved.</Alert>}
      <Button type="button" variant="primary" size="md" isLoading={save.isPending} disabled={studyTime === profile.preferredStudyTime} onClick={() => void save.run()}>
        Save
      </Button>
    </div>
  );
}

/** GET / PATCH /ai-companion (the companion created during onboarding). */
function CompanionSettings() {
  const companion = useApiQuery(() => loadCompanion(), []);
  const [form, setForm] = useState<Companion | null>(null);
  const [done, setDone] = useState(false);
  const values = form ?? companion.data;
  const changes = values && companion.data ? changedFields(companion.data, values) : {};
  const save = useAsyncAction(async () => {
    await saveCompanion(changes);
    companion.retry();
    setForm(null);
    setDone(true);
  });
  const labels: Record<keyof Companion, string> = { name: 'Name', gender: 'Persona', personality: 'Personality', teachingStyle: 'Teaching style', voice: 'Voice', appearance: 'Look' };
  return (
    <div className="space-y-6">
      <SectionHeader title="AI companion" description="How your AI companion presents itself." />
      {companion.isLoading ? (
        <LoadingState layout="list" rows={3} />
      ) : !values ? (
        companion.error && <ErrorState error={companion.error} onRetry={companion.retry} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COMPANION_KEYS.map((key) => {
              const options = COMPANION_OPTIONS[key];
              const set = (v: string) => { setForm({ ...values, [key]: v }); setDone(false); };
              return options ? (
                <div key={key} className="space-y-2">
                  <label htmlFor={`cmp-${key}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels[key]}</label>
                  <select id={`cmp-${key}`} value={values[key]} onChange={(e) => set(e.target.value)} className={fieldClass}>
                    {!values[key] && <option value="">Not set</option>}
                    {Array.from(new Set([...options, ...(values[key] ? [values[key]] : [])])).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input key={key} id={`cmp-${key}`} label={labels[key]} value={values[key]} onChange={(e) => set(e.target.value)} maxLength={100} />
              );
            })}
          </div>
          {save.error && <ErrorState error={save.error} compact />}
          {done && !save.error && <Alert variant="success">Companion saved.</Alert>}
          <Button type="button" variant="primary" size="md" isLoading={save.isPending} disabled={!Object.keys(changes).length} onClick={() => void save.run()}>
            Save companion
          </Button>
        </>
      )}
    </div>
  );
}

function AccountSettings({ profile }: { profile: LearnerProfile | undefined }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  return (
    <div className="space-y-6">
      <SectionHeader title="Account security" description="Password, email and account status." />
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Password</h3>
              <p className="text-[11px] text-gray-500">Change your password.</p>
            </div>
            {!isChangingPassword && (
              <Button type="button" variant="outline" size="sm" onClick={() => setIsChangingPassword(true)} aria-expanded={isChangingPassword}>
                Change
              </Button>
            )}
          </div>
          {isChangingPassword && (
            <ChangePasswordForm
              onCancel={() => {
                setIsChangingPassword(false);
                invalidateLearnerStats();
              }}
            />
          )}
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">Email address</h3>
          <p className="text-[11px] text-gray-500">{profile?.email ?? '…'}</p>
          <p className="text-[11px] text-gray-400 mt-1">Changing your email address is not available yet.</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400">Freeze or delete your account</h3>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Freezing pauses your account until you reactivate it. Deleting needs your password.</p>
          </div>
          <Link href="/account-state" className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold text-center">
            Manage account status
          </Link>
        </div>
      </div>
    </div>
  );
}
