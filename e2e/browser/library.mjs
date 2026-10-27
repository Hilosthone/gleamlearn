// e2e/browser/library.mjs — real-browser check of /library (saved courses, notes, flashcards) against a LOCAL backend.
// Needs at least one published course in the disposable e2e database (e.g. from mycoursea-backend test/live/learner-learning.mjs).
// "real" = real frontend build + real local backend. No mocked responses. Passwords are never printed.
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');

const RUN = Date.now().toString(36);
const PASSWORD = `Pw-${RUN}-local`;
const results = [];
let page = null;
const record = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};
async function check(name, fn) {
  try {
    record(name, true, (await fn()) ?? '');
  } catch (e) {
    // say what the page showed instead (error banners, empty states)
    const shown = await page?.eval(`[...document.querySelectorAll('[role=alert],[role=status],main h3')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ')`).catch(() => '');
    record(name, false, `${e.message}${shown ? ` [page: ${shown.slice(0, 300)}]` : ''}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
const text = (p) => p.eval('document.body.innerText');
async function clickIn(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(400);
}
const clickLabel = (p, label) => p.eval(`(() => { const el = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!el) return false; el.click(); return true; })()`);
async function api(path, token, init = {}) {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(2500);
  }
  throw new Error(`${path} stayed throttled`);
}

async function main() {
  const signup = async (name) => {
    const body = { fullName: 'Library Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('lib');
  const other = await signup('libo');
  const courses = await api('/courses', token);
  const course = Array.isArray(courses.json) ? courses.json[0] : null;
  if (!course) throw new Error('no published course in the e2e database');

  const chrome = await launch({ port: 9345 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('/library starts empty: no invented items or counts', async () => {
      await p.goto(`${BASE}/library`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('No saved courses yet')`, { timeout: 20000 });
      assert(!/Kernel Threads|CSC301|Fiscal Policy/.test(await text(p)), 'prototype items shown');
    });

    await check('"Save to library" on the course page saves it on the server', async () => {
      await p.goto(`${BASE}/learn/${course.id}`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('Save to library')`, { timeout: 20000 });
      await clickIn(p, 'button', 'Save to library');
      await p.waitFor(`document.body.innerText.includes('Saved to library')`, { label: 'saved state', timeout: 20000 });
      const saved = await api('/library/courses', token);
      assert(saved.json.some((s) => s.courseId === course.id), 'not saved on server');
      await sleep(1500); // this check's own read shares GET /library/courses' 3 per second limit with the next page load
      return course.title;
    });

    await check('The saved course is listed with its real title, then removed', async () => {
      await p.goto(`${BASE}/library`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes(${JSON.stringify(course.title)})`, { timeout: 20000 });
      await sleep(2100); // POST/DELETE /library/courses share a 1 per 2 s limit
      assert(await clickLabel(p, `Remove ${course.title} from library`), 'no remove button');
      await p.waitFor(`document.body.innerText.includes('No saved courses yet')`, { label: 'removed', timeout: 20000 });
      const saved = await api('/library/courses', token);
      assert(saved.json.length === 0, `${saved.json.length} still saved`);
    });

    let noteId;
    await check('Notes: create, edit and delete persist on the server', async () => {
      await clickIn(p, '[role=tab]', 'Notes');
      await p.waitFor(`document.body.innerText.includes('No notes yet')`, { timeout: 20000 });
      await clickIn(p, 'button', 'New note');
      await p.fill('form[aria-label="New note"] input', `Photosynthesis ${RUN}`);
      await p.fill('form[aria-label="New note"] textarea', 'Light energy becomes chemical energy.');
      await p.fill('form[aria-label="New note"] label:nth-of-type(3) input', 'biology, exam, biology');
      await clickIn(p, 'button', 'Save note');
      await p.waitFor(`document.body.innerText.includes('Photosynthesis ${RUN}')`, { label: 'note listed', timeout: 20000 });
      const notes = await api('/notes', token);
      assert(notes.json.length === 1 && notes.json[0].tags.join() === 'biology,exam', `server notes ${JSON.stringify(notes.json?.map((n) => n.tags))}`);
      noteId = notes.json[0].id;

      await sleep(3100); // PATCH /notes is 1 per 3 s
      assert(await clickLabel(p, `Edit Photosynthesis ${RUN}`), 'no edit button');
      await p.fill('form[aria-label="Edit note"] input', `Photosynthesis ${RUN} (edited)`);
      await clickIn(p, 'button', 'Save changes');
      await p.waitFor(`document.body.innerText.includes('(edited)')`, { label: 'edit shown', timeout: 20000 });
      assert((await api(`/notes/${noteId}`, token)).json.title.endsWith('(edited)'), 'edit not saved');
      return 'tags de-duplicated: biology, exam';
    });

    await check("Another learner cannot read this learner's note", async () => {
      const r = await api(`/notes/${noteId}`, other);
      assert(r.status === 404 || r.status === 403, `status ${r.status}`);
      return `status ${r.status}`;
    });

    await check('Deleting the note removes it', async () => {
      assert(await clickLabel(p, `Delete Photosynthesis ${RUN} (edited)`), 'no delete button');
      await p.waitFor(`document.body.innerText.includes('No notes yet')`, { label: 'deleted', timeout: 20000 });
      assert((await api('/notes', token)).json.length === 0, 'still on server');
    });

    let deckId;
    await check('Flashcards: create a deck and add two cards', async () => {
      await clickIn(p, '[role=tab]', 'Flashcards');
      await p.waitFor(`document.body.innerText.includes('No flashcard decks yet')`, { timeout: 20000 });
      await p.waitFor(`document.body.innerText.includes('No cards are due')`, { timeout: 20000 });
      await clickIn(p, 'button', 'New deck');
      await p.fill('form[aria-label="New deck"] input', `Biology ${RUN}`);
      await clickIn(p, 'button', 'Create deck');
      await p.waitFor(`document.body.innerText.includes('Biology ${RUN}') && document.body.innerText.includes('0 cards')`, { label: 'deck listed', timeout: 20000 });
      deckId = (await api('/flashcard-decks', token)).json[0].id;
      await clickIn(p, 'button', `Biology ${RUN}0 cards`);
      await p.waitFor(`!!document.querySelector('form[aria-label="Add card"]')`, { timeout: 20000 });
      for (const [q, a] of [['What makes ATP?', 'Mitochondria'], ['Plant cell wall?', 'Cellulose']]) {
        await p.fill('form[aria-label="Add card"] label:nth-of-type(1) textarea', q);
        await p.fill('form[aria-label="Add card"] label:nth-of-type(2) textarea', a);
        await clickIn(p, 'button', 'Add card');
        await p.waitFor(`document.body.innerText.includes(${JSON.stringify(q)})`, { label: `card ${q}`, timeout: 20000 });
        await sleep(3100); // POST /flashcards is 1 per 3 s
      }
      const deck = await api(`/flashcard-decks/${deckId}`, token);
      assert(deck.json.cards.length === 2, `${deck.json.cards.length} cards on server`);
    });

    await check("Another learner cannot open this learner's deck", async () => {
      const r = await api(`/flashcard-decks/${deckId}`, other);
      assert(r.status === 403 || r.status === 404, `status ${r.status}`);
      return `status ${r.status}`;
    });

    await check('Review today: both new cards are due; grading reschedules them on the server', async () => {
      await clickIn(p, 'button', 'All decks');
      await p.waitFor(`document.body.innerText.includes('2 cards due')`, { label: 'due count', timeout: 20000 });
      await clickIn(p, 'button', 'Start review');
      for (let i = 1; i <= 2; i++) {
        await p.waitFor(`document.body.innerText.includes('Card ${i} of 2')`, { timeout: 20000 });
        await clickIn(p, 'button', 'Show answer');
        await clickIn(p, 'button', 'Good');
        await sleep(1100); // POST /flashcards/:id/review is 1 per second
      }
      await p.waitFor(`document.body.innerText.includes('Review complete')`, { timeout: 20000 });
      const due = await api('/flashcards/review/today', token);
      const deck = await api(`/flashcard-decks/${deckId}`, token);
      assert(due.json.length === 0, `${due.json.length} still due`);
      assert(deck.json.cards.every((c) => c.repetitions === 1 && Date.parse(c.nextReviewDate) > Date.now()), 'not rescheduled');
      return 'both cards: repetitions 1, next review in the future';
    });

    await check('Uploaded materials starts empty: only real uploads are listed (uploads are tested in learner-profile.mjs)', async () => {
      await clickIn(p, '[role=tab]', 'Uploaded materials');
      await p.waitFor(`document.body.innerText.includes('No uploaded materials yet')`, { timeout: 20000 });
      assert(!(await p.eval(`!!document.querySelector('ul[aria-label="Uploaded materials"]')`)), 'files listed for a new learner');
    });

    const unexpected = p.consoleErrors.filter((e) => !/status of 429/.test(e));
    record('No unexpected console errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | ') || 'none');
  } finally {
    await p.close().catch(() => {});
    await chrome.close();
  }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  process.exitCode = results.every(Boolean) ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
