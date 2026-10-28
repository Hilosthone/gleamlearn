// scripts/integration-inventory.mjs — builds the endpoint integration matrix from the actual code.
//
//   node scripts/integration-inventory.mjs [--backend=../mycoursea-backend] [--json=<out.json>] [--md=<out.md>] [--list]
//
// Backend: every live (non-commented) @Controller + @Get/@Post/@Put/@Patch/@Delete route, its guard and Swagger tag.
// Frontend: every request in src/lib/*.ts (apiRequest / adminHttp.request / learnerHttp.upload …), with its client
// function. A route counts as USED when that client function is referenced from a file reachable through imports from
// an app route (page/layout). This is static evidence of wiring, not proof the screen works — the matrix says so.
// Read-only; no network.
import fs from 'node:fs';
import path from 'node:path';

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=') ?? d;
const BACKEND = path.resolve(arg('backend', '../mycoursea-backend'));
const FRONT = process.cwd();
const rel = (base, f) => path.relative(base, f).replace(/\\/g, '/');

const walk = (dir, filter, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.next', 'dist', '__tests__'].includes(e.name)) walk(p, filter, out);
    } else if (filter(p)) out.push(p);
  }
  return out;
};
/** Removes // line comments (incl. whole commented-out copies of old code) and block comments, keeping line numbers. */
const live = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .split('\n')
    .map((l) => (/^\s*\/\//.test(l) ? '' : l.replace(/(^|[^:'"`\\])\/\/[^'"`]*$/, '$1')))
    .join('\n');
const norm = (p) => ('/' + p).replace(/\/+/g, '/').replace(/\/$/, '').replace(/:[A-Za-z_]+/g, ':p').replace(/^\/api\/v1(?=\/|$)/, '') || '/';
const balanced = (s, i, open = '(', close = ')') => {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    if (s[j] === open) depth++;
    else if (s[j] === close && --depth === 0) return j;
  }
  return -1;
};

// ------------------------------------------------------------------------------------------------- backend routes
const routes = [];
for (const file of walk(path.join(BACKEND, 'src'), (p) => p.endsWith('.ts') && !p.endsWith('.spec.ts'))) {
  const code = live(fs.readFileSync(file, 'utf8'));
  const classRe = /((?:@[A-Za-z]+\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)\s*)*)export\s+class\s+(\w+)/g;
  let m;
  while ((m = classRe.exec(code))) {
    const decos = m[1];
    // @Controller('p'), @Controller(['p', 'alias']) (first path), @Controller({ path: 'p' })
    const ctl = /@Controller\(\s*(?:\[\s*)?(?:'([^']*)'|"([^"]*)"|\{[^}]*path:\s*'([^']*)')?/.exec(decos);
    if (!ctl) continue;
    const prefix = ctl[1] ?? ctl[2] ?? ctl[3] ?? '';
    const tag = /@ApiTags\(\s*'([^']+)'/.exec(decos)?.[1] ?? '';
    const classGuard = /@UseGuards\(([^)]*)\)/.exec(decos)?.[1] ?? '';
    const start = m.index + m[0].length;
    const next = code.indexOf('\nexport class', start);
    const body = code.slice(start, next === -1 ? undefined : next);
    const methodRe = /((?:\s*@[A-Za-z]+\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))+)\s*(?:async\s+)?(\w+)\s*\(/g;
    let mm;
    while ((mm = methodRe.exec(body))) {
      const d = mm[1];
      const verb = /@(Get|Post|Put|Patch|Delete)\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/.exec(d);
      if (!verb) continue;
      const sub = verb[2] ?? verb[3] ?? '';
      // @AdminOnly(permission) (src/admin/auth/admin-only.decorator.ts) = admin JWT + that permission
      const adminOnly = /@AdminOnly\(\s*([\w.]+)\s*\)/.exec(d) ?? /@AdminOnly\(\s*([\w.]+)\s*\)/.exec(decos);
      const guard = (adminOnly ? `AdminOnly(${adminOnly[1]})` : (/@UseGuards\(([^)]*)\)/.exec(d)?.[1] ?? classGuard)).replace(/\s+/g, ' ').trim();
      const full = norm(`${prefix}/${sub}`);
      routes.push({
        method: verb[1].toUpperCase(),
        path: full,
        handler: mm[2],
        tag,
        guard: guard || 'none',
        admin: /^\/admin(\/|$)/.test(full) || /Admin/.test(guard),
        file: rel(BACKEND, file),
      });
    }
  }
}

