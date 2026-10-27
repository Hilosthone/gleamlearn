import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const events = [];
globalThis.window = {
  localStorage: { getItem: () => 'learner-token-for-tests-0123456789', setItem: () => {}, removeItem: () => {} },
  dispatchEvent: (e) => (events.push(e.type), true),
};
const calls = [];
let responder = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  return responder(url, init);
};

const A = await import('../avatar.ts');
const C = await import('../learner-content.ts');
const L = await import('../learning.ts');
const { createHttpClient } = await import('../http-client.ts');
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(() => {
  calls.length = 0;
  events.length = 0;
});

test('avatar responses: presets must be known; upload links on the API are made absolute; anything else is the default', () => {
  assert.deepEqual(A.toAvatar({ kind: 'preset', presetId: 'rocket' }), { kind: 'preset', presetId: 'rocket' });
  assert.deepEqual(A.toAvatar({ kind: 'preset', presetId: 'not-a-preset' }), { kind: 'default' });
  const up = A.toAvatar({ kind: 'upload', imageUrl: '/storage/local/abc.sig', expiresAt: '2026-10-27T10:00:00Z' });
  assert.equal(up.kind, 'upload');
  assert.match(up.imageUrl, /^https?:\/\/.+\/storage\/local\/abc\.sig$/);
  assert.equal(A.toAvatar({ kind: 'upload', imageUrl: 'https://api.cloudinary.com/x' }).imageUrl, 'https://api.cloudinary.com/x');
  assert.deepEqual(A.toAvatar(null), { kind: 'default' });
});

test('avatar file checks before upload (the server checks the contents)', () => {
  assert.equal(A.checkAvatarFile({ name: 'me.png', type: 'image/png', size: 1000 }), null);
  assert.match(A.checkAvatarFile({ name: 'me.gif', type: 'image/gif', size: 1000 }), /PNG, JPEG or WebP/);
  assert.match(A.checkAvatarFile({ name: 'me.png', type: 'image/png', size: 3 * 1024 * 1024 }), /2 MB/);
  assert.match(A.checkAvatarFile({ name: 'me.png', type: 'image/png', size: 0 }), /empty/);
});

test('choosing a preset saves it on the server, then every avatar refreshes', async () => {
  responder = () => json(200, { kind: 'preset', presetId: 'owl' });
  assert.deepEqual(await A.choosePreset('owl'), { kind: 'preset', presetId: 'owl' });
  assert.equal(calls[0].init.method, 'PUT');
  assert.deepEqual(JSON.parse(calls[0].init.body), { presetId: 'owl' });
  assert.deepEqual(events, [A.AVATAR_CHANGED_EVENT]);
  assert.deepEqual(await A.sharedAvatar(), { kind: 'preset', presetId: 'owl' }); // served from the updated cache
  assert.equal(calls.length, 1);
});

test('personal courses: summaries, progress and the create payload', () => {
  const [c] = C.toPersonalCourses([{ id: 'p1', title: 'Biology', subjects: ['Bio', 3], examGoals: ['WAEC'], moduleCount: 4, completedModules: 1, materialCount: 2 }, { title: 'no id' }]);
  assert.deepEqual([c.title, c.subjects, c.percent, c.materialCount], ['Biology', ['Bio'], 25, 2]);
  assert.deepEqual(C.courseInput({ title: ' Bio ', description: ' ', subjects: 'Biology, chemistry,, Biology', level: '', examGoals: 'WAEC, JAMB' }), {
    title: 'Bio',
    subjects: ['Biology', 'chemistry'],
    examGoals: ['WAEC', 'JAMB'],
    objectives: [],
  });
  assert.deepEqual(C.courseInput({ title: 'Bio', description: '', subjects: '', level: '', examGoals: '', objectives: ' Cells \r\n\n Genes ' }).objectives, ['Cells', 'Genes']);
  const d = C.toPersonalCourseDetail({ id: 'p1', title: 'Bio', modules: [{ id: 'm1', title: 'Cells', isCompleted: true }, { id: 'm2', title: 'Genes' }], materials: [] });
  assert.deepEqual([d.modules.length, d.completedModules, d.percent], [2, 1, 50]);
  assert.throws(() => C.toPersonalCourseDetail({}), /could not be read/);
});

