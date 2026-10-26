// e2e/browser/learner-rest.mjs — real-browser check of /planner, /support and /premium against a LOCAL backend.
import { launch, newPage, sleep } from './cdp.mjs';
import { BASE, api, assert, check, clickIn, clickLabel, has, ready, record, signup, summary, text, usePage } from './harness.mjs';

const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function main() {
  const token = await signup('rest', 'Rest Learner');
  const other = await signup('resto', 'Other Learner');
  const tomorrow = localDate(new Date(Date.now() + 86400000));

  const chrome = await launch({ port: 9349 });
  const p = await newPage(chrome.port);
  usePage(p);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('/planner starts empty: no invented week, streak or exams', async () => {
      await p.goto(`${BASE}/planner`, ready('h1'));
      await p.waitFor(has('Your plan is empty'), { timeout: 20000 });
      assert(!/Faraday|Electromagnetism|14 Days Streak|Quantum/.test(await text(p)), 'prototype content shown');
    });

    let itemId;
    await check('Add a session for tomorrow; it is saved and listed under its date', async () => {
      await clickIn(p, 'button', 'Add session');
      await p.fill('form[aria-label="New study session"] input', `Revise cells ${tomorrow}`);
      await p.fill('form[aria-label="New study session"] input[type=date]', tomorrow);
      await p.fill('form[aria-label="New study session"] label:nth-of-type(4) input', '09:00');
      await p.fill('form[aria-label="New study session"] label:nth-of-type(5) input', '10:30');
      await clickIn(p, 'button', 'Save session');
      await p.waitFor(has(`Revise cells ${tomorrow}`), { label: 'listed', timeout: 20000 });
      const plan = await api('/planner', token);
      assert(plan.json.schedule.length === 1 && plan.json.schedule[0].scheduledDate.startsWith(tomorrow), 'not stored for tomorrow');
      itemId = plan.json.schedule[0].id;
      assert(await p.eval(has('09:00–10:30')), 'time not shown');
    });

    await check('An end time before the start is refused before sending', async () => {
      await sleep(2100);
      await clickIn(p, 'button', 'Add session');
      await p.fill('form[aria-label="New study session"] input', 'Backwards');
      await p.fill('form[aria-label="New study session"] label:nth-of-type(4) input', '11:00');
      await p.fill('form[aria-label="New study session"] label:nth-of-type(5) input', '10:00');
      await clickIn(p, 'button', 'Save session');
      await p.waitFor(has('The end time must be after the start time.'));
      assert((await api('/planner', token)).json.schedule.length === 1, 'invalid session stored');
      await clickIn(p, 'button', 'Cancel');
    });

    await check('Mark done updates the server', async () => {
      await clickLabel(p, `Mark Revise cells ${tomorrow} done`);
      await p.waitFor(has('· Done'), { timeout: 20000 });
      const plan = await api('/planner', token);
      assert(plan.json.schedule[0].isCompleted === true, 'not completed on server');
    });

    await check("Another learner does not see or change this learner's session", async () => {
      const list = await api('/planner', other);
      const done = await api(`/planner/${itemId}/complete`, other, { method: 'POST' });
      assert(list.json.schedule.length === 0 && done.status === 404, `list ${list.json.schedule.length}, complete ${done.status}`);
      return 'empty list; complete → 404';
    });

    await check('AI plan generation is shown as unavailable (no fake plan)', async () => {
      const btn = await p.eval(`[...document.querySelectorAll('button')].find((b) => b.textContent.includes('AI plan'))?.disabled`);
      assert(btn === true, 'AI plan button enabled');
      const gen = await api('/planner/generate', token, { method: 'POST', body: JSON.stringify({ targetId: 'x', deadline: '2026-12-01' }) });
      assert(gen.status === 501 && (await api('/planner', token)).json.schedule.length === 1, `generate ${gen.status}`);
    });

    await check('Goals: create, complete, delete', async () => {
      await clickIn(p, '[role=tab]', 'Goals');
      await p.waitFor(has('No goals yet'), { timeout: 20000 });
      await clickIn(p, 'button', 'New goal');
      await p.fill('form[aria-label="New goal"] input', 'Finish biology');
      await clickIn(p, 'button', 'Save goal');
      await p.waitFor(has('Finish biology'), { timeout: 20000 });
      await sleep(3100);
      await clickIn(p, 'button', 'Mark complete');
      await p.waitFor(has('Completed'), { timeout: 20000 });
      assert((await api('/goals', token)).json.goals[0].isCompleted === true, 'not completed on server');
      await sleep(5100);
      await clickLabel(p, 'Delete goal Finish biology');
      await p.waitFor(has('No goals yet'), { timeout: 20000 });
      assert((await api('/goals', token)).json.goals.length === 0, 'still on server');
    });

    await check('Calendar says plainly it is not available', async () => {
      await clickIn(p, '[role=tab]', 'Calendar');
      await p.waitFor(has("The calendar isn't available yet"));
    });

    await check('/support: help is searchable; reports are offered by email while in-app sending is unavailable', async () => {
      await p.goto(`${BASE}/support`, ready('h1'));
      await p.fill('input', 'streak');
      await p.waitFor(has('Keeping your streak'));
      assert(!/Streak Freeze|shop|rubric-based/i.test(await text(p)), 'false help content');
      await clickIn(p, '[role=tab]', 'Report a problem');
      await p.waitFor(has("Sending from the app isn't available yet"), { timeout: 20000 });
      await p.fill('form[aria-label="Report a problem"] textarea', 'The lesson page will not load for me.');
      const href = await p.eval(`[...document.querySelectorAll('a')].find((a) => a.textContent.includes('Email us'))?.getAttribute('href')`);
      assert(href?.startsWith('mailto:gleamlearn.ai@gmail.com?subject=Problem%20report') && href.includes('lesson%20page'), `href ${href}`);
      assert(!(await p.eval(has('Problem Report Received'))), 'fake success shown');
    });

    await check('/premium: no prices, no fake subscription; says payments are not set up', async () => {
      await p.goto(`${BASE}/premium`, ready('h1'));
      await p.waitFor(has("Premium isn't available yet"), { timeout: 20000 });
      assert(!/₦|Receipt|Cancel subscription|Pause/i.test(await text(p)), 'fake billing shown');
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
