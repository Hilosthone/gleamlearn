// // src/app/onboarding/page.tsx
// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Card } from '@/components/ui/Card';

// export default function OnboardingPage() {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 10; // Updated total step count

//   // Onboarding Form States
//   const [eduType, setEduType] = useState<'secondary' | 'university' | 'other'>('university');
//   const [academicData, setAcademicData] = useState({
//     institution: '',
//     facultyOrClass: '',
//     departmentOrSubject: '',
//     levelOrTerm: '',
//     semester: 'First Semester',
//   });
  
//   // NEW: State for Step 8 (Core Subjects & Focus Areas)
//   const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
//   const [customSubject, setCustomSubject] = useState('');

//   // NEW: State for Step 9 (Preferred Content & Study Formats)
//   const [contentFormats, setContentFormats] = useState({
//     format: 'interactive', // interactive, flashcards, summary-notes, video-lectures
//     practiceFreq: 'After every lesson',
//   });

//   // NEW: State for Step 10 (Daily Streak Reminders & Notifications)
//   const [notificationSettings, setNotificationSettings] = useState({
//     reminderTime: '08:00 PM',
//     enablePush: true,
//   });

//   const [preferences, setPreferences] = useState({
//     speed: 'balanced',
//     sessionDuration: '30 mins',
//     style: 'theory',
//   });
//   const [goalData, setGoalData] = useState({
//     goal: 'Master my courses',
//     targetScore: 'A / Distinction',
//     targetDate: 'End of Semester',
//   });
//   const [aiCompanion, setAiCompanion] = useState({
//     name: 'Gleam AI',
//     personality: 'Encouraging & Detailed',
//     voice: 'Friendly',
//   });

//   const [isLoading, setIsLoading] = useState(false);

//   // Navigation Handlers
//   const nextStep = () => {
//     if (currentStep < totalSteps) {
//       setCurrentStep((prev) => prev + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } else {
//       setIsLoading(true);
//       setTimeout(() => {
//         setIsLoading(false);
//         router.push('/dashboard'); // Direct to main student dashboard
//       }, 1500);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const toggleSubject = (subject: string) => {
//     setSelectedSubjects((prev) =>
//       prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
//     );
//   };

//   const progressPercentage = Math.round((currentStep / totalSteps) * 100);

//   return (
//     <main className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#0B0F19] px-6 py-8 max-w-lg mx-auto transition-colors duration-300">
      
//       {/* Top Header & Progress Bar */}
//       <div className="space-y-3">
//         <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
//           <button 
//             onClick={prevStep} 
//             disabled={currentStep === 1}
//             className="hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-0 transition-opacity"
//           >
//             ← Back
//           </button>
//           <span>STEP {currentStep} OF {totalSteps}</span>
//           <span className="text-[var(--color-brand-blue)]">{progressPercentage}% Complete</span>
//         </div>
//         <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//           <div 
//             className="h-full bg-[var(--color-brand-blue)] rounded-full transition-all duration-500 ease-out" 
//             style={{ width: `${progressPercentage}%` }}
//           />
//         </div>
//       </div>

//       {/* Step Content Container with Smooth Fade Animation */}
//       <div className="my-auto py-8 animate-fade-in transition-all duration-300">
        
//         {/* ================= STEP 1: EDUCATION TYPE ================= */}
//         {currentStep === 1 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">What are you currently studying?</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 We configure your virtual classrooms to match your academic track.
//               </p>
//             </div>

//             <div className="space-y-3">
//               {[
//                 { id: 'secondary', title: 'Secondary School', desc: 'Junior or Senior Secondary (SS1-SS3, WAEC, JAMB)', icon: GraduationCapIcon },
//                 { id: 'university', title: 'University / Polytechnic', desc: 'Undergraduate degree, diploma, or professional college', icon: BuildingLibraryIcon },
//                 { id: 'other', title: 'Self-Taught / Professional', desc: 'Personal upskilling, coding bootcamps, or lifelong learning', icon: BookOpenIcon },
//               ].map((item) => {
//                 const IconComponent = item.icon;
//                 const isSelected = eduType === item.id;
//                 return (
//                   <Card
//                     key={item.id}
//                     variant={isSelected ? 'bordered' : 'default'}
//                     onClick={() => setEduType(item.id as any)}
//                     className={`cursor-pointer transition-all ${
//                       isSelected 
//                         ? 'border-[var(--color-brand-blue)] bg-blue-50/40 dark:bg-blue-950/20 shadow-sm' 
//                         : 'hover:border-gray-300 dark:hover:border-gray-700'
//                     }`}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`p-3 rounded-xl ${isSelected ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
//                         <IconComponent className="w-6 h-6" />
//                       </div>
//                       <div>
//                         <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
//                       </div>
//                     </div>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 2: ACADEMIC SETUP ================= */}
//         {currentStep === 2 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Academic Details</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 {eduType === 'secondary' ? 'Specify your school and class level.' : 'Specify your university, faculty, and level.'}
//               </p>
//             </div>

