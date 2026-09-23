'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  BookOpen, 
  Award, 
  Flame, 
  FileText, 
  Target, 
  Sparkles, 
  Settings, 
  Check, 
  Filter
} from 'lucide-react';

type NotificationCategory = 'all' | 'Study reminders' | 'Achievements' | 'Streak' | 'Exam' | 'Goals' | 'AI recommendations' | 'System';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  time: string;
  read: boolean;
}

export default function NotificationsHub() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  
  // Initial Notification Dataset
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Study Reminder: Physics 401',
      description: 'Your scheduled study session for Maxwell-Faraday Equations starts in 30 minutes.',
      category: 'Study reminders',
      time: '10 mins ago',
      read: false
    },
    {
      id: '2',
      title: 'New Achievement Unlocked! 🏆',
      description: 'You earned the "Electrodynamics Master" badge for scoring 95% on your latest quiz.',
      category: 'Achievements',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      title: 'Streak Milestone: 14 Days!',
      description: 'Incredible consistency! You have studied every single day for two weeks straight.',
      category: 'Streak',
      time: '3 hours ago',
      read: true
    },
    {
      id: '4',
      title: 'Upcoming Exam Alert',
      description: 'Vector Calculus Midterm Test is scheduled for tomorrow at 10:00 AM. Review your saved notes.',
      category: 'Exam',
      time: '5 hours ago',
      read: false
    },
    {
      id: '5',
      title: 'Weekly Learning Goal Reached',
      description: 'Congratulations! You hit your goal of 10 completed lessons ahead of schedule.',
      category: 'Goals',
      time: 'Yesterday',
      read: true
    },
    {
      id: '6',
      title: 'New AI Study Recommendation',
      description: 'Based on recent quiz performance, our AI tutor prepared a practice set on Quantum Superposition.',
      category: 'AI recommendations',
      time: 'Yesterday',
      read: true
    },
    {
      id: '7',
      title: 'System Maintenance Notice',
      description: 'Platform servers will undergo routine optimization tonight from 02:00 AM to 03:00 AM.',
      category: 'System',
      time: '2 days ago',
      read: true
    }
  ]);

  // Actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(item => item.id === id ? { ...item, read: true } : item)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  };

  // Filter logic
  const filteredNotifications = activeCategory === 'all' 
    ? notifications 
    : notifications.filter(item => item.category === activeCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Icon mapping helper
  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Study reminders': return BookOpen;
      case 'Achievements': return Award;
      case 'Streak': return Flame;
      case 'Exam': return FileText;
      case 'Goals': return Target;
      case 'AI recommendations': return Sparkles;
      case 'System': return Settings;
      default: return Bell;
    }
  };

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Global Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-[#2563EB] border border-blue-200/50 relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Notifications Center</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stay updated with your study schedule, academic goals, and AI recommendations.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              unreadCount > 0 
                ? 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 border border-blue-200/50 hover:bg-blue-100' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'Study reminders', label: 'Study Reminders' },
          { id: 'Achievements', label: 'Achievements' },
          { id: 'Streak', label: 'Streak' },
          { id: 'Exam', label: 'Exam' },
          { id: 'Goals', label: 'Goals' },
          { id: 'AI recommendations', label: 'AI Recommendations' },
          { id: 'System', label: 'System' },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as NotificationCategory)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-[#111827] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List Card Container */}
      <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2563EB]" /> 
            {activeCategory === 'all' ? 'All Notifications' : activeCategory} 
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">
              {filteredNotifications.length}
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <div 
                  key={item.id} 
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    item.read 
                      ? 'bg-gray-50/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800/80 opacity-85' 
                      : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-900/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      !item.read ? 'bg-blue-500/10 text-[#2563EB]' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-xs sm:text-sm font-bold ${!item.read ? 'text-gray-900 dark:text-white font-black' : 'text-gray-700 dark:text-gray-300'}`}>
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">{item.description}</p>
                      <span className="text-[10px] text-gray-400 block pt-0.5">{item.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!item.read && (
                      <button 
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 hover:bg-blue-100 transition-all text-xs font-bold flex items-center gap-1 px-3"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Mark read</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteNotification(item.id)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all text-xs font-bold flex items-center gap-1 px-3"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto" />
              <p className="text-xs text-gray-400 font-medium">No notifications found in this category.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}