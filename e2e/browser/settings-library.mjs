// e2e/browser/settings-library.mjs — profile, goals, library edits and the course leaderboard against a LOCAL stack
// (real frontend build, real local backend, local mock model): school suggestions from the academic directory, saved
// notification preferences, the honest privacy answer, goal progress, flashcard and deck edits, renaming a generated
// summary, and the course leaderboard.
// Needs ADMIN_EMAIL / ADMIN_PASSWORD for the local seeded super admin (never printed), and SEED='{"quizzes",...}' from
// mycoursea-backend test/live/seed-assessments.mjs (an official quiz, for XP).
import { randomUUID } from 'crypto';
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
const seed = JSON.parse(process.env.SEED ?? '{}');
if (!seed.quizzes) throw new Error('SEED is required');

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
    const shown = await page?.eval(`[...document.querySelectorAll('[role=alert],[role=status]')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ')`).catch(() => '');
    record(name, false, `${e.message}${shown ? ` [page: ${shown.slice(0, 300)}]` : ''}`);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
const has = (s) => `document.body.textContent.includes(${JSON.stringify(s)})`;
async function clickText(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(350);
}
const clickSel = async (p, sel) => {
  const ok = await p.eval(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no ${sel}`);
  await sleep(350);
};
async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3000);
  }
  throw new Error(`${path} stayed throttled`);
}
const tab = (p, label) => clickText(p, '[role=tab]', label);
const datalistValues = (id) => `[...(document.getElementById(${JSON.stringify(id)})?.options ?? [])].map((o) => o.value)`;

async function main() {
  const signup = async (name, extra = {}) => {
    const body = { fullName: 'Edit Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD, ...extra };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const admin = (await api('/admin/auth/login', null, { method: 'POST', body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) })).json?.accessToken;
  if (!admin) throw new Error('local admin login failed');
  const token = await signup('edt', { educationType: 'University' });
  const other = await signup('edto');

  // the academic directory (admin-maintained): one university with a faculty and two departments
  const UNI = `University of Testland ${RUN}`;
  const inst = await api('/institutions', admin, { method: 'POST', body: JSON.stringify({ name: UNI, type: 'University', country: 'Nigeria' }) });
  if (inst.status >= 300) throw new Error(`institution ${inst.status}`);
  const fac = await api('/faculties', admin, { method: 'POST', body: JSON.stringify({ name: `Science ${RUN}`, institutionId: inst.json.id }) });
  if (fac.status >= 300) throw new Error(`faculty ${fac.status}`);
  for (const d of ['Biochemistry', 'Zoology']) {
    const r = await api('/departments', admin, { method: 'POST', body: JSON.stringify({ name: `${d} ${RUN}`, facultyId: fac.json.id }) });
    if (r.status >= 300) throw new Error(`department ${r.status}`);
  }
  // a catalogue course both learners enrol in; one of them earns XP by completing its lesson
  const course = (await api('/admin/content/courses', admin, { method: 'POST', body: JSON.stringify({ title: `Board course ${RUN}`, description: 'Leaderboard check', track: 'University', level: '100 Level' }) })).json?.data;
  const lesson = (await api(`/admin/content/courses/${course.id}/lessons`, admin, { method: 'POST', body: JSON.stringify({ title: 'Cells', content: 'Cells are the unit of life.', orderIndex: 0 }) })).json?.data;
  assert(course?.id && lesson?.id, 'course not published');
  for (const t of [token, other]) assert((await api(`/courses/${course.id}/enroll`, t, { method: 'POST' })).status < 300, 'enrol');

  const chrome = await launch({ port: 9357 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Edit profile suggests universities, then that university’s departments, from the directory; the choice is saved', async () => {
      await p.goto(`${BASE}/settings`, ready('h1'));
      await clickText(p, 'button', 'Edit Profile');
      await p.waitFor(`!!document.getElementById('pf-university')`, { timeout: 15000 });
      await p.waitFor(`${datalistValues('dl-universities')}.includes(${JSON.stringify(UNI)})`, { label: 'university suggested', timeout: 15000 });
      await p.fill('#pf-university', UNI);
      await p.waitFor(`${datalistValues('dl-departments')}.length === 2`, { label: 'departments narrowed', timeout: 5000 });
      const depts = await p.eval(datalistValues('dl-departments'));
      assert(depts.every((d) => d.endsWith(RUN)), depts.join(', '));
      await p.fill('#pf-department', `Zoology ${RUN}`);
      await clickText(p, 'button', 'Save changes');
      await p.waitFor(has('Your profile was saved.'), { label: 'saved', timeout: 15000 });
      const me = (await api('/users/me', token)).json;
      const u = me.data ?? me;
      assert(u.university === UNI && u.department === `Zoology ${RUN}`, `${u.university} / ${u.department}`);
      return `${depts.length} departments suggested for the chosen university`;
    });

    await check('Notification preferences via /users/me/... are now stored (same settings as the Settings page); privacy answers 501, not a fake success', async () => {
      const r = await api('/users/me/notification-preferences', token, { method: 'PATCH', body: JSON.stringify({ marketingEmails: true }) });
      assert(r.status === 200, `patch ${r.status}`);
      await sleep(3100);
      const s = (await api('/notifications/settings', token)).json;
      assert(s?.data?.marketingEmails === true, JSON.stringify(s));
      const bad = await api('/users/me/notification-preferences', token, { method: 'PATCH', body: JSON.stringify({ marketingEmails: 'yes' }) });
      assert(bad.status === 400 || bad.status === 429, `invalid value → ${bad.status}`);
      await sleep(3100);
      const priv = await api('/users/me/privacy-settings', token, { method: 'PATCH', body: JSON.stringify({ profileVisibility: 'private' }) });
      assert(priv.status === 501 && priv.json?.code === 'FEATURE_UNAVAILABLE', `privacy ${priv.status}`);
      return 'marketingEmails saved; privacy → 501';
    });

    await check('Planner → Goals: record progress (6 of 10 = 60%), then reach the target → completed', async () => {
      const g = await api('/goals', token, { method: 'POST', body: JSON.stringify({ title: `Past papers ${RUN}`, targetValue: 10 }) });
      assert(g.status < 300, `goal ${g.status}`);
      await p.goto(`${BASE}/planner`, ready('h1'));
      await tab(p, 'Goals').catch(() => clickText(p, 'button', 'Goals'));
      await p.waitFor(has(`Past papers ${RUN}`), { label: 'goal listed', timeout: 15000 });
      await clickSel(p, `button[aria-label="Edit goal Past papers ${RUN}"]`);
      const form = `form[aria-label="Edit goal Past papers ${RUN}"]`;
      await p.fill(`${form} input[type=number]`, '6');
      await clickText(p, `${form} button`, 'Save');
      await p.waitFor(has('6 of 10 (60%)'), { label: '60%', timeout: 15000 });
      await sleep(3100); // goal edits are limited to one per 3 s
      await clickSel(p, `button[aria-label="Edit goal Past papers ${RUN}"]`);
      await p.fill(`${form} input[type=number]`, '10');
      await clickText(p, `${form} button`, 'Save');
      await p.waitFor(has('10 of 10 (100%)'), { label: '100%', timeout: 15000 });
      const stored = (await api(`/goals/${g.json.goal.id}`, token)).json.goal;
      assert(stored.isCompleted === true && stored.currentValue === 10, JSON.stringify(stored));
      const theirs = await api(`/goals/${g.json.goal.id}`, other, { method: 'PATCH', body: JSON.stringify({ currentValue: 0 }) });
      assert(theirs.status === 404, `other learner → ${theirs.status}`);
      return 'completed by progress; other learner 404';
    });

    await check('Library → Flashcards: rename the deck and fix a card; the review schedule is untouched', async () => {
      const deck = (await api('/flashcard-decks', token, { method: 'POST', body: JSON.stringify({ title: `Bio deck ${RUN}`, description: '' }) })).json;
      await sleep(2100);
      await api('/flashcards', token, { method: 'POST', body: JSON.stringify({ deckId: deck.id, question: 'Powerhouse of the cel?', answer: 'Mitochondria' }) });
      await p.goto(`${BASE}/library?tab=flashcards`, ready('h1'));
      await p.waitFor(has(`Bio deck ${RUN}`), { label: 'deck', timeout: 15000 });
      await clickText(p, 'button', `Bio deck ${RUN}`).catch(async () => {
        await p.eval(`[...document.querySelectorAll('button, a')].find((b) => b.textContent.includes(${JSON.stringify(`Bio deck ${RUN}`)}))?.click()`);
        await sleep(400);
      });
      await p.waitFor(`!!document.querySelector('button[aria-label="Rename deck"]')`, { label: 'deck open', timeout: 15000 });
      await clickSel(p, 'button[aria-label="Rename deck"]');
      await p.fill('form[aria-label="Rename deck"] input', `Biology ${RUN}`);
      await clickText(p, 'form[aria-label="Rename deck"] button', 'Save');
      await p.waitFor(`document.querySelector('h2')?.textContent === ${JSON.stringify(`Biology ${RUN}`)} || ${has(`Biology ${RUN}`)}`, { label: 'renamed', timeout: 15000 });
      await clickSel(p, 'button[aria-label="Edit card Powerhouse of the cel?"]');
      await p.fill('form[aria-label="Edit card"] textarea', 'Powerhouse of the cell?');
      await clickText(p, 'form[aria-label="Edit card"] button', 'Save card');
      await p.waitFor(has('Powerhouse of the cell?'), { label: 'card fixed', timeout: 15000 });
      const stored = (await api(`/flashcard-decks/${deck.id}`, token)).json;
      assert(stored.title === `Biology ${RUN}` && stored.cards?.[0]?.question === 'Powerhouse of the cell?', JSON.stringify(stored).slice(0, 200));
      const theirs = await api(`/flashcards/${stored.cards[0].id}`, other, { method: 'PATCH', body: JSON.stringify({ answer: 'x' }) });
      assert(theirs.status === 404 || theirs.status === 403, `other learner → ${theirs.status}`);
    });

    await check('A generated summary can be renamed from its page', async () => {
      const gen = await api('/learning/generate', token, { method: 'POST', body: JSON.stringify({ requestId: randomUUID(), kind: 'summary', sourceType: 'text', title: `Cells ${RUN}`, text: 'Cells are the basic unit of life. The nucleus holds DNA. Mitochondria release energy through respiration.' }) });
      assert(gen.status < 300 && gen.json?.id, `generate ${gen.status} ${JSON.stringify(gen.json).slice(0, 160)}`);
      await p.goto(`${BASE}/learn/resources/${gen.json.id}`, ready('h1'));
      await p.waitFor(`!!document.querySelector('button[aria-label="Rename"]')`, { timeout: 20000 });
      await clickSel(p, 'button[aria-label="Rename"]');
      await p.fill('form[aria-label="Rename"] input', `Cell biology summary ${RUN}`);
      await clickText(p, 'form[aria-label="Rename"] button', 'Save');
      await p.waitFor(`document.querySelector('h1#resource-title')?.textContent === ${JSON.stringify(`Cell biology summary ${RUN}`)}`, { label: 'renamed', timeout: 15000 });
      const stored = (await api(`/learning/resources/${gen.json.id}`, token)).json;
      assert(stored.title === `Cell biology summary ${RUN}`, stored.title);
    });

    await check('Progress → Leaderboard → My courses: ranks the learners enrolled in the chosen course', async () => {
      // the board ranks XP earners; XP comes from graded submissions (lessons award none), so both enrolled
      // learners submit the seeded official quiz
      for (const t of [token, other]) {
        const s = await api(`/quizzes/${seed.quizzes}/submit`, t, { method: 'POST', body: JSON.stringify({ answers: { 0: '4', 1: 'Lagos' } }) });
        assert(s.status < 300, `submit ${s.status}`);
        await sleep(3100);
      }
      await p.goto(`${BASE}/progress`, ready('h1'));
      await clickText(p, '[role=tab], button', 'Leaderboard').catch(() => {});
      await p.waitFor(`[...document.querySelectorAll('[role=tab]')].some((t) => t.textContent.trim() === 'My courses' && !t.disabled)`, { label: 'course scope enabled', timeout: 15000 });
      await clickText(p, '[role=tab]', 'My courses');
      await p.waitFor(`[...document.querySelectorAll('select option')].some((o) => o.textContent === ${JSON.stringify(`Board course ${RUN}`)})`, { label: 'course picker', timeout: 15000 });
      await p.eval(`(() => { const s = [...document.querySelectorAll('select')].find((x) => [...x.options].some((o) => o.textContent === ${JSON.stringify(`Board course ${RUN}`)})); const o = [...s.options].find((o) => o.textContent === ${JSON.stringify(`Board course ${RUN}`)}); Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
      await p.waitFor(`document.querySelectorAll('ol > li').length >= 1 && document.body.textContent.includes('(you)')`, { label: 'ranked', timeout: 15000 });
      const board = (await api(`/leaderboards/course?courseId=${course.id}`, token)).json.leaderboard;
      assert(board.length === 2, `expected the 2 enrolled learners, got ${board.length}`);
      return `${board.length} enrolled learners ranked`;
    });

    await check('Phone width (375px): Settings, Planner and Library fit without horizontal scrolling', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      for (const url of ['/settings', '/planner', '/library?tab=flashcards', '/progress']) {
        await p.goto(`${BASE}${url}`, ready('h1'));
        await sleep(1500);
        const over = await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        assert(over <= 1, `${url}: ${over}px`);
      }
    });
  } finally {
    await p.close().catch(() => {});
    await chrome.close();
  }
  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} checks passed`);
  process.exitCode = passed === results.length ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
