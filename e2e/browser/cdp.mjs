// e2e/browser/cdp.mjs — a minimal Chrome DevTools Protocol driver (no dependencies; Node 22+ global WebSocket)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Starts an isolated headless Chrome (throw-away profile) and returns { browser, close }. */
export async function launch({ port, extraArgs = [] }) {
  const exe = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!exe) throw new Error('Chrome not found; set CHROME_PATH');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'gleamlearn-cdp-'));
  const proc = spawn(exe, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', ...extraArgs, 'about:blank'], { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 50 && !version; i++) {
    try {
      version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    } catch {
      await sleep(200);
    }
  }
  if (!version) throw new Error('Chrome did not start');
  const close = async () => {
    proc.kill();
    await sleep(500);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* profile may still be locked */ }
  };
  return { port, close };
}

/** Opens a new tab and returns a Page wrapper. */
export async function newPage(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const page = new Page(target.webSocketDebuggerUrl, target.id, port);
  await page.ready;
  await Promise.all(['Page.enable', 'Runtime.enable', 'Network.enable', 'Log.enable'].map((m) => page.send(m)));
  return page;
}

export class Page {
  constructor(wsUrl, id, port) {
    this.id = id;
    this.port = port;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.consoleErrors = [];
    this.ws = new WebSocket(wsUrl);
    this.ready = new Promise((r) => this.ws.addEventListener('open', r, { once: true }));
    this.ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners.get(msg.method) ?? []) fn(msg.params);
      }
    });
    this.on('Runtime.exceptionThrown', (p) => this.consoleErrors.push(`exception: ${p.exceptionDetails?.exception?.description?.split('\n')[0] ?? p.exceptionDetails?.text}`));
    this.on('Runtime.consoleAPICalled', (p) => {
      if (p.type === 'error') this.consoleErrors.push(`console.error: ${p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200)}`);
    });
    this.on('Log.entryAdded', (p) => {
      if (p.entry.level === 'error') this.consoleErrors.push(`log: ${p.entry.text.slice(0, 200)} ${p.entry.url ?? ''}`);
    });
  }

  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
    return () => this.listeners.set(event, this.listeners.get(event).filter((f) => f !== fn));
  }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(`eval failed: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    return r.result.value;
  }

  async waitFor(expression, { timeout = 15000, label = expression } = {}) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      try {
        const v = await this.eval(expression);
        if (v) return v;
      } catch { /* page may be navigating */ }
      await sleep(100);
    }
    throw new Error(`timed out waiting for: ${label}`);
  }

  async goto(url, readyExpr = 'document.readyState === "complete"') {
    await this.send('Page.navigate', { url });
    await sleep(150);
    await this.waitFor(readyExpr, { timeout: 30000, label: `load ${url}` });
  }

  async reload(readyExpr = 'document.readyState === "complete"') {
    await this.send('Page.reload', {});
    await sleep(300);
    await this.waitFor(readyExpr, { timeout: 30000, label: 'reload' });
  }

  /** Sets an input/textarea/select value the way React observes it (native setter + input/change events). */
  async fill(selector, value) {
    const ok = await this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    if (!ok) throw new Error(`no element ${selector}`);
  }

  /** Fills a select with its first real option (or the given text), or types into the text fallback. */
  async choose(selector, fallbackText) {
    return this.eval(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      if (el.tagName === 'SELECT') {
        const opt = [...el.options].find((o) => o.value) ;
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, opt.value);
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return { kind: 'select', value: opt.value };
      }
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(fallbackText)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return { kind: 'text', value: ${JSON.stringify(fallbackText)} };
    })()`);
  }

  /** Clicks the first button/label/input whose visible text (or selector) matches. */
  async click(textOrSelector, { exact = false } = {}) {
    const ok = await this.eval(`(() => {
      const want = ${JSON.stringify(textOrSelector)};
      let el = null;
      try { el = document.querySelector(want); } catch {}
      if (!el) {
        const norm = (s) => s.replace(/\\s+/g, ' ').trim();
        el = [...document.querySelectorAll('button, a, label, [role=button]')].find((e) => ${exact} ? norm(e.textContent) === want : norm(e.textContent).includes(want));
      }
      if (!el) return false;
      el.click();
      return true;
    })()`);
    if (!ok) throw new Error(`nothing to click: ${textOrSelector}`);
  }

  async key(key, code = key, keyCode = 0) {
    for (const type of ['keyDown', 'keyUp']) await this.send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: keyCode, text: type === 'keyDown' ? (key === 'Enter' ? '\r' : key.length === 1 ? key : undefined) : undefined });
  }

  async close() {
    try { await fetch(`http://127.0.0.1:${this.port}/json/close/${this.id}`); } catch { /* ignore */ }
    this.ws.close();
  }
}

export { sleep };
