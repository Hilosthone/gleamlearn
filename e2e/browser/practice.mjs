// e2e/browser/practice.mjs — real-browser check of /practice and /exams against a LOCAL backend.
// Needs seeded assessments: SEED='{"quizzes":"<id>","tests":"<id>","exams":"<id>"}' (from mycoursea-backend
// test/live/seed-assessments.mjs, which writes only to the disposable gleamlearn_e2e database).
// "real" = real frontend build + real local backend. No mocked responses. Passwords are never printed.
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
const seed = JSON.parse(process.env.SEED ?? '{}');
if (!seed.quizzes || !seed.tests || !seed.exams) throw new Error('SEED with quizzes/tests/exams ids is required');

const RUN = Date.now().toString(36);
const PASSWORD = `Pw-${RUN}-local`;
const results = [];
const record = (name, pass, detail = '') => {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
};
async function check(name, fn) {
  try {
    record(name, true, (await fn()) ?? '');
  } catch (e) {
    record(name, false, e.message);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
async function clickIn(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(400);
}
async function api(path, token, init = {}) {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(2500);
  }
  throw new Error(`${path} stayed throttled`);
}
/** Selects the option with this text for the question at position `pos` (1-based) on the page. */
const choose = (p, pos, option) =>
  p.eval(`(() => {
    const q = document.querySelectorAll('form ol > li')[${pos - 1}];
    const label = [...q.querySelectorAll('label')].find((l) => l.textContent.trim() === ${JSON.stringify(option)});
    label.querySelector('input').click();
    return true;
  })()`);

async function main() {
  const body = { fullName: 'Practice Learner', username: `prac${RUN}`, email: `prac-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
  const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
  if (su.status !== 201) throw new Error(`signup ${su.status}`);
  const token = su.json.accessToken;

  await check('Learners cannot create, edit or delete assessments (admin only)', async () => {
    const create = await api('/quizzes', token, { method: 'POST', body: JSON.stringify({ title: 'mine', questions: [{ question: 'q', options: ['a', 'b'], correctAnswer: 'a' }] }) });
    const edit = await api(`/quizzes/${seed.quizzes}`, token, { method: 'PATCH', body: JSON.stringify({ title: 'hacked' }) });
    const del = await api(`/tests/${seed.tests}`, token, { method: 'DELETE' });
    assert([create, edit, del].every((r) => r.status === 401 || r.status === 403), `statuses ${create.status}/${edit.status}/${del.status}`);
    return `POST ${create.status}, PATCH ${edit.status}, DELETE ${del.status}`;
  });

  await check('Learner reads of a quiz never include the answer key', async () => {
    const r = await api(`/quizzes/${seed.quizzes}`, token);
    assert(r.status === 200 && Array.isArray(r.json.questions) && r.json.questions.length === 2, `status ${r.status}`);
    assert(!/correctAnswer|explanation|Two pairs|since 1991/i.test(JSON.stringify(r.json)), 'answer key exposed');
    return 'questions without correctAnswer/explanation';
  });

  const chrome = await launch({ port: 9343 });
  const p = await newPage(chrome.port);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('/practice lists the stored quiz and grades a fully correct submission (rewards once)', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('E2E quizzes')`, { label: 'seeded quiz listed', timeout: 20000 });
      await p.eval(`[...document.querySelectorAll('li')].find((li) => li.textContent.includes('E2E quizzes')).querySelector('button').click()`);
      await p.waitFor(`document.querySelectorAll('form ol > li').length === 2`, { label: 'questions shown' });
      assert(!/Two pairs|since 1991/i.test(await p.eval('document.body.innerText')), 'explanation shown before submitting');
      await choose(p, 1, '4');
      await choose(p, 2, 'Abuja');
      await p.click('Submit answers');
      await p.waitFor(`document.body.innerText.includes('100%')`, { label: 'score 100%', timeout: 20000 });
      await p.waitFor(`document.body.innerText.includes('Rewards earned')`, { label: 'rewards' });
      const xp = await api('/xp', token);
      assert(xp.json.totalXp > 0, `server XP ${xp.json.totalXp}`);
      return `server XP now ${xp.json.totalXp}`;
    });

    await check('Submitting the same quiz again is graded but earns nothing (server de-duplicates)', async () => {
      await p.click('Back to quizzes');
      await p.waitFor(`document.body.innerText.includes('E2E quizzes')`);
      await sleep(4500); // the submit route allows few requests per minute
      await p.eval(`[...document.querySelectorAll('li')].find((li) => li.textContent.includes('E2E quizzes')).querySelector('button').click()`);
      await p.waitFor(`document.querySelectorAll('form ol > li').length === 2`);
      await choose(p, 1, '4');
      await choose(p, 2, 'Abuja');
      await p.click('Submit answers');
      await p.waitFor(`document.body.innerText.includes('already been awarded')`, { label: 'already awarded', timeout: 20000 });
      assert(!(await p.eval(`document.body.innerText.includes('Rewards earned')`)), 'rewards shown again');
    });

    await check('Tests: half right scores 50% (real grading, not the old fixed 88.5)', async () => {
      await p.click('Back to quizzes');
      await clickIn(p, '[role=tab]', 'Tests');
      await p.waitFor(`document.body.innerText.includes('E2E tests')`, { timeout: 20000 });
      await p.eval(`[...document.querySelectorAll('li')].find((li) => li.textContent.includes('E2E tests')).querySelector('button').click()`);
      await p.waitFor(`document.querySelectorAll('form ol > li').length === 2`);
      await choose(p, 1, '4');
      await choose(p, 2, 'Lagos');
      await p.click('Submit answers');
      await p.waitFor(`document.body.innerText.includes('50%')`, { label: 'score 50%', timeout: 20000 });
      assert(!(await p.eval(`document.body.innerText.includes('88.5')`)), 'fixed score shown');
    });

    await check('/exams opens on the Exams tab with the stored exam', async () => {
      await p.goto(`${BASE}/exams`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('E2E exams')`, { timeout: 20000 });
      assert(!/readiness|85%/i.test(await p.eval('document.body.innerText')), 'fake readiness shown');
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
