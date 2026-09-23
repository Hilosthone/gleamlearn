'use client';

import React, { useState } from 'react';
import AIAssistant from './components/AIAssistant';
import AIConversation from './components/AIConversation';
import AITutor from './components/AITutor';
import AIClassroom from './components/AIClassroom';
import AICompanionProfile from './components/AICompanionProfile';

export default function AIMainPage() {
  const [currentScreen, setCurrentScreen] = useState<string>('assistant');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'assistant':
        return <AIAssistant onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'chat':
        return <AIConversation onBack={() => setCurrentScreen('assistant')} />;
      case 'tutor':
        return <AITutor onStartClassroom={() => setCurrentScreen('classroom')} onBack={() => setCurrentScreen('assistant')} />;
      case 'classroom':
        return <AIClassroom onBack={() => setCurrentScreen('tutor')} />;
      case 'profile':
        return <AICompanionProfile onBack={() => setCurrentScreen('assistant')} />;
      default:
        return <AIAssistant onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0b0f19] px-4 sm:px-8 py-8">
      {renderScreen()}
    </main>
  );
}