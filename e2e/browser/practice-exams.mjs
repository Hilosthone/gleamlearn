// e2e/browser/practice-exams.mjs — Practice & Exams end to end against a LOCAL stack: official quiz/test/exam
// start → answer → submit → stored attempt → review; timed attempts resume after a refresh; exam readiness; History;
// Performance analytics (from real submissions); past questions; exam-prep plans; ownership.
// Needs: SEED='{"quizzes","tests","exams"}' (mycoursea-backend test/live/seed-assessments.mjs) and PQ_SUBJECT
// (test/live/seed-past-questions.mjs — clearly marked fixture questions in the disposable e2e database).
// "real" = real frontend build + real local backend; no AI is involved here.
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
const seed = JSON.parse(process.env.SEED ?? '{}');
const PQ_SUBJECT = process.env.PQ_SUBJECT;
if (!seed.quizzes || !seed.tests || !seed.exams || !PQ_SUBJECT) throw new Error('SEED and PQ_SUBJECT are required');

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
async function clickText(p, scope, label, exact = true) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => { const t = b.textContent.replace(/\\s+/g, ' ').trim(); return ${exact} ? t === ${JSON.stringify(label)} : t.includes(${JSON.stringify(label)}); }); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(350);
}
async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3000);
  }
  throw new Error(`${path} stayed throttled`);
}
const tab = (p, label) => clickText(p, '[role=tab]', label);
/** In the list for this kind, presses "Start <kind>" on the seeded card (matched by its run id in the title). */
async function startSeeded(p, kind, title) {
  await p.waitFor(has(title), { label: `${kind} listed`, timeout: 20000 });
  const ok = await p.eval(`(() => { const card = [...document.querySelectorAll('li, article, div')].reverse().find((e) => e.textContent.includes(${JSON.stringify(title)}) && [...e.querySelectorAll('button')].some((b) => /^Start /.test(b.textContent.trim()))); if (!card) return false; [...card.querySelectorAll('button')].find((b) => /^Start /.test(b.textContent.trim())).click(); return true; })()`);
  assert(ok, `no Start button for ${title}`);
  await p.waitFor(`!!document.querySelector('input[type=radio]')`, { label: 'questions', timeout: 20000 });
}
/** Picks option text for question n (0-based) in the official question list. */
const pick = (p, n, text) => p.eval(`(() => { const groups = [...document.querySelectorAll('fieldset')]; const g = groups[${n}]; const l = [...g.querySelectorAll('label')].find((x) => x.textContent.trim() === ${JSON.stringify(text)}); if (!l) return false; l.click(); return true; })()`);

