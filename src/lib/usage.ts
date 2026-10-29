/**
 * ---------------------------------------------------------------------------------------------------------------
 * lib/usage.ts — Usage and limits (GET /usage)
 * ---------------------------------------------------------------------------------------------------------------
 * Backend contract (verified 2026-10-29): { plan: null, quotas: { ai, documents, courses, quizzes } }, each
 * { label, used, limit, remaining, period: 'day' | 'total', resetAt }. Only limits the server enforces are given;
 * limit null means "not capped". Daily counts reset at midnight Nigerian time.
 */
import { usageApi } from './api.ts';

export interface Quota {
  key: string;
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  period: 'day' | 'total';
  resetAt: string | null;
}

const ORDER = ['documents', 'courses', 'ai', 'quizzes'];
const rank = (key: string) => (ORDER.includes(key) ? ORDER.indexOf(key) : ORDER.length);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function toUsage(res: unknown): Quota[] {
  const quotas = ((res ?? {}) as Record<string, unknown>).quotas;
  if (!quotas || typeof quotas !== 'object') return [];
  return Object.entries(quotas as Record<string, unknown>)
    .map(([key, v]) => {
      const q = (v ?? {}) as Record<string, unknown>;
      const used = num(q.used);
      if (used === null || typeof q.label !== 'string') return null;
      const limit = num(q.limit);
      return {
        key,
        label: q.label,
        used,
        limit,
        remaining: limit === null ? null : (num(q.remaining) ?? Math.max(0, limit - used)),
        period: q.period === 'day' ? 'day' : 'total',
        resetAt: typeof q.resetAt === 'string' ? q.resetAt : null,
      } satisfies Quota;
    })
    .filter((q): q is Quota => q !== null)
    .sort((a, b) => rank(a.key) - rank(b.key));
}

/** 0..100, or null when there is no cap */
export const percentUsed = (q: Quota) => (q.limit ? Math.min(100, Math.round((q.used / q.limit) * 100)) : null);

export const loadUsage = async () => toUsage(await usageApi.getUsageOverview());
