'use client';

import React, { useState } from 'react';
import PracticeHub from './components/PracticeHub';
import QuizSetup from './components/QuizSetup';
import QuizPage from './components/QuizPage';
import QuizResult from './components/QuizResult';
import QuestionReview from './components/QuestionReview';
import TestSetup from './components/TestSetup';
import TestPage from './components/TestPage';
import TestResult from './components/TestResult';

export default function PracticeMainPage() {
  const [currentScreen, setCurrentScreen] = useState<string>('hub');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'hub':
        return <PracticeHub onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'quiz-setup':
        return <QuizSetup onStartQuiz={() => setCurrentScreen('quiz-active')} onBack={() => setCurrentScreen('hub')} />;
      case 'quiz-active':
        return <QuizPage onSubmitQuiz={() => setCurrentScreen('quiz-result')} />;
      case 'quiz-result':
        return <QuizResult onNavigate={(screen) => setCurrentScreen(screen)} />;
      case 'review':
        return <QuestionReview onBack={() => setCurrentScreen('quiz-result')} />;
      case 'test-setup':
        return <TestSetup onStartTest={() => setCurrentScreen('test-active')} onBack={() => setCurrentScreen('hub')} />;
      case 'test-active':
        return <TestPage onSubmitTest={() => setCurrentScreen('test-result')} />;
      case 'test-result':
        return <TestResult onReset={() => setCurrentScreen('hub')} />;
      default:
        return <PracticeHub onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-[#0b0f19] px-4 sm:px-8 py-8">
      {renderScreen()}
    </main>
  );
}