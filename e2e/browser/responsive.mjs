// e2e/browser/responsive.mjs — every learner page at 320, 375, 390, 768, 1024, 1366 and 1440 px against a LOCAL stack.
// For each page and width it checks: no horizontal page scroll, the page rendered its heading (not an error screen),
// and, below 1024 px, the menu button is reachable. Offending elements are named when a page overflows.
// The learner's lesson, quiz, attempt, material, course and YouTube session are created first through the real API
// (the AI service answers from the MOCK model locally, so generated text is a test double).
// Usage: node e2e/browser/responsive.mjs [--widths=320,375] [--only=/learn,/library]
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const WIDTHS = (arg('widths') ?? '320,375,390,768,1024,1366,1440').split(',').map(Number);
const ONLY = arg('only')?.split(',');

const RUN = Date.now().toString(36);
const PASSWORD = `Pw-${RUN}-local`;
async function api(path, token, init = {}) {
  for (let i = 0; i < 8; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(3200);
  }
  throw new Error(`${path} stayed throttled`);
}
const uuid = () => crypto.randomUUID();
const TEXT = `Photosynthesis ${RUN}. Plants use light energy, water and carbon dioxide to make glucose and oxygen. The light-dependent reactions happen in the thylakoid membranes; the Calvin cycle happens in the stroma.`;

async function seed() {
  const body = { fullName: 'Responsive Learner', username: `resp${RUN}`, email: `resp-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD };
  const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
  if (su.status !== 201) throw new Error(`signup ${su.status}`);
  const token = su.json.accessToken;
  const course = await api('/personal-courses', token, { method: 'POST', body: JSON.stringify({ title: `A very long course title to test wrapping on narrow screens ${RUN}`, subjects: ['Biology'], examGoals: ['WAEC'], objectives: ['Cell structure', 'Photosynthesis'] }) });
  const material = await api('/materials/text', token, { method: 'POST', body: JSON.stringify({ title: `Notes ${RUN}`, text: TEXT, personalCourseId: course.json.id }) });
  const gen = async (kind) => {
    await sleep(3200); // 1 per 3 s per learner
    const r = await api('/learning/generate', token, { method: 'POST', body: JSON.stringify({ requestId: uuid(), kind, sourceType: 'material', sourceId: material.json.id, personalCourseId: course.json.id, options: kind === 'exam' ? { count: 5, durationMinutes: 10 } : { count: 5 } }) });
    if (r.status !== 201 && r.status !== 200) throw new Error(`generate ${kind}: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
    return r.json;
  };
  const lesson = await gen('lesson');
  const exam = await gen('exam');
  await sleep(2100);
  const started = await api(`/learner-assessments/${exam.id}/attempts`, token, { method: 'POST' });
  await sleep(2100);
  const submitted = await api(`/learner-assessments/attempts/${started.json.attempt.id}/submit`, token, { method: 'POST', body: JSON.stringify({ answers: {} }) });
  const yt = await api('/youtube-sessions', token, { method: 'POST', body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }) });
  await sleep(2100);
  await api(`/youtube-sessions/${yt.json.id}/transcript`, token, { method: 'PUT', body: JSON.stringify({ text: '[00:00] Welcome.\n[00:05] Light energy is captured by chlorophyll.\n[00:42] The Calvin cycle fixes carbon dioxide.' }) });
  for (const [k, v] of Object.entries({ course, material, lesson, exam, started, submitted, yt })) if (!v?.json?.id && !v?.id && !v?.json?.attempt) throw new Error(`seed ${k} failed`);
  return { token, ids: { course: course.json.id, material: material.json.id, lesson: lesson.resourceId ?? lesson.id, exam: exam.id, attempt: started.json.attempt.id, yt: yt.json.id } };
}

