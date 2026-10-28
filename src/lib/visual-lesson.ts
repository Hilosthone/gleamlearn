/**
 * ---------------------------------------------------------------------------------------------------------------
 * lib/visual-lesson.ts — interactive visual lessons (learning resources of kind "visual_lesson")
 * ---------------------------------------------------------------------------------------------------------------
 * The AI service returns a structured lesson whose steps may carry a visual from a CLOSED registry; the backend
 * validates it (src/learning/visual-lesson.ts) and stores it as JSON. This module validates it a third time and
 * prepares render data. A visual is only data for one of the renderers in components/visual: nothing from the AI is
 * executed — graphs are sampled from fixed formula families here, molecules are laid out here.
 */

import { aiTutorApi } from './api.ts';

export const VISUAL_TYPES = ['shape3d', 'molecule', 'graph2d', 'vectors', 'orbit', 'wave', 'flow', 'labeled'] as const;
export type VisualType = (typeof VISUAL_TYPES)[number];
const SHAPES = ['cube', 'cuboid', 'sphere', 'cylinder', 'cone', 'pyramid', 'torus', 'prism'] as const;
const FAMILIES = ['linear', 'quadratic', 'cubic', 'sine', 'cosine', 'exponential', 'logarithmic', 'absolute'] as const;
export const ELEMENT_COLORS: Record<string, string> = {
  H: '#e5e7eb', C: '#374151', N: '#3b82f6', O: '#ef4444', F: '#22c55e', P: '#f97316', S: '#eab308', Cl: '#16a34a', Br: '#b45309', I: '#7c3aed',
  Na: '#a855f7', K: '#8b5cf6', Mg: '#10b981', Ca: '#64748b', Fe: '#c2410c', Cu: '#d97706', Zn: '#94a3b8', Al: '#cbd5e1', Si: '#a16207', B: '#f472b6',
  Li: '#c084fc', He: '#67e8f9', Ne: '#f0abfc', Ar: '#7dd3fc',
};

export type Visual =
  | { type: 'shape3d'; caption: string; shape: (typeof SHAPES)[number]; labels: string[]; dimensions: Record<string, number> }
  | { type: 'molecule'; caption: string; name: string; atoms: { id: string; element: string }[]; bonds: { a: string; b: string; order: number }[] }
  | { type: 'graph2d'; caption: string; family: (typeof FAMILIES)[number]; a: number; b: number; c: number; d: number; xMin: number; xMax: number; xLabel: string; yLabel: string; points: { x: number; y: number; label: string }[] }
  | { type: 'vectors'; caption: string; vectors: { x: number; y: number; z: number; label: string }[]; showResultant: boolean }
  | { type: 'orbit'; caption: string; center: string; bodies: { label: string; radius: number; period: number }[] }
  | { type: 'wave'; caption: string; amplitude: number; wavelength: number; waves: number; label: string }
  | { type: 'flow'; caption: string; nodes: { id: string; label: string }[]; edges: { from: string; to: string; label: string }[]; cycle: boolean }
  | { type: 'labeled'; caption: string; subject: string; parts: { label: string; description: string }[] };

export interface VisualLessonStep {
  title: string;
  explanation: string;
  visual: Visual | null;
}
export interface VisualLesson {
  title: string;
  summary: string;
  steps: VisualLessonStep[];
  keyTakeaways: string[];
  /** "topic": taught from general knowledge (no learner material) */
  basis: 'material' | 'topic';
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Raw) : null);
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown, lo: number, hi: number, d: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
const arr = (v: unknown, max: number) => (Array.isArray(v) ? v.slice(0, max) : []);
const objs = (v: unknown, max: number) => arr(v, max).map(obj).filter((x): x is Raw => !!x);
const oneOf = <T extends string>(v: unknown, xs: readonly T[]): T | null => (typeof v === 'string' && (xs as readonly string[]).includes(v) ? (v as T) : null);

