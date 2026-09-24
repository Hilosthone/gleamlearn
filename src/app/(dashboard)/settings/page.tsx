'use client';

import React, { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Edit3, Award, Flame, Zap, Coins, GraduationCap, BookOpen, Shield, Bell, Moon, Sun, Volume2, Lock, Trash2, 
  Sparkles, 
  Camera,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

type SubView = 'profile' | 'edit' | 'settings';
type SettingsTab = 'appearance' | 'notifications' | 'learning' | 'ai' | 'privacy' | 'account';

export default function ProfileSettingsHub() {
  const [activeView, setActiveView] = useState<SubView>('profile');
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('appearance');

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    fullName: 'Hilosthone Sulyman',
    username: 'hilosthone',
    institution: 'University Of Ilorin',
    department: 'Computer Science & Engineering',
    level: '400 Level',
    xp: '14,850 XP',
    coins: '1,250 Coins',
    streak: '14 Days',
    achievementsCount: '24 Unlocked',
    bio: 'Full-stack software engineer and undergraduate student passionate about AI systems, mobile architectures, and quantum computing.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  });

  // Settings State
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'dark' as 'light' | 'dark' | 'system',
    // Notifications
    studyReminders: true,
    streakReminders: true,
    achievementNotifications: true,
    examReminders: true,
    // Learning
    learningPace: 'Accelerated',
    defaultStudyDuration: '45 mins',
    defaultDifficulty: 'Advanced',
    // AI
    aiPersonality: 'Encouraging & Academic',
    aiVoice: 'Nova (Warm & Clear)',
    responseStyle: 'Detailed with Step-by-Step Breakdown',
    // Privacy
    profileVisibility: 'Public',
    leaderboardVisibility: 'Friends Only',
    activityVisibility: 'Private',
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveView('profile');
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Navigation Sub-Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Profile & Preferences</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your academic profile, customization preferences, and security settings.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full sm:w-auto">
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
                onClick={() => setActiveView(tab.id as SubView)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 57. PROFILE PAGE                                         */}
      {/* ========================================================= */}
      {activeView === 'profile' && (
        <div className="space-y-6">
          {/* Main Hero Profile Card */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <img 
                    src={userProfile.avatarUrl} 
                    alt={userProfile.fullName} 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-[#2563EB] text-white text-[10px] font-black shadow-md">
                    {userProfile.level}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{userProfile.fullName}</h2>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-[#2563EB]">
                      @{userProfile.username}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-500" /> {userProfile.institution} • {userProfile.department}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg pt-1">
                    {userProfile.bio}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveView('edit')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Experience XP</span>
                <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{userProfile.xp}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-yellow-500" /> Balance Coins</span>
                <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{userProfile.coins}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> Study Streak</span>
                <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{userProfile.streak}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Award className="w-3.5 h-3.5 text-purple-500" /> Achievements</span>
                <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{userProfile.achievementsCount}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 58. EDIT PROFILE                                         */}
      {/* ========================================================= */}
      {activeView === 'edit' && (
        <form onSubmit={handleProfileSave} className="bg-white dark:bg-[#111827] p-6 sm:p-10 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">Edit Academic Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your personal details, academic institution, and biography.</p>
          </div>

          {/* Profile Picture Uploader Simulator */}
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <img src={userProfile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white">Profile Picture</h4>
              <p className="text-[11px] text-gray-400">Recommended 400x400px PNG or JPG.</p>
              <button type="button" className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] text-xs font-bold border border-blue-200/50 flex items-center gap-1.5 mt-1">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload New Image</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Full Name</label>
              <input 
                type="text" 
                value={userProfile.fullName}
                onChange={(e) => setUserProfile({ ...userProfile, fullName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Username</label>
              <input 
                type="text" 
                value={userProfile.username}
                onChange={(e) => setUserProfile({ ...userProfile, username: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Institution</label>
              <input 
                type="text" 
                value={userProfile.institution}
                onChange={(e) => setUserProfile({ ...userProfile, institution: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Department</label>
              <input 
                type="text" 
                value={userProfile.department}
                onChange={(e) => setUserProfile({ ...userProfile, department: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Academic Level</label>
              <input 
                type="text" 
                value={userProfile.level}
                onChange={(e) => setUserProfile({ ...userProfile, level: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Biography / Bio</label>
            <textarea 
              rows={3}
              value={userProfile.bio}
              onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setActiveView('profile')}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 59. SETELLINGS HUB                                       */}
      {/* ========================================================= */}
      {activeView === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation Sidebar */}
          <div className="bg-white dark:bg-[#111827] p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-1 lg:col-span-1 h-fit">
            {[
              { id: 'appearance', label: 'Appearance', icon: Sun },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'learning', label: 'Learning', icon: BookOpen },
              { id: 'ai', label: 'AI Preferences', icon: Sparkles },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'account', label: 'Account Security', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSettingsTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSettingsTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Content Panels */}
          <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs lg:col-span-3 space-y-6">
            
            {/* Appearance Section */}
            {activeSettingsTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Appearance Settings</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Customize your interface theme and color mode.</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: SettingsIcon },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = settings.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSettings({ ...settings, theme: item.id as any })}
                        className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-[#2563EB] text-[#2563EB] font-black' 
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSettingsTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choose what alerts and reminders you receive.</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'studyReminders', title: 'Study Reminders', desc: 'Alerts for scheduled study blocks and lesson plans.' },
                    { key: 'streakReminders', title: 'Streak Reminders', desc: 'Daily evening pings to keep your active study streak alive.' },
                    { key: 'achievementNotifications', title: 'Achievement Notifications', desc: 'Instant celebration banners when unlocking badges.' },
                    { key: 'examReminders', title: 'Exam Reminders', desc: 'Advance warnings for upcoming tests, quizzes, and exams.' },
                  ].map((item) => {
                    const isChecked = (settings as any)[item.key];
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-[11px] text-gray-500">{item.desc}</p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                          className="w-5 h-5 rounded accent-[#2563EB] cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Learning Section */}
            {activeSettingsTab === 'learning' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Learning Defaults</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Set default pacing, session length, and difficulty preferences.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Learning Pace</label>
                    <select
                      value={settings.learningPace}
                      onChange={(e) => setSettings({ ...settings, learningPace: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Relaxed (Moderate daily load)</option>
                      <option>Balanced (Standard academic tempo)</option>
                      <option>Accelerated (Intensive daily modules)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Default Study Duration</label>
                    <select
                      value={settings.defaultStudyDuration}
                      onChange={(e) => setSettings({ ...settings, defaultStudyDuration: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>30 mins</option>
                      <option>45 mins</option>
                      <option>60 mins</option>
                      <option>90 mins</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Default Difficulty</label>
                    <select
                      value={settings.defaultDifficulty}
                      onChange={(e) => setSettings({ ...settings, defaultDifficulty: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert / Master</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Section */}
            {activeSettingsTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">AI Tutor Personalization</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure how your AI companion behaves, speaks, and responds.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">AI Personality</label>
                    <select
                      value={settings.aiPersonality}
                      onChange={(e) => setSettings({ ...settings, aiPersonality: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Encouraging & Academic</option>
                      <option>Strict & Socratic</option>
                      <option>Casual & Direct</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">AI Voice & Audio</label>
                    <select
                      value={settings.aiVoice}
                      onChange={(e) => setSettings({ ...settings, aiVoice: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Nova (Warm & Clear)</option>
                      <option>Echo (Deep & Authoritative)</option>
                      <option>Shimmer (Bright & Articulate)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Response Style</label>
                    <select
                      value={settings.responseStyle}
                      onChange={(e) => setSettings({ ...settings, responseStyle: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Detailed with Step-by-Step Breakdown</option>
                      <option>Concise Bullet Points</option>
                      <option>Analogy-Driven Explanations</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSettingsTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Privacy Controls</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage visibility across your profile, leaderboards, and study activity.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Profile Visibility</label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Leaderboard Visibility</label>
                    <select
                      value={settings.leaderboardVisibility}
                      onChange={(e) => setSettings({ ...settings, leaderboardVisibility: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Public Ranking</option>
                      <option>Friends Only</option>
                      <option>Anonymous</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Activity Visibility</label>
                    <select
                      value={settings.activityVisibility}
                      onChange={(e) => setSettings({ ...settings, activityVisibility: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Account Security Section */}
            {activeSettingsTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Account Security & Actions</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your credentials, freeze account status, or delete your data.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Change Password</h4>
                      <p className="text-[11px] text-gray-500">Update your account password securely.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] text-xs font-bold border border-blue-200/50">
                      Update
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Registered Email</h4>
                      <p className="text-[11px] text-gray-500">hilosthone.dev@oau.edu.ng</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
                      Change Email
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">Freeze Account</h4>
                      <p className="text-[11px] text-amber-600/80">Temporarily pause your subscription and streak decay.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold">
                      Freeze
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-200 dark:border-red-900/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Delete Account</h4>
                      <p className="text-[11px] text-red-500/80">Permanently remove your account and all associated data.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}