async function main() {
  const signup = async (name) => {
    const body = { fullName: 'Practice Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('prx');
  const other = await signup('prxo');
  const titleOf = (kind) => `E2E ${kind} ${seed.run}`;
  const chrome = await launch({ port: 9353 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  let quizAttempt;
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Official quiz: start → answer → submit stores the attempt and links to its review', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await tab(p, 'Quizzes');
      await startSeeded(p, 'quiz', titleOf('quizzes'));
      assert(await pick(p, 0, '4'), 'option 4');
      assert(await pick(p, 1, 'Lagos'), 'option Lagos');
      await sleep(3100); // submit allows 1 per 3 s
      await clickText(p, 'button', 'Submit answers');
      await p.waitFor(has('Review your answers'), { label: 'review link', timeout: 20000 });
      const list = await api('/quizzes/attempts', token);
      assert(list.status === 200 && list.json.length === 1 && list.json[0].status === 'submitted' && Number(list.json[0].score) === 50, JSON.stringify(list.json).slice(0, 200));
      quizAttempt = list.json[0].id;
      return `score ${list.json[0].score}%`;
    });

    await check('The review page shows the score and each question: correct / your answer vs the correct one', async () => {
      await clickText(p, 'a', 'Review your answers');
      await p.waitFor(`location.pathname.startsWith('/practice/official/quiz/attempts/')`, { timeout: 15000 });
      await p.waitFor(has('50%'), { timeout: 15000 });
      assert(await p.eval(has('Correct')), 'correct marker');
      assert(await p.eval(has('Your answer: Lagos · correct answer: Abuja')), 'wrong-answer detail (letter key B resolved to Abuja)');
      assert(await p.eval(has('Abuja since 1991.')), 'explanation');
    });

    await check('Another learner gets 404 for that attempt', async () => {
      const r = await api(`/quizzes/attempts/${quizAttempt}`, other);
      assert(r.status === 404, `status ${r.status}`);
    });

    await check('Official test is timed: countdown shown; refreshing resumes the same attempt', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await tab(p, 'Tests');
      await startSeeded(p, 'test', titleOf('tests'));
      await p.waitFor(`!!document.querySelector('[role=timer]')`, { label: 'timer', timeout: 10000 });
      const before = (await api('/tests/attempts', token)).json;
      await sleep(2500); // the start and assessment routes are rate-limited per second
      await p.reload(ready('h1'));
      await tab(p, 'Tests');
      await startSeeded(p, 'test', titleOf('tests'));
      await p.waitFor(has('resumed your attempt in progress'), { label: 'resumed', timeout: 10000 });
      const after = (await api('/tests/attempts', token)).json;
      assert(before.length === 1 && after.length === 1 && before[0].id === after[0].id && after[0].status === 'in_progress' && after[0].deadlineAt, 'one open attempt with a deadline');
      return `deadline ${after[0].deadlineAt}`;
    });

    await check('Official exam: readiness shows no attempts; after submitting, readiness is computed from it', async () => {
      await p.goto(`${BASE}/exams`, ready('h1'));
      await startSeeded(p, 'exam', titleOf('exams'));
      await p.waitFor(has('Readiness: no attempts yet'), { label: 'readiness before', timeout: 10000 });
      assert(await pick(p, 0, '4'), 'exam q1');
      assert(await pick(p, 1, 'Abuja'), 'exam q2');
      await sleep(3100);
      await clickText(p, 'button', 'Submit answers');
      await p.waitFor(has('Review your answers'), { timeout: 20000 });
      const r = await api(`/exams/${seed.exams}/readiness`, token);
      assert(r.json?.status === 'ready' && r.json.attempts === 1 && r.json.lastScore === 100, JSON.stringify(r.json));
      return `readiness ${r.json.status}, best ${r.json.bestScore}%`;
    });

    await check('History lists the attempts (submitted and in progress) with scores', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await tab(p, 'History');
      await p.waitFor(`!!document.querySelector('ul[aria-label="Attempt history"] li')`, { timeout: 15000 });
      const n = await p.eval(`document.querySelectorAll('ul[aria-label="Attempt history"] li').length`);
      assert(n === 3, `${n} rows`);
      assert(await p.eval(`document.querySelector('ul[aria-label="Attempt history"]').textContent.includes('in progress')`), 'in-progress test');
    });

    await check('Performance is computed from the real submissions (no placeholder figures)', async () => {
      await tab(p, 'Performance');
      await p.waitFor(`!!document.querySelector('[aria-label=Overview]')`, { timeout: 15000 });
      const ov = (await api('/analytics/overview', token)).json;
      const m = (await api('/analytics/mastery', token)).json;
      assert(ov.totalAssessments === 2 && ov.averageScore === 75, JSON.stringify(ov));
      assert(m.overallMasteryPercentage === 75 && m.questionsAnswered === 4, JSON.stringify(m)); // 3 of 4 correct
      assert(await p.eval(has('75%')), 'shown on the page');
      const fresh = (await api('/analytics/mastery', other)).json;
      assert(fresh.overallMasteryPercentage === null, `other learner ${JSON.stringify(fresh)}`);
      return 'average 75%, mastery 75% (3/4); a new learner has null mastery';
    });

    await check('Past questions: filter by subject, answer, and check the real answer key', async () => {
      await tab(p, 'Past questions');
      await p.waitFor(`!!document.querySelector('form[aria-label="Find past questions"]')`, { timeout: 15000 });
      await p.fill('form[aria-label="Find past questions"] label:first-child select, form[aria-label="Find past questions"] label:first-child input', PQ_SUBJECT);
      await clickText(p, 'button', 'Find questions');
      await p.waitFor(`document.querySelectorAll('ol[aria-label="Past questions"] > li').length === 2`, { label: 'two questions', timeout: 15000 });
      await clickText(p, 'ol[aria-label="Past questions"] > li:first-child label', 'Chloroplast');
      await clickText(p, 'ol[aria-label="Past questions"] > li:first-child button', 'Check answer');
      await p.waitFor(`document.querySelector('ol[aria-label="Past questions"] > li:first-child [role=status]')?.textContent.includes('Correct')`, { label: 'correct', timeout: 5000 });
    });

    await check('Exam prep plans: create (with countdown), edit, delete — persisted for this learner only', async () => {
      await tab(p, 'Exam prep plans');
      await p.waitFor(`!!document.querySelector('form[aria-label="Exam preparation plan"]')`, { timeout: 15000 });
      const date = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
      await p.fill('form[aria-label="Exam preparation plan"] input', `JAMB ${RUN}`);
      await p.fill('form[aria-label="Exam preparation plan"] input[type=date]', date);
      await p.fill('form[aria-label="Exam preparation plan"] label:nth-of-type(4) input', 'Biology, Chemistry');
      await clickText(p, 'button', 'Save plan');
      await p.waitFor(has(`JAMB ${RUN}`) + ' && ' + has('days to go'), { label: 'plan listed', timeout: 15000 });
      const plans = (await api('/exam-prep', token)).json;
      assert(plans.length === 1, `${plans.length} plans`);
      assert((await api(`/exam-prep/${plans[0].id}`, other)).status === 404, 'other learner can read it');
      await p.eval(`document.querySelector('[aria-label="Edit JAMB ${RUN}"]').click()`);
      await sleep(300);
      await p.fill('ul[aria-label="Your preparation plans"] form input', `JAMB ${RUN} (edited)`);
      await clickText(p, 'ul[aria-label="Your preparation plans"] button', 'Save plan');
      await p.waitFor(has('(edited)'), { timeout: 15000 });
      await p.eval('window.confirm = () => true');
      await p.eval(`document.querySelector('[aria-label="Delete JAMB ${RUN} (edited)"]').click()`);
      await p.waitFor(has('No preparation plans yet'), { timeout: 15000 });
    });

    await check('Phone width (375px): Practice tabs and the review page fit without horizontal scrolling', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      for (const url of ['/practice', `/practice/official/quiz/attempts/${quizAttempt}`]) {
        await p.goto(`${BASE}${url}`, ready('h1'));
        await sleep(800);
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
