import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLearnerActive, nextHeartbeat, toDailyVisit, toEngagementToday, toHeartbeat, ACTIVITY_WINDOW_MS } from '../engagement.ts';
import { calendarMonth, canRecoverStreak, recoveryMessage, toRecoveryHistory, toStreakCalendar, toStreakStatus } from '../gamification.ts';
import { toStreakRecovery } from '../learning.ts';
import { addToast, toToast } from '../toast.ts';
import { DASHBOARD_HELP, HELP_ARTICLES, helpArticle } from '../support.ts';
import { captionFileProblem, toYoutubeSession, transcriptSourceLabel } from '../self-learning.ts';

const recovery = (over = {}) => ({
  missedDays: ['2026-11-01'],
  nextMissedDay: '2026-11-01',
  remainingThisMonth: 4,
  monthlyAllowance: 4,
  recoverable: true,
  reason: null,
  brokenStreak: 5,
  streakIfRecovered: 7,
  ...over,
});

test('daily visit: the reward and the recovery prompt come from the server', () => {
  const v = toDailyVisit({ today: '2026-11-02', streakCounted: true, streak: { currentStreak: 1, recovery: recovery() }, reward: { granted: true, xp: 5, coins: 5, message: 'Welcome back!' } });
  assert.deepEqual(v.reward, { xp: 5, coins: 5, message: 'Welcome back!' });
  assert.equal(v.recovery?.nextMissedDay, '2026-11-01');
  assert.equal(toDailyVisit({ reward: { granted: false, xp: 0, coins: 0 } }).reward, null, 'a repeat visit shows no reward');
  assert.equal(toDailyVisit(null).reward, null);
});

test('heartbeat and today summaries never invent amounts', () => {
  const h = toHeartbeat({ today: '2026-11-02', activeSecondsToday: 600, rewardedBlocksToday: 1, maxBlocksPerDay: 6, nextRewardInSeconds: 600, rewards: [{ xp: 2, coins: 2, message: 'Nice work!' }] });
  assert.deepEqual(h.rewards, [{ xp: 2, coins: 2, message: 'Nice work!' }]);
  assert.equal(h.capReached, false);
  assert.equal(toHeartbeat({ rewardedBlocksToday: 6, maxBlocksPerDay: 6, rewards: 'x' }).capReached, true);
  assert.deepEqual(toHeartbeat({}).rewards, []);
  const t = toEngagementToday({ dailyVisitRewarded: true, activeSecondsToday: 1259, rewardedBlocksToday: 2, maxBlocksPerDay: 6, nextRewardInSeconds: 541, policy: { dailyVisit: { xp: 5, coins: 5 }, activeTime: { xp: 2, coins: 2 } } });
  assert.equal(t.activeMinutesToday, 20);
  assert.deepEqual([t.blockXp, t.blockCoins, t.dailyVisitXp, t.dailyVisitCoins], [2, 2, 5, 5]);
});

test('activity: a visible page with an interaction in the last two minutes; one inactive beat stops the clock', () => {
  const now = 1_000_000;
  assert.equal(isLearnerActive({ visible: true, lastInteractionAt: now - ACTIVITY_WINDOW_MS, now }), true);
  assert.equal(isLearnerActive({ visible: true, lastInteractionAt: now - ACTIVITY_WINDOW_MS - 1, now }), false);
  assert.equal(isLearnerActive({ visible: false, lastInteractionAt: now, now }), false, 'a hidden tab never counts');
  assert.equal(nextHeartbeat(true, false), true);
  assert.equal(nextHeartbeat(false, true), false, 'tell the server once that the learner stopped');
  assert.equal(nextHeartbeat(false, false), null, 'then send nothing while idle');
});

test('recovery is offered only when the server says the gap can be closed', () => {
  const s = (r) => toStreakStatus({ currentStreak: 1, longestStreak: 5, activeToday: true, recoveryTokens: 4, recovery: r });
  assert.equal(canRecoverStreak(s(recovery())), true);
  assert.equal(canRecoverStreak(s(recovery({ recoverable: false, reason: 'gap_too_long' }))), false);
  assert.equal(canRecoverStreak(s(recovery({ missedDays: [], nextMissedDay: null, recoverable: false, reason: null }))), false);
  assert.equal(toStreakRecovery({ missedDays: ['2026-11-01', 'bad'], nextMissedDay: 'x', reason: 'weird' }).missedDays.length, 1);
});

test('recovery messages say how many recoveries are left and that each day needs one', () => {
  assert.match(recoveryMessage(recovery()), /Recover it to keep your 5-day streak \(4 of 4 recoveries left this month\)/);
  assert.match(recoveryMessage(recovery({ missedDays: ['2026-11-01', '2026-11-02'] })), /Each missed day needs its own recovery: recover all 2/);
  assert.match(recoveryMessage(recovery({ recoverable: false, reason: 'allowance_exhausted', remainingThisMonth: 0 })), /used all 4 recoveries this month/);
  assert.match(recoveryMessage(recovery({ missedDays: ['a', 'b', 'c'], recoverable: false, reason: 'gap_too_long', remainingThisMonth: 1 })), /more than the 1 recovery you have left/);
  assert.equal(recoveryMessage(recovery({ missedDays: [] })), null);
  assert.equal(recoveryMessage(null), null);
});

