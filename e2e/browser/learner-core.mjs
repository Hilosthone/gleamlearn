// e2e/browser/learner-core.mjs — real-browser check of the learner core pages against a LOCAL backend.
// Dashboard (shared stats), Navbar bell, /notifications, /settings, /progress, /history.
// All checks are "real": real frontend build + real local backend on a disposable database. No mocked responses.
// Accounts are throw-away @example.test learners created through the API; passwords are never printed.
//   BASE_URL (default http://localhost:3917, built with NEXT_PUBLIC_API_URL=API_URL), API_URL (default http://127.0.0.1:5055/api/v1)
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');

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
const text = (p) => p.eval('document.body.innerText');
const FAKE = /Hilosthone|hilosthone|Maxwell-Faraday|Physics 401|Level 42 Scholar|142\.5 hrs|Electrodynamics/;

/** The Navbar bell (the only /notifications link with an aria-label; the sidebar and dashboard also link there). */
const BELL = 'a[href="/notifications"][aria-label]';
const bellLabel = (p) => p.eval(`document.querySelector(${JSON.stringify(BELL)})?.getAttribute('aria-label') ?? null`);

/** Clicks the element with exactly this text inside `scope` (the page's own tabs, never same-named sidebar links). */
async function clickIn(p, scope, label) {
  const ok = await p.eval(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)});
    if (!el) return false;
    el.click();
    return true;
  })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(300);
}
const TAB = '[role=tab]';

/** Direct check against the backend. The page has often just used the same endpoint, so 429 is retried. */
async function api(path, token, init = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
    if (r.status !== 429) return r.json();
    await sleep(2500);
  }
  throw new Error(`${path} stayed throttled`);
}

