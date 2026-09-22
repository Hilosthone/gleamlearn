// //StepEducation
// 'use client';

// import React from 'react';
// import { Card } from '@/components/ui/Card';

// interface StepEducationTypeProps {
//   eduType: 'secondary' | 'university' | 'other';
//   setEduType: (type: 'secondary' | 'university' | 'other') => void;
// }

// export default function StepEducationType({ eduType, setEduType }: StepEducationTypeProps) {
//   const options = [
//     { id: 'secondary', title: 'Secondary School', desc: 'Junior or Senior Secondary (SS1-SS3, WAEC, JAMB)' },
//     { id: 'university', title: 'University / Polytechnic', desc: 'Undergraduate degree, diploma, or college' },
//     { id: 'other', title: 'Other / Self-Taught', desc: 'Personal upskilling, bootcamps, or professional exams' },
//   ] as const;

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">What are you currently studying?</h1>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           We dynamically configure your virtual classrooms to match your academic track.
//         </p>
//       </div>

//       <div className="space-y-3">
//         {options.map((item) => {
//           const isSelected = eduType === item.id;
//           return (
//             <Card
//               key={item.id}
//               variant={isSelected ? 'bordered' : 'default'}
//               onClick={() => setEduType(item.id)}
//               className={`cursor-pointer transition-all ${
//                 isSelected 
//                   ? 'border-[var(--color-brand-blue)] bg-blue-50/40 dark:bg-blue-950/20 shadow-sm' 
//                   : 'hover:border-gray-300 dark:hover:border-gray-700'
//               }`}
//             >
//               <div>
//                 <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
//               </div>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

interface StepEducationTypeProps {
  eduType: 'secondary' | 'university' | 'other';
  setEduType: (type: 'secondary' | 'university' | 'other') => void;
}

export default function StepEducationType({ eduType, setEduType }: StepEducationTypeProps) {
  const options = [
    { id: 'secondary', title: 'Secondary School', desc: 'Junior or Senior Secondary (SS1-SS3, WAEC, JAMB)' },
    { id: 'university', title: 'University / Polytechnic', desc: 'Undergraduate degree, diploma, or college' },
    { id: 'other', title: 'Other / Self-Taught', desc: 'Personal upskilling, bootcamps, or professional exams' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">What are you currently studying?</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We dynamically configure your virtual classrooms to match your academic track.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((item) => {
          const isSelected = eduType === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setEduType(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-[var(--color-brand-blue)] bg-blue-50/70 dark:bg-blue-950/40 shadow-sm'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div>
                <h3 className={`font-bold ${isSelected ? 'text-[var(--color-brand-blue)] dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>

              {/* Radio check indicator */}
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
    </div>
  );
}