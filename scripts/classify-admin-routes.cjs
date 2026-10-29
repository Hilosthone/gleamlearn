// scripts/classify-admin-routes.cjs — classifies every ADMIN route of the integration inventory and writes the admin
// matrix. Usage: node scripts/integration-inventory.mjs --json=inv.json && node scripts/classify-admin-routes.cjs inv.json docs/ADMIN_INTEGRATION_MATRIX.md
const fs = require('fs');
const path = require('path');
const j = require(path.resolve(process.argv[2]));
const out = process.argv[3];

/** [category, reason, matchers] — first match wins; WIRED routes are integrated unless listed as a silo. */
const RULES = [
  ['server-only', 'Token refresh: the console signs in again instead of refreshing (access tokens only)', [/^POST \/admin\/auth\/refresh$/]],
  ['silo', 'Manages `admin_questions`, which nothing learner-facing reads. The console manages the real bank (`questions`) instead. Needs your decision: retire it or migrate its data', [/^\w+ \/admin\/questions/]],
  ['silo', 'Manages `admin_courses`, which nothing learner-facing reads. The real catalogue is managed through `/admin/content`. Needs your decision', [/^\w+ \/admin\/courses/]],
  ['silo', 'Edits the `roles`/`permissions` tables, which are NOT used for authorization (roles are fixed in code). The console shows the enforced model read-only (`GET /admin/access`). Needs your decision', [/^\w+ \/admin\/roles/, /^GET \/admin\/permissions$/]],
  ['refused', 'Answers 501 by design: freezing is learner-controlled', [/^PATCH \/admin\/users\/:p\/(freeze|unfreeze)$/]],
  ['refused', 'Answers 501 by design: permanent deletion awaits a data-retention plan', [/^DELETE \/admin\/users\/:p$/]],
  ['refused', 'Answers 501: no live subscriptions or payment provider, so nothing could change, be cancelled or be refunded', [/^(PATCH|POST) \/admin\/subscriptions\/:p(\/cancel|\/refund)?$/]],
  ['refused', 'Not exposed: the stored settings are not applied by the platform yet, so editing would imply an effect that does not happen (shown read-only)', [/^PATCH \/admin\/settings$/]],
  ['equivalent', 'Covered by `GET /admin/dashboard/counts` (exact counts) on the Overview', [/^GET \/admin\/dashboard$/]],
  ['equivalent', 'Same record as `GET /admin/users/:id`', [/^GET \/admin\/users\/:p\/profile$/]],
  ['equivalent', 'The subscriptions list shows each full record', [/^GET \/admin\/subscriptions\/:p$/]],
  ['equivalent', 'Legacy catalogue writes; the console edits the same tables through `/admin/content`', [/^(POST|PATCH|DELETE) \/(courses|topics|lessons)(\/:p)?(\/topics|\/lessons)?$/]],
  ['equivalent', 'Same effect as `POST /admin/users/:id/xp` (used on the learner page, reason required)', [/^POST \/xp\/award$/]],
  ['partial', 'Admin password recovery by email: no console screen yet (an admin can sign in and is reset by a Super Admin)', [/^POST \/admin\/auth\/(forgot|reset)-password$/]],
  ['partial', 'Legacy uploaded-files store (superseded by learner materials); no console screen', [/^(GET|DELETE) \/files(\/:p)?$/]],
  // the console builds these paths at runtime (`${kind}`, a boolean, a category or a metric), which the detector cannot see
  ['integrated', 'Used by the console with a computed path', [
    /^GET \/admin\/activity\/(users|learning|assessments|ai|payments)$/, /^GET \/admin\/auth\/me$/, /^GET \/admin\/export\/(users|analytics|transactions|activity)$/,
    /^GET \/admin\/finance\/revenue\/(daily|monthly)$/, /^PATCH \/admin\/users\/:p\/(suspend|unsuspend|verify|unverify)$/,
    /^(GET|POST|PATCH|DELETE) \/(quizzes|tests|exams)(\/manage\/all|\/manage\/:p|\/:p)?$/,
  ]],
];

const rows = j.routes.filter((r) => r.admin).map((r) => {
  const key = `${r.method} ${r.path}`;
  for (const [category, reason, matchers] of RULES) if (matchers.some((m) => m.test(key))) return { key, tag: r.tag, guard: r.guard, category, reason };
  if (r.status === 'WIRED') return { key, tag: r.tag, guard: r.guard, category: 'integrated', reason: 'Wired' };
  return { key, tag: r.tag, guard: r.guard, category: 'unclassified', reason: r.status };
});

const LABEL = {
  integrated: 'Integrated',
  equivalent: 'Integrated through an equivalent route',
  partial: 'Partially integrated (no console screen yet)',
  refused: 'Deliberately not offered (server refuses or effect not real)',
  silo: 'Unintegrated: disconnected silo awaiting your decision',
  'server-only': 'Intentionally server-only',
  unclassified: 'UNCLASSIFIED',
};
const counts = Object.fromEntries(Object.keys(LABEL).map((k) => [k, rows.filter((r) => r.category === k).length]));
console.log({ total: rows.length, ...counts });
if (counts.unclassified) console.log(rows.filter((r) => r.category === 'unclassified').map((r) => r.key).join('\n'));

if (out) {
  const lines = [
    '# GleamLearn admin console integration matrix',
    '',
    '**Generated** by `node scripts/classify-admin-routes.cjs <inventory.json> <this file>` from the integration inventory (`scripts/integration-inventory.mjs`). Regenerate after changes.',
    '',
    `## Totals (${new Date().toISOString().slice(0, 10)})`,
    '',
    '| Category | Routes |',
    '|---|---|',
    ...Object.entries(LABEL).filter(([k]) => counts[k] || k !== 'unclassified').map(([k, l]) => `| ${l} | ${counts[k]} |`),
    `| **All admin routes** | **${rows.length}** |`,
    '',
    '## Routes',
    '',
    '| Method & path | Module | Guard | Category | Note |',
    '|---|---|---|---|---|',
    ...rows
      .sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key))
      .map((r) => `| \`${r.key}\` | ${r.tag || '—'} | ${String(r.guard || '').replace('AdminPermission.', '')} | ${LABEL[r.category]} | ${r.reason === 'Wired' ? '' : r.reason} |`),
    '',
  ];
  fs.writeFileSync(out, lines.join('\n'));
}
