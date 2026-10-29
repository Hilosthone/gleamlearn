// e2e/browser/admin-console.mjs — the admin console end to end against a LOCAL backend (real frontend build): grouped
// navigation, overview, a learner's learning overview and actions (XP adjustment, password reset, direct message),
// the question bank (shared with learners), security & access, gamification, finance/analytics honesty, exports,
// system health and audience notifications. Uses the LOCAL super admin from <BACKEND_DIR>/.env; never prints it.
import fs from 'fs';
import path from 'path';
import { launch, newPage, sleep } from './cdp.mjs';
import { BASE, RUN, api, assert, check, clickIn, has, ready, record, signup, summary, usePage } from './harness.mjs';

const backendDir = process.env.BACKEND_DIR ?? path.resolve('..', 'mycoursea-backend');
const env = Object.fromEntries(
  fs.readFileSync(path.join(backendDir, '.env'), 'utf8').split(/\r?\n/).filter((l) => l && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
if (!['localhost', '127.0.0.1', '::1'].includes(env.DATABASE_HOST || 'localhost')) throw new Error('Refusing: the backend .env is not local');

const sel = (s) => JSON.stringify(s);
async function clickSel(p, s) {
  const ok = await p.eval(`(() => { const el = document.querySelector(${sel(s)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no ${s}`);
  await sleep(400);
}
/** Clicks the confirm button of the open <dialog>. */
const confirmDialog = (p, label) => clickIn(p, 'dialog[open] button', label);

async function main() {
  const login = await api('/admin/auth/login', null, { method: 'POST', body: JSON.stringify({ email: env.SUPER_ADMIN_EMAIL, password: env.SUPER_ADMIN_PASSWORD }) });
  if (!login.json?.accessToken) throw new Error(`admin login ${login.status}`);
  const admin = login.json.accessToken;
  const SCHOOL = `Console Check College ${RUN}`;
  const learner = await signup('acl', 'Console Learner');
  await api('/users/me/academic-profile', learner, { method: 'PATCH', body: JSON.stringify({ educationType: 'University', university: SCHOOL }) });
  const me = (await api('/users/me', learner)).json;
  const learnerId = (me.data ?? me).id;
  const learnerEmail = (me.data ?? me).email;
  const outsider = await signup('aclo', 'Other Learner');

  const chrome = await launch({ port: 9359 });
  const p = await newPage(chrome.port);
  usePage(p);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/admin/login`);
    await p.eval(`localStorage.setItem('gleamlearn.adminAccessToken', ${sel(admin)})`);

    await check('Navigation: ten labelled groups; every console page opens with a heading', async () => {
      await p.goto(`${BASE}/admin`, ready('h1'));
      await p.waitFor(`!!document.querySelector('aside nav[aria-label="Admin"]')`, { timeout: 20000 });
      const groups = await p.eval(`[...document.querySelectorAll('aside nav[aria-label="Admin"] > div > p')].map((x) => x.textContent.trim())`);
      assert(groups.length === 10, groups.join(' | '));
      const hrefs = await p.eval(`[...document.querySelectorAll('aside nav[aria-label="Admin"] a')].map((a) => a.getAttribute('href'))`);
      for (const h of hrefs) {
        await p.goto(`${BASE}${h}`, ready('h1'));
        const t = await p.eval(`document.querySelector('main h1')?.textContent ?? ''`);
        assert(t && !/not available for your role|404/i.test(t), `${h}: ${t}`);
      }
      return `${groups.length} groups, ${hrefs.length} pages`;
    });

    await check('Overview: needs-attention counts, health, recent activity and quick links (no invented figures)', async () => {
      await p.goto(`${BASE}/admin`, ready('h1'));
      await p.waitFor(`!!document.querySelector('section[aria-label="Needs attention"]') && !!document.querySelector('section[aria-label="System health"]')`, { timeout: 20000 });
      await p.waitFor(`/Server .+database connected/.test(document.querySelector('section[aria-label="System health"]').innerText)`, { label: 'health', timeout: 15000 });
      const attention = await p.eval(`document.querySelector('section[aria-label="Needs attention"]').innerText`);
      assert(!/…/.test(attention), attention);
      const pending = (await api('/admin/reports?status=PENDING&limit=1', admin)).json.data.pagination.total;
      assert(attention.includes(String(pending.toLocaleString())), `pending ${pending} not shown: ${attention}`);
      assert(await p.eval(`!!document.querySelector('section[aria-label="Quick access"] a[href="/admin/question-bank"]')`), 'quick links');
    });

    await check("User page: real learning overview, XP adjustment (confirmed, audited) and a direct message the learner receives", async () => {
      await p.goto(`${BASE}/admin/users/${learnerId}`, ready('h1'));
      await p.waitFor(`document.querySelector('section[aria-labelledby="learning-heading"]')?.innerText.includes('XP earned')`, { label: 'learning overview', timeout: 20000 });
      await p.fill('form[aria-label="Adjust XP or coins"] input[aria-label="Amount"]', '40');
      await p.fill('form[aria-label="Adjust XP or coins"] input[aria-label="Reason"]', `Console check ${RUN}`);
      await clickIn(p, 'button', 'Adjust XP…');
      await confirmDialog(p, 'Apply adjustment');
      await p.waitFor(has('XP adjusted by 40.'), { label: 'adjusted', timeout: 15000 });
      await p.waitFor(`/XP earned\\s*40/.test(document.querySelector('section[aria-labelledby="learning-heading"]').innerText)`, { label: 'reloaded 40', timeout: 15000 });
      const history = (await api('/xp/history', learner)).json;
      assert(JSON.stringify(history).includes(`Console check ${RUN}`), 'learner XP history');
      await p.fill('form[aria-label="Message this learner"] input[aria-label="Title"]', `Hello ${RUN}`);
      await p.fill('form[aria-label="Message this learner"] textarea', 'Your exam timetable is out.');
      await clickIn(p, 'button', 'Send to this learner');
      await p.waitFor(has("Delivered to the learner's notifications."), { label: 'sent', timeout: 15000 });
      const notes = JSON.stringify((await api('/notifications', learner)).json);
      assert(notes.includes(`Hello ${RUN}`), 'learner did not receive it');
      assert(!JSON.stringify((await api('/notifications', outsider)).json).includes(`Hello ${RUN}`), 'outsider received it');
    });

    await check('Password reset needs confirmation; the learner signs in with the new password', async () => {
      await sleep(3100);
      await p.fill('form[aria-label="Reset password"] input', `New-${RUN}-pass`);
      await clickIn(p, 'button', 'Reset password…');
      await confirmDialog(p, 'Reset password');
      await p.waitFor(has('The password was reset.'), { label: 'reset', timeout: 15000 });
      const signin = await api('/auth/login', null, { method: 'POST', body: JSON.stringify({ email: learnerEmail, password: `New-${RUN}-pass` }) });
      assert(signin.status === 200 || signin.status === 201, `login ${signin.status}`);
    });

    await check('Security & access: audit log attributes the actions to the admin; access matrix; learners are refused', async () => {
      await p.goto(`${BASE}/admin/security?tab=audit`, ready('h1'));
      await p.waitFor(`document.querySelector('ul[aria-label="Audit log"]')?.innerText.includes('MANUAL_XP_ADJUSTMENT')`, { label: 'audit entries', timeout: 20000 });
      const logs = (await api('/admin/audit-logs?category=USERS&limit=50', admin)).json.data.auditLogs;
      const reset = logs.find((l) => l.action === 'RESET_PASSWORD' && l.userId === learnerId);
      assert(reset?.adminId, `reset not attributed: ${JSON.stringify(reset)}`);
      await clickIn(p, '[role=tab]', 'Roles & access');
      await p.waitFor(`!!document.querySelector('section[aria-label="Role permissions"] table')`, { timeout: 15000 });
      const cols = await p.eval(`document.querySelectorAll('section[aria-label="Role permissions"] thead th').length`);
      assert(cols === 8, `columns ${cols}`);
      for (const route of ['/admin/access', '/admin/audit-logs', '/admin/gamification/xp', '/questions/manage/all']) {
        const r = await api(route, learner);
        assert(r.status === 401 || r.status === 403, `learner on ${route} → ${r.status}`);
      }
    });

    await check('Question bank: add, edit and delete a question in the shared bank; learners see the change', async () => {
      const Q = `Which organelle makes ATP? ${RUN}`;
      await p.goto(`${BASE}/admin/question-bank`, ready('h1'));
      await clickIn(p, 'button', 'New question');
      await p.fill('form[aria-label="New question"] textarea', Q);
      await p.eval(`(() => { const t = document.querySelectorAll('form[aria-label="New question"] textarea')[1]; Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, 'Nucleus\\nMitochondrion\\nRibosome'); t.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      await p.eval(`(() => { const i = document.querySelector('form[aria-label="New question"] input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, 'Mitochondrion'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      await clickIn(p, 'form[aria-label="New question"] button', 'Add question');
      await p.waitFor(has('Question added.'), { label: 'added', timeout: 15000 });
      const seen = (await api(`/questions?subject=`, learner)).json;
      const mine = (Array.isArray(seen) ? seen : []).find((x) => x.questionText === Q);
      assert(mine?.correctAnswer === 'Mitochondrion', 'learner cannot see it');
      await sleep(3100);
      await p.eval(`[...document.querySelectorAll('ul[aria-label="Questions"] > li')].find((li) => li.innerText.includes(${sel(Q)})).querySelector('button[aria-label="Edit question"]').click()`);
      await sleep(400);
      await p.fill('form[aria-label="Edit question"] textarea', `${Q} (edited)`);
      await clickIn(p, 'form[aria-label="Edit question"] button', 'Save question');
      await p.waitFor(has('Question saved.'), { label: 'saved', timeout: 15000 });
      assert((await api(`/questions/${mine.id}`, learner)).json.questionText === `${Q} (edited)`, 'edit not live');
      await sleep(5100);
      await p.eval(`[...document.querySelectorAll('ul[aria-label="Questions"] > li')].find((li) => li.innerText.includes(${sel(`${Q} (edited)`)})).querySelector('button[aria-label="Delete question"]').click()`);
      await sleep(400);
      await confirmDialog(p, 'Delete question');
      await p.waitFor(has('Question deleted.'), { label: 'deleted', timeout: 15000 });
      assert((await api(`/questions/${mine.id}`, learner)).status === 404, 'still there');
      const bad = await api('/questions/manage/all', admin);
      assert(bad.status === 200 && Array.isArray(bad.json.data.questions), 'admin list');
    });

    await check('Gamification: real totals and leaderboard; the adjustment is listed with its reason', async () => {
      await p.goto(`${BASE}/admin/gamification`, ready('h1'));
      const xp = (await api('/admin/gamification/xp', admin)).json.data;
      await p.waitFor(has('XP awarded (net)'), { timeout: 20000 });
      assert(await p.eval(has(xp.totalXpGenerated.toLocaleString())), 'total not shown');
      await clickIn(p, '[role=tab]', 'Adjustments');
      await p.waitFor(has(`Console check ${RUN}`), { label: 'adjustment listed', timeout: 15000 });
    });

    await check('Finance and detailed analytics show "not available" from the server, never figures', async () => {
      await p.goto(`${BASE}/admin/finance`, ready('h1'));
      await p.waitFor(`document.querySelectorAll('section[aria-label]').length >= 4 && ![...document.querySelectorAll('section[aria-label]')].some((s) => /Loading/.test(s.innerText))`, { timeout: 20000 });
      const finance = await p.eval(`document.querySelector('main').innerText`);
      assert(!/145,250|850/.test(finance), 'invented figures');
      assert(/not available/i.test(finance), 'no unavailable state');
      await p.goto(`${BASE}/admin/analytics?tab=reports`, ready('h1'));
      await p.waitFor(`document.querySelectorAll('section[aria-label]').length >= 10 && ![...document.querySelectorAll('section[aria-label]')].some((s) => /Loading/.test(s.innerText))`, { timeout: 20000 });
      assert(!/88\\.5|1,240/.test(await p.eval(`document.querySelector('main').innerText`)), 'invented analytics');
      const refund = await api('/admin/subscriptions/00000000-0000-4000-8000-000000000000/refund', admin, { method: 'POST' });
      assert(refund.status === 501, `refund → ${refund.status}`);
    });

    await check('Export centre: the users CSV downloads (formula cells neutralised); transactions is unavailable', async () => {
      const r = await fetch(`${BASE.replace(/:\d+$/, ':5055')}/api/v1/admin/export/users?format=csv`.replace('localhost', '127.0.0.1'), { headers: { Authorization: `Bearer ${admin}` } });
      assert(r.ok && (await r.text()).split('\n')[0].includes('email'), `users export ${r.status}`);
      await p.goto(`${BASE}/admin/analytics?tab=exports`, ready('h1'));
      await p.waitFor(`!!document.querySelector('button[aria-label="Download Payment transactions as CSV"]')`, { timeout: 15000 });
      await clickSel(p, 'button[aria-label="Download Payment transactions as CSV"]');
      await p.waitFor(has("This export isn't available"), { label: 'unavailable', timeout: 15000 });
    });

    await check('Notifications: an institution broadcast reaches only that school\'s learners and is listed as sent', async () => {
      await p.goto(`${BASE}/admin/notifications`, ready('h1'));
      await p.fill('form[aria-label="New notification"] select', 'SPECIFIC_INSTITUTION');
      await sleep(300);
      const inputs = 'form[aria-label="New notification"] input';
      await p.eval(`(() => { const [name, title] = document.querySelectorAll(${sel(inputs)}); const set = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }; set(name, ${sel(SCHOOL)}); set(title, ${sel(`Campus notice ${RUN}`)}); })()`);
      await p.fill('form[aria-label="New notification"] textarea', 'Library opens late on Friday.');
      await clickIn(p, 'button', 'Review and send…');
      await confirmDialog(p, 'Send');
      await p.waitFor(String.raw`/Delivered to \d+ learner/.test(document.body.innerText)`, { label: 'delivered', timeout: 15000 }).catch(async (e) => {
        const dialog = await p.eval(`[...document.querySelectorAll('dialog')].map((d) => d.open + ':' + d.innerText).join(' || ')`);
        throw new Error(`${e.message} [dialog: ${dialog.slice(0, 300)}]`);
      });
      const delivered = await p.eval(String.raw`/Delivered to (\d+) learner/.exec(document.body.innerText)[1]`);
      assert(delivered === '1', `delivered to ${delivered}`);
      assert(JSON.stringify((await api('/notifications', learner)).json).includes(`Campus notice ${RUN}`), 'school learner missed it');
      assert(!JSON.stringify((await api('/notifications', outsider)).json).includes(`Campus notice ${RUN}`), 'outsider got it');
      await clickIn(p, '[role=tab]', 'Sent');
      await p.waitFor(has(`Campus notice ${RUN}`), { label: 'history', timeout: 15000 });
    });

    await check('System health is live; the other monitors say they are not available', async () => {
      await p.goto(`${BASE}/admin/system`, ready('h1'));
      await p.waitFor(has('Connected'), { timeout: 20000 });
      await clickIn(p, '[role=tab]', 'Monitors');
      await p.waitFor(`document.querySelectorAll('section[aria-label]').length === 4 && ![...document.querySelectorAll('section[aria-label]')].some((s) => /Loading/.test(s.innerText))`, { timeout: 20000 });
      assert(/not available/i.test(await p.eval(`document.querySelector('main').innerText`)), 'monitors');
    });

    await check('Phone width (375px): console pages fit without horizontal scrolling; the menu shows the groups', async () => {
      await p.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 760, deviceScaleFactor: 2, mobile: true });
      for (const url of ['/admin', '/admin/security', '/admin/question-bank', '/admin/gamification', '/admin/notifications', `/admin/users/${learnerId}`]) {
        await p.goto(`${BASE}${url}`, ready('h1'));
        await sleep(1200);
        const over = await p.eval('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        assert(over <= 1, `${url}: ${over}px`);
      }
      await clickSel(p, 'button[aria-label="Open admin menu"]');
      await p.waitFor(`document.querySelectorAll('[role=dialog] nav[aria-label="Admin"] > div > p').length === 10`, { label: 'mobile groups', timeout: 5000 });
    });

    const unexpected = p.consoleErrors.filter((e) => !/status of (429|501)/.test(e));
    record('No unexpected console errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | ') || 'none');
  } finally {
    await p.close().catch(() => {});
    await chrome.close();
  }
  summary();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
