// 'use client';

// import React from 'react';
// import { Card } from '@/components/ui/Card';
// import { Input } from '@/components/ui/Input';

// interface StepAcademicGoalProps {
//   goalData: {
//     goal: string;
//     targetScore: string;
//     targetDate: string;
//   };
//   setGoalData: React.Dispatch<React.SetStateAction<any>>;
// }

// export default function StepAcademicGoal({ goalData, setGoalData }: StepAcademicGoalProps) {
//   const goals = [
//     'Pass my exams',
//     'Prepare for JAMB / UTME',
//     'Score higher / Distinction',
//     'Master my courses',
//     'Build consistent study habits',
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Primary Academic Goal</h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           What is your core target for using gleamLearn?
//         </p>
//       </div>

//       <div className="space-y-2.5">
//         {goals.map((item) => {
//           const isSelected = goalData.goal === item;
//           return (
//             <Card
//               key={item}
//               variant={isSelected ? 'bordered' : 'default'}
//               onClick={() => setGoalData({ ...goalData, goal: item })}
//               className={`cursor-pointer transition-all py-3 px-4 ${
//                 isSelected 
//                   ? 'border-[var(--color-brand-blue)] bg-blue-50/40 dark:bg-blue-950/20 shadow-sm' 
//                   : 'hover:border-gray-300 dark:hover:border-gray-700'
//               }`}
//             >
//               <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{item}</h3>
//             </Card>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-2 gap-3 pt-2">
//         <Input
//           label="Target Score / Grade"
//           placeholder="e.g. A / 300+ in JAMB"
//           value={goalData.targetScore}
//           onChange={(e) => setGoalData({ ...goalData, targetScore: e.target.value })}
//         />
//         <Input
//           label="Target Date"
//           placeholder="e.g. End of Semester"
//           value={goalData.targetDate}
//           onChange={(e) => setGoalData({ ...goalData, targetDate: e.target.value })}
//         />
//       </div>
//     </div>
//   );
// }


'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';

interface StepAcademicGoalProps {
  goalData: {
    goal: string;
    targetScore: string;
    targetDate: string;
  };
  setGoalData: React.Dispatch<React.SetStateAction<any>>;
}

export default function StepAcademicGoal({ goalData, setGoalData }: StepAcademicGoalProps) {
  const goals = [
    'Pass my exams',
    'Prepare for JAMB / UTME',
    'Score higher / Distinction',
    'Master my courses',
    'Build consistent study habits',
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Primary Academic Goal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          What is your core target for using gleamLearn?
        </p>
      </div>

      <div className="space-y-2.5">
        {goals.map((item) => {
          const isSelected = goalData.goal === item;
          return (
            <div
              key={item}
              onClick={() => setGoalData({ ...goalData, goal: item })}
              className={`py-3 px-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isSelected 
                  ? 'border-[var(--color-brand-blue)] bg-blue-50/70 dark:bg-blue-950/40 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <h3 className={`font-semibold text-sm ${
                isSelected ? 'text-[var(--color-brand-blue)] dark:text-blue-400 font-bold' : 'text-gray-900 dark:text-white'
              }`}>
                {item}
              </h3>

              {/* Radio Check Indicator */}
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'border-[var(--color-brand-blue)] bg-[var(--color-brand-blue)] text-white' 
                  : 'border-gray-300 dark:border-gray-700 bg-transparent'
              }`}>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Input
          label="Target Score / Grade"
          placeholder="e.g. A / 300+ in JAMB"
          value={goalData.targetScore}
          onChange={(e) => setGoalData({ ...goalData, targetScore: e.target.value })}
        />
        <Input
          label="Target Date"
          placeholder="e.g. End of Semester"
          value={goalData.targetDate}
          onChange={(e) => setGoalData({ ...goalData, targetDate: e.target.value })}
        />
      </div>
    </div>
  );
}