//             <div className="space-y-4">
//               {eduType === 'secondary' ? (
//                 <>
//                   <Input
//                     label="School Name"
//                     placeholder="e.g. Federal Government College"
//                     value={academicData.institution}
//                     onChange={(e) => setAcademicData({ ...academicData, institution: e.target.value })}
//                   />
//                   <Input
//                     label="Class / Grade"
//                     placeholder="e.g. Senior Secondary 3 (SS3)"
//                     value={academicData.facultyOrClass}
//                     onChange={(e) => setAcademicData({ ...academicData, facultyOrClass: e.target.value })}
//                   />
//                   <Input
//                     label="Target Exams"
//                     placeholder="e.g. WAEC, NECO, JAMB UTME"
//                     value={academicData.departmentOrSubject}
//                     onChange={(e) => setAcademicData({ ...academicData, departmentOrSubject: e.target.value })}
//                   />
//                 </>
//               ) : (
//                 <>
//                   <Input
//                     label="University / Institution"
//                     placeholder="e.g. Obafemi Awolowo University"
//                     value={academicData.institution}
//                     onChange={(e) => setAcademicData({ ...academicData, institution: e.target.value })}
//                   />
//                   <Input
//                     label="Faculty / College"
//                     placeholder="e.g. Faculty of Technology"
//                     value={academicData.facultyOrClass}
//                     onChange={(e) => setAcademicData({ ...academicData, facultyOrClass: e.target.value })}
//                   />
//                   <Input
//                     label="Department / Course of Study"
//                     placeholder="e.g. Computer Science and Engineering"
//                     value={academicData.departmentOrSubject}
//                     onChange={(e) => setAcademicData({ ...academicData, departmentOrSubject: e.target.value })}
//                   />
//                   <div className="grid grid-cols-2 gap-3">
//                     <Input
//                       label="Level"
//                       placeholder="e.g. 200 Level"
//                       value={academicData.levelOrTerm}
//                       onChange={(e) => setAcademicData({ ...academicData, levelOrTerm: e.target.value })}
//                     />
//                     <div className="flex flex-col gap-1.5">
//                       <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Semester</label>
//                       <select
//                         value={academicData.semester}
//                         onChange={(e) => setAcademicData({ ...academicData, semester: e.target.value })}
//                         className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#111827] border border-gray-300 dark:border-[#1F2937] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]"
//                       >
//                         <option value="First Semester">First Semester</option>
//                         <option value="Second Semester">Second Semester</option>
//                       </select>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 3: LEARNING PREFERENCES ================= */}
//         {currentStep === 3 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Learning Preferences</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 How do you prefer your study pacing and explanation styles?
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Study Pacing</label>
//                 <div className="grid grid-cols-3 gap-3">
//                   {[
//                     { id: 'detailed', label: 'Slow & Detailed' },
//                     { id: 'balanced', label: 'Balanced' },
//                     { id: 'fast', label: 'Fast-paced' },
//                   ].map((item) => (
//                     <button
//                       key={item.id}
//                       type="button"
//                       onClick={() => setPreferences({ ...preferences, speed: item.id })}
//                       className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
//                         preferences.speed === item.id
//                           ? 'border-[var(--color-brand-blue)] bg-blue-50 dark:bg-blue-950/30 text-[var(--color-brand-blue)]'
//                           : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
//                       }`}
//                     >
//                       {item.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Study Duration</label>
//                 <div className="grid grid-cols-3 gap-3">
//                   {['15 mins', '30 mins', '60+ mins'].map((time) => (
//                     <button
//                       key={time}
//                       type="button"
//                       onClick={() => setPreferences({ ...preferences, sessionDuration: time })}
//                       className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
//                         preferences.sessionDuration === time
//                           ? 'border-[var(--color-brand-green)] bg-emerald-50 dark:bg-emerald-950/30 text-[var(--color-brand-green)]'
//                           : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
//                       }`}
//                     >
//                       {time}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Explanation & Test Style</label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {[
//                     { id: 'theory', label: 'Theory & Conceptual' },
//                     { id: 'objective', label: 'Objective & Practice Quiz' },
//                   ].map((style) => (
//                     <button
//                       key={style.id}
//                       type="button"
//                       onClick={() => setPreferences({ ...preferences, style: style.id })}
//                       className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
//                         preferences.style === style.id
//                           ? 'border-[var(--color-brand-purple)] bg-purple-50 dark:bg-purple-950/30 text-[var(--color-brand-purple)]'
//                           : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
//                       }`}
//                     >
//                       {style.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 4: ACADEMIC GOALS ================= */}
//         {currentStep === 4 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Primary Academic Goal</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 What is your main target for using gleamLearn this term?
//               </p>
//             </div>