test('the calendar distinguishes active, recovered, missed and today', () => {
  const cal = toStreakCalendar({ month: '2026-11', days: [{ date: '2026-11-01', kind: 'active' }, { date: '2026-11-02', kind: 'recovered' }, { date: '2026-11-03', kind: 'missed' }, { date: '2026-11-04', kind: 'today_pending' }, { date: 'x', kind: 'active' }, { date: '2026-11-05', kind: 'bogus' }] });
  assert.deepEqual(cal.kinds, { '2026-11-01': 'active', '2026-11-02': 'recovered', '2026-11-03': 'missed', '2026-11-04': 'today_pending' });
  const cells = calendarMonth(cal.kinds, 2026, 10).filter((c) => c.day !== null).slice(0, 5);
  assert.deepEqual(cells.map((c) => [c.kind, c.checkedIn]), [['active', true], ['recovered', true], ['missed', false], ['today_pending', false], [null, false]]);
  // an older backend: checkInDates only
  assert.deepEqual(toStreakCalendar({ checkInDates: ['2026-11-01'] }).kinds, { '2026-11-01': 'active' });
});

test('recovery history, newest missed day first', () => {
  assert.deepEqual(toRecoveryHistory({ recoveries: [{ missedDate: '2026-10-03', recoveredOn: '2026-10-04', streakBefore: 2 }, { missedDate: '2026-11-01T00:00:00Z', recoveredOn: '2026-11-02', streakBefore: 5 }, { bad: 1 }] }), [
    { missedDate: '2026-11-01', recoveredOn: '2026-11-02', streakBefore: 5 },
    { missedDate: '2026-10-03', recoveredOn: '2026-10-04', streakBefore: 2 },
  ]);
});

test('toasts: in-app links only, at most four at once', () => {
  assert.equal(toToast({ title: 'x', href: 'https://evil.example' }).href, null);
  assert.equal(toToast({ title: 'x', href: '//evil.example' }).href, null);
  assert.equal(toToast({ title: 'x', href: '/progress?view=streak' }).href, '/progress?view=streak');
  let list = [];
  for (let i = 0; i < 6; i++) list = addToast(list, toToast({ title: `t${i}` }));
  assert.deepEqual(list.map((t) => t.title), ['t2', 't3', 't4', 't5']);
});

test('help articles cover streaks, recovery, rewards and YouTube, and are linked from the dashboard', () => {
  for (const id of ['streak', 'streak-recovery', 'streak-calendar', 'rewards-daily', 'rewards-time', 'xp', 'notifications', 'youtube-materials', 'youtube-transcript']) assert.ok(helpArticle(id), id);
  assert.equal(new Set(HELP_ARTICLES.map((a) => a.id)).size, HELP_ARTICLES.length, 'ids are unique');
  assert.ok(DASHBOARD_HELP.length >= 4);
  assert.match(helpArticle('streak-recovery').body, /up to 4 recoveries each calendar month/);
  assert.match(helpArticle('rewards-time').body, /2 XP and 2 coins, up to 60 minutes a day/);
  assert.match(helpArticle('notifications').body, /push notifications are not available yet/);
  assert.doesNotMatch(helpArticle('streak').body, /check in on Progress/, 'there is no check-in button any more');
  assert.equal(helpArticle('nope'), null);
});

test('YouTube transcript status, failure reason and caption files', () => {
  const s = toYoutubeSession({ id: 's1', transcriptStatus: 'unavailable', transcriptErrorCode: 'BLOCKED', transcriptRetryable: true, transcriptError: 'YouTube refused…' });
  assert.deepEqual([s.transcriptErrorCode, s.transcriptRetryable], ['BLOCKED', true]);
  assert.equal(toYoutubeSession({ id: 's1', transcriptErrorCode: 'MADE_UP' }).transcriptErrorCode, null);
  const ready = toYoutubeSession({ id: 's1', transcriptStatus: 'ready', transcriptSource: 'youtube', transcriptLanguage: 'en', transcriptAutoGenerated: true, segmentCount: 12 });
  assert.equal(transcriptSourceLabel(ready), "From the video's automatic captions (en)");
  assert.equal(transcriptSourceLabel({ transcriptSource: 'captions', transcriptLanguage: null, transcriptAutoGenerated: null }), 'From your caption file');
  assert.equal(ready.segmentCount, 12);
  assert.equal(captionFileProblem({ name: 'lesson.VTT', size: 10 }), null);
  assert.equal(captionFileProblem({ name: 'lesson.srt', size: 10 }), null);
  assert.match(captionFileProblem({ name: 'lesson.txt', size: 10 }), /\.vtt|\.srt/);
  assert.match(captionFileProblem({ name: 'big.vtt', size: 3 * 1024 * 1024 }), /2 MB/);
  assert.match(captionFileProblem({ name: 'empty.vtt', size: 0 }), /empty/);
});