const PUBLIC = ['/', '/welcome', '/auth/login', '/auth/signup'];
const learnerPages = (ids) => [
  '/dashboard', '/learn', '/my-courses', `/my-courses/${ids.course}`, `/learn/materials/${ids.material}`, `/learn/resources/${ids.lesson}`,
  '/practice', `/practice/${ids.exam}`, `/practice/attempts/${ids.attempt}`, '/exams',
  '/library', '/library?tab=lessons', '/library?tab=assessments', '/library?tab=youtube', '/library?tab=uploads',
  '/ai', '/ai?tab=youtube', `/ai/youtube/${ids.yt}`,
  '/progress', '/planner', '/notifications', '/history', '/settings', '/support', '/premium',
];

const OVERFLOW = `(() => {
  const vw = document.documentElement.clientWidth;
  const over = document.documentElement.scrollWidth - vw;
  if (over <= 1) return null;
  // the outermost elements sticking out on the right, skipping ones inside horizontal scrollers
  const inScroller = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if ((s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflowX === 'hidden') && p !== document.body && p !== document.documentElement) return true; } return false; };
  const bad = [...document.querySelectorAll('body *')].filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.right > vw + 1 && !inScroller(el); });
  const top = bad.filter((el) => !bad.includes(el.parentElement)).slice(0, 4).map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 3).join('.') + ' w=' + Math.round(el.getBoundingClientRect().width) + ' "' + (el.innerText || '').slice(0, 30).replace(/\\s+/g, ' ') + '"');
  return { over, top };
})()`;

async function main() {
  const { token, ids } = await seed();
  const pages = [...PUBLIC, ...learnerPages(ids)].filter((u) => !ONLY || ONLY.some((o) => u.startsWith(o)));
  const chrome = await launch({ port: 9348 });
  const p = await newPage(chrome.port);
  const fails = [];
  let checks = 0;
  try {
    for (const width of WIDTHS) {
      const mobile = width < 768;
      await p.send('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 760 : 900, deviceScaleFactor: mobile ? 2 : 1, mobile });
      for (const url of pages) {
        const isPublic = PUBLIC.includes(url);
        await p.goto(`${BASE}/welcome`);
        await p.eval(isPublic ? `localStorage.removeItem('accessToken')` : `localStorage.setItem('accessToken', ${JSON.stringify(token)})`);
        await p.goto(`${BASE}${url}`);
        try {
          await p.waitFor(`!!document.querySelector('h1, main h2') && !document.querySelector('[aria-busy=true]')`, { label: 'heading', timeout: 20000 });
        } catch {
          /* reported below */
        }
        await sleep(900); // late content (lists, images) settles
        checks++;
        const problems = [];
        const o = await p.eval(OVERFLOW);
        if (o) problems.push(`horizontal scroll ${o.over}px: ${o.top.join(' | ')}`);
        const head = await p.eval(`document.querySelector('h1, main h2')?.textContent.trim() ?? ''`);
        if (!head) problems.push('no heading rendered');
        const at = await p.eval('location.pathname');
        if (at !== url.split('?')[0]) problems.push(`ended on ${at} (redirected)`);
        if (/Application error|Unhandled Runtime Error|This page could not be found/.test(await p.eval('document.body.innerText'))) problems.push('error screen');
        if (!isPublic && width < 1024 && !(await p.eval(`!!document.querySelector('[aria-label="Open Menu"]') && document.querySelector('[aria-label="Open Menu"]').getBoundingClientRect().right <= document.documentElement.clientWidth`)))
          problems.push('menu button missing or off screen');
        if (problems.length) fails.push(`${width}px ${url}: ${problems.join('; ')}`);
        console.log(`${problems.length ? 'FAIL' : 'PASS'} ${width}px ${url}${problems.length ? ` — ${problems.join('; ')}` : ''}`);
        if (url.startsWith('/dashboard')) await sleep(1200); // the dashboard and Navbar share per-second route limits
      }
    }
  } finally {
    await p.close().catch(() => {});
    await chrome.close();
  }
  console.log(`\n${checks - fails.length}/${checks} page × width checks passed`);
  process.exitCode = fails.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
