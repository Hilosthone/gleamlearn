// e2e/browser/self-learning.mjs — real-browser check of the self-service learning flows against a LOCAL stack:
// Learn (paste text → generate a lesson and a quiz), take/refresh/submit/review the quiz, Library tabs, a YouTube
// session with a pasted transcript and grounded Q&A, and global search (desktop Ctrl+K, mobile full screen).
// "real" = real frontend build + real local backend + real local AI service. The AI service talks to the MOCK model
// (mycoursea-backend/test/live/mock_nim.py), so generated text is a test double: these checks prove the plumbing,
// persistence, grading and grounding rules, not the quality of real model output. Passwords are never printed.
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
    const shown = await page?.eval(`[...document.querySelectorAll('[role=alert],[role=status],main h3')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ')`).catch(() => '');
    record(name, false, `${e.message}${shown ? ` [page: ${shown.slice(0, 300)}]` : ''}`);
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
const has = (s) => `document.body.innerText.includes(${JSON.stringify(s)})`;
async function clickIn(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(400);
}
async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3000);
  }
  throw new Error(`${path} stayed throttled`);
}
const NOTES = `Photosynthesis ${RUN}. Plants use light energy, water and carbon dioxide to make glucose and oxygen. ` +
  'The light-dependent reactions happen in the thylakoid membranes and produce ATP and NADPH. ' +
  'The Calvin cycle happens in the stroma and fixes carbon dioxide into sugars using ATP and NADPH.';
const TRANSCRIPT = ['[00:00] Welcome to this lesson on photosynthesis.', '[00:05] Light energy is captured by chlorophyll in the thylakoids.', '[00:42] The Calvin cycle then fixes carbon dioxide in the stroma.'].join('\n');

/** Picks a kind and presses Generate. POST /learning/generate allows 1 per 3 s per learner; when the page says
 * "Slow down", wait and press again, as a learner would. Returns how many presses it took. */
async function generate(p, kind, doneExpr) {
  await p.waitFor(`!!document.querySelector('input[name=generate-kind][value=${kind}]')`, { timeout: 20000 });
  await p.eval(`document.querySelector('input[name=generate-kind][value=${kind}]').click()`);
  for (let i = 1; i <= 4; i++) {
    await sleep(3200);
    await p.eval(`[...document.querySelectorAll('button[type=submit]')].find((b) => /Generate/.test(b.textContent)).click()`);
    const r = await p.waitFor(`(${doneExpr}) ? 'done' : document.body.innerText.includes('Slow down') ? 'throttled' : ''`, { label: kind, timeout: 90000 });
    if (r === 'done') return i;
  }
  throw new Error(`${kind}: still throttled after 4 presses`);
}

