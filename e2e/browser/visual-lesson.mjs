// e2e/browser/visual-lesson.mjs — the AI visual-teaching pipeline in a real browser against a LOCAL stack:
// topic input → backend (POST /learning/generate, kind visual_lesson) → AI service (/learn/generate) → structured
// lesson (validated 3×) → renderer registry (3D scenes / 2D SVG) → learner interaction (steps, 3D/2D, ask the tutor,
// finish → completed), plus no-WebGL and reduced-motion fallbacks and ownership.
// "real" = real frontend build + real local backend + real local AI service; the AI service answers from the MOCK
// model (mycoursea-backend/test/live/mock_nim.py): content is a test double, the pipeline and rendering are real.
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
    const shown = await page?.eval(`[...document.querySelectorAll('[role=alert],[role=status]')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ')`).catch(() => '');
    record(name, false, `${e.message}${shown ? ` [page: ${shown.slice(0, 300)}]` : ''}`);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
const has = (s) => `document.body.innerText.includes(${JSON.stringify(s)})`;
async function clickText(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(300);
}
async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3000);
  }
  throw new Error(`${path} stayed throttled`);
}
// the visual container: data-visual = type, data-view = 3d | 2d (set by components/visual/VisualView.tsx)
const stepVisual = (p) => p.eval(`(() => { const v = document.querySelector('section[aria-labelledby=step-title] [data-visual]'); if (!v) return 'none'; const kind = v.dataset.visual + '/' + v.dataset.view; if (v.querySelector('canvas')) return kind + ':canvas'; const svg = v.querySelector('svg[role=img]'); if (svg) return kind + ':svg:' + (svg.getAttribute('aria-label') || ''); if (v.querySelector('ol')) return kind + ':list'; return kind + ':text'; })()`);
const goStep = async (p, n) => {
  await p.eval(`document.querySelector('nav[aria-label="Lesson steps"] button:nth-child(${n})').click()`);
  await p.waitFor(`document.querySelector('nav[aria-label="Lesson steps"] button:nth-child(${n})').getAttribute('aria-current') === 'step'`, { timeout: 5000 });
  await sleep(600);
};

