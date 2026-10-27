// e2e/browser/ai.mjs — real-browser check of /ai against a LOCAL backend + LOCAL AI service + mock model.
// Needs: backend on 5055, the real FastAPI AI service (test/live/start-ai-service.mjs) and test/live/mock_nim.py on 8799.
// The mock model answers "MOCK-NIM: …"; POST /__mode?m=error makes it fail, to check the error path.
import { launch, newPage, sleep } from './cdp.mjs';
import { BASE, api, assert, check, clickIn, clickLabel, has, ready, record, signup, summary, text, usePage } from './harness.mjs';

const MOCK = process.env.MOCK_NIM_URL ?? 'http://127.0.0.1:8799';
const mockMode = (m) => fetch(`${MOCK}/__mode?m=${m}`, { method: 'POST' });

async function main() {
  const token = await signup('ai', 'AI Learner');
  const other = await signup('aio', 'Other Learner');
  await mockMode('ok');

  const chrome = await launch({ port: 9347 });
  const p = await newPage(chrome.port);
  usePage(p);
  await p.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  try {
    await p.goto(`${BASE}/welcome`);
    await p.eval(`localStorage.setItem('accessToken', ${JSON.stringify(token)})`);

    await check('/ai starts with no invented persona or scripted conversation', async () => {
      await p.goto(`${BASE}/ai`, ready('h1'));
      await p.waitFor(has('Ask anything about your studies'), { timeout: 20000 });
      assert(!/Dr\. Athena|Isomerism|Organic Chemistry/.test(await text(p)), 'prototype content shown');
    });

    let conversationId;
    await check('Assistant: a message gets the real AI answer and is saved as a conversation', async () => {
      await p.fill('textarea', 'What is photosynthesis?');
      await clickIn(p, 'button', 'Send');
      await p.waitFor(has('MOCK-NIM: photosynthesis'), { label: 'AI answer', timeout: 30000 });
      const list = await api('/ai/conversations', token);
      assert(list.json.conversations.length === 1, `${list.json.conversations.length} conversations`);
      conversationId = list.json.conversations[0].id;
      const conv = await api(`/ai/conversations/${conversationId}`, token);
      assert(conv.json.conversation.messages.length === 2, 'messages not stored');
      return 'stored: 1 conversation, 2 messages';
    });

    await check('Assistant: a follow-up goes to the same conversation; it is listed after a reload', async () => {
      await sleep(2100); // POST /ai/chat allows 1 per 2 s
      await p.fill('textarea', 'And in one sentence?');
      await clickIn(p, 'button', 'Send');
      await p.waitFor(`document.querySelectorAll('ol[aria-label=Messages] > li:not([aria-hidden])').length >= 4`, { label: 'four messages', timeout: 30000 });
      const conv = await api(`/ai/conversations/${conversationId}`, token);
      assert(conv.json.conversation.messages.length === 4, `${conv.json.conversation.messages.length} stored`);
      await p.reload(ready('h1'));
      await p.waitFor(`!!document.querySelector('aside[aria-label=Conversations] li button')`, { timeout: 20000 });
      await p.eval(`document.querySelector('aside[aria-label=Conversations] li button').click()`);
      await p.waitFor(`document.querySelectorAll('ol[aria-label=Messages] > li:not([aria-hidden])').length === 4`, { label: 'history loaded', timeout: 20000 });
    });

    await check("Another learner cannot open this learner's conversation", async () => {
      const r = await api(`/ai/conversations/${conversationId}`, other);
      assert(r.status === 404, `status ${r.status}`);
      return 'status 404';
    });

    await check('When the AI fails, the error is shown, no answer is invented and the draft is kept', async () => {
      await mockMode('error');
      await sleep(2100);
      await clickIn(p, 'button', 'New chat');
      await p.fill('textarea', 'Will this fail?');
      await clickIn(p, 'button', 'Send');
      await p.waitFor(`!!document.querySelector('[role=alert]')`, { label: 'error shown', timeout: 30000 });
      const draft = await p.eval(`document.querySelector('textarea').value`);
      assert(draft === 'Will this fail?', `draft "${draft}"`);
      assert(!(await p.eval(has('MOCK-NIM'))), 'an answer was shown');
      const list = await api('/ai/conversations', token);
      assert(list.json.conversations.length === 1, 'a conversation was stored for the failed message');
      await mockMode('ok');
      return 'nothing stored for the failed message';
    });

    await check('Delete removes the conversation on the server', async () => {
      await p.eval(`document.querySelector('aside[aria-label=Conversations] li button').click()`);
      await p.waitFor(`document.querySelectorAll('ol[aria-label=Messages] > li:not([aria-hidden])').length === 4`, { timeout: 20000 });
      await clickLabel(p, 'Delete conversation');
      await p.waitFor(has('Ask anything about your studies'), { label: 'cleared', timeout: 20000 });
      assert((await api('/ai/conversations', token)).json.conversations.length === 0, 'still on server');
    });

    await check('Tutor: start a session, get an answer, end it (composer removed)', async () => {
      await clickIn(p, '[role=tab]', 'Tutor sessions');
      await clickIn(p, 'button', 'New session');
      await p.fill('form[aria-label="New tutor session"] input', 'Plant biology');
      await clickIn(p, 'button', 'Start session');
      await p.waitFor(has('Ask the tutor a question to begin.'), { timeout: 20000 });
      await p.fill('section textarea', 'Explain chlorophyll');
      await clickIn(p, 'button', 'Send');
      await p.waitFor(has('MOCK-NIM'), { label: 'tutor answer', timeout: 30000 });
      await clickIn(p, 'button', 'End session');
      await p.waitFor(has('This session has ended.'), { timeout: 20000 });
      const sessions = await api('/ai-tutor/sessions', token);
      assert(sessions.json.data.length === 1 && sessions.json.data[0].status === 'ended', 'not ended on server');
      return 'session stored and ended';
    });

    await check('Study tools: Explain returns the AI text; Diagram is labelled as source, not drawn', async () => {
      await clickIn(p, '[role=tab]', 'Study tools');
      await p.fill('form[aria-label=Explain] textarea', 'osmosis');
      await clickIn(p, 'form[aria-label=Explain] button', 'Explain');
      await p.waitFor(has('MOCK-NIM'), { label: 'explanation', timeout: 30000 });
      await sleep(3100);
      await clickIn(p, '[role=radio]', 'Diagram');
      await p.fill('form[aria-label=Diagram] textarea', 'the water cycle');
      await clickIn(p, 'form[aria-label=Diagram] button', 'Diagram');
      await p.waitFor(has('Diagram source (Mermaid)'), { label: 'diagram source', timeout: 30000 });
      assert(await p.eval(has('it is not drawn here')), 'no honesty note');
    });

    await check("Using up one's own AI allowance shows a countdown; another learner is not affected", async () => {
      // the backend allows 10 explain requests per minute per learner: use them up through the API
      for (let i = 0; i < 12; i++) {
        const r = await fetch(`${process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1'}/ai/explain`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ input: 'x' }) });
        if (r.status === 429) break;
        await sleep(2100);
      }
      await clickIn(p, '[role=radio]', 'Explain');
      await p.fill('form[aria-label=Explain] textarea', 'osmosis again');
      await clickIn(p, 'form[aria-label=Explain] button', 'Explain');
      await p.waitFor(has('You can send again in'), { label: 'countdown', timeout: 20000 });
      assert(await p.eval(`document.querySelector('form[aria-label=Explain] button[type=submit]').disabled`), 'button not disabled');
      assert(!/Too many requests/.test(await text(p)), 'old generic message');
      const theirs = await api('/ai/explain', other, { method: 'POST', body: JSON.stringify({ input: 'osmosis' }) });
      assert(theirs.status === 201, `other learner got ${theirs.status}`);
      return 'own limit: countdown + disabled; other learner 201';
    });

    await check('Companion tab shows the saved companion honestly (not used by the AI yet)', async () => {
      await clickIn(p, '[role=tab]', 'Companion');
      await p.waitFor(has('the AI does not use them in answers yet'), { timeout: 20000 });
    });

    const unexpected = p.consoleErrors.filter((e) => !/status of (429|500|502|503)/.test(e)); // the AI-failure check expects one 5xx
    record('No unexpected console errors', unexpected.length === 0, unexpected.slice(0, 3).join(' | ') || 'none');
  } finally {
    await mockMode('ok').catch(() => {});
    await p.close().catch(() => {});
    await chrome.close();
  }
  summary();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
