'use client';

import React, { useState } from 'react';
import ExamHub from './components/ExamHub';
import ExamSetup from './components/ExamSetup';
import ExamInterface from './components/ExamInterface';
import ExamResult from './components/ExamResult';
import ExamReadiness from './components/ExamReadiness';

export default function ExamMainPage() {
  const [currentScreen, setCurrentScreen] = useState<string>('hub');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'hub':
        return <ExamHub onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'setup':
        return <ExamSetup onStartExam={() => setCurrentScreen('exam-active')} onBack={() => setCurrentScreen('hub')} />;
      case 'exam-active':
        return <ExamInterface onSubmitExam={() => setCurrentScreen('result')} />;
      case 'result':
        return <ExamResult onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'readiness':
        return <ExamReadiness onBack={() => setCurrentScreen('hub')} onStartRevision={() => setCurrentScreen('setup')} />;
      default:
        return <ExamHub onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0b0f19] px-4 sm:px-8 py-8">
      {renderScreen()}
    </main>
  );
}