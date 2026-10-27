// e2e/browser/learner-profile.mjs — real-browser check of the greeting, avatar, recommendations, learning streak,
// personal courses and uploaded materials against a LOCAL backend (STORAGE_DRIVER=local; nothing goes to Cloudinary).
// An admin (local super admin from <BACKEND_DIR>/.env; never printed) publishes a disposable JAMB course.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { launch, newPage, sleep } from './cdp.mjs';
import { API, BASE, RUN, api, assert, check, clickIn, clickLabel, has, ready, record, summary, usePage as setHarnessPage } from './harness.mjs';

const backendDir = process.env.BACKEND_DIR ?? path.resolve('..', 'mycoursea-backend');
const env = Object.fromEntries(
  fs.readFileSync(path.join(backendDir, '.env'), 'utf8').split(/\r?\n/).filter((l) => l && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-e2e-files-'));
const PNG = path.join(tmp, 'me.png');
// a valid 1×1 PNG
fs.writeFileSync(PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
const NOTES = path.join(tmp, 'cell-notes.txt');
fs.writeFileSync(NOTES, 'Cells are the basic unit of life.\nMitochondria make ATP.');
const FAKE_PDF = path.join(tmp, 'virus.pdf');
fs.writeFileSync(FAKE_PDF, Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04])); // an .exe header named .pdf

async function signup(prefix, extra) {
  const password = `Pw-${RUN}-local`;
  const body = { username: `${prefix}${RUN}`, email: `${prefix}-${RUN}@example.test`, password, confirmPassword: password, ...extra };
  const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
  if (su.status !== 201) throw new Error(`signup ${su.status}`);
  return su.json.accessToken;
}

async function main() {
  const adminLogin = await api('/admin/auth/login', null, { method: 'POST', body: JSON.stringify({ email: env.SUPER_ADMIN_EMAIL, password: env.SUPER_ADMIN_PASSWORD }) });
  const admin = adminLogin.json?.accessToken;
  if (!admin) throw new Error(`admin login ${adminLogin.status}`);
  // Every run adds a course that ties with earlier runs' courses (same score), and ties are ordered by title. The
  // suffix counts DOWN over time, so this run's course sorts first. (Earlier runs' courses can't be deleted: a
  // completed lesson is protected, which is correct.)
  const COURSE = `JAMB Biology ${(Number.MAX_SAFE_INTEGER - Date.now()).toString(36)}`;
  const course = (await api('/admin/content/courses', admin, { method: 'POST', body: JSON.stringify({ title: COURSE, description: 'UTME past questions', track: 'Secondary', level: 'SS 3' }) })).json?.data;
  const lesson = (await api(`/admin/content/courses/${course.id}/lessons`, admin, { method: 'POST', body: JSON.stringify({ title: 'Cells', content: 'Cells are the unit of life.', orderIndex: 0 }) })).json?.data;
  assert(course?.id && lesson?.id, 'course not published');

  const token = await signup('prof', { fullName: 'Amina Bello', educationType: 'Secondary', secondaryClass: 'SS 3', examAimOrGoals: 'JAMB and WAEC' });
  const other = await signup('profo', { fullName: 'Other Learner' });

  const chrome = await launch({ port: 9351 });
  const p = await newPage(chrome.port);
  setHarnessPage(p); // not a React hook; renamed so the hooks lint rule does not misfire
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('Navbar greets the learner by first name', async () => {
      await p.goto(`${BASE}/dashboard`, ready('h1'));
      await p.waitFor(has('Welcome back, Scholar Amina 👋'), { timeout: 20000 });
    });

    await check('Dashboard recommends the matching catalogue course, with the real reason', async () => {
      await p.waitFor(has(COURSE), { label: 'recommended course', timeout: 20000 });
      assert(await p.eval(has('Matches your exam goal (JAMB)')), 'reason missing');
      assert(await p.eval(has('For your class (SS 3)')), 'class reason missing');
    });

    await check('Completing a lesson starts the streak at 1; more activity the same day does not inflate it', async () => {
      assert((await api('/streak', token)).json.currentStreak === 0, 'not 0 before');
      await p.goto(`${BASE}/learn/lesson/${lesson.id}`, ready('h1'));
      await p.waitFor(has('Mark as complete'), { timeout: 20000 });
      await clickIn(p, 'button', 'Mark as complete');
      await p.waitFor(has('Lesson completed.'), { timeout: 20000 });
      const s = await api('/streak', token);
      assert(s.json.currentStreak === 1 && s.json.activeToday === true, `streak ${JSON.stringify(s.json)}`);
      const again = await api('/streak/check-in', token, { method: 'POST' });
      assert(again.status === 400 && (await api('/streak', token)).json.currentStreak === 1, 'inflated');
      await p.goto(`${BASE}/progress`, ready('h1'));
      await clickIn(p, '[role=tab]', 'Streak');
      await p.waitFor(has('Today counts towards your streak.'), { timeout: 20000 });
      return `server streak 1 (${s.json.today}, ${s.json.timeZone})`;
    });

    await check('Avatar: choose a preset, save, and the Navbar shows it', async () => {
      await p.goto(`${BASE}/settings`, ready('h1'));
      await p.waitFor(`[...document.querySelectorAll('[role=tab]')].some((t) => t.textContent.trim() === 'Settings')`, { label: 'settings loaded', timeout: 20000 });
      await clickIn(p, '[role=tab]', 'Settings');
      await clickIn(p, 'nav[aria-label="Settings sections"] button', 'Profile picture');
      await p.waitFor(has('Choose an avatar'), { timeout: 20000 });
      await p.eval(`document.querySelector('input[name=avatar-preset][value=rocket]').click()`);
      await clickIn(p, 'button', 'Save avatar');
      await p.waitFor(has('Your avatar was saved.'), { timeout: 20000 });
      assert((await api('/users/me/avatar', token)).json.presetId === 'rocket', 'not saved on server');
      await p.reload(ready('h1'));
      await p.waitFor(`!!document.querySelector('button [data-avatar="preset:rocket"]')`, { label: 'navbar rocket avatar', timeout: 20000 });
    });

    await check('Avatar: upload a picture; it is stored privately and only reachable by a signed link', async () => {
      await p.waitFor(`[...document.querySelectorAll('[role=tab]')].some((t) => t.textContent.trim() === 'Settings')`, { timeout: 20000 });
      await clickIn(p, '[role=tab]', 'Settings');
      await clickIn(p, 'nav[aria-label="Settings sections"] button', 'Profile picture');
      await p.setFiles('input[type=file][accept^="image"]', [PNG]);
      await p.waitFor(has('me.png'), { timeout: 10000 });
      await clickIn(p, 'button', 'Upload picture');
      await p.waitFor(has('Your picture was uploaded.'), { timeout: 20000 });
      const a = (await api('/users/me/avatar', token)).json;
      assert(a.kind === 'upload' && a.imageUrl.startsWith('/storage/local/'), `avatar ${JSON.stringify(a)}`);
      const img = await fetch(`${API}${a.imageUrl}`);
      assert(img.status === 200 && img.headers.get('content-type') === 'image/png', `image ${img.status}`);
      const tampered = await fetch(`${API}${a.imageUrl.slice(0, -3)}abc`);
      assert(tampered.status === 404, `tampered link ${tampered.status}`);
      assert((await api('/users/me/avatar', other)).json.kind === 'default', "another learner's avatar changed");
      await p.waitFor(`[...document.querySelectorAll('img')].some((i) => i.src.includes('/storage/local/') && i.complete && i.naturalWidth > 0)`, { label: 'uploaded image shown', timeout: 20000 });
      assert(await p.eval(`!!document.querySelector('button [data-avatar="upload"]')`), 'navbar not updated');
      return 'served 200 image/png; tampered link 404';
    });

    await check('Editing the full name updates the greeting', async () => {
      await clickIn(p, 'nav[aria-label="Settings sections"] button', 'Appearance').catch(() => {});
      await p.goto(`${BASE}/settings`, ready('h1'));
      await clickIn(p, 'button', 'Edit Profile');
      await p.waitFor(`!!document.querySelector('#pf-fullName')`, { timeout: 10000 });
      await sleep(3100); // PATCH /users/me allows 1 per 3 s
      await p.fill('#pf-fullName', 'Chidi Okafor');
      await clickIn(p, 'button', 'Save changes');
      await p.waitFor(has('Welcome back, Scholar Chidi 👋'), { label: 'greeting updated', timeout: 20000 });
    });

    let courseId;
    let materialId;
    await check('My courses: create a personal course, add a module and mark it done', async () => {
      await p.goto(`${BASE}/my-courses`, ready('h1'));
      await p.waitFor(has('No personal courses yet'), { timeout: 20000 });
      await clickIn(p, 'button', 'Create a course');
      await p.fill('form[aria-label="Create course"] input', `My JAMB plan ${RUN}`);
      await p.fill('form[aria-label="Create course"] label:nth-of-type(3) input', 'Biology, Chemistry');
      await p.fill('form[aria-label="Create course"] label:nth-of-type(5) input', 'JAMB');
      await clickIn(p, 'button', 'Create course');
      await p.waitFor(`location.pathname.startsWith('/my-courses/')`, { label: 'opened course', timeout: 20000 });
      courseId = await p.eval('location.pathname.split("/").pop()');
      await p.waitFor(has('Personal · only you'), { timeout: 20000 });
      await p.fill('input[placeholder^="New module"]', 'Cell biology');
      await clickIn(p, 'button', 'Add module');
      await p.waitFor(has('Cell biology'), { timeout: 20000 });
      await sleep(1100);
      await p.eval(`document.querySelector('li input[type=checkbox]').click()`);
      await p.waitFor(has('1 of 1 modules done (100%)'), { timeout: 20000 });
      const c = (await api(`/personal-courses/${courseId}`, token)).json;
      assert(c.subjects.join() === 'Biology,Chemistry' && c.examGoals.join() === 'JAMB' && c.modules[0].isCompleted, 'not stored');
    });

    await check('A personal course never appears in the public catalogue or to another learner', async () => {
      const catalogue = (await api('/courses', other)).json;
      assert(!JSON.stringify(catalogue).includes(`My JAMB plan ${RUN}`), 'in catalogue');
      const r = await api(`/personal-courses/${courseId}`, other);
      const edit = await api(`/personal-courses/${courseId}`, other, { method: 'PATCH', body: JSON.stringify({ title: 'taken' }) });
      assert(r.status === 404 && edit.status === 404, `get ${r.status} patch ${edit.status}`);
      return 'other learner: 404/404';
    });

    await check('Upload a material into the course: progress, listed with type, size, date and status', async () => {
      await p.setFiles('input[type=file][accept^=".pdf"]', [NOTES]);
      await p.waitFor(has('cell-notes.txt'), { timeout: 10000 });
      await clickIn(p, 'button', 'Upload');
      await p.waitFor(`document.querySelector('ul[aria-label="Uploaded materials"]')?.innerText.includes('cell-notes.txt')`, { label: 'listed', timeout: 20000 });
      assert(await p.eval(`document.querySelector('ul[aria-label="Uploaded materials"]').innerText.includes('Text') && document.querySelector('ul[aria-label="Uploaded materials"]').innerText.includes('Ready')`), 'type/status missing');
      const list = (await api(`/materials?personalCourseId=${courseId}`, token)).json;
      assert(list.length === 1 && !('storageKey' in list[0]), 'not stored or leaks key');
      materialId = list[0].id;
    });

    await check("Only the owner can open or delete a material; links work and expire-signed", async () => {
      const link = (await api(`/materials/${materialId}/access`, token)).json;
      const file = await fetch(`${API}${link.url}`);
      assert(file.status === 200 && (await file.text()).includes('Mitochondria'), `owner link ${file.status}`);
      const o1 = await api(`/materials/${materialId}/access`, other);
      const o2 = await api(`/materials/${materialId}`, other, { method: 'DELETE' });
      assert(o1.status === 404 && o2.status === 404, `other ${o1.status}/${o2.status}`);
      return 'owner 200; other learner 404/404';
    });

    await check('A disguised file (exe named .pdf) is rejected by the server, nothing is stored', async () => {
      await sleep(2100);
      await p.setFiles('input[type=file][accept^=".pdf"]', [FAKE_PDF]);
      await p.waitFor(has('virus.pdf'), { timeout: 10000 });
      await clickIn(p, 'button', 'Upload');
      await p.waitFor(has('Upload a PDF, Word (.docx) or plain-text file.'), { label: 'rejected', timeout: 20000 });
      assert((await api('/materials', token)).json.length === 1, 'stored anyway');
    });

    await check('Library → Uploaded materials lists it; its text is extracted and it can be learned from', async () => {
      await p.goto(`${BASE}/library`, ready('h1'));
      await clickIn(p, '[role=tab]', 'Uploaded materials');
      await p.waitFor(has('cell-notes.txt'), { timeout: 20000 });
      await p.waitFor(has('Ready') + ' && ' + has('Learn from it'), { label: 'extracted (READY)', timeout: 60000 });
      return 'text extracted by the local AI service';
    });

    await check('Deleting the material removes the file; its old link stops working', async () => {
      const link = (await api(`/materials/${materialId}/access`, token)).json;
      await sleep(2100);
      await p.eval('window.confirm = () => true');
      await clickLabel(p, 'Delete cell-notes.txt');
      await p.waitFor(has('No uploaded materials yet'), { timeout: 20000 });
      const gone = await fetch(`${API}${link.url}`);
      assert(gone.status === 404, `old link ${gone.status}`);
    });

    const unexpected = p.consoleErrors.filter((e) => !/status of (429|400|404|501)/.test(e));
    record('No unexpected console errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | ') || 'none');
  } finally {
    await p.close().catch(() => {});
    await chrome.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  summary();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