async function signup(tag) {
  const body = { fullName: `Core ${tag}`, username: `core${tag}${RUN}`, email: `core-${tag}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
  const r = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const json = await r.json();
  if (r.status !== 201 || !json.accessToken) throw new Error(`signup ${tag} → ${r.status}`);
  return { ...body, token: json.accessToken };
}

async function main() {
  const a = await signup('a');
  await sleep(700);
  const b = await signup('b');
  const chrome = await launch({ port: 9341 });
  const p = await newPage(chrome.port);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const apiCalls = [];
  p.on('Network.requestWillBeSent', (e) => e.request.url.startsWith(API) && e.request.method !== 'OPTIONS' && apiCalls.push(`${e.request.method} ${e.request.url.slice(API.length).split('?')[0]}`));

  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(a.token)})`);

    await check('Dashboard: XP/coins/streak loaded once for Navbar + page (shared request)', async () => {
      apiCalls.length = 0;
      await p.goto(`${BASE}/dashboard`, ready(BELL));
      await sleep(2500);
      const count = (path) => apiCalls.filter((c) => c === `GET ${path}`).length;
      assert(count('/xp') === 1 && count('/coins') === 1 && count('/streak') === 1, `xp ${count('/xp')}, coins ${count('/coins')}, streak ${count('/streak')}`);
      return 'GET /xp, /coins, /streak: 1 each (was 2 each)';
    });

    await check('Navbar bell shows the real unread count (welcome notification)', async () => {
      await p.waitFor(`(document.querySelector(${JSON.stringify(BELL)})?.getAttribute('aria-label') ?? '').includes('unread')`, { label: 'unread bell' });
      return await bellLabel(p);
    });

    await check('/notifications lists real notifications; "Mark all read" updates the server and the bell', async () => {
      await p.goto(`${BASE}/notifications`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('Welcome to GleamLearn')`, { label: 'welcome notification' });
      const t = await text(p);
      assert(!FAKE.test(t), 'fake content present');
      await p.click('Mark all read');
      await p.waitFor(`document.body.innerText.includes('You are all caught up.')`, { label: 'caught up' });
      await p.waitFor(`document.querySelector(${JSON.stringify(BELL)})?.getAttribute('aria-label') === 'Notifications'`, { label: 'bell cleared' });
      const r = await api('/notifications/unread', a.token);
      assert(Array.isArray(r.data) && r.data.length === 0, `server still has ${r.data?.length} unread`);
      return 'server unread = 0; bell dot cleared';
    });

    await check('/settings shows the real profile (no sample person)', async () => {
      await p.goto(`${BASE}/settings`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes(${JSON.stringify(a.email)})`, { label: 'profile email' });
      const t = await text(p);
      assert(t.includes(a.fullName) && t.includes(`@${a.username}`), 'name/username missing');
      assert(!FAKE.test(t), 'fake content present');
      return `${a.fullName} @${a.username}`;
    });

    await check('Edit profile: a taken username is refused (409 shown); a new name is saved on the server', async () => {
      await clickIn(p, TAB, 'Edit Profile');
      await p.waitFor(ready('#pf-username'));
      await p.fill('#pf-username', b.username);
      await p.click('form button[type=submit]');
      await p.waitFor(`document.body.innerText.includes('That username is already taken.')`, { label: '409 message' });
      await sleep(3200); // PATCH /users/me allows 1 request per 3 s
      await p.fill('#pf-username', a.username);
      await p.fill('#pf-fullName', 'Core A Renamed');
      await p.click('form button[type=submit]');
      await p.waitFor(`document.body.innerText.includes('Your profile was saved.')`, { label: 'saved', timeout: 20000 });
      const me = await api('/users/me', a.token);
      assert(me.fullName === 'Core A Renamed' && me.username === a.username, `server has ${me.fullName} / ${me.username}`);
      return 'server: fullName updated, username unchanged';
    });

    await check('Settings → Notifications: a switch saves to the server', async () => {
      await clickIn(p, TAB, 'Settings');
      await clickIn(p, 'nav[aria-label="Settings sections"] button', 'Notifications');
      await p.waitFor(`[...document.querySelectorAll('label')].some((l) => l.textContent.includes('News and offers') && l.querySelector('input'))`, { label: 'settings switches' });
      await p.eval(`[...document.querySelectorAll('label')].find((l) => l.textContent.includes('News and offers')).querySelector('input').click()`);
      await sleep(1500);
      const s = await api('/notifications/settings', a.token);
      assert(s.data?.marketingEmails === true, `marketingEmails ${s.data?.marketingEmails}`);
      return 'marketingEmails = true on the server';
    });

    await check('Settings → Privacy says it is not available (no fake controls)', async () => {
      await clickIn(p, 'nav[aria-label="Settings sections"] button', 'Privacy');
      await p.waitFor(`document.body.innerText.includes("Privacy settings aren't available yet")`, { label: 'privacy unavailable' });
    });

    await check('/progress → Streak: check-in works, the calendar marks today, the Navbar streak updates', async () => {
      await p.goto(`${BASE}/progress`, ready('h1'));
      await clickIn(p, TAB, 'Streak');
      await p.waitFor(`document.body.innerText.includes('Check in for today')`, { label: 'check-in button' });
      await p.click('Check in for today');
      await p.waitFor(`document.body.innerText.includes('Today counts towards your streak.')`, { label: 'checked in', timeout: 20000 });
      const today = new Date().toISOString().slice(0, 10);
      await p.waitFor(`!!document.querySelector('[aria-label="${today}, checked in"]')`, { label: 'calendar cell', timeout: 20000 });
      assert(/1 day\b/.test(await text(p)), 'streak not 1 day');
      const s = await api('/streak', a.token);
      assert(s.currentStreak === 1 && s.checkedInToday === true, `server streak ${s.currentStreak}`);
      return `server streak 1, checked in; ${today} marked`;
    });

    await check('/progress other views render real data or honest empty states', async () => {
      for (const [tab, expect] of [
        ['Overview', /No courses yet|Course progress/],
        ['XP & Level', /Level 1|No XP yet/],
        ['Coins', /No coin activity yet|Coin history/],
        ['Achievements', /Achievements|No achievements available yet/],
        ['Leaderboard', /No rankings yet|XP/],
      ]) {
        await sleep(1200); // stay under the 2-requests-per-2-s limits of these endpoints
        await clickIn(p, TAB, tab);
        await p.waitFor(`!document.body.innerText.includes('Loading') && ${expect}.test(document.body.innerText)`, { label: tab, timeout: 20000 });
      }
      assert(!FAKE.test(await text(p)), 'fake content present');
      return 'overview, XP, coins, achievements, leaderboard';
    });

    await check('/history: the check-in appears; assessments honestly unavailable; AI history empty state', async () => {
      await sleep(2000);
      await p.goto(`${BASE}/history`, ready('h1'));
      await p.waitFor(`document.body.innerText.includes('Daily check-in')`, { label: 'check-in in activity', timeout: 20000 });
      await clickIn(p, TAB, 'Assessments');
      await p.waitFor(`document.body.innerText.includes("Assessment history isn't available yet")`);
      await clickIn(p, TAB, 'AI');
      await p.waitFor(`/No AI conversations yet|AI tutor/.test(document.body.innerText)`);
      assert(!FAKE.test(await text(p)), 'fake content present');
    });

    const throttled = p.consoleErrors.filter((e) => /status of 429/.test(e));
    const unexpected = p.consoleErrors.filter((e) => !/status of (409|429)/.test(e));
    record('No unexpected console errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | ') || `${throttled.length} throttled (429) request(s); 409 from the username check`);
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
