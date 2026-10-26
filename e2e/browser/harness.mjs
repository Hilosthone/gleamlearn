// e2e/browser/harness.mjs — shared helpers for the browser checks (LOCAL backend only; passwords are never printed).
import { sleep } from './cdp.mjs';

export const BASE = process.env.BASE_URL ?? 'http://localhost:3917';
export const API = process.env.API_URL ?? 'http://127.0.0.1:5055/api/v1';
if (/onrender\.com|vercel\.app/i.test(API + BASE)) throw new Error('Refusing to run against a deployed environment');
export const RUN = Date.now().toString(36);

const results = [];
let page = null;
export const usePage = (p) => (page = p);

export function record(name, pass, detail = '') {
  results.push(pass);
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}
export async function check(name, fn) {
  try {
    record(name, true, (await fn()) ?? '');
  } catch (e) {
    // say what the page showed instead (error banners, status messages)
    const shown = await page?.eval(`[...document.querySelectorAll('[role=alert],[role=status]')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ')`).catch(() => '');
    record(name, false, `${e.message}${shown ? ` [page: ${shown.slice(0, 300)}]` : ''}`);
  }
}
export function summary() {
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  process.exitCode = results.every(Boolean) ? 0 : 1;
}
export const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
export const ready = (sel) => `(() => { const el = document.querySelector(${JSON.stringify(sel)}); return !!el && Object.keys(el).some((k) => k.startsWith('__react')); })()`;
export const text = (p) => p.eval('document.body.innerText');
export const has = (s) => `document.body.innerText.includes(${JSON.stringify(s)})`;

/** Clicks the element in `scope` whose whitespace-normalised text is exactly `label`. */
export async function clickIn(p, scope, label) {
  const ok = await p.eval(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(scope)})].find((b) => b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(label)}); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no "${label}" in ${scope}`);
  await sleep(400);
}
export async function clickLabel(p, label) {
  const ok = await p.eval(`(() => { const el = document.querySelector('[aria-label=${JSON.stringify(label)}]'); if (!el) return false; el.click(); return true; })()`);
  if (!ok) throw new Error(`no element labelled "${label}"`);
  await sleep(400);
}

/** API call that waits out throttling (429) instead of failing. */
export async function api(path, token, init = {}) {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(`${API}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(init.headers ?? {}) } });
    if (r.status !== 429) return { status: r.status, json: await r.json().catch(() => null) };
    await sleep(2500);
  }
  throw new Error(`${path} stayed throttled`);
}

export async function signup(prefix, fullName = 'Browser Learner') {
  const password = `Pw-${RUN}-local`;
  const body = { fullName, username: `${prefix}${RUN}`, email: `${prefix}-${RUN}@example.test`, password, confirmPassword: password };
  const su = await api('/auth/signup', null, { method: 'POST', body: JSON.stringify(body) });
  if (su.status !== 201) throw new Error(`signup ${su.status}`);
  return su.json.accessToken;
}
