/**
 * ---------------------------------------------------------------------------
 * lib/library.ts — Saved courses, notes and flashcards (typed wrappers over existing api.ts clients)
 * ---------------------------------------------------------------------------
 * Backend contract (verified 2026-10-26; all learner-JWT and owner-scoped):
 *   GET    /library/courses               → [{ id, userId, courseId, savedAt }]   (no course details: joined here)
 *   POST   /library/courses/:courseId     → saved row; 409 if already saved
 *   DELETE /library/courses/:courseId     → { message }; 404 if not saved
 *   GET/POST /notes, GET/PATCH/DELETE /notes/:id   { title, content, courseId?, tags? }
 *   GET/POST /flashcard-decks, GET/PATCH/DELETE /flashcard-decks/:id (deck with `cards`)
 *   POST /flashcards { deckId, question, answer }; DELETE /flashcards/:id
 *   GET  /flashcards/review/today         → cards due (never reviewed or due), each with its deck
 *   POST /flashcards/:id/review { quality: 0..5 }  → SM-2 schedule updated server-side
 * Uploaded files are not listed here: files have no owner column yet (B4), so listing them is admin-only.
 */

import { ApiError } from './api-error.ts';
import { invalidateLearnerStats } from './learning.ts';
import { coursesApi, flashcardDecksApi, flashcardsApi, libraryApi, notesApi } from './api.ts';

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const rows = (res: unknown): Raw[] => {
  const list = Array.isArray(res) ? res : Array.isArray((res as Raw | null)?.data) ? ((res as Raw).data as unknown[]) : [];
  return list.filter((x) => x && typeof x === 'object') as Raw[];
};

// ---------------------------------------------------------------------------------------------------------
// Saved courses
// ---------------------------------------------------------------------------------------------------------

export interface SavedCourse {
  courseId: string;
  title: string;
  description: string;
  savedAt: string;
  available: boolean; // false when the course no longer exists in the catalogue
}

export function joinSavedCourses(savedRes: unknown, catalogRes: unknown): SavedCourse[] {
  const catalog = new Map(rows(catalogRes).map((c) => [str(c.id), c]));
  return rows(savedRes)
    .filter((s) => typeof s.courseId === 'string')
    .map((s) => {
      const c = catalog.get(s.courseId as string);
      return { courseId: s.courseId as string, title: c ? str(c.title) || 'Untitled course' : 'Course no longer available', description: c ? str(c.description) : '', savedAt: str(s.savedAt), available: Boolean(c) };
    })
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
}

export async function loadSavedCourses(): Promise<SavedCourse[]> {
  const [saved, catalog] = await Promise.all([libraryApi.getSavedCourses(), coursesApi.getAllCourses()]);
  return joinSavedCourses(saved, catalog);
}
export const saveCourseToLibrary = (courseId: string) => libraryApi.saveCourse(courseId);
export const removeCourseFromLibrary = (courseId: string) => libraryApi.removeSavedCourse(courseId);

/**
 * Saves or removes a course and returns the state the server confirmed. "Already saved" (409) and "not saved" (404)
 * mean the server is already in the requested state, e.g. after a change in another tab.
 */
export async function setCourseSaved(courseId: string, save: boolean): Promise<boolean> {
  try {
    await (save ? saveCourseToLibrary(courseId) : removeCourseFromLibrary(courseId));
  } catch (e) {
    if (!(e instanceof ApiError && e.status === (save ? 409 : 404))) throw e;
  }
  return save;
}

// ---------------------------------------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------------------------------------

export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string | null;
  tags: string[];
  updatedAt: string;
}

export function toNotes(res: unknown): Note[] {
  return rows(res)
    .filter((n) => typeof n.id === 'string')
    .map((n) => ({
      id: n.id as string,
      title: str(n.title) || 'Untitled note',
      content: str(n.content),
      courseId: str(n.courseId) || null,
      tags: Array.isArray(n.tags) ? n.tags.filter((t): t is string => typeof t === 'string') : [],
      updatedAt: str(n.updatedAt) || str(n.createdAt),
    }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

/** "algebra, exam prep ,, " → ["algebra", "exam prep"] (unique, max 10). */
export function parseTags(input: string): string[] {
  return Array.from(new Set(input.split(',').map((t) => t.trim()).filter(Boolean))).slice(0, 10);
}

export const loadNotes = async () => toNotes(await notesApi.getAllNotes());
export const createNote = (n: { title: string; content: string; tags: string[] }) => notesApi.createNote(n);
export const updateNote = (id: string, n: { title: string; content: string; tags: string[] }) => notesApi.updateNote(id, n);
export const deleteNote = (id: string) => notesApi.deleteNote(id);

// ---------------------------------------------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------------------------------------------

export interface Flashcard {
  id: string;
  deckId: string;
  deckTitle: string;
  question: string;
  answer: string;
  nextReviewDate: string | null;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: string;
  cards: Flashcard[];
}

function toCard(c: Raw, deck?: Raw): Flashcard | null {
  if (typeof c.id !== 'string') return null;
  const d = (c.deck && typeof c.deck === 'object' ? (c.deck as Raw) : deck) ?? {};
  return { id: c.id, deckId: str(c.deckId) || str(d.id), deckTitle: str(d.title), question: str(c.question), answer: str(c.answer), nextReviewDate: str(c.nextReviewDate) || null };
}

export function toDeck(raw: unknown): Deck | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Raw;
  if (typeof d.id !== 'string') return null;
  const cards = Array.isArray(d.cards) ? d.cards.map((c) => (c && typeof c === 'object' ? toCard(c as Raw, d) : null)).filter((c): c is Flashcard => c !== null) : [];
  return { id: d.id, title: str(d.title) || 'Untitled deck', description: str(d.description), category: str(d.category), cards };
}

export const toDecks = (res: unknown): Deck[] => rows(res).map(toDeck).filter((d): d is Deck => d !== null);
export const toDueCards = (res: unknown): Flashcard[] => rows(res).map((c) => toCard(c)).filter((c): c is Flashcard => c !== null);

/** The four review buttons and the SM-2 quality (0–5) each one sends. */
export const REVIEW_GRADES = [
  { label: 'Again', quality: 1 },
  { label: 'Hard', quality: 3 },
  { label: 'Good', quality: 4 },
  { label: 'Easy', quality: 5 },
] as const;

export const loadDecks = async () => toDecks(await flashcardDecksApi.getAllDecks());
export const loadDeck = async (id: string) => {
  const d = toDeck(await flashcardDecksApi.getDeckById(id));
  if (!d) throw new Error('This deck could not be read.');
  return d;
};
export const createDeck = (d: { title: string; description: string; category: string }) => flashcardDecksApi.createDeck(d);
export const deleteDeck = (id: string) => flashcardDecksApi.deleteDeck(id);
export const addCard = (deckId: string, question: string, answer: string) => flashcardsApi.createFlashcard({ deckId, question, answer });
export const deleteCard = (id: string) => flashcardsApi.deleteFlashcard(id);
export const loadDueCards = async () => toDueCards(await flashcardsApi.getDueFlashcards());
export async function reviewCard(id: string, quality: number) {
  const res = await flashcardsApi.submitReview(id, { quality });
  invalidateLearnerStats(); // a review counts towards today's streak
  return res;
}

/** Whether the learner saved this course; null when the saved list could not be read (show no button rather than guess). */
export async function loadCourseSaved(courseId: string): Promise<boolean | null> {
  try {
    return rows(await libraryApi.getSavedCourses()).some((s) => s.courseId === courseId);
  } catch {
    return null;
  }
}
