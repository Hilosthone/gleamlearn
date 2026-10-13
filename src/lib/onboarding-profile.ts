/**
 * ---------------------------------------------------------------------------
 * lib/onboarding-profile.ts — Maps the onboarding wizard to the backend fields that are really stored
 * ---------------------------------------------------------------------------
 * Verified against the running backend (PATCH /users/me/academic-profile, PATCH /users/me/preferences,
 * POST /ai-companion). Wizard answers with no backend field are listed in `notStored` so the UI can say so
 * instead of pretending they were saved.
 *
 * Kept dependency-free so it can be unit-tested with `node --test`.
 */

export type EducationChoice = 'secondary' | 'university' | 'other';

export interface OnboardingAnswers {
  eduType: EducationChoice;
  academic: { institution: string; facultyOrClass: string; departmentOrSubject: string; levelOrTerm: string; semester: string };
  preferences: { speed: string; studyTime: string; duration: string; explanationStyle: string };
  goal: { goal: string; targetScore: string; targetDate: string };
  companion: { name: string; gender: string; personality: string; teachingStyle: string; voice: string; appearance: string };
}

export interface OnboardingRequests {
  academicProfile: Record<string, string>;
  preferences: Record<string, string>;
  companion: Record<string, string>;
  /** Human-readable names of answers the backend has no field for. */
  notStored: string[];
}

const clean = (obj: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (v ?? '').trim()]).filter(([, v]) => v)) as Record<string, string>;

export function buildOnboardingRequests(a: OnboardingAnswers): OnboardingRequests {
  const { academic: ac } = a;
  const notStored = ['Learning speed', 'Session length', 'Explanation style'];
  let academicProfile: Record<string, string>;

  if (a.eduType === 'university') {
    academicProfile = clean({
      educationType: 'University',
      university: ac.institution,
      faculty: ac.facultyOrClass,
      department: ac.departmentOrSubject,
      levelOrClass: ac.levelOrTerm, // stored in the `level` column
    });
    notStored.push('Semester');
  } else if (a.eduType === 'secondary') {
    academicProfile = clean({
      educationType: 'Secondary',
      secondarySchool: ac.institution,
      levelOrClass: ac.facultyOrClass, // the class, e.g. SS3
    });
    if (ac.levelOrTerm.trim()) notStored.push('Academic session / term');
    if (ac.departmentOrSubject.trim()) notStored.push('Core subjects');
  } else {
    academicProfile = clean({ educationType: 'Other' });
  }

  const goalText = [a.goal.goal, a.goal.targetScore && `target ${a.goal.targetScore}`, a.goal.targetDate && `by ${a.goal.targetDate}`]
    .filter((p) => p && p.trim())
    .join(', ');
  if (goalText) academicProfile.examAimOrGoals = goalText.slice(0, 250);

  return {
    academicProfile,
    preferences: clean({ preferredStudyTime: a.preferences.studyTime }),
    companion: clean({
      name: a.companion.name,
      gender: a.companion.gender,
      personality: a.companion.personality,
      teachingStyle: a.companion.teachingStyle,
      voice: a.companion.voice,
      appearance: a.companion.appearance,
    }),
    notStored,
  };
}