//             <div className="space-y-3">
//               {[
//                 { title: 'Master my courses & difficult concepts', desc: 'Deep breakdowns, step-by-step notes, and tutorials' },
//                 { title: 'Prepare for exams & pass with top grades', desc: 'Intensive past questions, simulated tests, and revision' },
//                 { title: 'Build consistent daily study habits', desc: 'Gamified streaks, XP challenges, and structured pacing' },
//               ].map((item, idx) => {
//                 const isSelected = goalData.goal === item.title;
//                 return (
//                   <Card
//                     key={idx}
//                     variant={isSelected ? 'bordered' : 'default'}
//                     onClick={() => setGoalData({ ...goalData, goal: item.title })}
//                     className={`cursor-pointer transition-all ${
//                       isSelected 
//                         ? 'border-[var(--color-brand-blue)] bg-blue-50/40 dark:bg-blue-950/20' 
//                         : 'hover:border-gray-300 dark:hover:border-gray-700'
//                     }`}
//                   >
//                     <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 5: AI COMPANION SETUP ================= */}
//         {currentStep === 5 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Meet Your AI Companion</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Your personal virtual tutor will guide you through tricky problems and quizzes.
//               </p>
//             </div>

//             <div className="space-y-4">
//               <Input
//                 label="AI Tutor Name"
//                 value={aiCompanion.name}
//                 onChange={(e) => setAiCompanion({ ...aiCompanion, name: e.target.value })}
//               />

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teaching Persona</label>
//                 <div className="grid grid-cols-2 gap-3">
//                   {[
//                     { id: 'Encouraging & Detailed', label: 'Encouraging & Detailed' },
//                     { id: 'Strict & Analytical', label: 'Strict & Analytical' },
//                   ].map((persona) => (
//                     <button
//                       key={persona.id}
//                       type="button"
//                       onClick={() => setAiCompanion({ ...aiCompanion, personality: persona.id })}
//                       className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
//                         aiCompanion.personality === persona.id
//                           ? 'border-[var(--color-brand-purple)] bg-purple-50 dark:bg-purple-950/30 text-[var(--color-brand-purple)]'
//                           : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
//                       }`}
//                     >
//                       {persona.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 6: COURSE UPLOAD / CURRICULUM PREVIEW ================= */}
//         {currentStep === 6 && (
//           <div className="space-y-6 text-center">
//             <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-[var(--color-brand-blue)] rounded-2xl mx-auto flex items-center justify-center">
//               <SparklesIcon className="w-8 h-8" />
//             </div>
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Your Virtual Classroom is Ready</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
//                 gleamLearn AI has indexed your academic profile and built your initial study routine.
//               </p>
//             </div>

//             <Card variant="bordered" className="text-left space-y-2 bg-gray-50/50 dark:bg-gray-900/40">
//               <div className="flex justify-between text-xs text-gray-500 font-semibold">
//                 <span>PROFILE SUMMARY</span>
//                 <span className="text-[var(--color-brand-green)]">Optimized</span>
//               </div>
//               <p className="text-sm font-bold text-gray-900 dark:text-white">{academicData.institution || 'University Undergraduate'}</p>
//               <p className="text-xs text-gray-600 dark:text-gray-400">{academicData.departmentOrSubject || 'General Studies'} • {academicData.levelOrTerm || '200 Level'}</p>
//             </Card>
//           </div>
//         )}

