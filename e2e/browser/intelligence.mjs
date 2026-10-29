// e2e/browser/intelligence.mjs — learning intelligence and gamification against a LOCAL stack (real frontend build,
// real local backend; no AI): generated study plan, live study timer, calendar, level & rank, learning progress,
// scoped leaderboards, and "What to study next" — all computed from this learner's own records.
// Needs SEED='{"quizzes",...}' from mycoursea-backend test/live/seed-assessments.mjs (an official quiz to create data).
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
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
async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3000);
  }
  throw new Error(`${path} stayed throttled`);
}
const ymd = (d) => d.toISOString().slice(0, 10);

async function main() {
  const signup = async (name, extra = {}) => {
    const body = { fullName: 'Intel Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD, ...extra };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('itl');
  const other = await signup('itlo');
  // data: a personal course with modules, and one official quiz submitted half right (weak topic "General")
  const course = (await api('/personal-courses', token, { method: 'POST', body: JSON.stringify({ title: `Biology ${RUN}`, subjects: ['Biology'] }) })).json;
  for (const t of ['Cells', 'Genetics', 'Ecology']) {
    await sleep(2100);
    await api(`/personal-courses/${course.id}/modules`, token, { method: 'POST', body: JSON.stringify({ title: t }) });
  }
  await sleep(3100);
  await api(`/quizzes/${seed.quizzes}/submit`, token, { method: 'POST', body: JSON.stringify({ answers: { 0: '4', 1: 'Lagos' } }) });

  const chrome = await launch({ port: 9354 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Planner → Generate a study plan from my course: sessions until the deadline (modules in turn, final revision)', async () => {
      await p.goto(`${BASE}/planner`, ready('h1'));
      await p.waitFor(`!!document.querySelector('form[aria-label="Generate a study plan"] select option[value="${course.id}"]')`, { timeout: 20000 });
      await p.fill('form[aria-label="Generate a study plan"] select', course.id);
      const deadline = ymd(new Date(Date.now() + 15 * 86400000));
      await p.fill('form[aria-label="Generate a study plan"] input[type=date]', deadline);
      await clickText(p, 'button', 'Generate plan');
      await p.waitFor(has('sessions planned for'), { label: 'generated', timeout: 20000 });
      const items = (await api('/planner', token)).json;
      const list = Array.isArray(items) ? items : items.schedule ?? [];
      const generated = list.filter((x) => x.metadata?.generated);
      assert(generated.length >= 3 && generated.some((x) => /Study: (Cells|Genetics|Ecology)/.test(x.title)) && generated.some((x) => x.activityType === 'revision'), `generated ${generated.map((x) => x.title).join(' | ')}`);
      assert(generated.every((x) => x.scheduledDate < deadline), 'a session on/after the deadline');
      // regenerating replaces the open generated sessions instead of duplicating them
      await sleep(2100);
      await clickText(p, 'button', 'Generate plan');
      await sleep(1500);
      const again = ((await api('/planner', token)).json);
      const list2 = (Array.isArray(again) ? again : again.schedule ?? []).filter((x) => x.metadata?.generated);
      assert(list2.length === generated.length, `${generated.length} → ${list2.length} after regenerating`);
      return `${generated.length} sessions, e.g. ${generated[0].title}`;
    });

    await check('Study timer: start → pause → resume → finish records a completed session', async () => {
      await clickText(p, '[role=tab]', 'Study sessions');
      await p.waitFor(`!!document.querySelector('section[aria-label="Study timer"] input')`, { timeout: 15000 });
      await p.fill('section[aria-label="Study timer"] input', `Timer ${RUN}`);
      await clickText(p, 'section[aria-label="Study timer"] button', 'Start');
      await p.waitFor(`!!document.querySelector('[role=timer]')`, { timeout: 10000 });
      await sleep(2200);
      await clickText(p, 'section[aria-label="Study timer"] button', 'Pause');
      await p.waitFor(has('Paused'), { timeout: 10000 });
      await sleep(2200);
      await p.reload(ready('h1'));
      await clickText(p, '[role=tab]', 'Study sessions');
      await p.waitFor(`document.querySelector('section[aria-label="Study timer"]')?.textContent.includes('Timer ${RUN}')`, { label: 'session picked up after reload', timeout: 15000 });
      await clickText(p, 'section[aria-label="Study timer"] button', 'Resume');
      await p.waitFor(has('Running'), { timeout: 10000 });
      await sleep(2200);
      await clickText(p, 'section[aria-label="Study timer"] button', 'Finish');
      await p.waitFor(`!!document.querySelector('section[aria-label="Study timer"] input')`, { label: 'timer reset', timeout: 10000 });
      const today = (await api('/study-sessions/today', token)).json;
      assert(today.sessions?.some((s) => s.title === `Timer ${RUN}` && s.status === 'completed'), JSON.stringify(today).slice(0, 200));
    });

    await check('Calendar: add an event this month, edit it, delete it (owner-only)', async () => {
      await clickText(p, '[role=tab]', 'Calendar');
      await p.waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Add event')`, { timeout: 15000 });
      await clickText(p, 'button', 'Add event');
      await p.fill('form[aria-label="Calendar event"] input', `Exam ${RUN}`);
      await clickText(p, 'form[aria-label="Calendar event"] button', 'Save event');
      await p.waitFor(has(`Exam ${RUN}`), { label: 'event listed', timeout: 15000 });
      const now = new Date();
      const month = (await api(`/calendar/month?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, token)).json;
      const ev = (Array.isArray(month) ? month : []).find((e) => e.title === `Exam ${RUN}`);
      assert(ev, 'not stored');
      assert((await api(`/calendar/events/${ev.id}`, other, { method: 'DELETE' })).status === 404, 'other learner deleted it');
      await p.eval(`document.querySelector('[aria-label="Edit Exam ${RUN}"]').click()`);
      await sleep(300);
      await p.fill('form[aria-label="Calendar event"] input', `Exam ${RUN} (moved)`);
      await clickText(p, 'form[aria-label="Calendar event"] button', 'Save event');
      await p.waitFor(has('(moved)'), { timeout: 15000 });
      await p.eval('window.confirm = () => true');
      await p.eval(`document.querySelector('[aria-label="Delete Exam ${RUN} (moved)"]').click()`);
      await p.waitFor(has('Nothing in your calendar this month'), { timeout: 15000 });
    });

    await check('Progress → Level & rank shows the real level, XP to next level and title ladder', async () => {
      await p.goto(`${BASE}/progress`, ready('h1'));
      await clickText(p, '[role=tab]', 'Level & rank');
      await p.waitFor(`!!document.querySelector('[aria-label="Your level"]')`, { timeout: 15000 });
      const me = (await api('/levels/me', token)).json;
      assert(await p.eval(has(`Level ${me.currentLevel}`)), 'level shown');
      assert(await p.eval(`!!document.querySelector('[role=progressbar][aria-label="Progress to the next level"]')`), 'progress bar');
      return `level ${me.currentLevel}, ${me.totalXp} XP`;
    });

    await check('Progress → Learning progress reflects the submitted quiz (mastery from real answers)', async () => {
      await clickText(p, '[role=tab]', 'Learning progress');
      await p.waitFor(`!!document.querySelector('[aria-label="Progress overview"]')`, { timeout: 15000 });
      assert(await p.eval(`document.querySelector('[aria-label="Progress overview"]').textContent.includes('50%')`), 'mastery 50% (1 of 2)');
    });

    await check('Leaderboard "My school" without a school in the profile is empty and says why (it used to list everyone)', async () => {
      await clickText(p, '[role=tab]', 'Leaderboard');
      await clickText(p, '[role=tab]', 'My school');
      await p.waitFor(has('Add your school in your profile'), { timeout: 15000 });
      const r = (await api('/leaderboards/school', token)).json;
      assert(r.leaderboard.length === 0 && /Add your school/.test(r.message), JSON.stringify(r));
      assert((await api('/leaderboards/friends', token)).status === 501, 'friends board is not faked');
    });

    await check('Dashboard → What to study next: the unfinished module and the weak topic, with reasons', async () => {
      await p.goto(`${BASE}/dashboard`, ready('h1'));
      await p.waitFor(`!!document.querySelector('section[aria-labelledby=next-steps]')`, { timeout: 20000 });
      const text = await p.eval(`document.querySelector('section[aria-labelledby=next-steps]').textContent`);
      assert(/Cells \(Biology/.test(text) && /next unfinished module/.test(text), `revision missing: ${text.slice(0, 200)}`);
      assert(/General/.test(text) && /1 of 2 questions/.test(text), `weak topic missing: ${text.slice(0, 300)}`);
      const fresh = (await api('/recommendations', other)).json;
      assert(['topics', 'quizzes', 'revision'].every((k) => fresh[k].length === 0), 'a new learner gets invented suggestions');
    });

    await check('A topic suggestion opens Learn with that topic filled in', async () => {
      await p.eval(`[...document.querySelectorAll('section[aria-labelledby=next-steps] a')].find((a) => a.getAttribute('href').startsWith('/learn?topic='))?.click()`);
      await p.waitFor(`location.pathname === '/learn'`, { timeout: 15000 });
      await p.waitFor(`document.querySelector('form[aria-label="Learn a topic"] input')?.value === 'General'`, { label: 'topic prefilled', timeout: 15000 });
    });

    await check('Phone width (375px): Planner, Progress and Dashboard fit without horizontal scrolling', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      for (const url of ['/planner', '/progress', '/dashboard']) {
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
