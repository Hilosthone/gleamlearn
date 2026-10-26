/**
 * ---------------------------------------------------------------------------
 * lib/ai.ts — AI assistant chat, AI tutor sessions and AI study tools (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Every call goes to the GleamLearn backend with the learner's JWT; the backend calls the private AI service.
 * Backend contract (verified 2026-10-26):
 *   POST /ai/chat { message, conversationId? }       → { data: { conversationId, userMessage, aiMessage } }
 *        (a new conversation is created when conversationId is omitted; nothing is stored if the AI call fails)
 *   GET  /ai/conversations                           → { conversations: [{ id, title, createdAt, updatedAt }] }
 *   GET  /ai/conversations/:id                       → { conversation: { id, title, messages: [{ id, sender: 'user'|'ai', content, createdAt }] } }
 *   DELETE /ai/conversations/:id                     → owner-scoped; 404 otherwise
 *   POST /ai-tutor/sessions { title? }               → { data: session }
 *   GET  /ai-tutor/sessions/:id                      → { data: { id, title, status: 'active'|'ended', messages: [{ sender: 'user'|'tutor', content, createdAt }] } }
 *   POST /ai-tutor/sessions/:id/message { message }  → { data: { userMessage, tutorMessage } }
 *   POST /ai-tutor/sessions/:id/end                  → { data: session }
 *   POST /ai/explain|summarize|generate-example|generate-practice { input, context? } → { explanation|summary|example|practiceQuestion }
 *   POST /ai/evaluate-answer|explain-mistake { question, userAnswer, correctAnswer? } → { evaluation (JSON text) | analysis }
 *   POST /ai-tutor/teach|explain|generate-diagram|drawing-instructions { input } → { lesson | explanation | diagramSpec.code | instructions }
 * Not supported by the backend: streaming (answers arrive whole), conversation memory (each chat message is answered
 * on its own; earlier messages are stored but not sent to the model), voice, and attachments in chat.
 */

import { aiAssistantApi, aiTutorApi } from './api.ts';
import { toConversations, toTutorSessions, type AiHistoryItem } from './history.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});

export interface ChatMessage {
  id: string;
  from: 'learner' | 'ai';
  text: string;
  at: string;
}

export interface Thread {
  id: string;
  title: string;
  status: string | null; // tutor sessions: 'active' | 'ended'
  messages: ChatMessage[];
}

export function toMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m, i) => {
      const r = obj(m);
      const text = str(r.content);
      if (!text) return null;
      return { id: str(r.id) || `m${i}`, from: r.sender === 'user' ? ('learner' as const) : ('ai' as const), text, at: str(r.createdAt) };
    })
    .filter((m): m is ChatMessage => m !== null)
    .sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
}

function toThread(raw: unknown, fallbackTitle: string): Thread {
  const r = obj(raw);
  if (typeof r.id !== 'string') throw new Error('This conversation could not be read.');
  return { id: r.id, title: str(r.title) || fallbackTitle, status: str(r.status) || null, messages: toMessages(r.messages) };
}

/** The two messages a send returns (stored on the server), in display order. */
export function toExchange(res: unknown, aiKey: 'aiMessage' | 'tutorMessage'): { conversationId: string | null; messages: ChatMessage[] } {
  const d = obj(obj(res).data);
  const messages = toMessages([d.userMessage, d[aiKey]]);
  if (messages.length < 2) throw new Error('The AI returned no answer. Please try again.');
  return { conversationId: str(d.conversationId) || null, messages };
}

// Assistant conversations ------------------------------------------------------------------------------------

export const loadConversations = async (): Promise<AiHistoryItem[]> => toConversations(await aiAssistantApi.getAllConversations());
export const loadConversation = async (id: string) => toThread(obj(await aiAssistantApi.getConversationById(id)).conversation, 'Conversation');
export const deleteConversation = (id: string) => aiAssistantApi.deleteConversation(id);
export async function sendChat(message: string, conversationId: string | null) {
  return toExchange(await aiAssistantApi.sendChatMessage({ message, ...(conversationId ? { conversationId } : {}) }), 'aiMessage');
}

// Tutor sessions -----------------------------------------------------------------------------------------------

export const loadTutorSessions = async (): Promise<AiHistoryItem[]> => toTutorSessions(await aiTutorApi.getAllSessions());
export const loadTutorSession = async (id: string) => toThread(obj(await aiTutorApi.getSessionById(id)).data, 'Tutor session');
export async function createTutorSession(title: string): Promise<string> {
  const id = str(obj(obj(await aiTutorApi.createSession(title ? { title } : {})).data).id);
  if (!id) throw new Error('The session could not be created.');
  return id;
}
export const endTutorSession = (id: string) => aiTutorApi.endSession(id);
export async function sendTutorMessage(sessionId: string, message: string) {
  return toExchange(await aiTutorApi.sendMessage(sessionId, { message }), 'tutorMessage').messages;
}