//         {/* ================= STEP 7: SELECT CORE SUBJECTS & FOCUS AREAS ================= */}
//         {currentStep === 7 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Select Core Courses & Topics</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Choose primary subjects you want to focus on this semester, or add custom ones.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-2.5">
//               {[
//                 'Data Structures & Algorithms',
//                 'Linear Algebra',
//                 'Database Systems',
//                 'Operating Systems',
//                 'Software Engineering',
//                 'Computer Networks',
//                 'Calculus II',
//                 'Digital Logic',
//               ].map((subj) => {
//                 const isSelected = selectedSubjects.includes(subj);
//                 return (
//                   <button
//                     key={subj}
//                     type="button"
//                     onClick={() => toggleSubject(subj)}
//                     className={`p-3 text-xs font-semibold rounded-xl border text-left transition-all ${
//                       isSelected
//                         ? 'border-[var(--color-brand-blue)] bg-blue-50 dark:bg-blue-950/30 text-[var(--color-brand-blue)]'
//                         : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
//                     }`}
//                   >
//                     {subj}
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="flex gap-2 pt-2">
//               <Input
//                 placeholder="Add custom course..."
//                 value={customSubject}
//                 onChange={(e) => setCustomSubject(e.target.value)}
//               />
//               <button
//                 type="button"
//                 onClick={() => {
//                   if (customSubject.trim()) {
//                     setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
//                     setCustomSubject('');
//                   }
//                 }}
//                 className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold"
//               >
//                 Add
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 8: PREFERRED STUDY FORMATS ================= */}
//         {currentStep === 8 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Preferred Lesson Formats</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 How do you consume educational material best during study sessions?
//               </p>
//             </div>

//             <div className="space-y-3">
//               {[
//                 { id: 'interactive', title: 'Interactive AI Chat & Q&A', desc: 'Conversational breakdown with real-time feedback' },
//                 { id: 'flashcards', title: 'Flashcards & Active Recall', desc: 'Quick-fire memory retention modules' },
//                 { id: 'summary-notes', title: 'Comprehensive Summary Notes', desc: 'Structured textbook-style chapters with examples' },
//               ].map((item) => {
//                 const isSelected = contentFormats.format === item.id;
//                 return (
//                   <Card
//                     key={item.id}
//                     variant={isSelected ? 'bordered' : 'default'}
//                     onClick={() => setContentFormats({ ...contentFormats, format: item.id })}
//                     className={`cursor-pointer transition-all ${
//                       isSelected 
//                         ? 'border-[var(--color-brand-blue)] bg-blue-50/40 dark:bg-blue-950/20' 
//                         : 'hover:border-gray-300 dark:hover:border-gray-700'
//                     }`}
//                   >
//                     <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 9: STREAK & NOTIFICATION REMINDERS ================= */}
//         {currentStep === 9 && (
//           <div className="space-y-6">
//             <div className="space-y-2">
//               <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Stay Consistent</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Set your daily study reminder so you never miss a streak milestone.
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Reminder Time</label>
//                 <div className="grid grid-cols-3 gap-3">
//                   {['07:00 AM', '01:00 PM', '08:00 PM'].map((time) => (
//                     <button
//                       key={time}
//                       type="button"
//                       onClick={() => setNotificationSettings({ ...notificationSettings, reminderTime: time })}
//                       className={`p-3 text-xs font-semibold rounded-xl border transition-all ${
//                         notificationSettings.reminderTime === time
//                           ? 'border-[var(--color-brand-blue)] bg-blue-50 dark:bg-blue-950/30 text-[var(--color-brand-blue)]'
//                           : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
//                       }`}
//                     >
//                       {time}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800">
//                 <div>
//                   <h4 className="text-sm font-bold text-gray-900 dark:text-white">Push Notifications</h4>
//                   <p className="text-xs text-gray-500 dark:text-gray-400">Receive streak warnings and quiz summaries</p>
//                 </div>
//                 <input
//                   type="checkbox"
//                   checked={notificationSettings.enablePush}
//                   onChange={(e) => setNotificationSettings({ ...notificationSettings, enablePush: e.target.checked })}
//                   className="w-5 h-5 accent-[var(--color-brand-blue)] rounded cursor-pointer"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ================= STEP 10: FINAL SUCCESS SCREEN ================= */}
//         {currentStep === 10 && (
//           <div className="space-y-6 text-center">
//             <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-[var(--color-brand-green)] rounded-3xl mx-auto flex items-center justify-center animate-bounce">
//               <CheckCircleIcon className="w-10 h-10" />
//             </div>
//             <div className="space-y-2">
//               <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">You Are All Set!</h1>
//               <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
//                 Your daily streak counter is active, your AI tutor is online, and your dashboard is fully prepared.
//               </p>
//             </div>
//           </div>
//         )}

