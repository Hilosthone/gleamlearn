// e2e/browser/navigation.mjs — the learner navigation in seven sections against a LOCAL stack: section labels and
// links on desktop, the active page marked, every link opens a page, and the mobile menu shows the same sections.
import { launch, newPage, sleep } from './cdp.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');

const RUN = Date.now().toString(36);
const PASSWORD = `Pw-${RUN}-local`;
const SECTIONS = ['Home', 'Learn', 'AI', 'Practice & exams', 'Plan', 'Progress'];
const LINKS = ['/dashboard', '/notifications', '/learn', '/my-courses', '/library', '/ai', '/practice', '/exams', '/planner', '/progress', '/history', '/settings', '/support'];
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
const assert = (c, m) => {
  if (!c) throw new Error(m);
};
const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;

async function main() {
  const su = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fullName: 'Nav Learner', username: `nav${RUN}`, email: `nav-${RUN}@example.test`, password: PASSWORD, confirmPassword: PASSWORD }) });
  if (su.status !== 201) throw new Error(`signup ${su.status}`);
  const token = (await su.json()).accessToken;

  const chrome = await launch({ port: 9358 });
  const p = await newPage(chrome.port);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Desktop sidebar: six labelled sections plus Account at the bottom, every page linked once', async () => {
      await p.goto(`${BASE}/practice`, ready('h1'));
      await p.waitFor(`!!document.querySelector('aside nav[aria-label="Main"]')`, { timeout: 15000 });
      const labels = await p.eval(`[...document.querySelectorAll('aside nav[aria-label="Main"] > div > p')].map((x) => x.textContent.trim())`);
      assert(JSON.stringify(labels) === JSON.stringify(SECTIONS), labels.join(' | '));
      const hrefs = await p.eval(`[...document.querySelectorAll('aside a[href]')].slice(1).map((a) => a.getAttribute('href')).filter((h) => h !== '/premium')`);
      for (const h of LINKS) assert(hrefs.filter((x) => x === h).length === 1, `${h} linked ${hrefs.filter((x) => x === h).length}×`);
      return `${hrefs.length} links (the logo and Premium aside)`;
    });

    await check('The current page (and its sub-pages) is marked; similar prefixes are not', async () => {
      const current = await p.eval(`[...document.querySelectorAll('aside a[aria-current=page]')].map((a) => a.getAttribute('href'))`);
      assert(JSON.stringify(current) === '["/practice"]', JSON.stringify(current));
      await p.goto(`${BASE}/learn/resources/00000000-0000-4000-8000-000000000000`, ready('body'));
      await sleep(800);
      const sub = await p.eval(`[...document.querySelectorAll('aside a[aria-current=page]')].map((a) => a.getAttribute('href'))`);
      assert(JSON.stringify(sub) === '["/learn"]', JSON.stringify(sub));
    });

    await check('Every navigation link opens a page with a heading (no 404)', async () => {
      for (const h of LINKS) {
        await p.goto(`${BASE}${h}`, ready('h1'));
        const title = await p.eval(`document.querySelector('h1')?.textContent ?? ''`);
        assert(!/404|not found/i.test(title), `${h}: ${title}`);
      }
      return `${LINKS.length} pages`;
    });

    await check('Phone width: the menu shows the same seven sections and closes when a link is chosen', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      await p.goto(`${BASE}/dashboard`, ready('h1'));
      await p.eval(`document.querySelector('button[aria-label="Open Menu"]').click()`);
      await p.waitFor(`!!document.querySelector('.fixed nav[aria-label="Main"]')`, { label: 'menu open', timeout: 5000 });
      const labels = await p.eval(`[...document.querySelectorAll('.fixed nav[aria-label="Main"] > div > p')].map((x) => x.textContent.trim())`);
      assert(JSON.stringify(labels) === JSON.stringify([...SECTIONS, 'Account']), labels.join(' | '));
      await p.eval(`[...document.querySelectorAll('.fixed nav[aria-label="Main"] a')].find((a) => a.getAttribute('href') === '/planner').click()`);
      await p.waitFor(`location.pathname === '/planner' && !document.querySelector('.fixed nav[aria-label="Main"]')`, { label: 'navigated, closed', timeout: 15000 });
      const over = await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      assert(over <= 1, `${over}px horizontal overflow`);
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
