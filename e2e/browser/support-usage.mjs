// e2e/browser/support-usage.mjs — problem reports, feedback, question reports and usage against a LOCAL stack (real
// frontend build, real local backend): reports reach the admin moderation queue and the learner sees the outcome;
// usage shows real counts against the limits the server enforces.
// Needs PQ_SUBJECT (mycoursea-backend test/live/seed-past-questions.mjs) and ADMIN_EMAIL / ADMIN_PASSWORD for the
// local seeded super admin (never printed).
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
const PQ_SUBJECT = process.env.PQ_SUBJECT;
if (!PQ_SUBJECT || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('PQ_SUBJECT, ADMIN_EMAIL and ADMIN_PASSWORD are required');

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
const tab = (p, label) => clickText(p, '[role=tab]', label);
const reportsList = `section[aria-label="Your reports"]`;

async function main() {
  const signup = async (name) => {
    const body = { fullName: 'Support Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('sup');
  const other = await signup('supo');
  const admin = (await api('/admin/auth/login', null, { method: 'POST', body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) })).json?.accessToken;
  if (!admin) throw new Error('local admin login failed');
  await api('/personal-courses', token, { method: 'POST', body: JSON.stringify({ title: `Chemistry ${RUN}`, subjects: ['Chemistry'] }) });
  const problem = `The study timer froze on ${RUN}`;

  const chrome = await launch({ port: 9356 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Support → Report a problem: sent from the app (no email fallback) and listed under "Your reports" as waiting', async () => {
      await p.goto(`${BASE}/support`, ready('h1'));
      await tab(p, 'Report a problem');
      await p.waitFor(`!!document.querySelector('form[aria-label="Report a problem"] textarea')`, { timeout: 15000 });
      assert(!(await p.eval(has('Email us'))), 'offline email fallback shown');
      await p.fill('form[aria-label="Report a problem"] select', 'Something is broken');
      await p.fill('form[aria-label="Report a problem"] textarea', problem);
      await clickText(p, 'button', 'Send report');
      await p.waitFor(has('Your report was sent'), { label: 'sent', timeout: 15000 });
      await p.waitFor(`document.querySelector('${reportsList}')?.textContent.includes(${JSON.stringify(problem)})`, { label: 'listed', timeout: 15000 });
      assert(await p.eval(`document.querySelector('${reportsList}').textContent.includes('Waiting for review')`), 'status');
    });

    let reportId = null;
    await check('The report reaches the admin moderation queue; another learner cannot see it', async () => {
      const list = await api('/admin/reports?status=PENDING&reportedItemType=GENERAL&limit=50', admin);
      const row = (list.json?.data?.reports ?? []).find((r) => r.description === problem);
      assert(row, `not in /admin/reports (${list.status})`);
      assert(row.reason === '[OTHER] Something is broken', row.reason);
      reportId = row.id;
      const theirs = (await api('/reports/me', other)).json;
      assert(Array.isArray(theirs) && !theirs.some((r) => r.id === reportId), 'visible to another learner');
      const learner = await api('/admin/reports', token);
      assert(learner.status === 401 || learner.status === 403, `learner on admin route ${learner.status}`);
      return `report ${reportId.slice(0, 8)} pending; learner token on /admin/reports → ${learner.status}`;
    });

    await check('A moderator resolves it; the learner sees "Resolved"', async () => {
      assert(reportId, 'no report');
      const r = await api(`/admin/reports/${reportId}/resolve`, admin, { method: 'PATCH' });
      assert(r.status === 200, `resolve ${r.status}`);
      await p.reload(ready('h1'));
      await tab(p, 'Report a problem');
      await p.waitFor(`document.querySelector('${reportsList}')?.textContent.includes('Resolved')`, { label: 'resolved', timeout: 15000 });
    });

    await check('Feedback: a 4-star rating with a message is stored; invalid ratings are refused', async () => {
      await tab(p, 'Feedback');
      await p.waitFor(`!!document.querySelector('form[aria-label="Feedback"] textarea')`, { timeout: 15000 });
      await p.eval(`document.querySelector('form[aria-label="Feedback"] button[aria-label="4 stars"]').click()`);
      await sleep(300);
      await p.fill('form[aria-label="Feedback"] textarea', `Visual lessons are great ${RUN}`);
      await clickText(p, 'button', 'Send feedback');
      await p.waitFor(has('your feedback was sent'), { label: 'feedback sent', timeout: 15000 });
      await sleep(5200); // feedback is throttled to one per 5 s
      const bad = await api('/feedback', token, { method: 'POST', body: JSON.stringify({ rating: 6, message: 'x' }) });
      assert(bad.status === 400, `rating 6 → ${bad.status}`);
      return 'rating 6 → 400';
    });

    await check('Past questions → "Report a problem with this question" sends a question report, shown in Support', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await tab(p, 'Past questions');
      await p.waitFor(`!!document.querySelector('form[aria-label="Find past questions"]')`, { timeout: 15000 });
      await p.fill('form[aria-label="Find past questions"] label:first-child select, form[aria-label="Find past questions"] label:first-child input', PQ_SUBJECT);
      await clickText(p, 'button', 'Find questions');
      await p.waitFor(`document.querySelectorAll('ol[aria-label="Past questions"] > li').length > 0`, { label: 'questions', timeout: 15000 });
      const first = 'ol[aria-label="Past questions"] > li:first-child';
      await p.eval(`document.querySelector('${first} input[type=radio]').click()`);
      await sleep(300);
      await clickText(p, `${first} button`, 'Check answer');
      await clickText(p, `${first} button`, 'Report a problem with this question');
      await p.fill(`${first} form[aria-label="Report this question"] textarea`, `Option text has a typo ${RUN}`);
      await clickText(p, `${first} button`, 'Send report');
      await p.waitFor(`document.querySelector('${first}')?.textContent.includes('Thanks — reported')`, { label: 'reported', timeout: 15000 });
      const mine = (await api('/reports/me', token)).json;
      const q = mine.find((r) => r.target === 'QUESTION');
      assert(q && q.details === `Option text has a typo ${RUN}` && q.targetId, JSON.stringify(mine));
      return `question ${q.targetId.slice(0, 8)} reported`;
    });

    await check('Settings → Usage & limits: real counts against enforced limits; uncapped daily use says "No limit"', async () => {
      await p.goto(`${BASE}/settings`, ready('h1'));
      await clickText(p, 'button', 'Settings');
      await clickText(p, 'button', 'Usage & limits');
      await p.waitFor(has('Personal courses'), { label: 'usage', timeout: 15000 });
      const text = await p.eval(`document.querySelector('[role=progressbar][aria-label="Personal courses"]')?.closest('li')?.textContent ?? ''`);
      assert(text.includes('1 of 50'), text);
      const mats = await p.eval(`document.querySelector('[role=progressbar][aria-label="Uploaded materials"]')?.closest('li')?.textContent ?? ''`);
      assert(mats.includes('0 of 200'), mats);
      assert(await p.eval(has('No limit')), 'uncapped quotas');
      const otherUsage = (await api('/usage', other)).json;
      assert(otherUsage.quotas.courses.used === 0, 'another learner shares counts');
      return 'courses 1 of 50, materials 0 of 200; other learner 0';
    });

    await check('Phone width (375px): Support and Settings fit without horizontal scrolling', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      for (const url of ['/support', '/settings']) {
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
