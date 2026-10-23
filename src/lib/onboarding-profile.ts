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
    // 'other': the backend documents only 'Secondary' | 'University', so no educationType is sent
    academicProfile = {};
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


// ---------------------------------------------------------------------------------------------------------
// Onboarding after registration: do not ask again for what the learner already gave at sign-up
// ---------------------------------------------------------------------------------------------------------

/** Onboarding step numbers: 1 education type, 2 academic setup, 3 preferences, 4 goal, 5 AI companion, 6 done. */
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;
export const ALL_ONBOARDING_STEPS: OnboardingStep[] = [1, 2, 3, 4, 5, 6];

export interface ProfileSnapshot {
  educationType?: string | null;
  secondaryClass?: string | null;
  university?: string | null;
  examAimOrGoals?: string | null;
  preferredStudyTime?: string | null;
}

const filled = (v: unknown) => typeof v === 'string' && v.trim().length > 0;

/** Steps still worth showing, from the profile returned by GET /auth/me. The companion and finish steps always remain. */
export function onboardingPlan(profile: ProfileSnapshot | null | undefined): OnboardingStep[] {
  if (!profile) return ALL_ONBOARDING_STEPS;
  const hasEducation = filled(profile.educationType) || filled(profile.secondaryClass) || filled(profile.university) || filled(profile.examAimOrGoals);
  return ALL_ONBOARDING_STEPS.filter((step) => {
    if ((step === 1 || step === 2) && hasEducation) return false;
    if (step === 3 && filled(profile.preferredStudyTime)) return false;
    if (step === 4 && filled(profile.examAimOrGoals)) return false;
    return true;
  });
}

/** Keeps only the answers from steps that were actually shown, so skipped (pre-filled) data is never overwritten. */
export function onlyShownAnswers(req: OnboardingRequests, plan: OnboardingStep[]): OnboardingRequests {
  const shown = new Set(plan);
  const academicProfile: Record<string, string> = {};
  if (shown.has(1) || shown.has(2)) Object.assign(academicProfile, req.academicProfile);
  delete academicProfile.examAimOrGoals;
  if (shown.has(4) && req.academicProfile.examAimOrGoals) academicProfile.examAimOrGoals = req.academicProfile.examAimOrGoals;
  return {
    academicProfile,
    preferences: shown.has(3) ? req.preferences : {},
    companion: shown.has(5) ? req.companion : {},
    notStored: req.notStored,
  };
}