// Study tools --------------------------------------------------------------------------------------------------

export type ToolId = 'explain' | 'summarize' | 'example' | 'practice' | 'teach' | 'diagram' | 'evaluate' | 'mistake';

export interface ToolSpec {
  id: ToolId;
  label: string;
  description: string;
  inputLabel: string;
  /** evaluate / mistake need a question, the learner's answer and optionally the expected answer */
  kind: 'text' | 'answer';
}

export const TOOLS: ToolSpec[] = [
  { id: 'explain', label: 'Explain', description: 'A clear explanation of a concept, with examples.', inputLabel: 'Concept or question', kind: 'text' },
  { id: 'summarize', label: 'Summarise', description: 'A short summary of text you paste.', inputLabel: 'Text to summarise', kind: 'text' },
  { id: 'example', label: 'Example', description: 'A worked, real-world example.', inputLabel: 'Concept', kind: 'text' },
  { id: 'practice', label: 'Practice question', description: 'One practice question with its answer and explanation.', inputLabel: 'Topic', kind: 'text' },
  { id: 'teach', label: 'Teach me', description: 'A short lesson on a topic.', inputLabel: 'Topic', kind: 'text' },
  { id: 'diagram', label: 'Diagram', description: 'Diagram source code (Mermaid) for a process or system.', inputLabel: 'Process or system', kind: 'text' },
  { id: 'evaluate', label: 'Check my answer', description: 'A score out of 100 with feedback on your answer.', inputLabel: 'Question', kind: 'answer' },
  { id: 'mistake', label: 'Explain my mistake', description: 'What went wrong in an answer and how to fix it.', inputLabel: 'Question', kind: 'answer' },
];

export interface Evaluation {
  score: number | null;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export type ToolResult = { kind: 'text'; text: string } | { kind: 'code'; text: string } | { kind: 'evaluation'; evaluation: Evaluation };

/** The evaluator is asked for JSON but may wrap it in prose or a code fence; fall back to the raw text as feedback. */
export function parseEvaluation(text: string): Evaluation {
  const m = text.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const j = obj(JSON.parse(m[0]));
      const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []);
      const score = typeof j.score === 'number' && j.score >= 0 && j.score <= 100 ? Math.round(j.score) : null;
      return { score, feedback: str(j.feedback), strengths: list(j.strengths), improvements: list(j.improvements) };
    } catch {
      // not JSON after all
    }
  }
  return { score: null, feedback: text.trim(), strengths: [], improvements: [] };
}

const RESULT_KEY: Record<ToolId, string> = {
  explain: 'explanation',
  summarize: 'summary',
  example: 'example',
  practice: 'practiceQuestion',
  teach: 'lesson',
  diagram: 'diagramSpec',
  evaluate: 'evaluation',
  mistake: 'analysis',
};

export function toToolResult(tool: ToolId, res: unknown): ToolResult {
  const v = obj(res)[RESULT_KEY[tool]];
  const text = tool === 'diagram' ? str(obj(v).code) : str(v);
  if (!text.trim()) throw new Error('The AI returned an empty answer. Please try again.');
  if (tool === 'diagram') return { kind: 'code', text: text.trim() };
  if (tool === 'evaluate') return { kind: 'evaluation', evaluation: parseEvaluation(text) };
  return { kind: 'text', text: text.trim() };
}

export interface ToolInput {
  input: string; // the text, or the question for answer tools
  userAnswer?: string;
  correctAnswer?: string;
}

export async function runTool(tool: ToolId, { input, userAnswer = '', correctAnswer = '' }: ToolInput): Promise<ToolResult> {
  const text = { input };
  const answer = { question: input, userAnswer, correctAnswer };
  const call: Record<ToolId, () => Promise<unknown>> = {
    explain: () => aiAssistantApi.explainConcept(text),
    summarize: () => aiAssistantApi.summarizeText(text),
    example: () => aiAssistantApi.generateExample(text),
    practice: () => aiAssistantApi.generatePractice(text),
    teach: () => aiTutorApi.teachTopic({ topic: input, input }),
    diagram: () => aiTutorApi.generateDiagram({ topic: input, input }),
    evaluate: () => aiAssistantApi.evaluateAnswer(answer),
    mistake: () => aiAssistantApi.explainMistake(answer),
  };
  return toToolResult(tool, await call[tool]());
}
