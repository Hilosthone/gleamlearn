"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Coins, Zap, Shield, Users, Award } from "lucide-react";

export default function GamificationSection() {
  const leaderboardUsers = [
    { rank: 1, name: "Boluwatife O.", xp: "14,850 XP", streak: "45 Days", badge: "Grand Scholar" },
    { rank: 2, name: "Hilosthone S.", xp: "13,200 XP", streak: "38 Days", badge: "AI Master" },
    { rank: 3, name: "Chidera Okafor", xp: "11,940 XP", streak: "30 Days", badge: "Streak King" },
    { rank: 4, name: "Fatima Aliyu", xp: "10,500 XP", streak: "24 Days", badge: "Bookworm" },
  ];

  return (
    <section id="gamification" className="py-24 bg-gray-50 dark:bg-dark-bg relative border-t border-gray-200 dark:border-dark-border overflow-hidden transition-colors duration-300">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-semibold mb-4 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Motivating & Engaging</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Gamified Learning That Feels Like Play
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Stay motivated with balanced gamification. Earn XP, collect coins, maintain streaks, and compete on department and national leaderboards.
          </p>
        </div>

        {/* Grid: Feature Cards Left, Leaderboard Preview Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: XP, Coins, Streaks Explanation */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-dark-border flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-brand-orange/15 dark:bg-brand-orange/20 text-brand-orange border border-brand-orange/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Daily Learning Streaks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Build consistent study habits with daily streaks. Includes smart streak protection and recovery options so life&apos;s busy moments never ruin your progress.
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-dark-border flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-brand-green/15 dark:bg-brand-green/20 text-brand-green border border-brand-green/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">XP & Knowledge Levels</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Harder lessons and complex tests yield higher XP rewards. Watch your academic mastery level grow from Novice to Scholar.
                </p>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 dark:border-dark-border flex items-start gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/15 dark:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Coin Rewards & Cosmetics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Earn coins by acing quizzes and completing daily challenges. Use them to customize your AI companion persona, themes, and profile badges.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Leaderboard Widget Simulation */}
          <div className="lg:col-span-6">
            <div className="bg-white/80 dark:bg-[#111827]/75 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-dark-border shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-dark-border mb-6">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                  <Users className="w-5 h-5 text-brand-purple" />
                  <span>Global & Department Leaderboard</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-purple/20 text-brand-purple font-semibold">Weekly</span>
              </div>

              <div className="space-y-3">
                {leaderboardUsers.map((user) => (
                  <div 
                    key={user.rank}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      user.rank === 2 
                        ? "bg-brand-blue/10 border-brand-blue/50 shadow-lg" 
                        : "bg-gray-50/80 dark:bg-dark-bg/60 border-gray-200 dark:border-dark-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.rank === 1 ? "bg-amber-500 text-black" :
                        user.rank === 2 ? "bg-brand-blue text-white" :
                        user.rank === 3 ? "bg-amber-700 text-white" : "bg-gray-200 dark:bg-dark-card text-gray-600 dark:text-gray-400"
                      }`}>
                        {user.rank}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Award className="w-3.5 h-3.5 text-brand-purple inline" />
                          {user.badge}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-brand-green">{user.xp}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                        <Flame className="w-3.5 h-3.5 text-brand-orange inline" />
                        {user.streak}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border text-center text-xs text-gray-500 dark:text-gray-400">
                Rankings update in real-time as students complete quizzes and tests.
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}