/** Re-validates one visual; anything outside the registry becomes null (the step then shows text only). */
export function toVisual(raw: unknown): Visual | null {
  const v = obj(raw);
  const type = oneOf(v?.type, VISUAL_TYPES);
  if (!v || !type) return null;
  const caption = str(v.caption, 200);
  switch (type) {
    case 'shape3d': {
      const shape = oneOf(v.shape, SHAPES);
      if (!shape) return null;
      const dims = obj(v.dimensions) ?? {};
      return { type, caption, shape, labels: arr(v.labels, 6).map((l) => str(l, 60)).filter(Boolean), dimensions: Object.fromEntries(Object.entries(dims).slice(0, 4).map(([k, d]) => [str(k, 24), num(d, 0.1, 100, 1)]).filter(([k]) => k)) };
    }
    case 'molecule': {
      const atoms = objs(v.atoms, 24).map((a) => ({ id: str(a.id, 24), element: str(a.element, 2) })).filter((a) => a.id && ELEMENT_COLORS[a.element]);
      const ids = new Set(atoms.map((a) => a.id));
      if (!atoms.length || ids.size !== atoms.length) return null;
      const bonds = objs(v.bonds, 40).map((b) => ({ a: str(b.a, 24), b: str(b.b, 24), order: Math.round(num(b.order, 1, 3, 1)) })).filter((b) => ids.has(b.a) && ids.has(b.b) && b.a !== b.b);
      return { type, caption, name: str(v.name, 80), atoms, bonds };
    }
    case 'graph2d': {
      const family = oneOf(v.family, FAMILIES);
      if (!family) return null;
      let xMin = num(v.xMin, -100, 100, -10);
      let xMax = num(v.xMax, -100, 100, 10);
      if (xMax <= xMin) [xMin, xMax] = [-10, 10];
      return { type, caption, family, a: num(v.a, -100, 100, 1), b: num(v.b, -100, 100, 0), c: num(v.c, -100, 100, 0), d: num(v.d, -100, 100, 0), xMin, xMax, xLabel: str(v.xLabel, 30), yLabel: str(v.yLabel, 30), points: objs(v.points, 8).map((p) => ({ x: num(p.x, -1000, 1000, 0), y: num(p.y, -1000, 1000, 0), label: str(p.label, 40) })) };
    }
    case 'vectors': {
      const vectors = objs(v.vectors, 8).map((a) => ({ x: num(a.x, -10, 10, 0), y: num(a.y, -10, 10, 0), z: num(a.z, -10, 10, 0), label: str(a.label, 40) })).filter((a) => a.x || a.y || a.z);
      return vectors.length ? { type, caption, vectors, showResultant: v.showResultant === true } : null;
    }
    case 'orbit': {
      const bodies = objs(v.bodies, 8).map((b) => ({ label: str(b.label, 40), radius: num(b.radius, 1, 10, 3), period: num(b.period, 1, 60, 10) })).filter((b) => b.label);
      return bodies.length ? { type, caption, center: str(v.center, 40) || 'Centre', bodies } : null;
    }
    case 'wave':
      return { type, caption, amplitude: num(v.amplitude, 0.1, 5, 1), wavelength: num(v.wavelength, 0.5, 20, 4), waves: Math.round(num(v.waves, 1, 6, 1)), label: str(v.label, 60) };
    case 'flow': {
      const nodes = objs(v.nodes, 12).map((n) => ({ id: str(n.id, 24), label: str(n.label, 60) })).filter((n) => n.id && n.label);
      const ids = new Set(nodes.map((n) => n.id));
      if (nodes.length < 2 || ids.size !== nodes.length) return null;
      return { type, caption, nodes, edges: objs(v.edges, 20).map((e) => ({ from: str(e.from, 24), to: str(e.to, 24), label: str(e.label, 40) })).filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to), cycle: v.cycle === true };
    }
    case 'labeled': {
      const parts = objs(v.parts, 10).map((p) => ({ label: str(p.label, 50), description: str(p.description, 200) })).filter((p) => p.label);
      return parts.length ? { type, caption, subject: str(v.subject, 60), parts } : null;
    }
  }
}

/** Parses a stored lesson (resource content). Throws when it is not a usable lesson. */
export function parseVisualLesson(content: string): VisualLesson {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new Error('This visual lesson could not be read.');
  }
  const r = obj(raw);
  const steps = objs(r?.steps, 10).map((s) => ({ title: str(s.title, 120), explanation: txt(s.explanation, 2500), visual: toVisual(s.visual) })).filter((s) => s.title && s.explanation);
  if (!r || steps.length < 2) throw new Error('This visual lesson could not be read.');
  return { title: str(r.title, 200), summary: txt(r.summary, 1200), steps, keyTakeaways: arr(r.keyTakeaways, 8).map((k) => str(k, 200)).filter(Boolean), basis: r.basis === 'topic' ? 'topic' : 'material' };
}

