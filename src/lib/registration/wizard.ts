/**
 * ---------------------------------------------------------------------------
 * lib/registration/wizard.ts — Adaptive registration wizard: state, validation, payload
 * ---------------------------------------------------------------------------
 * Contract (backend SignupDto, verified 2026-10-12/20 against src/auth/dto/signup.dto.ts + live HTTP):
 *   required: fullName, username, email (IsEmail), password (MinLength 6), confirmPassword (must match)
 *   optional strings: dateOfBirth, country, educationType, secondarySchool, secondaryClass, secondaryStream,
 *                     university, faculty, department, courseOfStudy, level, examAimOrGoals, preferredStudyTime
 *   educationType is documented as 'Secondary' | 'University'. There is NO examination-preparation value:
 *   exam learners are sent WITHOUT educationType (not misclassified) and their exams/goals go into
 *   examAimOrGoals — see docs/REGISTRATION.md "Backend gaps".
 * Column limits (users table): fullName 150, username 100, email 255, country 100.
 *
 * Passwords live in a separate `Secrets` object that is never serialized (see draft.ts).
 * Kept free of path aliases so it can be unit-tested with `node --test`.
 */

export type LearnerPath = 'secondary' | 'university' | 'exam';

export const STEPS = ['path', 'personal', 'security', 'education', 'goals', 'review'] as const;
export type StepId = (typeof STEPS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  path: 'Your path',
  personal: 'About you',
  security: 'Security',
  education: 'Education',
  goals: 'Goals',
  review: 'Review',
};

export const PATH_INFO: Record<LearnerPath, { title: string; description: string; educationStepLabel: string }> = {
  secondary: { title: 'Secondary school student', description: 'JSS or SSS — classes, subjects and school exams.', educationStepLabel: 'Your school' },
  university: { title: 'University student', description: 'Undergraduate courses, faculties and semester exams.', educationStepLabel: 'Your university' },
  exam: { title: 'Preparing for an examination', description: 'WAEC, NECO, JAMB/UTME, Post-UTME and similar — in or out of school.', educationStepLabel: 'Your exams' },
};

/** Common examinations offered as quick picks (examples given by the product owner; learners can add others). */
export const EXAM_SUGGESTIONS = ['WAEC', 'NECO', 'JAMB/UTME', 'Post-UTME'] as const;

/** Preferred study time options (free-text field on the backend; these match the existing onboarding choices). */
export const STUDY_TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

/** Non-secret wizard values. Everything here may be kept in a draft (draft.ts allowlists the same keys). */
export interface RegistrationValues {
  path: LearnerPath | null;
  fullName: string;
  username: string;
  email: string;
  dateOfBirth: string; // yyyy-mm-dd or ''
  country: string;
  // secondary
  secondarySchool: string;
  secondaryClass: string;
  secondaryStream: string;
  // university
  university: string;
  faculty: string;
  department: string;
  courseOfStudy: string;
  level: string;
  // examination preparation
  exams: string[];
  examTimeframe: string;
  subjects: string;
  // goals & preferences (all paths)
  goals: string;
  preferredStudyTime: string;
  termsAccepted: boolean;
}

/** Never persisted, never logged, never put in a URL. */
export interface Secrets {
  password: string;
  confirmPassword: string;
}

export const EMPTY_VALUES: RegistrationValues = {
  path: null,
  fullName: '',
  username: '',
  email: '',
  dateOfBirth: '',
  country: '',
  secondarySchool: '',
  secondaryClass: '',
  secondaryStream: '',
  university: '',
  faculty: '',
  department: '',
  courseOfStudy: '',
  level: '',
  exams: [],
  examTimeframe: '',
  subjects: '',
  goals: '',
  preferredStudyTime: '',
  termsAccepted: false,
};

export const EMPTY_SECRETS: Secrets = { password: '', confirmPassword: '' };

export const PASSWORD_MIN = 6; // backend MinLength(6)
export const LIMITS = { fullName: 150, username: 100, email: 255, country: 100, text: 200, goals: 500 } as const;

export type FieldErrors = Partial<Record<keyof RegistrationValues | keyof Secrets, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function tooLong(value: string, max: number, label: string): string | undefined {
  return value.trim().length > max ? `${label} must be at most ${max} characters.` : undefined;
}

