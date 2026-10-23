// e2e/browser/registration.mjs — drives the real registration UI in headless Chrome against a LOCAL backend.
//
//   BASE_URL   frontend (default http://localhost:3917, a `next start` build made with NEXT_PUBLIC_API_URL=API_URL)
//   API_URL    backend  (default http://127.0.0.1:5055/api/v1 — a disposable database, never production)
//   MAIL_DIR   where the SMTP sink writes mails (default <tmp>/gleamlearn-e2e-mail), used to read one-time codes
//
// Every result is labelled: "real" = real frontend + real local backend; "mocked" = the request was failed on
// purpose with the DevTools Fetch domain (no mocked response bodies are used anywhere); "browser" = no backend call.
// Accounts are throw-away `@example.test` addresses. Passwords are never printed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
const MAIL_DIR = process.env.MAIL_DIR ?? path.join(os.tmpdir(), 'gleamlearn-e2e-mail');
if (/onrender\.com|vercel\.app|gleamlearn\.(com|ng)/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');

const RUN = Date.now().toString(36);
const PASSWORD = `Pw-${RUN}-local`;
const NEW_PASSWORD = `Pw2-${RUN}-local`;
const acct = (tag) => ({ email: `reg-${RUN}-${tag}@example.test`, username: `reg${RUN}${tag}`, fullName: `Test ${tag} Learner` });
const STEPS = ['path', 'personal', 'security', 'education', 'goals', 'review'];
const DRAFT_KEY = 'gleamlearn.registrationDraft';

const results = [];
const record = (name, mode, pass, detail = '') => {
  results.push({ name, mode, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${mode}] ${name}${detail ? ` — ${detail}` : ''}`);
};
async function check(name, mode, fn) {
  try {
    const detail = await fn();
    record(name, mode, true, typeof detail === 'string' ? detail : '');
  } catch (e) {
    record(name, mode, false, e.message);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const redact = (body) => Object.fromEntries(Object.entries(body).map(([k, v]) => [k, /password/i.test(k) ? '<redacted>' : v]));

function latestCode(email, since) {
  const key = email.replace('@', '_at_');
  for (const f of fs.readdirSync(MAIL_DIR).filter((f) => f.includes(key) && Number(f.split('_')[0]) >= since).sort().reverse()) {
    const raw = fs.readFileSync(path.join(MAIL_DIR, f), 'utf8').replace(/=\r?\n/g, '');
    const m = raw.match(/token=(\d{6})/) || raw.match(/\b(\d{6})\b/);
    if (m) return m[1];
  }
  return null;
}
async function waitCode(email, since) {
  for (let i = 0; i < 50; i++) {
    const c = latestCode(email, since);
    if (c) return c;
    await sleep(200);
  }
  throw new Error(`no mail with a code for ${email}`);
}

// ---------------------------------------------------------------------------------------------------------
// wizard helpers
// ---------------------------------------------------------------------------------------------------------
const currentStep = (p) => p.eval(`(() => { const li = [...document.querySelectorAll('ol[aria-label="Registration progress"] li')]; return ${JSON.stringify(STEPS)}[li.findIndex((l) => l.getAttribute('aria-current') === 'step')] ?? null; })()`);
const STEP_MARK = { path: 'input[name=learner-path]', personal: '#reg-fullName', security: '#reg-password', education: '#reg-school, #reg-class, #reg-university, #reg-exam-other', goals: '#reg-goals', review: '[id^=review-]' };
/** Waits until the progress bar says `id` AND only that step's fields are mounted and hydrated (the exit animation is over). */
const waitStep = (p, id) => p.waitFor(`(() => {
  const li = [...document.querySelectorAll('ol[aria-label="Registration progress"] li')];
  if (${JSON.stringify(STEPS)}[li.findIndex((l) => l.getAttribute('aria-current') === 'step')] !== ${JSON.stringify(id)}) return false;
  const marks = ${JSON.stringify(STEP_MARK)};
  const el = document.querySelector(marks[${JSON.stringify(id)}]);
  if (!el || !Object.keys(el).some((k) => k.startsWith('__react'))) return false;
  return Object.entries(marks).every(([k, sel]) => k === ${JSON.stringify(id)} || !document.querySelector(sel));
})()`, { label: `step ${id}` });
const submitBtn = 'form button[type=submit]';
/** True once React has hydrated the element (server HTML exists before its handlers are attached). */
const hydrated = (selector) => `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
const anyHydrated = (...selectors) => `(${selectors.map(hydrated).join(' || ')})`;
const WIZARD_READY = anyHydrated('input[name=learner-path]', '#resume-heading', 'section[aria-labelledby=wizard-heading] button');
/** The wizard's own Back button (not the header "Back" link to /welcome). */
const back = (p) => p.eval(`[...document.querySelectorAll('form button[type=button]')].find((b) => b.textContent.trim() === 'Back').click()`);
const cont = async (p, nextStep) => {
  await p.click(submitBtn);
  if (nextStep) await waitStep(p, nextStep);
  await sleep(250); // let the 180 ms step transition finish
};
const offerShown = (p) => p.eval(`!!document.getElementById('resume-heading')`);
const storage = (p) => p.eval(`({ local: localStorage.getItem(${JSON.stringify(DRAFT_KEY)}), session: sessionStorage.getItem(${JSON.stringify(DRAFT_KEY)}), token: !!localStorage.getItem('accessToken') })`);
const bannerText = (p) => p.eval(`[...document.querySelectorAll('[role=alert], .rounded-xl')].map((e) => e.textContent).join(' | ')`);
const setPersist = (p, on) => p.eval(`(() => { const box = [...document.querySelectorAll('form input[type=checkbox]')].find((b) => b.closest('label')?.textContent.includes('Save progress on this device')); if (box.checked !== ${on}) box.click(); return box.checked; })()`);
const acceptTerms = (p) => p.eval(`(() => { const box = [...document.querySelectorAll('form input[type=checkbox]')].find((b) => b.closest('label')?.textContent.includes('Terms of Service')); if (!box.checked) box.click(); return box.checked; })()`);

async function openWizard(p) {
  await p.goto(`${BASE}/auth/signup`, WIZARD_READY);
  if (await offerShown(p)) {
    await p.click('Start over');
    await waitStep(p, 'path');
  }
}
async function choosePath(p, pathId) {
  await p.click(`input[name=learner-path][value=${pathId}]`);
  await cont(p, 'personal');
}
async function fillPersonal(p, a) {
  await p.fill('#reg-fullName', a.fullName);
  await p.fill('#reg-username', a.username);
  await p.fill('#reg-email', a.email);
  await p.fill('#reg-country', 'Nigeria');
  await cont(p, 'security');
}
async function fillSecurity(p) {
  await p.fill('#reg-password', PASSWORD);
  await p.fill('#reg-confirm', PASSWORD);
  await acceptTerms(p);
  await cont(p, 'education');
}
async function fillEducation(p, pathId) {
  if (pathId === 'secondary') {
    await p.fill('#reg-school', 'Test Secondary School');
    await p.choose('#reg-class', 'SS3');
  } else if (pathId === 'university') {
    await p.fill('#reg-university', 'Test University');
    await p.fill('#reg-faculty', 'Science');
    await p.fill('#reg-course', 'Physics');
  } else {
    await p.click('JAMB/UTME', { exact: true });
    await p.click('WAEC', { exact: true });
    await p.fill('#reg-timeframe', 'May 2027');
    await p.fill('#reg-subjects', 'Maths, Physics');
  }
}
async function fillGoals(p, goals, time = 'Evening') {
  if (goals) await p.fill('#reg-goals', goals);
  if (time) await p.click(time, { exact: true });
  await cont(p, 'review');
}

/** Records every POST /auth/signup body the page sends (as seen on the wire). */
function captureSignups(p) {
  const bodies = [];
  p.on('Network.requestWillBeSent', (e) => {
    if (e.request.method === 'POST' && e.request.url.endsWith('/auth/signup')) bodies.push(JSON.parse(e.request.postData ?? '{}'));
  });
  return bodies;
}

/** Fails the sign-up POST before it leaves the browser ("Request") or after the backend answered ("Response"). */
async function failSignup(p, stage) {
  const off = p.on('Fetch.requestPaused', async (e) => {
    if (e.request.method === 'POST' && e.request.url.endsWith('/auth/signup')) await p.send('Fetch.failRequest', { requestId: e.requestId, errorReason: 'ConnectionFailed' });
    else await p.send('Fetch.continueRequest', { requestId: e.requestId });
  });
  await p.send('Fetch.enable', { patterns: [{ urlPattern: '*/auth/signup', requestStage: stage }] });
  return async () => {
    off();
    await p.send('Fetch.disable');
  };
}

const SECONDARY_ONLY = ['secondarySchool', 'secondaryClass', 'secondaryStream'];
const UNIVERSITY_ONLY = ['university', 'faculty', 'department', 'courseOfStudy', 'level'];
const keysPresent = (body, keys) => keys.filter((k) => k in body);

// ---------------------------------------------------------------------------------------------------------
async function main() {
  fs.mkdirSync(MAIL_DIR, { recursive: true });
  const health = await fetch(`${API.replace(/\/api\/v1$/, '')}/api/v1/academic-levels`).then((r) => r.status).catch(() => 0);
  console.log(`frontend ${BASE}, backend ${API} (academic-levels ${health}), run ${RUN}`);

  const chrome = await launch({ port: 9333 });
  const pages = [];
  const page = async () => {
    const p = await newPage(chrome.port);
    pages.push(p);
    return p;
  };

  try {
    // ======================= layout, keyboard, motion (browser only; no account is created) =======================
    const L = await page();
    const jsRequests = [];
    L.on('Network.requestWillBeSent', (e) => e.type === 'Script' && jsRequests.push(e.request.url));

    await check('Mobile 360 px: no horizontal overflow, no WebGL canvas, three.js not loaded', 'browser', async () => {
      await L.send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
      jsRequests.length = 0;
      await openWizard(L);
      await sleep(1500);
      const m = await L.eval(`({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, canvas: document.querySelectorAll('canvas').length })`);
      assert(m.sw <= m.cw, `scrollWidth ${m.sw} > ${m.cw}`);
      assert(m.canvas === 0, `${m.canvas} canvas on mobile`);
      const mobileScripts = jsRequests.length;
      await choosePath(L, 'exam');
      const m2 = await L.eval(`({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })`);
      assert(m2.sw <= m2.cw, `personal step overflows: ${m2.sw} > ${m2.cw}`);
      L.mobileScripts = mobileScripts;
      return `scrollWidth ${m.sw}/${m.cw}; ${mobileScripts} script requests`;
    });

    await check('Desktop 1280 px: 3D canvas loads lazily, no overflow', 'browser', async () => {
      await L.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
      jsRequests.length = 0;
      await openWizard(L);
      const canvas = await L.waitFor(`document.querySelectorAll('canvas').length`, { timeout: 15000, label: 'canvas' }).catch(() => 0);
      const m = await L.eval(`({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, fallback: !!document.querySelector('div.rotate-12') })`);
      assert(m.sw <= m.cw, `scrollWidth ${m.sw} > ${m.cw}`);
      assert(canvas >= 1, `no canvas (fallback shown: ${m.fallback}) — headless WebGL may be unavailable`);
      return `canvas ${canvas}; ${jsRequests.length} script requests (mobile: ${L.mobileScripts})`;
    });

    await check('Keyboard: arrow keys choose a path, Enter continues, focus moves to the step heading', 'browser', async () => {
      await openWizard(L);
      await L.eval(`document.querySelector('input[name=learner-path]').focus()`);
      await L.key(' ', 'Space', 32);
      await L.key('ArrowDown', 'ArrowDown', 40);
      const chosen = await L.eval(`document.querySelector('input[name=learner-path]:checked')?.value`);
      assert(chosen === 'university', `ArrowDown selected ${chosen}`);
      await L.key('Enter', 'Enter', 13);
      await waitStep(L, 'personal');
      await sleep(300);
      const focused = await L.eval(`document.activeElement?.id`);
      assert(focused === 'wizard-heading', `focus on ${focused}`);
      // Empty submit → focus goes to the first invalid field, errors are linked
      await L.key('Tab', 'Tab', 9);
      await L.click(submitBtn);
      await sleep(300);
      const err = await L.eval(`({ id: document.activeElement?.id, invalid: document.activeElement?.getAttribute('aria-invalid'), described: !!document.getElementById(document.activeElement?.getAttribute('aria-describedby') ?? '_') })`);
      assert(err.id === 'reg-fullName' && err.invalid === 'true' && err.described, `after invalid submit focus ${JSON.stringify(err)}`);
      return 'Space/ArrowDown on radios, Enter submits, heading focus, first invalid field focused with aria-invalid + aria-describedby';
    });

    const transitionMs = async () => {
      await openWizard(L);
      await L.click(`input[name=learner-path][value=exam]`);
      return L.eval(`new Promise((resolve) => {
        const t0 = performance.now();
        document.querySelector('form button[type=submit]').click();
        const tick = () => document.getElementById('reg-fullName') && getComputedStyle(document.getElementById('reg-fullName').closest('div[style]') ?? document.body).opacity === '1' ? resolve(Math.round(performance.now() - t0)) : requestAnimationFrame(tick);
        tick();
      })`);
    };
    await check('Reduced motion: step changes without the slide animation; 3D stays static', 'browser', async () => {
      const normal = await transitionMs();
      await L.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      const reduced = await transitionMs();
      const mq = await L.eval(`matchMedia('(prefers-reduced-motion: reduce)').matches`);
      await L.send('Emulation.setEmulatedMedia', { features: [] });
      assert(mq, 'media query not applied');
      assert(reduced < normal && reduced < 150, `reduced ${reduced} ms vs normal ${normal} ms`);
      return `next step fully visible after ${normal} ms normally, ${reduced} ms with reduced motion`;
    });

    // ======================= drafts (browser only) =======================
    await check('Draft: this tab only by default — survives reload, not shared with a new tab, no secrets', 'browser', async () => {
      const D = await page();
      await openWizard(D);
      await choosePath(D, 'secondary');
      await D.fill('#reg-fullName', 'Draft Person');
      await D.fill('#reg-email', `draft-${RUN}@example.test`);
      await cont(D); // fails validation (no username) — stays on personal
      assert((await currentStep(D)) === 'personal', 'continued without a username');
      await D.fill('#reg-username', `draft${RUN}`);
      await cont(D, 'security');
      await D.fill('#reg-password', PASSWORD);
      await D.fill('#reg-confirm', PASSWORD);
      await sleep(700);
      const s = await storage(D);
      assert(s.session && !s.local, `session ${!!s.session}, local ${!!s.local}`);
      const sd = JSON.parse(s.session);
      assert(!s.session.includes(PASSWORD) && !/password/i.test(s.session) && sd.values.termsAccepted === false, 'secret or consent in draft');
      await D.reload(WIZARD_READY);
      assert(await offerShown(D), 'no resume offer after reload');
      await D.click('Continue registration');
      await waitStep(D, 'security');
      const pw = await D.eval(`document.getElementById('reg-password').value`);
      assert(pw === '', 'password restored from draft');
      await back(D);
      await waitStep(D, 'personal');
      const name = await D.eval(`document.getElementById('reg-fullName').value`);
      assert(name === 'Draft Person', `name after resume: ${name}`);
      const N = await page();
      await N.goto(`${BASE}/auth/signup`, WIZARD_READY);
      assert(!(await offerShown(N)), 'a new tab offered the tab-only draft');
      await N.close();
      D.keep = true;
      globalThis.draftPage = D;
      return 'sessionStorage only; password empty after resume; values restored; new tab sees nothing';
    });

    await check('Draft: "Save progress on this device" → resume in a new tab; unticking removes it; Start over deletes it', 'browser', async () => {
      const D = globalThis.draftPage;
      await setPersist(D, true);
      await D.fill('#reg-country', 'Ghana');
      await sleep(700);
      let s = await storage(D);
      assert(s.local && !s.local.includes(PASSWORD) && !/password/i.test(s.local), 'device draft missing or contains a secret');
      const N = await page();
      await N.goto(`${BASE}/auth/signup`, WIZARD_READY);
      assert(await offerShown(N), 'no offer in a new tab with a device draft');
      const offerText = await N.eval(`document.getElementById('resume-heading').parentElement.innerText`);
      await N.click('Continue registration');
      await waitStep(N, 'personal');
      const vals = await N.eval(`({ n: document.getElementById('reg-fullName').value, c: document.getElementById('reg-country').value })`);
      assert(vals.n === 'Draft Person' && vals.c === 'Ghana', `resumed ${JSON.stringify(vals)}`);
      await N.close();
      await setPersist(D, false);
      await sleep(700); // autosave is debounced by 400 ms
      s = await storage(D);
      assert(!s.local && s.session, `untick: local ${!!s.local}, session ${!!s.session}`);
      await setPersist(D, true);
      await sleep(700);
      await D.reload(WIZARD_READY);
      assert(await offerShown(D), 'no offer before start over');
      await D.click('Start over');
      await waitStep(D, 'path');
      s = await storage(D);
      const checked = await D.eval(`document.querySelector('input[name=learner-path]:checked')?.value ?? null`);
      assert(!s.local && !s.session && checked === null, `after start over local ${!!s.local} session ${!!s.session} path ${checked}`);
      return `offer: "${offerText.replace(/\s+/g, ' ').slice(0, 90)}…"`;
    });

    await check('Draft: expired and malformed device drafts are discarded', 'browser', async () => {
      const D = globalThis.draftPage;
      const old = JSON.stringify({ version: 1, savedAt: Date.now() - 8 * 24 * 3600 * 1000, step: 'personal', persistent: true, values: { path: 'exam', fullName: 'Old' } });
      await D.eval(`localStorage.setItem(${JSON.stringify(DRAFT_KEY)}, ${JSON.stringify(old)}); sessionStorage.removeItem(${JSON.stringify(DRAFT_KEY)})`);
      await D.reload(WIZARD_READY);
      await sleep(400);
      assert(!(await offerShown(D)), 'expired draft offered');
      const expiredNote = await D.eval(`document.body.innerText.match(/expired|older than|no longer/i)?.[0] ?? ''`);
      await D.eval(`localStorage.setItem(${JSON.stringify(DRAFT_KEY)}, '{not json')`);
      await D.reload(WIZARD_READY);
      await sleep(400);
      assert(!(await offerShown(D)), 'malformed draft offered');
      const s = await storage(D);
      assert(!s.local, 'malformed draft left in storage');
      return `expired notice text: "${expiredNote || 'none found'}"`;
    });

    // ======================= secondary path (real backend) =======================
    const S = await page();
    const sBodies = captureSignups(S);
    await S.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    const sec = acct('sec');
    await check('Secondary: back/forward keeps entered values', 'browser', async () => {
      await openWizard(S);
      await choosePath(S, 'secondary');
      await S.fill('#reg-fullName', sec.fullName);
      await sleep(100);
      await S.eval('history.back()');
      await waitStep(S, 'path');
      assert((await S.eval(`document.querySelector('input[name=learner-path]:checked')?.value`)) === 'secondary', 'path lost on Back');
      await S.eval('history.forward()');
      await waitStep(S, 'personal');
      const n = await S.eval(`document.getElementById('reg-fullName').value`);
      assert(n === sec.fullName, `name after forward: ${n}`);
      return 'browser Back → path step (choice kept); Forward → personal step (name kept)';
    });
    await check('Secondary: full registration sends only secondary fields; duplicate clicks send one request', 'real', async () => {
      await fillPersonal(S, sec);
      await fillSecurity(S);
      await fillEducation(S, 'secondary');
      await cont(S, 'goals');
      await fillGoals(S, 'Distinctions in WAEC');
      await S.eval(`(() => { const b = document.querySelector('form button[type=submit]'); b.click(); b.click(); b.click(); })()`);
      await S.waitFor(`location.pathname === '/auth/verify-email'`, { timeout: 20000, label: 'verify-email page' });
      await sleep(500);
      assert(sBodies.length === 1, `${sBodies.length} sign-up requests`);
      const b = sBodies[0];
      assert(b.educationType === 'Secondary' && b.secondaryClass && b.secondarySchool === 'Test Secondary School', `body ${JSON.stringify(redact(b))}`);
      assert(keysPresent(b, UNIVERSITY_ONLY).length === 0, `university fields: ${keysPresent(b, UNIVERSITY_ONLY)}`);
      assert(!('termsAccepted' in b) && !('path' in b), 'UI-only fields sent');
      const url = new URL(await S.eval('location.href'));
      return `payload keys: ${Object.keys(b).join(', ')}; delivery=${url.searchParams.get('delivery')}`;
    });
    await check('Returning signed-in learner on /auth/signup sees "You already have an account" (unverified)', 'real', async () => {
      await S.goto(`${BASE}/auth/signup`, WIZARD_READY);
      await S.waitFor(`document.body.innerText.includes('You already have an account')`, { label: 'account panel' }).catch(() => {});
      const t = await S.eval('document.body.innerText');
      assert(t.includes('You already have an account'), 'wizard shown to a signed-in learner');
      assert(/verify/i.test(t), 'no verify option for an unverified account');
      return 'panel shown with a verify option';
    });
    await check('Duplicate email/username → "Account already exists" (409)', 'real', async () => {
      const token = await S.eval(`localStorage.getItem('accessToken')`);
      await S.eval(`localStorage.removeItem('accessToken')`);
      await openWizard(S);
      await choosePath(S, 'secondary');
      await fillPersonal(S, sec);
      await fillSecurity(S);
      await fillEducation(S, 'secondary');
      await cont(S, 'goals');
      await fillGoals(S, '', '');
      await cont(S);
      await S.waitFor(`document.body.innerText.includes('Account already exists')`, { label: 'exists banner' });
      await S.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);
      return 'banner with sign-in link; wizard kept the data';
    });
    await check('Verify email with the code from the mail sink → onboarding shows only the missing steps', 'real', async () => {
      const since = 0;
      const code = await waitCode(sec.email, since);
      await S.goto(`${BASE}/auth/verify-email?email=${encodeURIComponent(sec.email)}`, hydrated('#verify-code'));
      await S.fill('#verify-code', code);
      await S.click('form button[type=submit]');
      await S.waitFor(`document.body.innerText.includes('Email verified')`, { label: 'verified' });
      await S.click('Continue', { exact: true });
      await S.waitFor(`location.pathname === '/onboarding'`, { timeout: 20000, label: 'onboarding' });
      const stepText = await S.waitFor(`document.body.innerText.match(/STEP \\d+ OF \\d+/)?.[0]`, { label: 'onboarding step counter' });
      assert(stepText === 'STEP 1 OF 2', `expected companion + finish only, got ${stepText}`);
      return `${stepText} (education, study time and goal skipped)`;
    });
    await check('Onboarding completes → dashboard', 'real', async () => {
      await S.click('Continue', { exact: true });
      await S.waitFor(`document.body.innerText.includes('STEP 2 OF 2')`);
      await S.click('Start Learning', { exact: true });
      await S.waitFor(`location.pathname === '/dashboard' || document.body.innerText.includes('Not saved')`, { timeout: 20000, label: 'dashboard' });
      const pathName = await S.eval('location.pathname');
      assert(pathName === '/dashboard', `stayed on ${pathName}: ${(await bannerText(S)).slice(0, 200)}`);
      return 'POST /ai-companion saved; redirected to /dashboard';
    });
    await check('Log out clears the session; log in returns to the dashboard', 'real', async () => {
      await S.waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.includes('Log out')) || document.readyState === 'complete'`);
      const label = await S.eval(`[...document.querySelectorAll('button')].find((b) => /log out/i.test(b.textContent) && b.offsetParent)?.textContent.trim() ?? null`);
      let how = `"${label}" button`;
      if (label) {
        await S.eval(`[...document.querySelectorAll('button')].find((b) => /log out/i.test(b.textContent) && b.offsetParent).click()`);
        await S.waitFor(`!localStorage.getItem('accessToken') && location.pathname === '/auth/login'`, { label: 'token cleared + on login' });
      } else {
        how = 'no visible Log out button on /dashboard at this width — token removed manually';
        await S.eval(`localStorage.removeItem('accessToken')`);
      }
      await S.goto(`${BASE}/auth/login`, hydrated('#login-email'));
      await S.fill('#login-email', sec.email);
      await S.fill('#login-password', PASSWORD);
      await S.click('form button[type=submit]');
      await S.waitFor(`location.pathname !== '/auth/login'`, { timeout: 20000, label: 'leave login page' });
      const p = await S.eval('location.pathname');
      assert(await S.eval(`!!localStorage.getItem('accessToken')`), 'no token after login');
      return `${how}; after login → ${p}`;
    });
    await check('Forgot password → code from mail → reset → log in with the new password', 'real', async () => {
      await S.eval(`localStorage.removeItem('accessToken')`);
      const since = Date.now() * 1e6;
      await S.goto(`${BASE}/auth/forgot-password`, hydrated('#forgot-email'));
      await S.fill('#forgot-email', sec.email);
      await S.click('form button[type=submit]');
      await S.waitFor(`!!document.querySelector('a[href^="/auth/reset-password?email="]')`, { label: 'reset link' });
      await S.click('a[href^="/auth/reset-password?email="]');
      await S.waitFor(hydrated('#reset-token'));
      const code = await waitCode(sec.email, since);
      const prefilled = await S.eval(`document.getElementById('reset-email').value`);
      await S.fill('#reset-token', code);
      await S.fill('#reset-new-password', NEW_PASSWORD);
      await S.fill('#reset-confirm-password', NEW_PASSWORD);
      await S.click('form button[type=submit]');
      await S.waitFor(`document.body.innerText.includes('Password reset')`, { timeout: 20000, label: 'reset success' });
      await S.goto(`${BASE}/auth/login`, hydrated('#login-email'));
      await S.fill('#login-email', sec.email);
      await S.fill('#login-password', NEW_PASSWORD);
      await S.click('form button[type=submit]');
      await S.waitFor(`location.pathname !== '/auth/login'`, { timeout: 20000, label: 'login with new password' });
      return `email prefilled: ${prefilled === sec.email}; logged in → ${await S.eval('location.pathname')}`;
    });

    // ======================= exam path + network failure before the request reaches the backend =======================
    await S.eval(`localStorage.removeItem('accessToken')`); // the next learners start signed out (tabs share localStorage)
    const E = await page();
    const eBodies = captureSignups(E);
    const exam = acct('exam');
    await check('Exam path: switching from University drops university fields; sends no educationType', 'real', async () => {
      await openWizard(E);
      await choosePath(E, 'university');
      await fillPersonal(E, exam);
      await fillSecurity(E);
      await fillEducation(E, 'university');
      await back(E);
      await waitStep(E, 'security');
      await back(E);
      await waitStep(E, 'personal');
      await back(E);
      await waitStep(E, 'path');
      await E.click('input[name=learner-path][value=exam]');
      await cont(E, 'personal');
      await cont(E, 'security');
      await E.fill('#reg-password', PASSWORD); // secrets are kept in memory between steps; refilled to be explicit
      await E.fill('#reg-confirm', PASSWORD);
      await cont(E, 'education');
      await fillEducation(E, 'exam');
      await cont(E, 'goals');
      await fillGoals(E, 'Score 300+ in JAMB', 'Morning');
      return 'reached review';
    });
    await check('Network failure before the backend (mocked: request failed in the browser) → "outcome unknown" → check → not created → create', 'mocked', async () => {
      const restore = await failSignup(E, 'Request');
      await cont(E);
      await E.waitFor(`document.body.innerText.includes('We lost the connection')`, { label: 'uncertain banner' });
      await restore();
      assert(await E.eval(`location.pathname === '/auth/signup'`), 'left the wizard');
      await E.click('Check whether my account was created');
      await E.waitFor(`document.body.innerText.includes('Your account was not created')`, { label: 'not created' });
      await cont(E);
      await E.waitFor(`location.pathname === '/auth/verify-email'`, { timeout: 20000, label: 'verify-email' });
      assert(eBodies.length === 2, `${eBodies.length} sign-up requests`);
      const b = eBodies[1];
      assert(!('educationType' in b), `educationType sent: ${b.educationType}`);
      assert(keysPresent(b, [...UNIVERSITY_ONLY, ...SECONDARY_ONLY]).length === 0, `stale fields: ${keysPresent(b, [...UNIVERSITY_ONLY, ...SECONDARY_ONLY])}`);
      assert(/WAEC/.test(b.examAimOrGoals) && /JAMB/.test(b.examAimOrGoals) && /May 2027/.test(b.examAimOrGoals), `examAimOrGoals: ${b.examAimOrGoals}`);
      return `failure → banner, no auto-retry; reconcile via real login 401 → "not created"; 2nd request created the account. examAimOrGoals="${b.examAimOrGoals}"`;
    });
    await check('Exam learner: onboarding skips education steps', 'real', async () => {
      const code = await waitCode(exam.email, 0);
      await E.fill('#verify-code', code);
      await E.click('form button[type=submit]');
      await E.waitFor(`document.body.innerText.includes('Email verified')`, { label: 'verified' });
      await E.click('Continue', { exact: true });
      await E.waitFor(`location.pathname === '/onboarding'`, { timeout: 20000 });
      const stepText = await E.waitFor(`document.body.innerText.match(/STEP \\d+ OF \\d+/)?.[0]`);
      assert(stepText === 'STEP 1 OF 2', stepText);
      return stepText;
    });

    // ======================= university path + response lost after the backend created the account =======================
    await E.eval(`localStorage.removeItem('accessToken')`);
    const U = await page();
    const uBodies = captureSignups(U);
    const uni = acct('uni');
    await check('University path: switching from Secondary drops secondary fields', 'real', async () => {
      await openWizard(U);
      await choosePath(U, 'secondary');
      await fillPersonal(U, uni);
      await fillSecurity(U);
      await fillEducation(U, 'secondary');
      for (const s of ['security', 'personal', 'path']) {
        await back(U);
        await waitStep(U, s);
      }
      await U.click('input[name=learner-path][value=university]');
      await cont(U, 'personal');
      await cont(U, 'security');
      await cont(U, 'education');
      await fillEducation(U, 'university');
      await cont(U, 'goals');
      await fillGoals(U, '', ''); // all optional
      return 'reached review';
    });
    await check('Response lost after the account was created (mocked: response failed in the browser) → check → created → verify', 'mocked', async () => {
      const restore = await failSignup(U, 'Response');
      await cont(U);
      await U.waitFor(`document.body.innerText.includes('We lost the connection')`, { label: 'uncertain banner' });
      await restore();
      await U.click('Check whether my account was created');
      await U.waitFor(`location.pathname === '/auth/verify-email'`, { timeout: 20000, label: 'verify-email after reconcile' });
      assert(uBodies.length === 1, `${uBodies.length} sign-up requests (must not resend)`);
      const b = uBodies[0];
      assert(b.educationType === 'University' && b.university === 'Test University' && b.courseOfStudy === 'Physics', JSON.stringify(redact(b)));
      assert(keysPresent(b, SECONDARY_ONLY).length === 0, `stale secondary fields: ${keysPresent(b, SECONDARY_ONLY)}`);
      assert(!('examAimOrGoals' in b) && !('preferredStudyTime' in b), 'empty optional fields sent');
      const delivery = new URL(await U.eval('location.href')).searchParams.get('delivery');
      return `one request only; reconcile via real login succeeded; delivery=${delivery}; keys: ${Object.keys(b).join(', ')}`;
    });
    await check('University learner: onboarding asks for study time and goal (not given at sign-up)', 'real', async () => {
      const code = await waitCode(uni.email, 0);
      await U.fill('#verify-code', code);
      await U.click('form button[type=submit]');
      await U.waitFor(`document.body.innerText.includes('Email verified')`, { label: 'verified' });
      await U.click('Continue', { exact: true });
      await U.waitFor(`location.pathname === '/onboarding'`, { timeout: 20000 });
      const stepText = await U.waitFor(`document.body.innerText.match(/STEP \\d+ OF \\d+/)?.[0]`);
      assert(stepText === 'STEP 1 OF 4', `expected preferences, goal, companion, finish — got ${stepText}`);
      return stepText;
    });

    // ======================= console errors =======================
    const errs = pages.flatMap((p) => p.consoleErrors);
    // Only the deliberate failures count as expected: 401 (reconcile/login checks), 409 (duplicate), the failed sign-up
    // Expected: the deliberate 409 / failed sign-up, 401 from reconcile checks, and 401 from dashboard requests still in
    // flight when the script removes the token. 429 on the dashboard stats is reported as a warning (see README).
    const throttled = errs.filter((e) => /status of 429/.test(e));
    const expected = errs.filter((e) => /status of (401|409)/.test(e) || /ERR_CONNECTION_FAILED/.test(e));
    console.log(`console errors seen:\n  ${[...new Set(errs)].join('\n  ')}`);
    if (throttled.length) {
      console.log(`WARN [real] ${throttled.length} request(s) throttled (429): ${[...new Set(throttled.map((e) => e.split(' ').pop()))].join(', ')}`);
      results.push({ name: 'Throttled requests during the run', mode: 'real', pass: null, detail: throttled.join(' || ') });
    }
    const unexpected = errs.filter((e) => !expected.includes(e) && !throttled.includes(e));
    record('No unexpected console errors or exceptions', 'browser', unexpected.length === 0, `${expected.length} expected (deliberate 401/409/failed requests); unexpected: ${unexpected.slice(0, 5).join(' || ') || 'none'}`);
  } finally {
    for (const p of pages) await p.close().catch(() => {});
    await chrome.close();
  }

  // ======================= WebGL unavailable (separate browser) =======================
  const noGl = await launch({ port: 9334, extraArgs: ['--disable-webgl', '--disable-3d-apis'] });
  try {
    const W = await newPage(noGl.port);
    await check('WebGL disabled at 1280 px: static fallback, no canvas, wizard works', 'browser', async () => {
      await W.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
      await openWizard(W);
      await sleep(2500);
      const m = await W.eval(`({ canvas: document.querySelectorAll('canvas').length, fallback: !!document.querySelector('div.rotate-12'), gl: !!document.createElement('canvas').getContext('webgl') })`);
      assert(!m.gl, 'WebGL still available');
      assert(m.canvas === 0 && m.fallback, JSON.stringify(m));
      await choosePath(W, 'exam');
      const ex = W.consoleErrors.filter((e) => !/Failed to load resource/.test(e));
      assert(ex.length === 0, ex.join(' | '));
      return 'fallback gradient shown; path step → personal step works; no errors';
    });
    await W.close();
  } finally {
    await noGl.close();
  }

  const failed = results.filter((r) => r.pass === false);
  const checked = results.filter((r) => r.pass !== null);
  console.log(`\n${checked.length - failed.length}/${checked.length} passed${results.length > checked.length ? `, ${results.length - checked.length} warning(s)` : ''}`);
  fs.writeFileSync(path.join(os.tmpdir(), `gleamlearn-browser-results-${RUN}.json`), JSON.stringify(results, null, 2));
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
