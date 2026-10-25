import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActivityTimeline,
  calendarMonth,
  canRecoverStreak,
  humanizeSource,
  mergeAchievements,
  mergeBadges,
  toCheckInDates,
  toCoinLedger,
  toLeaderboard,
  toStreakStatus,
  toStudySessions,
  toStudyStats,
  toXpLedger,
} from '../gamification.ts';

test('XP and coin ledgers map the real rows; spending is negative; newest first', () => {
  const xp = toXpLedger([
    { id: 'x1', amount: 50, source: 'QUIZ_COMPLETED', description: 'Quiz: Algebra', createdAt: '2026-10-01T10:00:00Z' },
    { id: 'x2', amount: 20, source: 'ADMIN_AWARD', description: '', createdAt: '2026-10-02T10:00:00Z' },
    { junk: true },
  ]);
  assert.deepEqual(xp.map((e) => e.id), ['x2', 'x1']);
  const coins = toCoinLedger([
    { id: 'c1', amount: 10, type: 'EARN', source: 'QUIZ', createdAt: '2026-10-01T00:00:00Z' },
    { id: 'c2', amount: 5, type: 'SPEND', source: 'STORE', createdAt: '2026-10-03T00:00:00Z' },
  ]);
  assert.deepEqual(coins.map((e) => [e.id, e.amount]), [['c2', -5], ['c1', 10]]);
  assert.equal(humanizeSource('QUIZ_COMPLETED'), 'Quiz completed');
});

test('streak status and when recovery is offered (only when the streak is broken and a token exists)', () => {
  const now = new Date('2026-10-25T12:00:00Z');
  const base = toStreakStatus({ currentStreak: 3, longestStreak: 9, checkedInToday: false, recoveryTokens: 1, lastCheckInDate: '2026-10-24' });
  assert.equal(base.longestStreak, 9);
  assert.equal(canRecoverStreak(base, now), false, 'last check-in yesterday: not broken');
  assert.equal(canRecoverStreak({ ...base, lastCheckInDate: '2026-10-20' }, now), true);
  assert.equal(canRecoverStreak({ ...base, lastCheckInDate: '2026-10-20', recoveryTokens: 0 }, now), false);
  assert.equal(canRecoverStreak({ ...base, checkedInToday: true, lastCheckInDate: '2026-10-25' }, now), false);
  assert.equal(canRecoverStreak({ ...base, lastCheckInDate: null }, now), false);
});

test('check-in dates and the month grid (Monday first)', () => {
  assert.deepEqual(toCheckInDates({ checkInDates: ['2026-10-01', 'bad', 7, '2026-10-03'] }), ['2026-10-01', '2026-10-03']);
  const cells = calendarMonth(['2026-10-01', '2026-10-03'], 2026, 9);
  assert.equal(cells.filter((c) => c.day === null).length, 3, '1 Oct 2026 is a Thursday: Mon-Wed are blank');
  assert.equal(cells.filter((c) => c.day !== null).length, 31);
  assert.deepEqual(cells.filter((c) => c.checkedIn).map((c) => c.day), [1, 3]);
});

test('achievements and badges: the catalogue merged with what the learner earned', () => {
  const ach = mergeAchievements(
    { achievements: [{ id: 'a1', title: 'First Quiz', description: 'd', rewardXp: 10 }, { id: 'a2', title: 'Ace', description: 'd' }] },
    { unlockedAchievements: [{ achievementId: 'a2', unlockedAt: '2026-10-05T00:00:00Z', achievement: { id: 'a2' } }] },
  );
  assert.deepEqual(ach.map((a) => [a.id, a.unlockedAt]), [['a2', '2026-10-05T00:00:00Z'], ['a1', null]]);
  const badges = mergeBadges({ badges: [{ id: 'b1', name: 'Bronze' }, { id: 'b2', name: 'Gold' }] }, { earnedBadges: [{ badge: { id: 'b2' }, earnedAt: '2026-10-06' }] });
  assert.deepEqual(badges.map((b) => [b.id, Boolean(b.earnedAt)]), [['b2', true], ['b1', false]]);
});

test('leaderboard rows and study statistics', () => {
  assert.deepEqual(toLeaderboard({ leaderboard: [{ rank: 2, userId: 'b', name: 'Grace', totalXp: '600' }, { rank: 1, userId: 'a', name: 'Ada', totalXp: 900 }] }), [
    { rank: 1, userId: 'a', name: 'Ada', totalXp: 900 },
    { rank: 2, userId: 'b', name: 'Grace', totalXp: 600 },
  ]);
  assert.deepEqual(toStudyStats({ totalCompletedSessions: 4, totalStudyTimeMinutes: 95 }), { sessions: 4, minutes: 95 });
  const sessions = toStudySessions({ history: [{ id: 's1', title: '', durationSeconds: 1500, endTime: '2026-10-04T10:00:00Z' }] });
  assert.deepEqual(sessions, [{ id: 's1', title: 'Study session', courseId: null, minutes: 25, at: '2026-10-04T10:00:00Z' }]);
});

test('the activity timeline merges every real source, newest first', () => {
  const timeline = buildActivityTimeline({
    xp: [{ id: 'x1', amount: 50, source: 'QUIZ_COMPLETED', description: '', at: '2026-10-03T10:00:00Z' }],
    coins: [{ id: 'c1', amount: -5, source: 'STORE', description: 'Theme', at: '2026-10-04T10:00:00Z' }],
    sessions: [{ id: 's1', title: 'Algebra', courseId: null, minutes: 25, at: '2026-10-02T10:00:00Z' }],
    checkIns: ['2026-10-05'],
  });
  assert.deepEqual(timeline.map((t) => [t.kind, t.detail]), [
    ['check-in', 'Streak kept'],
    ['coins', '-5 coins'],
    ['xp', '+50 XP'],
    ['study', '25 min studied'],
  ]);
  assert.equal(timeline[2].title, 'Quiz completed');
});

test('AI history: tutor sessions and assistant conversations merged, newest first', async () => {
  const { toTutorSessions, toConversations, mergeAiHistory } = await import('../history.ts');
  const tutor = toTutorSessions({ status: 'success', data: [{ id: 't1', title: '', status: 'ended', createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-02T00:00:00Z' }] });
  const chats = toConversations({ status: 'success', conversations: [{ id: 'c1', title: 'Cells', updatedAt: '2026-10-03T00:00:00Z' }, { junk: 1 }] });
  const merged = mergeAiHistory(tutor, chats);
  assert.deepEqual(merged.map((m) => [m.kind, m.title]), [['assistant', 'Cells'], ['tutor', 'Tutor session']]);
  assert.deepEqual(toConversations({}), []);
});