// --------------------------------------------------------------------------------------------- render helpers

/** y = a·f(b·x + c) + d for a fixed family (b = 0 is treated as 1). No expression is ever evaluated. */
export function familyValue(g: Extract<Visual, { type: 'graph2d' }>, x: number): number | null {
  const b = g.b || 1;
  const u = b * x + g.c;
  const f: Record<string, (u: number) => number> = {
    linear: (u) => u,
    quadratic: (u) => u * u,
    cubic: (u) => u * u * u,
    sine: Math.sin,
    cosine: Math.cos,
    exponential: Math.exp,
    logarithmic: (u) => (u > 0 ? Math.log(u) : NaN),
    absolute: Math.abs,
  };
  const y = g.a * f[g.family](u) + g.d;
  return Number.isFinite(y) && Math.abs(y) < 1e6 ? y : null;
}

export function samplePath(g: Extract<Visual, { type: 'graph2d' }>, samples = 160): { x: number; y: number | null }[] {
  return Array.from({ length: samples + 1 }, (_, i) => {
    const x = g.xMin + ((g.xMax - g.xMin) * i) / samples;
    return { x, y: familyValue(g, x) };
  });
}

/**
 * Deterministic 3D layout for a molecule: a small spring simulation from fixed seeds (bonded atoms attract at bond
 * length, all atoms repel), so the same molecule always looks the same.
 */
export function layoutMolecule(m: Extract<Visual, { type: 'molecule' }>, iterations = 250): Record<string, [number, number, number]> {
  const n = m.atoms.length;
  const pos = m.atoms.map((_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    return [Math.cos(theta) * Math.sin(phi) * 1.5, Math.sin(theta) * Math.sin(phi) * 1.5, Math.cos(phi) * 1.5];
  });
  const idx = new Map(m.atoms.map((a, i) => [a.id, i]));
  for (let it = 0; it < iterations; it++) {
    const force = pos.map(() => [0, 0, 0]);
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const d = [0, 1, 2].map((k) => pos[i][k] - pos[j][k]);
        const dist = Math.max(0.1, Math.hypot(...d));
        const rep = 0.6 / (dist * dist);
        for (let k = 0; k < 3; k++) {
          force[i][k] += (d[k] / dist) * rep;
          force[j][k] -= (d[k] / dist) * rep;
        }
      }
    for (const bnd of m.bonds) {
      const i = idx.get(bnd.a)!;
      const j = idx.get(bnd.b)!;
      const d = [0, 1, 2].map((k) => pos[j][k] - pos[i][k]);
      const dist = Math.max(0.01, Math.hypot(...d));
      const pull = (dist - 1.2) * 0.3;
      for (let k = 0; k < 3; k++) {
        force[i][k] += (d[k] / dist) * pull;
        force[j][k] -= (d[k] / dist) * pull;
      }
    }
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) pos[i][k] += Math.max(-0.2, Math.min(0.2, force[i][k]));
  }
  const centre = [0, 1, 2].map((k) => pos.reduce((s, p) => s + p[k], 0) / n);
  return Object.fromEntries(m.atoms.map((a, i) => [a.id, [pos[i][0] - centre[0], pos[i][1] - centre[1], pos[i][2] - centre[2]] as [number, number, number]]));
}

/** Whether this browser can create a WebGL context (checked once, without keeping the context). */
let webgl: boolean | null = null;
export function supportsWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') ?? c.getContext('webgl');
    webgl = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

export const VISUAL_NEEDS_3D: Record<VisualType, boolean> = { shape3d: true, molecule: true, vectors: true, orbit: true, wave: true, graph2d: false, flow: false, labeled: false };

/** Asks the AI tutor a follow-up about one step (POST /ai-tutor/explain, input + context). */
export async function askAboutStep(lesson: VisualLesson, step: VisualLessonStep, question: string): Promise<string> {
  // the AI service's tutor payload takes context as an object (TutorPayload.context: Dict[str, Any])
  const context = { lesson: lesson.title.slice(0, 200), step: step.title, explanation: step.explanation.slice(0, 3500) };
  const res = (await aiTutorApi.explainConcept({ input: question.trim().slice(0, 2000), context })) as Raw | null;
  const answer = typeof res?.explanation === 'string' ? res.explanation.trim() : '';
  if (!answer) throw new Error('The tutor returned an empty answer. Please try again.');
  return answer;
}