// ------------------------------------------------------------------------------------------------- frontend calls
/** "/a/${encodeURIComponent(id)}/b${query({ x })}" → "/a/:p/b" (a ${…} that is not a whole segment ends the path). */
function templatePath(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '?') break;
    if (raw[i] === '$' && raw[i + 1] === '{') {
      const j = balanced(raw, i + 1, '{', '}');
      if (!out.endsWith('/')) break;
      out += ':p';
      i = j;
      continue;
    }
    out += raw[i];
  }
  return out;
}
/** Inlines small path helpers such as `const pc = (id: string) => \`/personal-courses/${…}\`` at their call sites. */
function inlineHelpers(code) {
  const helpers = [...code.matchAll(/(?:const|function)\s+(\w+)\s*=?\s*\([^)]*\)\s*(?::\s*string\s*)?(?:=>)?\s*\{?\s*(?:return\s*)?`(\/[^`]*)`/g)].map((h) => ({ name: h[1], tpl: h[2] }));
  for (const { name, tpl } of helpers) {
    let out = '';
    let i = 0;
    const re = new RegExp(`\\b${name}\\(`, 'g');
    let h;
    while ((h = re.exec(code))) {
      const close = balanced(code, h.index + name.length);
      if (close === -1) break;
      const inTemplate = code.slice(h.index - 2, h.index) === '${' && code[close + 1] === '}';
      if (code.slice(Math.max(0, h.index - 12), h.index).match(/(?:const|function)\s+$/)) continue; // the definition
      out += inTemplate ? code.slice(i, h.index - 2) + tpl : code.slice(i, h.index) + '`' + tpl + '`';
      i = inTemplate ? close + 2 : close + 1;
      re.lastIndex = i;
    }
    code = out + code.slice(i);
  }
  return code;
}
const calls = [];
for (const file of walk(path.join(FRONT, 'src/lib'), (p) => p.endsWith('.ts'))) {
  const code = inlineHelpers(live(fs.readFileSync(file, 'utf8')));
  const re = /\b(apiRequest|request|upload|requestJson|get|post|put|patch|delete|del)\s*(?:<(?:[^<>()]|<(?:[^<>()]|<[^<>()]*>)*>)*>)?\s*\(\s*(['`])(\/[A-Za-z][^'`]*)\2(?=([\s\S]{0,300}))/g;
  let m;
  while ((m = re.exec(code))) {
    const raw = m[3];
    if (/^\/(api|_next|storage)\b/.test(raw)) continue;
    const rest = m[4].split(/\b(?:apiRequest|request|upload)\s*(?:<[^(]*>)?\s*\(/)[0];
    const helper = m[1];
    const method = /method:\s*'(\w+)'/.exec(rest)?.[1]?.toUpperCase() ?? (helper === 'upload' ? 'POST' : ['post', 'put', 'patch', 'delete'].includes(helper) ? helper.toUpperCase() : helper === 'del' ? 'DELETE' : 'GET');
    const before = code.slice(Math.max(0, m.index - 1500), m.index);
    const fnName = [...before.matchAll(/(?:^|\n)\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=|(\w+)\s*:\s*(?:async\s*)?(?:\(|function)|(\w+)\s*\([^)]*\)\s*(?::[^{]*)?\{)/g)].pop();
    const name = fnName ? (fnName[1] ?? fnName[2] ?? fnName[3] ?? fnName[4]) : '?';
    const owner = fnName?.[3] ? [...code.slice(0, m.index).matchAll(/export\s+const\s+(\w+)\s*=\s*\{/g)].pop()?.[1] : null;
    calls.push({ method, path: norm(templatePath(raw)), fn: owner ? `${owner}.${name}` : name, name, owner, file: rel(FRONT, file) });
  }
}

// ------------------------------------------------------------------------------------------------- reachability
const srcFiles = walk(path.join(FRONT, 'src'), (p) => /\.(tsx?|mjs)$/.test(p) && !/\.test\.|__tests__/.test(p));
const text = new Map(srcFiles.map((f) => [path.resolve(f), live(fs.readFileSync(f, 'utf8'))]));
const resolveImport = (from, spec) => {
  let base;
  if (spec.startsWith('@/')) base = path.join(FRONT, 'src', spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const cand of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx'), base.replace(/\.js$/, '.ts')]) {
    if (text.has(path.resolve(cand))) return path.resolve(cand);
  }
  return null;
};
const roots = [...text.keys()].filter((f) => f.includes(`${path.sep}app${path.sep}`) && /(page|layout|template|error|not-found|loading)\.tsx$/.test(f));
const reachable = new Set();
const stack = [...roots];
while (stack.length) {
  const f = stack.pop();
  if (reachable.has(f)) continue;
  reachable.add(f);
  for (const im of text.get(f).matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const r = resolveImport(f, im[1] ?? im[2]);
    if (r && !reachable.has(r)) stack.push(r);
  }
}
for (const c of calls) {
  const own = path.resolve(FRONT, c.file);
  const needle = c.owner ? new RegExp(`\\b${c.owner}\\.${c.name}\\b`) : new RegExp(`\\b${c.name}\\b`);
  c.consumers = [...reachable].filter((f) => f !== own && needle.test(text.get(f))).map((f) => rel(FRONT, f));
  c.reachableFile = reachable.has(own);
}

// ------------------------------------------------------------------------------------------------- match
const segMatch = (a, b) => {
  const x = a.split('/'), y = b.split('/');
  return x.length === y.length && x.every((s, i) => s === y[i] || ((s === ':p') !== (y[i] === ':p') && (s === ':p' ? !['manage', 'history', 'search', 'me'].includes(y[i]) : !['manage', 'history', 'search', 'me'].includes(s))) || (s === ':p' && y[i] === ':p'));
};
for (const r of routes) {
  // prefer exact segment matches; fall back to :p ↔ literal
  const exact = calls.filter((c) => c.method === r.method && c.path === r.path);
  const hits = exact.length ? exact : calls.filter((c) => c.method === r.method && segMatch(c.path, r.path));
  r.clients = [...new Set(hits.map((h) => h.fn))];
  r.consumers = [...new Set(hits.flatMap((h) => h.consumers))];
  r.status = !hits.length ? 'FRONTEND MISSING' : r.consumers.length ? 'WIRED' : 'CLIENT ONLY';
}
const orphanCalls = calls.filter((c) => !routes.some((r) => r.method === c.method && (c.path === r.path || segMatch(c.path, r.path))));

// ------------------------------------------------------------------------------------------------- output
const by = (xs, f) => xs.reduce((a, x) => ((a[f(x)] = (a[f(x)] ?? 0) + 1), a), {});
const learner = routes.filter((r) => !r.admin);
const admin = routes.filter((r) => r.admin);
console.log(`backend routes: ${routes.length} (learner/public ${learner.length}, admin ${admin.length}); frontend client calls: ${calls.length}; route-reachable files: ${reachable.size}`);
console.log('learner:', by(learner, (r) => r.status));
console.log('admin:  ', by(admin, (r) => r.status));
console.log(`frontend calls with no backend route: ${orphanCalls.length}`);
const jsonOut = arg('json');
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ generatedAt: new Date().toISOString(), routes, orphanCalls }, null, 2));
const mdOut = arg('md');
if (mdOut) {
  const groups = {};
  for (const r of routes) (groups[`${r.admin ? 'Admin' : 'Learner'} — ${r.tag || r.file.split('/').slice(-1)[0]}`] ??= []).push(r);
  const lines = [];
  for (const [g, rs] of Object.entries(groups).sort()) {
    const s = by(rs, (r) => r.status);
    lines.push(`### ${g} (${rs.length}: ${Object.entries(s).map(([k, v]) => `${v} ${k}`).join(', ')})`, '', '| Method | Path | Guard | Status | Client | Used by |', '|---|---|---|---|---|---|');
    for (const r of rs) lines.push(`| ${r.method} | \`${r.path}\` | ${r.guard.replace(/\|/g, '/')} | ${r.status} | ${r.clients.map((c) => `\`${c}\``).join('<br>') || '—'} | ${r.consumers.slice(0, 3).map((c) => `\`${c.replace(/^src\//, '')}\``).join('<br>') || '—'}${r.consumers.length > 3 ? ` +${r.consumers.length - 3}` : ''} |`);
    lines.push('');
  }
  fs.writeFileSync(mdOut, lines.join('\n'));
}
if (process.argv.includes('--list')) {
  for (const r of routes) console.log(`${r.admin ? 'A' : 'L'} ${r.status.padEnd(16)} ${r.method.padEnd(6)} ${r.path}  [${r.tag}]`);
  for (const c of orphanCalls) console.log(`ORPHAN ${c.method} ${c.path} (${c.fn})`);
}
