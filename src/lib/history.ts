/**
 * ---------------------------------------------------------------------------
 * lib/history.ts — The learner's AI history (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-25):
 *   GET /ai-tutor/sessions    → { status, data: TutorSession[] }      { id, title, status: 'active'|'ended', createdAt, updatedAt }
 *   GET /ai/conversations     → { status, userId, conversations: Conversation[] }   { id, title, createdAt, updatedAt }
 * Quiz, test and exam attempts are NOT stored by the backend (no attempts table; the attempt-history endpoints
 * always answer an empty list), so there is no assessment history to show yet.
 */

import { aiAssistantApi, aiTutorApi } from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');

export interface AiHistoryItem {
  id: string;
  kind: 'tutor' | 'assistant';
  title: string;
  status: string | null;
  at: string;
}

function list(res: unknown, key: string): Raw[] {
  const v = res && typeof res === 'object' ? (res as Raw)[key] : undefined;
  return Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Raw[]) : [];
}

export function toTutorSessions(res: unknown): AiHistoryItem[] {
  return list(res, 'data')
    .filter((r) => typeof r.id === 'string')
    .map((r) => ({ id: r.id as string, kind: 'tutor' as const, title: str(r.title) || 'Tutor session', status: str(r.status) || null, at: str(r.updatedAt) || str(r.createdAt) }));
}

export function toConversations(res: unknown): AiHistoryItem[] {
  return list(res, 'conversations')
    .filter((r) => typeof r.id === 'string')
    .map((r) => ({ id: r.id as string, kind: 'assistant' as const, title: str(r.title) || 'Conversation', status: null, at: str(r.updatedAt) || str(r.createdAt) }));
}

export function mergeAiHistory(...groups: AiHistoryItem[][]): AiHistoryItem[] {
  return groups.flat().filter((i) => Number.isFinite(Date.parse(i.at))).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

export async function loadAiHistory(): Promise<AiHistoryItem[]> {
  const [tutor, assistant] = await Promise.all([aiTutorApi.getAllSessions(), aiAssistantApi.getAllConversations()]);
  return mergeAiHistory(toTutorSessions(tutor), toConversations(assistant));
}