async function main() {
  const signup = async (name) => {
    const body = { fullName: 'Self Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('self');
  const other = await signup('selfo');

  const chrome = await launch({ port: 9347 });
  const p = await newPage(chrome.port);
  page = p;
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Learn has no "wait for GleamLearn" empty state and offers learning from your own material', async () => {
      await p.goto(`${BASE}/learn`, ready('h1'));
      await p.waitFor(has('Paste text'), { timeout: 20000 });
      const t = await p.eval('document.body.innerText');
      assert(!/once they are published by GleamLearn|When exams\/quizzes are added by GleamLearn/.test(t), 'admin-dependent copy shown');
      for (const s of ['Upload a file', 'Paste text', 'My materials', 'My course', 'YouTube video']) assert(t.includes(s), `missing ${s}`);
    });

    let lessonUrl;
    await check('[real, mock model] Paste text → generate a lesson → it opens and is saved', async () => {
      await clickIn(p, '[role=tab]', 'Paste text');
      await p.fill('form[aria-label="Paste text"] input', `Photosynthesis ${RUN}`);
      await p.fill('form[aria-label="Paste text"] textarea', NOTES);
      await clickIn(p, 'button', 'Use this text');
      await p.waitFor(has('Choose what to learn below'), { label: 'material ready', timeout: 30000 });
      await generate(p, 'lesson', `location.pathname.startsWith('/learn/resources/')`);
      lessonUrl = await p.eval('location.pathname');
      await p.waitFor(`!!document.querySelector('h1') && !document.body.innerText.includes('Loading')`, { timeout: 20000 });
      const res = await api('/learning/resources', token);
      assert(res.json.some((r) => r.kind === 'lesson'), 'lesson not saved');
      return lessonUrl;
    });

    await check('Another learner gets 404 for that lesson', async () => {
      const r = await api(`/learning/resources/${lessonUrl.split('/').pop()}`, other);
      assert(r.status === 404, `status ${r.status}`);
    });

    let quizPath;
    await check('[real, mock model] A quiz is generated from the same material', async () => {
      const mats = await api('/materials', token);
      const m = mats.json.find((x) => x.originalName?.includes(RUN) || x.sourceType === 'text');
      assert(m, 'material not found');
      await p.goto(`${BASE}/learn/materials/${m.id}`, ready('h1'));
      const tries = await generate(p, 'quiz', `/^\\/practice\\/[^/]+$/.test(location.pathname)`);
      quizPath = await p.eval('location.pathname');
      await p.waitFor(has('not official past questions'), { label: 'AI-practice notice', timeout: 20000 });
      return tries > 1 ? `${quizPath} (pressed Generate ${tries} times after "Slow down")` : quizPath;
    });

    await check('Taking the quiz: answers autosave and survive a refresh; submit grades on the server; review shows topics', async () => {
      await p.goto(`${BASE}${quizPath}`, ready('h1'));
      await p.waitFor(`[...document.querySelectorAll('button')].some((b) => /^(Start|Resume)$/.test(b.textContent.trim()))`, { timeout: 20000 });
      await p.eval(`[...document.querySelectorAll('button')].find((b) => /^(Start|Resume)$/.test(b.textContent.trim())).click()`);
      await p.waitFor(`!!document.querySelector('input[name=q0]')`, { label: 'questions', timeout: 20000 });
      await p.eval(`document.querySelector('input[name=q0]').click()`);
      await p.waitFor(has('saved'), { label: 'autosave', timeout: 20000 });
      const chosen = await p.eval(`document.querySelector('input[name=q0]:checked')?.value`);
      await p.reload(ready('h1'));
      await p.waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Resume')`, { timeout: 20000 });
      await clickIn(p, 'button', 'Resume');
      await p.waitFor(`document.querySelector('input[name=q0]:checked')?.value === ${JSON.stringify(chosen)}`, { label: 'answer kept after refresh', timeout: 20000 });
      await p.eval('window.confirm = () => true');
      await clickIn(p, 'button', 'Submit answers');
      await p.waitFor(`location.pathname.startsWith('/practice/attempts/')`, { label: 'review page', timeout: 30000 });
      await p.waitFor(`/\\d+%/.test(document.body.innerText)`, { timeout: 20000 });
      const attempts = await api('/learner-assessments/attempts', token);
      assert(attempts.json.some((t) => t.status === 'submitted'), 'attempt not submitted on the server');
      return (await p.eval(`document.querySelector('h1 ~ p, p.text-4xl')?.textContent`)) ?? '';
    });

    await check('Library: lessons and quizzes tabs list the learner\'s items; ?tab= opens a section', async () => {
      await p.goto(`${BASE}/library?tab=lessons`, ready('h1'));
      await p.waitFor(`document.querySelector('[role=tab][aria-selected=true]')?.textContent.includes('Lessons')`, { label: 'lessons tab selected', timeout: 20000 });
      await p.waitFor(`!!document.querySelector('ul[aria-label="Generated lessons and notes"] li')`, { timeout: 20000 });
      await clickIn(p, '[role=tab]', 'Quizzes & exams');
      await p.waitFor(`!!document.querySelector('ul[aria-label="Your quizzes and exams"] li')`, { timeout: 20000 });
      await p.waitFor(has('Attempt history'), { timeout: 10000 });
      await p.waitFor(`/\\d+% ·/.test(document.querySelector('section[aria-label="Attempt history"]').innerText)`, { label: 'attempt listed', timeout: 20000 });
    });

    await check('AI page has a YouTube tab; a session is created from a link (offline: honest "no transcript")', async () => {
      await p.goto(`${BASE}/ai?tab=youtube`, ready('h1'));
      await p.waitFor(`document.querySelector('[role=tab][aria-selected=true]')?.textContent.includes('YouTube')`, { label: 'youtube tab', timeout: 20000 });
      await p.fill('form[aria-label="New YouTube session"] input', 'https://youtu.be/dQw4w9WgXcQ');
      await p.waitFor(`!document.querySelector('form[aria-label="New YouTube session"] button[type=submit]').disabled`, { timeout: 5000 });
      await clickIn(p, 'button', 'Create session');
      await p.waitFor(`location.pathname.startsWith('/ai/youtube/')`, { label: 'workspace', timeout: 30000 });
      const sessionPath = await p.eval('location.pathname');
      await p.waitFor(has('No transcript yet'), { timeout: 20000 });
      assert(await p.eval(`document.querySelector('textarea[placeholder="Add a transcript first"]').disabled`), 'asking allowed without transcript');
      assert(await p.eval(`!!document.querySelector('iframe[src^="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"]')`), 'no privacy-enhanced embed');
      return `${sessionPath} (YOUTUBE_NETWORK=off locally, so captions are not fetched)`;
    });

    await check('[real, mock model] Pasted transcript → grounded answer; only real timestamps become seek links', async () => {
      await p.fill('form[aria-label="Paste a transcript"] textarea', TRANSCRIPT);
      await clickIn(p, 'button', 'Save transcript');
      await p.waitFor(`!!document.querySelector('[aria-label="Play from 0:42"]')`, { label: 'transcript segments', timeout: 20000 });
      await p.fill('section[aria-label="Questions about the video"] textarea', 'Where does the Calvin cycle happen?');
      await clickIn(p, 'button', 'Ask');
      await p.waitFor(`!!document.querySelector('ol[aria-label="Questions and answers"] li:nth-child(2)')`, { label: 'answer', timeout: 60000 });
      const links = await p.eval(`[...document.querySelectorAll('ol[aria-label="Questions and answers"] button')].map((b) => b.textContent.trim())`);
      const answer = await p.eval(`document.querySelector('ol[aria-label="Questions and answers"] li:nth-child(2)').innerText`);
      assert(links.length >= 1 && !links.includes('99:59'), `links ${JSON.stringify(links)}`);
      assert(answer.includes('[99:59]') || !answer.includes('99:59'), 'fabricated stamp rendered as a link');
      await p.eval(`document.querySelector('ol[aria-label="Questions and answers"] button').click()`);
      await p.waitFor(`/[?&]start=\\d+/.test(document.querySelector('iframe').src)`, { label: 'player seeks', timeout: 5000 });
      await p.reload(ready('h1'));
      await p.waitFor(`!!document.querySelector('ol[aria-label="Questions and answers"] li:nth-child(2)')`, { label: 'Q&A persisted', timeout: 20000 });
      return `links: ${links.join(', ')}`;
    });

    await check('Global search (desktop): Ctrl+K opens it, results are grouped, arrows + Enter open a result', async () => {
      await p.goto(`${BASE}/dashboard`, ready('header'));
      await sleep(500);
      await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'k', code: 'KeyK', windowsVirtualKeyCode: 75, modifiers: 2 });
      await p.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'k', code: 'KeyK', windowsVirtualKeyCode: 75, modifiers: 2 });
      await p.waitFor(`!!document.querySelector('[role=dialog][aria-label=Search] input')`, { label: 'dialog', timeout: 5000 });
      await p.waitFor(`document.activeElement === document.querySelector('[role=dialog] input')`, { label: 'focus', timeout: 3000 });
      await p.send('Input.insertText', { text: RUN });
      await p.waitFor(`document.querySelectorAll('[role=option]').length >= 2`, { label: 'results', timeout: 15000 });
      const groups = await p.eval(`[...document.querySelectorAll('[role=listbox] [role=group]')].map((g) => g.getAttribute('aria-label'))`);
      await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      const second = await p.eval(`document.querySelector('[role=option][aria-selected=true]')?.id === document.querySelectorAll('[role=option]')[1].id`);
      assert(second, 'arrow did not move');
      await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await p.waitFor(`!document.querySelector('[role=dialog][aria-label=Search]') && location.pathname !== '/dashboard'`, { label: 'navigated', timeout: 15000 });
      return `${groups.join(', ')} → ${await p.eval('location.pathname + location.search')}`;
    });

    await check('Global search does not show another learner\'s items', async () => {
      const r = await api(`/search/everything?q=${RUN}`, other);
      assert(r.status === 200 && r.json.results.every((x) => ['course'].includes(x.type)), JSON.stringify(r.json?.results?.map((x) => x.type)));
    });

    await check('Global search (mobile 375px): full-screen dialog, Escape closes it', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 740, deviceScaleFactor: 2, mobile: true });
      await p.goto(`${BASE}/dashboard`, ready('header'));
      await sleep(2500); // the dashboard's own requests share per-second route limits
      await p.eval(`document.querySelector('header button[aria-label=Search]').click()`);
      await p.waitFor(`!!document.querySelector('[role=dialog][aria-label=Search]')`, { timeout: 5000 });
      const w = await p.eval(`Math.round(document.querySelector('[role=dialog][aria-label=Search]').getBoundingClientRect().width)`);
      assert(w >= 370, `dialog width ${w}`);
      await p.send('Input.insertText', { text: 'zz' + RUN });
      await p.waitFor(has('Nothing found'), { timeout: 15000 });
      await p.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
      await p.waitFor(`!document.querySelector('[role=dialog][aria-label=Search]')`, { label: 'closed', timeout: 5000 });
      return `width ${w}px`;
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