//       </div>

//       {/* Bottom Action Button */}
//       <div className="w-full pt-4">
//         <Button 
//           variant="primary" 
//           size="lg" 
//           className="w-full shadow-lg shadow-blue-500/25" 
//           onClick={nextStep}
//           isLoading={isLoading}
//         >
//           {currentStep === totalSteps ? 'Start Learning' : 'Continue'}
//         </Button>
//       </div>

//     </main>
//   );
// }

// // --- Clean SVG Icon Components (Zero Emojis) ---

// function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 1-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3v-1.5m10.5-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 3v-1.5" />
//     </svg>
//   );
// }

// function BuildingLibraryIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
//     </svg>
//   );
// }

// function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
//     </svg>
//   );
// }

// function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
//     </svg>
//   );
// }

// function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//     </svg>
//   );
// }



// src/app/onboarding/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

// Import Modular Step Components
import StepEducationType from './components/StepEducationType';
import StepAcademicSetup from './components/StepAcademicSetup';
import StepLearningPreferences from './components/StepLearningPreferences';
import StepAcademicGoal from './components/StepAcademicGoal';
import StepAiCompanion from './components/StepAiCompanion';
import StepComplete from './components/StepComplete';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State Containers
  const [eduType, setEduType] = useState<'secondary' | 'university' | 'other'>('university');
  
  const [academicData, setAcademicData] = useState({
    institution: '',
    facultyOrClass: '',
    departmentOrSubject: '',
    levelOrTerm: '',
    semester: 'First Semester',
  });

  const [preferences, setPreferences] = useState({
    speed: 'balanced',
    studyTime: 'Evening',
    duration: '30 mins',
    explanationStyle: 'mixed',
  });

  const [goalData, setGoalData] = useState({
    goal: 'Master my courses',
    targetScore: 'A / Distinction',
    targetDate: 'End of Semester',
  });

  const [aiCompanion, setAiCompanion] = useState({
    name: 'Gleam AI',
    gender: 'Neutral',
    personality: 'Encouraging & Detailed',
    teachingStyle: 'Socratic (Question-based)',
    voice: 'Friendly',
    appearance: 'Modern Hologram',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Navigation Handlers
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 1500);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#0B0F19] px-6 py-8 max-w-lg mx-auto transition-colors duration-300">
      
      {/* Header & Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
          <button 
            type="button"
            onClick={prevStep} 
            disabled={currentStep === 1}
            className="hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-0 transition-opacity cursor-pointer"
          >
            ← Back
          </button>
          <span>STEP {currentStep} OF {totalSteps}</span>
          <span className="text-[var(--color-brand-blue)]">{progressPercentage}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-brand-blue)] rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Dynamic Step Content Rendering */}
      <div className="my-auto py-8 animate-fade-in transition-all duration-300">
        {currentStep === 1 && (
          <StepEducationType eduType={eduType} setEduType={setEduType} />
        )}
        {currentStep === 2 && (
          <StepAcademicSetup 
            eduType={eduType} 
            academicData={academicData} 
            setAcademicData={setAcademicData} 
            onSkipLater={nextStep} 
          />
        )}
        {currentStep === 3 && (
          <StepLearningPreferences preferences={preferences} setPreferences={setPreferences} />
        )}
        {currentStep === 4 && (
          <StepAcademicGoal goalData={goalData} setGoalData={setGoalData} />
        )}
        {currentStep === 5 && (
          <StepAiCompanion aiCompanion={aiCompanion} setAiCompanion={setAiCompanion} />
        )}
        {currentStep === 6 && (
          <StepComplete goalData={goalData} academicData={academicData} aiCompanion={aiCompanion} />
        )}
      </div>

      {/* Bottom Action Button */}
      <div className="w-full pt-4">
        <Button 
          type="button"
          variant="primary" 
          size="lg" 
          className="w-full shadow-lg shadow-blue-500/25 cursor-pointer" 
          onClick={nextStep}
          isLoading={isLoading}
        >
          {currentStep === totalSteps ? 'Start Learning' : 'Continue'}
        </Button>
      </div>

    </main>
  );
}