/** Age in whole years on `today` for a yyyy-mm-dd date (NaN when invalid). */
export function ageOn(dateOfBirth: string, today: Date = new Date()): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!m) return NaN;
  const dob = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (dob.getMonth() !== Number(m[2]) - 1) return NaN; // e.g. 2010-02-31
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
}

/** Validation for one step. Rules marked "product" are UX rules; the rest mirror the backend contract. */
export function validateStep(step: StepId, v: RegistrationValues, s: Secrets, today: Date = new Date()): FieldErrors {
  const e: FieldErrors = {};
  switch (step) {
    case 'path':
      if (!v.path) e.path = 'Choose the option that best describes you.';
      break;
    case 'personal': {
      if (!v.fullName.trim()) e.fullName = 'Enter your full name.';
      else e.fullName = tooLong(v.fullName, LIMITS.fullName, 'Full name');
      if (!v.username.trim()) e.username = 'Choose a username.';
      else e.username = tooLong(v.username, LIMITS.username, 'Username');
      if (!v.email.trim()) e.email = 'Enter your email address.';
      else if (!EMAIL.test(v.email.trim())) e.email = 'Enter a valid email address, like name@example.com.';
      else e.email = tooLong(v.email, LIMITS.email, 'Email');
      if (v.dateOfBirth) {
        const age = ageOn(v.dateOfBirth, today);
        if (Number.isNaN(age)) e.dateOfBirth = 'Enter a valid date of birth.';
        else if (age < 0) e.dateOfBirth = 'Date of birth cannot be in the future.';
        else if (age > 120) e.dateOfBirth = 'Check the year of your date of birth.';
      }
      e.country = tooLong(v.country, LIMITS.country, 'Country');
      break;
    }
    case 'security':
      if (s.password.length < PASSWORD_MIN) e.password = `Use at least ${PASSWORD_MIN} characters.`;
      if (!s.confirmPassword) e.confirmPassword = 'Confirm your password.';
      else if (s.password !== s.confirmPassword) e.confirmPassword = 'Passwords do not match.';
      if (!v.termsAccepted) e.termsAccepted = 'Accept the Terms of Service and Privacy Policy to continue.';
      break;
    case 'education':
      if (v.path === 'secondary') {
        if (!v.secondaryClass.trim()) e.secondaryClass = 'Choose your current class.'; // product rule
        e.secondarySchool = tooLong(v.secondarySchool, LIMITS.text, 'School name');
      } else if (v.path === 'university') {
        if (!v.university.trim()) e.university = 'Enter your university or institution.'; // product rule
        for (const k of ['university', 'faculty', 'department', 'courseOfStudy'] as const) {
          e[k] = e[k] ?? tooLong(v[k], LIMITS.text, 'This field');
        }
      } else if (v.path === 'exam') {
        if (cleanExams(v.exams).length === 0) e.exams = 'Choose or add at least one examination.'; // product rule
        e.subjects = tooLong(v.subjects, LIMITS.text, 'Subjects');
      } else {
        e.path = 'Choose your learning path first.';
      }
      break;
    case 'goals':
      e.goals = tooLong(v.goals, LIMITS.goals, 'Goals');
      break;
    case 'review':
      for (const step of STEPS.slice(0, -1)) Object.assign(e, validateStep(step, v, s, today));
      break;
  }
  for (const k of Object.keys(e) as Array<keyof FieldErrors>) if (!e[k]) delete e[k];
  return e;
}

export function hasErrors(e: FieldErrors): boolean {
  return Object.keys(e).length > 0;
}

/** First step (in order) that has an error — where "Review" sends the learner to fix things. */
export function firstInvalidStep(v: RegistrationValues, s: Secrets, today: Date = new Date()): StepId | null {
  for (const step of STEPS.slice(0, -1)) if (hasErrors(validateStep(step, v, s, today))) return step;
  return null;
}

export function cleanExams(exams: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of exams) {
    const name = raw.trim().slice(0, 60);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      out.push(name);
    }
  }
  return out.slice(0, 8);
}