test('materials: type labels, sizes, file checks', () => {
  const [m] = C.toMaterials([{ id: 'f1', originalName: 'notes.pdf', mimeType: 'application/pdf', sizeBytes: 2_500_000, status: 'READY', createdAt: '2026-10-27' }]);
  assert.deepEqual([m.name, m.typeLabel, C.formatBytes(m.sizeBytes)], ['notes.pdf', 'PDF', '2.4 MB']);
  assert.equal(m.personalCourseId, null);
  assert.equal(C.checkMaterialFile({ name: 'a.docx', type: '', size: 10 }), null);
  assert.match(C.checkMaterialFile({ name: 'a.exe', type: 'application/x-msdownload', size: 10 }), /PDF, Word/);
  assert.match(C.checkMaterialFile({ name: 'a.pdf', type: 'application/pdf', size: 16 * 1024 * 1024 }), /15 MB/);
});

test('material links are fetched fresh and made absolute', async () => {
  responder = () => json(200, { url: '/storage/local/t.s', expiresAt: 'x' });
  assert.match(await C.materialLink('f1'), /\/storage\/local\/t\.s$/);
  assert.match(calls[0].url, /\/materials\/f1\/access$/);
  // generating from a material goes through lib/self-learning.ts now (see self-learning.test.mjs)
});

test('recommendations keep the server reasons and gaps; nothing is invented', () => {
  const r = L.toRecommendations({
    recommendations: [{ course: { id: 'c1', title: 'JAMB Biology', track: 'Secondary', level: 'SS 3' }, score: 9, reasons: ['Matches your exam goal (JAMB)'] }, { course: {} }],
    missingProfile: ['class'],
    uncoveredExamGoals: ['Post-UTME'],
    catalogueSize: 4,
  });
  assert.deepEqual(r.items, [{ courseId: 'c1', title: 'JAMB Biology', description: '', track: 'Secondary', level: 'SS 3', reasons: ['Matches your exam goal (JAMB)'] }]);
  assert.deepEqual([r.missingProfile, r.uncoveredExamGoals, r.catalogueSize], [['class'], ['Post-UTME'], 4]);
});

test('uploads: progress, errors mapped like other requests, cancellation', async () => {
  class FakeXHR {
    static next = { status: 201, body: '{"ok":true}', headers: {} };
    upload = {};
    headers = {};
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader(k, v) { this.headers[k] = v; }
    getResponseHeader(k) { return FakeXHR.next.headers[k] ?? null; }
    abort() { this.onabort?.(); }
    send() {
      FakeXHR.last = this;
      setTimeout(() => {
        if (this.aborted) return;
        this.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
        Object.assign(this, { status: FakeXHR.next.status, statusText: 'x', responseText: FakeXHR.next.body });
        this.onload?.();
      }, 5);
    }
  }
  globalThis.XMLHttpRequest = FakeXHR;
  const client = createHttpClient({ baseUrl: 'https://api.example.test/api/v1', getToken: () => 'tok' });
  const seen = [];
  assert.deepEqual(await client.upload('/materials', {}, { onProgress: (f) => seen.push(f) }), { ok: true });
  assert.deepEqual(seen, [0.5]);
  assert.equal(FakeXHR.last.headers.Authorization, 'Bearer tok');
  FakeXHR.next = { status: 400, body: JSON.stringify({ message: 'Upload a PDF, Word (.docx) or plain-text file.' }), headers: {} };
  await assert.rejects(client.upload('/materials', {}), (e) => e.kind === 'validation' && /PDF, Word/.test(e.message));
  FakeXHR.next = { status: 429, body: JSON.stringify({ code: 'RATE_LIMITED', retryAfterSeconds: 2 }), headers: {} };
  await assert.rejects(client.upload('/materials', {}), (e) => e.kind === 'rate_limited' && e.retryAfterSeconds === 2);
  const ctrl = new AbortController();
  const p = client.upload('/materials', {}, { signal: ctrl.signal });
  FakeXHR.last.aborted = true;
  ctrl.abort();
  await assert.rejects(p, (e) => e.kind === 'aborted');
});
