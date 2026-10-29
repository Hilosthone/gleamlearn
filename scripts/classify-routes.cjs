// scripts/classify-routes.cjs — sorts every backend route from the integration inventory into integrated, partially
// integrated, unintegrated (incl. superseded legacy and contained payments) and server-only.
// Usage: node scripts/integration-inventory.mjs --json=inv.json && node scripts/classify-routes.cjs ./inv.json
const j = require(require('path').resolve(process.argv[2]));
const key = (r) => `${r.method} ${r.path}`;
const SERVER_ONLY = [/^GET \/$/, /^GET \/health/, /^GET \/storage\/local/, /^POST \/payments\/webhook$/, /^GET \/throttler\/status$/, /^POST \/auth\/refresh-token$/];
const DETECTOR = ['GET /analytics/overview', 'GET /past-questions', 'GET /questions', 'GET /search', 'GET /search/courses', 'GET /search/topics', 'GET /search/questions', 'GET /search/materials', 'GET /search/users'];
// covered by an equivalent wired route (the capability is integrated through that route)
const DUPLICATE = [
  /^PATCH \/auth\/me$/, /^PATCH \/users\/me\/notification-preferences$/, /^GET \/goals\/:p(\/progress)?$/, /^GET \/flashcards(\/:p)?$/, /^GET \/notes\/:p$/,
  /^GET \/usage\/(ai|documents|quizzes)$/, /^GET \/xp\/(level|transactions)$/, /^GET \/coins\/transactions$/, /^GET \/streak\/(history|recovery)$/,
  /^GET \/planner\/(today|week|month)$/, /^GET \/calendar(\/week|\/day)?$/, /^GET \/recommendations\/(topics|quizzes|revision|exams)$/, /^GET \/study-sessions\/today$/,
  /^GET \/(quizzes|tests)\/:p\/results$/, /^GET \/exams\/:p\/result$/, /^POST \/exams\/:p\/simulate$/, /^GET \/(progress|mastery)\/(courses|topics)\/:p$/,
  /^GET \/library(\/(topics|materials|quizzes|tests|exams))?$/, /^GET \/analytics\/(courses|courses\/:p|time-spent)$/, /^GET \/past-questions\/:p$/, /^GET \/questions\/:p$/,
  /^GET \/exam-prep\/:p$/, /^GET \/examinations\/:p$/, /^PATCH \/planner\/:p$/, /^GET \/academic-levels$/, /^GET \/(institutions|faculties|departments)$/,
];
const SUPERSEDED = [/^(POST|GET) \/ai\/documents\//, /^POST \/(quizzes|tests|exams)\/generate/, /^(POST|GET|DELETE) \/youtube(\/|$)/, /^(POST|GET) \/files\//];
const PAYMENTS = [/^(GET|POST) \/(plans|subscription|payments)/];
// partially integrated: the module is integrated but these specific capabilities are not (yet)
const PARTIAL = [/^POST \/ai-tutor\//, /^POST \/ai\/voice\//, /^POST \/ai\/conversations$/, /^DELETE \/ai-companion$/, /^GET \/users\/:p/, /^PATCH \/users\/me\/privacy-settings$/,
  /^GET \/achievements\/:p$/, /^GET \/courses\/(search|:p\/topics)$/, /^GET \/topics\/:p$/, /^(POST|DELETE) \/library\/favorites\/:p$/, /^(POST|GET) \/progress\/(update|history)$/,
  /^(POST|DELETE) \/notifications\/token$/, /^POST \/content\/:p\/report$/, /^POST \/coins\/spend$/, /^GET \/leaderboards\/friends$/];
const m = (list, k) => list.some((x) => (x instanceof RegExp ? x.test(k) : x === k));
const out = { integrated: [], partial: [], unintegrated: [], serverOnly: [], superseded: [], paymentsContained: [] };
for (const r of j.routes) {
  const k = key(r);
  if (m(SERVER_ONLY, k)) out.serverOnly.push(k);
  else if (r.status === 'WIRED' || m(DETECTOR, k) || (!r.admin && m(DUPLICATE, k))) out.integrated.push(k);
  else if (!r.admin && m(SUPERSEDED, k)) out.superseded.push(k);
  else if (!r.admin && m(PAYMENTS, k)) out.paymentsContained.push(k);
  else if (!r.admin && m(PARTIAL, k)) out.partial.push(k);
  else out.unintegrated.push(`${r.admin ? '[admin] ' : ''}${k}`);
}
const learnerUnint = out.unintegrated.filter((k) => !k.startsWith('[admin]'));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])), 'total', j.routes.length);
console.log('learner unintegrated:', learnerUnint.length, learnerUnint.join(', '));
console.log('admin unintegrated:', out.unintegrated.length - learnerUnint.length);