/** Text stored in examAimOrGoals (the only backend field for goals and target exams). */
export function composeAimsAndGoals(v: RegistrationValues): string {
  const parts: string[] = [];
  const exams = cleanExams(v.exams);
  if (v.path === 'exam') {
    if (exams.length) parts.push(`Preparing for: ${exams.join(', ')}`);
    if (v.examTimeframe.trim()) parts.push(`Exam timeframe: ${v.examTimeframe.trim()}`);
    if (v.subjects.trim()) parts.push(`Subjects: ${v.subjects.trim()}`);
  }
  if (v.goals.trim()) parts.push(`Goals: ${v.goals.trim()}`);
  return parts.join(' · ').slice(0, 1000);
}

/** Exactly what POST /auth/signup receives: an explicit object built from validated values, per path. */
export interface SignupBody {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  country?: string;
  educationType?: 'Secondary' | 'University';
  secondarySchool?: string;
  secondaryClass?: string;
  secondaryStream?: string;
  university?: string;
  faculty?: string;
  department?: string;
  courseOfStudy?: string;
  level?: string;
  examAimOrGoals?: string;
  preferredStudyTime?: string;
}

export function buildSignupPayload(v: RegistrationValues, s: Secrets): SignupBody {
  const opt = (value: string) => (value.trim() ? value.trim() : undefined);
  const body: SignupBody = {
    fullName: v.fullName.trim(),
    username: v.username.trim(),
    email: v.email.trim(),
    password: s.password,
    confirmPassword: s.confirmPassword,
    dateOfBirth: opt(v.dateOfBirth),
    country: opt(v.country),
    preferredStudyTime: opt(v.preferredStudyTime),
    examAimOrGoals: opt(composeAimsAndGoals(v)),
  };
  if (v.path === 'secondary') {
    Object.assign(body, {
      educationType: 'Secondary',
      secondarySchool: opt(v.secondarySchool),
      secondaryClass: opt(v.secondaryClass),
      secondaryStream: opt(v.secondaryStream),
    });
  } else if (v.path === 'university') {
    Object.assign(body, {
      educationType: 'University',
      university: opt(v.university),
      faculty: opt(v.faculty),
      department: opt(v.department),
      courseOfStudy: opt(v.courseOfStudy),
      level: opt(v.level),
    });
  }
  // 'exam': no educationType (the backend has no such value yet) and no school/university fields.
  for (const k of Object.keys(body) as Array<keyof SignupBody>) if (body[k] === undefined) delete body[k];
  return body;
}

/** Summary rows for the review step: only the selected path's fields, empty ones omitted. */
export function reviewSections(v: RegistrationValues): Array<{ step: StepId; title: string; rows: Array<[string, string]> }> {
  const rows = (pairs: Array<[string, string]>) => pairs.filter(([, value]) => value.trim());
  const sections: Array<{ step: StepId; title: string; rows: Array<[string, string]> }> = [
    { step: 'path', title: 'Learning path', rows: v.path ? [['Path', PATH_INFO[v.path].title]] : [] },
    { step: 'personal', title: 'About you', rows: rows([['Full name', v.fullName], ['Username', v.username], ['Email', v.email], ['Date of birth', v.dateOfBirth], ['Country', v.country]]) },
    { step: 'security', title: 'Security', rows: [['Password', '•••••••• (set)'], ['Terms', v.termsAccepted ? 'Accepted' : 'Not accepted']] },
  ];
  if (v.path === 'secondary') {
    sections.push({ step: 'education', title: 'School', rows: rows([['School', v.secondarySchool], ['Class', v.secondaryClass], ['Stream', v.secondaryStream]]) });
  } else if (v.path === 'university') {
    sections.push({ step: 'education', title: 'University', rows: rows([['University', v.university], ['Faculty', v.faculty], ['Department', v.department], ['Course', v.courseOfStudy], ['Level', v.level]]) });
  } else if (v.path === 'exam') {
    sections.push({ step: 'education', title: 'Examinations', rows: rows([['Exams', cleanExams(v.exams).join(', ')], ['Timeframe', v.examTimeframe], ['Subjects', v.subjects]]) });
  }
  sections.push({ step: 'goals', title: 'Goals & preferences', rows: rows([['Goals', v.goals], ['Preferred study time', v.preferredStudyTime]]) });
  return sections;
}