async function main() {
  const signup = async (name) => {
    const body = { fullName: 'Visual Learner', username: `${name}${RUN}`, email: `${name}-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
    const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
    if (su.status !== 201) throw new Error(`signup ${su.status}`);
    return su.json.accessToken;
  };
  const token = await signup('vis');
  const other = await signup('viso');
  const chrome = await launch({ port: 9352 });
  const p = await newPage(chrome.port);
  page = p;
  const errors = [];
  await p.send('Runtime.enable');
  p.on?.('Runtime.exceptionThrown', (e) => errors.push(e.exceptionDetails?.exception?.description ?? 'exception'));
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  let lessonPath;
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('[real, mock model] Learn → "A topic" → generate an interactive visual lesson', async () => {
      await p.goto(`${BASE}/learn`, ready('h1'));
      await p.waitFor(has('A topic (visual lesson)'), { timeout: 20000 });
      await clickText(p, '[role=tab]', 'A topic (visual lesson)');
      await p.fill('form[aria-label="Learn a topic"] input', 'The water molecule');
      await clickText(p, 'button', 'Use this topic');
      await p.waitFor(`[...document.querySelectorAll('button[type=submit]')].some((b) => /Generate interactive visual lesson/.test(b.textContent))`, { label: 'generate form', timeout: 10000 });
      await sleep(3200); // POST /learning/generate allows 1 per 3 s per learner
      await p.eval(`[...document.querySelectorAll('button[type=submit]')].find((b) => /Generate interactive visual lesson/.test(b.textContent)).click()`);
      await p.waitFor(`location.pathname.startsWith('/learn/resources/')`, { label: 'lesson page', timeout: 90000 });
      lessonPath = await p.eval('location.pathname');
      await p.waitFor(`!!document.querySelector('nav[aria-label="Lesson steps"]')`, { label: 'lesson player', timeout: 20000 });
      const res = await api(`/learning/resources/${lessonPath.split('/').pop()}`, token);
      assert(res.json?.kind === 'visual_lesson' && res.json?.sourceType === 'topic', `stored ${res.json?.kind}/${res.json?.sourceType}`);
      const stored = JSON.parse(res.json.content);
      return `${stored.steps.length} steps stored; visuals: ${stored.steps.map((s) => s.visual?.type ?? '-').join(', ')}`;
    });

    await check('The lesson says it is from general knowledge (topic, not your material)', async () => {
      // textContent: the subtitle is CSS-uppercased, which innerText would reflect
      assert(await p.eval(`document.body.textContent.includes('AI-generated from general knowledge')`), 'subtitle');
      assert(await p.eval(`document.body.textContent.includes('not from your own material')`), 'basis notice');
    });

    const seen = {};
    await check('Each step renders through the registry: molecule (3D), graph (SVG), vectors (3D), cycle (SVG), parts (list), shape (3D)', async () => {
      const steps = await p.eval(`document.querySelectorAll('nav[aria-label="Lesson steps"] button').length`);
      assert(steps === 6, `${steps} steps`);
      for (let n = 1; n <= 6; n++) {
        await goStep(p, n);
        // 3D scenes load lazily: wait until the canvas (or a fallback) is there, not the loading text
        await p.waitFor(`(() => { const v = document.querySelector('section[aria-labelledby=step-title] [data-visual]'); return !!v && !/Loading the 3D view/.test(v.textContent); })()`, { timeout: 15000 });
        if ((await p.eval(`document.querySelector('section[aria-labelledby=step-title] [data-visual]').dataset.view`)) === '3d') await p.waitFor(`!!document.querySelector('section[aria-labelledby=step-title] [data-visual] canvas')`, { label: `canvas step ${n}`, timeout: 15000 });
        seen[n] = await stepVisual(p);
      }
      assert(seen[2].startsWith('graph2d/2d:svg:Graph of a quadratic'), `graph ${seen[2]}`);
      assert(seen[4].startsWith('flow/2d:svg:Diagram with 3 stages'), `flow ${seen[4]}`);
      assert(seen[5] === 'labeled/2d:list', `labeled ${seen[5]}`);
      assert(seen[1] === 'molecule/3d:canvas' && seen[3] === 'vectors/3d:canvas' && seen[6] === 'shape3d/3d:canvas', `3D steps ${seen[1]} ${seen[3]} ${seen[6]}`);
      return Object.entries(seen).map(([k, v]) => `${k}:${v.split(':').slice(0, 2).join(':')}`).join(' ');
    });

    await check('3D steps: a WebGL canvas with drag-to-rotate; switching to 2D shows the SVG view', async () => {
      await goStep(p, 1);
      const view = await stepVisual(p);
      assert(view === 'molecule/3d:canvas', `view ${view}`);
      assert(await p.eval(has('Drag to rotate')), 'rotate hint');
      await clickText(p, 'section[aria-labelledby=step-title] button', '2D');
      await p.waitFor(`document.querySelector('section[aria-labelledby=step-title] [data-visual]')?.dataset.view === '2d'`, { label: '2D view', timeout: 5000 });
      const flat = await stepVisual(p);
      assert(flat.startsWith('molecule/2d:svg:Molecule Water'), flat);
      const canvases = await p.eval(`document.querySelectorAll('canvas').length`);
      assert(canvases === 0, `${canvases} canvases left after switching to 2D (WebGL context not released)`);
      return 'canvas → 2D svg, no canvas left';
    });

    await check('[real, mock model] Ask the AI tutor about a step: the answer appears under the question', async () => {
      await goStep(p, 2);
      await p.fill('section[aria-label="Ask about this step"] textarea', 'Where is the vertex?');
      await sleep(3100); // POST /ai-tutor/explain allows 1 per 3 s
      await clickText(p, 'section[aria-label="Ask about this step"] button', 'Ask');
      await p.waitFor(has('You: Where is the vertex?'), { label: 'answer', timeout: 60000 });
      const answer = await p.eval(`document.querySelector('section[aria-label="Ask about this step"] .rounded-xl')?.innerText ?? ''`);
      assert(answer.trim().length > 0, 'empty answer');
      return answer.slice(0, 60).replace(/\s+/g, ' ');
    });

    await check('Finishing the lesson marks it completed on the server', async () => {
      await goStep(p, 6);
      await p.waitFor(has('Key takeaways'), { timeout: 5000 });
      await clickText(p, 'button', 'Finish the lesson');
      await p.waitFor(has('Completed'), { label: 'completed', timeout: 20000 });
      const r = await api(`/learning/resources/${lessonPath.split('/').pop()}`, token);
      assert(!!r.json?.completedAt, 'not completed on server');
    });

    await check('Another learner gets 404 for the lesson', async () => {
      const r = await api(`/learning/resources/${lessonPath.split('/').pop()}`, other);
      assert(r.status === 404, `status ${r.status}`);
    });

    await check('[real, mock model] "Practise what you learned" makes a quiz from the visual lesson (its words, not its JSON)', async () => {
      await p.waitFor(`!!document.querySelector('input[name=generate-kind][value=quiz]')`, { timeout: 10000 });
      await p.eval(`document.querySelector('input[name=generate-kind][value=quiz]').click()`);
      await sleep(3200);
      await p.eval(`[...document.querySelectorAll('button[type=submit]')].find((b) => /Generate quiz/.test(b.textContent)).click()`);
      await p.waitFor(`/^\\/practice\\/[^/]+$/.test(location.pathname)`, { label: 'quiz page', timeout: 90000 });
    });

    await check('Without WebGL, every 3D visual falls back to its 2D view (no canvas, no 3D toggle)', async () => {
      await p.send('Page.addScriptToEvaluateOnNewDocument', { source: "const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a); };" });
      await p.goto(`${BASE}${lessonPath}`, ready('h1'));
      await p.waitFor(`!!document.querySelector('nav[aria-label="Lesson steps"]')`, { timeout: 20000 });
      const views = [];
      for (const n of [1, 3, 6]) {
        await goStep(p, n);
        views.push(await stepVisual(p));
      }
      assert(views.every((v) => v.includes('/2d:') && !v.endsWith(':canvas')), views.join(' | '));
      assert(!(await p.eval(`!!document.querySelector('section[aria-labelledby=step-title] [aria-label=View]')`)), '3D toggle shown without WebGL');
      return views.map((v) => v.slice(0, 40)).join(' | ');
    });

    await check('Reduced motion + phone width (375px): the lesson still renders and fits', async () => {
      await p.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      await p.goto(`${BASE}${lessonPath}`, ready('h1'));
      await p.waitFor(`!!document.querySelector('nav[aria-label="Lesson steps"]')`, { timeout: 20000 });
      await goStep(p, 2);
      const over = await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      assert(over <= 1, `horizontal overflow ${over}px`);
    });
    if (errors.length) record('No uncaught page errors', false, errors.slice(0, 3).join(' | '));
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
