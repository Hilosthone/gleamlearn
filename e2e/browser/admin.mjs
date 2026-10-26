// e2e/browser/admin.mjs — real-browser check of /admin/assessments and /admin/moderation against a LOCAL backend.
// Uses the LOCAL super admin from <BACKEND_DIR>/.env (default ../mycoursea-backend). Credentials are never printed.
import fs from 'fs';
import path from 'path';
import { launch, newPage, sleep } from './cdp.mjs';
import { BASE, RUN, api, assert, check, clickIn, has, ready, record, signup, summary, text, usePage } from './harness.mjs';

const backendDir = process.env.BACKEND_DIR ?? path.resolve('..', 'mycoursea-backend');
const env = Object.fromEntries(
  fs.readFileSync(path.join(backendDir, '.env'), 'utf8').split(/\r?\n/).filter((l) => l && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);

async function main() {
  const login = await api('/admin/auth/login', null, { method: 'POST', body: JSON.stringify({ email: env.SUPER_ADMIN_EMAIL, password: env.SUPER_ADMIN_PASSWORD }) });
  if (!login.json?.accessToken) throw new Error(`admin login ${login.status}`);
  const admin = login.json.accessToken;
  const learner = await signup('adm', 'Admin Check Learner');
  const TITLE = `Admin quiz ${RUN}`;

  await check('Learners cannot use the admin assessment reads (they include answer keys)', async () => {
    const r = await api('/quizzes/manage/all', learner);
    assert(r.status === 401 || r.status === 403, `status ${r.status}`);
    return `status ${r.status}`;
  });

  const chrome = await launch({ port: 9350 });
  const p = await newPage(chrome.port);
  usePage(p);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/admin/login`);
    await p.eval(`localStorage.setItem('gleamlearn.adminAccessToken', ${JSON.stringify(admin)})`);

    await check('Admin navigation has no "not connected" sections left', async () => {
      await p.goto(`${BASE}/admin/assessments`, ready('h1'));
      await p.waitFor(has('The quizzes, tests and exams learners take.'), { timeout: 20000 });
      assert(!/not connected/i.test(await text(p)), '"not connected" shown');
    });

    let quizId;
    await check('Create a quiz in the editor; it is stored with its answer key', async () => {
      await clickIn(p, 'button', 'New quiz');
      await p.fill('form[aria-label="New quiz"] input', TITLE);
      await p.fill('li[aria-label="Question 1"] label:nth-of-type(1) textarea', 'What is 3 + 4?');
      await p.fill('li[aria-label="Question 1"] label:nth-of-type(2) textarea', '6\n7\n8');
      await p.fill('li[aria-label="Question 1"] select', '7');
      await clickIn(p, 'button', 'Add question');
      await p.fill('li[aria-label="Question 2"] label:nth-of-type(1) textarea', 'Largest planet?');
      await p.fill('li[aria-label="Question 2"] label:nth-of-type(2) textarea', 'Mars\nJupiter');
      await p.fill('li[aria-label="Question 2"] select', 'Jupiter');
      await p.fill('li[aria-label="Question 2"] label:nth-of-type(4) input', 'Jupiter is the largest.');
      await clickIn(p, 'button', 'Create quiz');
      await p.waitFor(has(TITLE), { label: 'listed', timeout: 20000 });
      const all = await api('/quizzes/manage/all', admin);
      const q = all.json.find((x) => x.title === TITLE);
      assert(q && q.questions.length === 2 && q.questions[0].correctAnswer === '7' && q.questions[1].explanation === 'Jupiter is the largest.', 'not stored as entered');
      quizId = q.id;
      assert(await p.eval(has('2 questions')), 'count not shown');
    });

    await check('An incomplete question is refused with a clear message (nothing sent)', async () => {
      await clickIn(p, 'button', 'New quiz');
      await p.fill('form[aria-label="New quiz"] input', 'Broken');
      await p.fill('li[aria-label="Question 1"] label:nth-of-type(1) textarea', 'Only one option');
      await p.fill('li[aria-label="Question 1"] label:nth-of-type(2) textarea', 'A');
      await clickIn(p, 'button', 'Create quiz');
      await p.waitFor(has('Question 1: add at least two options.'));
      await clickIn(p, 'button', 'Cancel');
      assert(!(await api('/quizzes/manage/all', admin)).json.some((x) => x.title === 'Broken'), 'stored anyway');
    });

    await check('The learner sees the quiz without the answer key and is graded by it', async () => {
      const r = await api(`/quizzes/${quizId}`, learner);
      assert(r.status === 200 && !/correctAnswer|Jupiter is the largest/.test(JSON.stringify(r.json)), 'answer key exposed');
      const sub = await api(`/quizzes/${quizId}/submit`, learner, { method: 'POST', body: JSON.stringify({ answers: { 0: '7', 1: 'Jupiter' } }) });
      assert(sub.status === 201 || sub.status === 200, `submit ${sub.status}`);
      const score = sub.json?.score ?? sub.json?.data?.score;
      assert(Number(score) === 100, `score ${JSON.stringify(sub.json).slice(0, 200)}`);
      return 'score 100';
    });

    await check('Editing the title is saved', async () => {
      await sleep(1500);
      await p.eval(`document.querySelector('[aria-label=${JSON.stringify(`Edit ${TITLE}`)}]').click()`);
      await p.waitFor(`document.querySelector('form[aria-label="Edit quiz"] input')?.value === ${JSON.stringify(TITLE)}`, { label: 'editor loaded', timeout: 20000 });
      await p.fill('form[aria-label="Edit quiz"] input', `${TITLE} (edited)`);
      await clickIn(p, 'button', 'Save changes');
      await p.waitFor(has(`${TITLE} (edited)`), { timeout: 20000 });
      const q = await api(`/quizzes/manage/${quizId}`, admin);
      assert(q.json.title === `${TITLE} (edited)` && q.json.questions.length === 2, 'edit not saved');
    });

    await check('Deleting removes it for learners', async () => {
      await p.eval('window.confirm = () => true');
      await p.eval(`document.querySelector('[aria-label=${JSON.stringify(`Delete ${TITLE} (edited)`)}]').click()`);
      await p.waitFor(`!document.body.innerText.includes(${JSON.stringify(`${TITLE} (edited)`)})`, { label: 'removed', timeout: 20000 });
      const r = await api(`/quizzes/${quizId}`, learner);
      assert(r.status === 404, `learner read ${r.status}`);
    });

    await check('Moderation: real (empty) queues and an honest note about why', async () => {
      await p.goto(`${BASE}/admin/moderation`, ready('h1'));
      await p.waitFor(has('No pending reports'), { timeout: 20000 });
      assert(await p.eval(has("Learners can't submit reports from the app yet")), 'no note');
      await clickIn(p, '[role=tab]', 'AI content');
      await p.waitFor(has('No pending AI content'), { timeout: 20000 });
    });

    const unexpected = p.consoleErrors.filter((e) => !/status of 429/.test(e));
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
