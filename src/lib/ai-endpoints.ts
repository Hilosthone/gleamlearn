/**
 * ---------------------------------------------------------------------------
 * lib/ai-endpoints.ts — Which backend endpoints run AI generation
 * ---------------------------------------------------------------------------
 * These calls reach the AI service (NVIDIA NIM) through the backend and can take
 * far longer than ordinary requests (the backend allows 120s, plus a possible
 * Render cold start). They get a longer client timeout so the UI does not report
 * a failure while the server is still working, and they are never auto-retried
 * (each attempt is a new billed generation).
 */

const AI_ENDPOINT_PATTERNS: RegExp[] = [
  /^\/ai\/(chat|explain|explain-mistake|summarize|generate-example|generate-practice|evaluate-answer)(\?|$)/,
  /^\/ai\/documents\/[^/]+\/(analyze|generate-[a-z-]+|create-course|export-pdf)(\?|$)/,
  /^\/ai\/voice\/(transcribe|respond|synthesize)(\?|$)/,
  /^\/ai-tutor\/(teach|explain|generate-diagram|drawing-instructions)(\?|$)/,
  /^\/ai-tutor\/sessions\/[^/]+\/(message|question|answer)(\?|$)/,
  /^\/ai-companion\/(chat|interact)(\?|$)/,
  /^\/(quizzes|tests|exams)\/generate(-from-[a-z]+)?(\?|$)/,
  /^\/youtube\/[^/]+\/(process|reprocess)(\?|$)/,
  /^\/files\/[^/]+\/(process|reprocess)(\?|$)/,
  /^\/recommendations(\/[a-z]+)?(\?|$)/,
  /^\/planner\/(generate|regenerate)(\?|$)/,
];

export function isAiOperation(endpoint: string): boolean {
  return AI_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint));
}
