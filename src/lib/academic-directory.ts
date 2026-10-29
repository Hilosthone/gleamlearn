/**
 * ---------------------------------------------------------------------------------------------------------------
 * lib/academic-directory.ts — Suggestions for the profile's school details (GET /institutions, GET /academic-levels)
 * ---------------------------------------------------------------------------------------------------------------
 * Backend contract (verified 2026-10-29):
 *   GET /institutions    → [{ id, name, type: 'Secondary' | 'University' | 'Institute', faculties: [{ id, name,
 *                            departments: [{ id, name }] }] }]  (the directory admins maintain; may be empty)
 *   GET /academic-levels → { secondaryLevels, universityLevels, secondaryStreams } (string lists)
 * The profile keeps free text (the directory can be incomplete); these only suggest the standard spelling, which is
 * what the school, university and department leaderboards match on.
 */
import { academicApi } from './api.ts';
import type { Track } from './profile.ts';

export interface Department {
  name: string;
}
export interface Faculty {
  name: string;
  departments: Department[];
}
export interface Institution {
  name: string;
  type: string;
  faculties: Faculty[];
}
export interface AcademicLevels {
  secondaryLevels: string[];
  universityLevels: string[];
  secondaryStreams: string[];
}

type Raw = Record<string, unknown>;
const list = (v: unknown): Raw[] => (Array.isArray(v) ? v : []).map((x) => (x ?? {}) as Raw);
const named = (r: Raw) => typeof r.name === 'string' && r.name.trim() !== '';
const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);

export function toInstitutions(res: unknown): Institution[] {
  return list(res)
    .filter(named)
    .map((i) => ({
      name: (i.name as string).trim(),
      type: typeof i.type === 'string' ? i.type : '',
      faculties: list(i.faculties)
        .filter(named)
        .map((f) => ({ name: (f.name as string).trim(), departments: list(f.departments).filter(named).map((d) => ({ name: (d.name as string).trim() })) })),
    }));
}

export function toLevels(res: unknown): AcademicLevels {
  const r = (res ?? {}) as Raw;
  return { secondaryLevels: strings(r.secondaryLevels), universityLevels: strings(r.universityLevels), secondaryStreams: strings(r.secondaryStreams) };
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const sorted = (names: string[]) => [...new Set(names)].sort((a, b) => a.localeCompare(b));

/** Suggestions for each field, narrowed by what is already chosen (university → its faculties → their departments). */
export function suggestionsFor(dir: Institution[], track: Track, chosen: { school: string; university: string; faculty: string }) {
  const schools = dir.filter((i) => i.type === 'Secondary');
  const universities = dir.filter((i) => i.type === 'University' || i.type === 'Institute');
  const uni = universities.find((u) => same(u.name, chosen.university));
  const faculties = uni ? uni.faculties : universities.flatMap((u) => u.faculties);
  const faculty = faculties.find((f) => same(f.name, chosen.faculty));
  const departments = (faculty ? [faculty] : faculties).flatMap((f) => f.departments);
  return {
    schools: track === 'Secondary' ? sorted(schools.map((s) => s.name)) : [],
    universities: track === 'University' ? sorted(universities.map((u) => u.name)) : [],
    faculties: track === 'University' ? sorted(faculties.map((f) => f.name)) : [],
    departments: track === 'University' ? sorted(departments.map((d) => d.name)) : [],
  };
}

export async function loadAcademicDirectory(): Promise<{ institutions: Institution[]; levels: AcademicLevels }> {
  const [institutions, levels] = await Promise.all([academicApi.getInstitutions(), academicApi.getAcademicLevels()]);
  return { institutions: toInstitutions(institutions), levels: toLevels(levels) };
}
