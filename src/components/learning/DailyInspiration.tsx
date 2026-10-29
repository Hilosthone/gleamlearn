'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const INSIGHTS = [
  {
    category: 'Educational Inspiration',
    text: '“Education is not the learning of facts, but the training of the mind to think.”',
    author: 'Albert Einstein',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn transforms any PDF, lecture note, or uploaded material into interactive lessons, flashcards, practice quizzes, and mock exams instantly.',
    author: 'GleamLearn Feature',
  },
  {
    category: 'Scientific Discovery',
    text: 'Alexander Fleming discovered penicillin in 1928 when a mold spore accidentally contaminated a petri dish of Staphylococcus bacteria, revolutionizing modern medicine.',
    author: 'Medical History',
  },
  {
    category: 'Did You Know?',
    text: 'You can generate realistic interactive 3D visual models and AI-powered step-by-step explanations for complex topics right inside GleamLearn.',
    author: 'GleamLearn Ecosystem',
  },
  {
    category: 'Study Wisdom',
    text: '“The expert in anything was once a beginner. Consistent, daily practice compounds into extraordinary results.”',
    author: 'GleamLearn Wisdom',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn tracks your mastery level across subjects and builds personalized AI revision timetables tailored specifically to your upcoming exams.',
    author: 'Smart Exam Prep',
  },
  {
    category: 'Mathematical Insight',
    text: 'Zero was invented independently in ancient India and Mesoamerica, completely transforming global mathematics and the foundation of computing.',
    author: 'Mathematical History',
  },
  {
    category: 'Did You Know?',
    text: 'Your daily study streak and earned XP on GleamLearn keep your motivation high while turning studying into an engaging, rewarding habit.',
    author: 'Gamified Learning',
  },
  {
    category: 'Growth Mindset',
    text: '“It does not matter how slowly you go as long as you do not stop. Your daily study streak is your superpower.”',
    author: 'Confucius',
  },
  {
    category: 'Did You Know?',
    text: 'You can upload YouTube video links into GleamLearn and let the AI extract key concepts, summaries, and test questions automatically.',
    author: 'AI Video Learning',
  },
  {
    category: 'Astronomy Fact',
    text: 'Light from the Sun takes approximately 8 minutes and 20 seconds to reach Earth, meaning we always see the Sun as it was in the past.',
    author: 'Cosmic Science',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn is designed from the ground up to support ambitious students across Nigeria and Africa with intelligent, personalized academic support.',
    author: 'Built for Excellence',
  },
  
  {
    category: 'Study Wisdom',
    text: 'Studying for 30 focused minutes every day can be more effective than cramming for several hours before an examination.',
    author: 'Effective Learning',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn helps you turn difficult academic topics into simpler, step-by-step explanations tailored to your learning needs.',
    author: 'GleamLearn AI Tutor',
  },
  {
    category: 'Biology Fact',
    text: 'The human brain contains approximately 86 billion neurons, forming networks that help us think, remember, and learn.',
    author: 'Neuroscience',
  },
  {
    category: 'Growth Mindset',
    text: 'Every difficult topic you understand today becomes a foundation for something greater tomorrow.',
    author: 'GleamLearn Wisdom',
  },
  {
    category: 'Mathematical Insight',
    text: 'The number π is irrational, meaning its decimal representation continues infinitely without repeating in a fixed pattern.',
    author: 'Mathematics',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn combines flashcards, practice questions, and AI explanations to help you strengthen your understanding of challenging subjects.',
    author: 'GleamLearn Features',
  },
  {
    category: 'Scientific Discovery',
    text: 'Marie Curie became the first person to win two Nobel Prizes, receiving recognition in Physics and Chemistry.',
    author: 'History of Science',
  },
  {
    category: 'Study Strategy',
    text: 'Active recall means testing yourself from memory instead of repeatedly rereading your notes. It is one of the most effective ways to strengthen learning.',
    author: 'Learning Science',
  },
  {
    category: 'Astronomy Fact',
    text: 'A day on Venus lasts longer than its year when measured by its rotation period and orbital period.',
    author: 'Planetary Science',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn can help you organize your study goals and monitor your learning progress as you prepare for important examinations.',
    author: 'Personalized Learning',
  },
  {
    category: 'Technology Insight',
    text: 'The first widely recognized computer programmer was Ada Lovelace, who described an algorithm for Charles Babbage’s Analytical Engine.',
    author: 'Computing History',
  },
  {
    category: 'Educational Inspiration',
    text: 'Your current level of knowledge does not determine your potential. What matters is your willingness to keep learning.',
    author: 'GleamLearn Inspiration',
  },
  {
    category: 'Chemistry Fact',
    text: 'Water expands when it freezes, making ice less dense than liquid water. This is why ice floats.',
    author: 'Chemistry',
  },
  {
    category: 'Did You Know?',
    text: 'With GleamLearn, your uploaded learning materials can become a foundation for personalized revision activities and practice assessments.',
    author: 'AI-Powered Revision',
  },
  {
    category: 'Study Strategy',
    text: 'Spaced repetition strengthens long-term memory by reviewing information at gradually increasing intervals.',
    author: 'Cognitive Science',
  },
  {
    category: 'Physics Fact',
    text: 'Sound cannot travel through the vacuum of space because it requires a medium such as air, water, or solid matter.',
    author: 'Physics',
  },
  {
    category: 'Growth Mindset',
    text: 'Making mistakes while learning is not wasted effort. Understanding why an answer was wrong can make your knowledge stronger.',
    author: 'Learning Psychology',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn is designed to make exam preparation more interactive through quizzes, assessments, progress tracking, and personalized study support.',
    author: 'Smart Exam Preparation',
  },
  {
    category: 'Geography Fact',
    text: 'Africa is the second-largest continent by land area and contains 54 internationally recognized countries.',
    author: 'World Geography',
  },
  {
    category: 'Mathematical Insight',
    text: 'A prime number is a whole number greater than one that has exactly two positive divisors: one and itself.',
    author: 'Number Theory',
  },
  {
    category: 'Study Wisdom',
    text: 'Understanding a concept deeply is more valuable than memorizing an answer you cannot explain.',
    author: 'GleamLearn Wisdom',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn brings AI tutoring, learning resources, practice tools, and academic progress tracking into one connected learning experience.',
    author: 'GleamLearn Ecosystem',
  },
  {
    category: 'Biology Fact',
    text: 'DNA carries genetic instructions using four chemical bases: adenine, thymine, cytosine, and guanine.',
    author: 'Genetics',
  },
  {
    category: 'Educational Inspiration',
    text: 'One hour of meaningful learning can change how you understand a subject for the rest of your life.',
    author: 'GleamLearn Inspiration',
  },
  {
    category: 'Technology Insight',
    text: 'The World Wide Web was invented by Tim Berners-Lee in 1989 while working at CERN.',
    author: 'Internet History',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn uses learning progress and performance information to support more personalized study experiences.',
    author: 'Adaptive Learning',
  },
  {
    category: 'Physics Fact',
    text: 'Light travels at approximately 299,792 kilometers per second in a vacuum, making it the fastest known way for information to travel.',
    author: 'Modern Physics',
  },
  {
    category: 'Study Strategy',
    text: 'The Feynman Technique encourages you to explain a topic in simple language, helping reveal gaps in your understanding.',
    author: 'Learning Techniques',
  },
  {
    category: 'Astronomy Fact',
    text: 'Jupiter is the largest planet in our solar system and has a famous storm known as the Great Red Spot.',
    author: 'Space Science',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn supports self-directed learning, allowing students to explore subjects and build personalized learning experiences.',
    author: 'Independent Learning',
  },
  {
    category: 'Chemistry Fact',
    text: 'The periodic table organizes chemical elements primarily by increasing atomic number, revealing patterns in their properties.',
    author: 'Chemical Science',
  },
  {
    category: 'Growth Mindset',
    text: 'You do not need to understand everything immediately. Curiosity, patience, and consistent practice make difficult ideas easier.',
    author: 'GleamLearn Wisdom',
  },
  {
    category: 'Computer Science',
    text: 'Binary numbers use only two digits, 0 and 1, forming the foundation of how digital computers represent information.',
    author: 'Computer Fundamentals',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn aims to help students prepare for WAEC, JAMB, Post-UTME, and university-level academic challenges.',
    author: 'GleamLearn Mission',
  },
  {
    category: 'Biology Fact',
    text: 'Photosynthesis allows plants to convert light energy into chemical energy, using carbon dioxide and water to produce sugars.',
    author: 'Plant Biology',
  },
  {
    category: 'Study Strategy',
    text: 'Interleaving different types of problems during practice can improve your ability to recognize which method to apply.',
    author: 'Learning Science',
  },
  {
    category: 'Mathematical Insight',
    text: 'The Fibonacci sequence begins with 0 and 1, and each following number is the sum of the previous two.',
    author: 'Mathematics',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn brings gamification into learning through features such as XP, streaks, achievements, badges, and leaderboards.',
    author: 'Gamified Education',
  },
  {
    category: 'Scientific Discovery',
    text: 'Isaac Newton formulated laws of motion and universal gravitation that transformed our understanding of physical movement.',
    author: 'History of Physics',
  },
  {
    category: 'Educational Inspiration',
    text: 'The most powerful learning habit is not studying perfectly. It is returning consistently, even when progress feels slow.',
    author: 'GleamLearn Inspiration',
  },
  {
    category: 'Earth Science',
    text: 'Earth’s tectonic plates move slowly over time, causing earthquakes, mountain formation, and changes in continental positions.',
    author: 'Geology',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn is being developed to make quality educational support more accessible to learners across Nigeria and beyond.',
    author: 'GleamLearn Vision',
  },
  {
    category: 'Study Wisdom',
    text: 'Practice questions do more than measure knowledge. They reveal what you understand, what you have forgotten, and what to revise next.',
    author: 'Assessment Science',
  },
  {
    category: 'Technology Insight',
    text: 'Artificial intelligence systems learn patterns from data, enabling applications such as language understanding, image recognition, and personalized recommendations.',
    author: 'Artificial Intelligence',
  },
  {
    category: 'Astronomy Fact',
    text: 'The Moon is gradually moving away from Earth at an average rate of approximately 3.8 centimeters per year.',
    author: 'Lunar Science',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn’s AI learning experience is designed to combine explanations with interactive diagrams and visual demonstrations.',
    author: 'Visual AI Learning',
  },
  {
    category: 'Mathematical Insight',
    text: 'Euler’s identity, e^(iπ) + 1 = 0, connects five fundamental mathematical constants in one elegant equation.',
    author: 'Advanced Mathematics',
  },
  {
    category: 'Growth Mindset',
    text: 'A challenging question is an opportunity to discover what you still need to learn, not a reason to give up.',
    author: 'GleamLearn Wisdom',
  },
  {
    category: 'Study Strategy',
    text: 'Taking short breaks during focused study sessions can help maintain attention and reduce mental fatigue.',
    author: 'Productive Learning',
  },
  {
    category: 'Did You Know?',
    text: 'GleamLearn’s long-term vision is to help learners understand deeply, practice effectively, and prepare confidently through intelligent educational technology.',
    author: 'GleamLearn Vision',
  },
];

export function DailyInspiration() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically computes index changing twice a day (at 12:00 AM and 12:00 PM)
  useEffect(() => {
    const calculateIndex = () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      
      // Total half-day intervals elapsed since the beginning of the year
      const totalHalfDays = Math.floor(diffDays * 2); 
      return totalHalfDays % INSIGHTS.length;
    };

    setCurrentIndex(calculateIndex());

    // Check periodically (every 10 minutes) to transition precisely when 12 AM or 12 PM hits
    const interval = setInterval(() => {
      setCurrentIndex(calculateIndex());
    }, 1000 * 60 * 10);

    return () => clearInterval(interval);
  }, []);

  const current = INSIGHTS[currentIndex];

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200/80 dark:border-gray-800 p-5 sm:p-6 shadow-xs flex items-start gap-4 transition-all">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
          <Lightbulb className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)]">
              {current.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
            {current.text}
          </p>
          <p className="text-xs text-gray-400 font-medium">— {current.author}</p>
        </div>
      </div>
    </div>
  );
}