'use client';

import { useEffect, useRef } from 'react';
import { ApiError } from '@/lib/api-error';
import { invalidateLearnerStats } from '@/lib/learning';
import { NOTIFICATIONS_CHANGED_EVENT } from '@/lib/notifications';
import { recoveryMessage } from '@/lib/gamification';
import { HEARTBEAT_INTERVAL_MS, isLearnerActive, nextHeartbeat, recordDailyVisit, sendHeartbeat, type DailyVisit } from '@/lib/engagement';
import { showToast } from '@/lib/toast';

const INTERACTIONS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
const MOVE_THROTTLE_MS = 5_000;

function announceVisit(v: DailyVisit) {
  if (v.reward) showToast({ tone: 'reward', title: `+${v.reward.xp} XP · +${v.reward.coins} coins`, message: v.reward.message });
  // only on the first visit of the day (when the visit reward was just granted), like the in-app notification
  const missed = v.reward ? recoveryMessage(v.recovery) : null;
  if (missed) {
    showToast({
      tone: 'warning',
      title: v.recovery?.recoverable ? 'Recover your streak' : 'Your streak started again',
      message: missed,
      href: '/progress?view=streak',
      actionLabel: v.recovery?.recoverable ? 'Recover now' : 'View streak',
      durationMs: v.recovery?.recoverable ? 0 : 8000,
    });
  }
  if (v.reward || v.streakCounted) invalidateLearnerStats();
  if (v.reward) notificationsChanged();
}

/** The server saved the reward as an in-app notification: the Navbar's unread count reloads. */
function notificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

/**
 * Inside the signed-in learner layout. On opening the app it records the day's first visit (the streak and the
 * daily reward; the server makes repeats harmless) and, about once a minute while the learner is active (page
 * visible, interaction within two minutes), sends a heartbeat. Rewards are shown as toasts; they are also saved as
 * in-app notifications by the server. Failures are silent: they never interrupt studying.
 */
export function EngagementTracker({ enabled = true }: { enabled?: boolean }) {
  const lastInteraction = useRef(0);
  const wasActive = useRef(false);
  const today = useRef<string | null>(null);
  const stopped = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    stopped.current = false;
    lastInteraction.current = Date.now(); // opening the app counts as interacting
    let cancelled = false;
    const stopOn = (err: unknown) => {
      // signed out or not allowed (frozen account): stop until the layout mounts again
      if (err instanceof ApiError && (err.kind === 'unauthorized' || err.status === 403)) stopped.current = true;
    };

    const visit = () =>
      recordDailyVisit()
        .then((v) => {
          if (cancelled) return;
          today.current = v.today;
          announceVisit(v);
        })
        .catch(stopOn);
    void visit();

    let lastMove = 0;
    const touch = (e: Event) => {
      const now = Date.now();
      if (e.type === 'pointermove') {
        if (now - lastMove < MOVE_THROTTLE_MS) return;
        lastMove = now;
      }
      lastInteraction.current = now;
    };
    for (const name of [...INTERACTIONS, 'pointermove'] as const) window.addEventListener(name, touch, { passive: true });

    let inFlight = false;
    const beat = async () => {
      if (stopped.current || inFlight) return;
      const active = isLearnerActive({ visible: document.visibilityState === 'visible', lastInteractionAt: lastInteraction.current, now: Date.now() });
      const send = nextHeartbeat(active, wasActive.current);
      if (send === null) return;
      inFlight = true;
      try {
        const h = await sendHeartbeat(send);
        wasActive.current = send;
        if (cancelled) return;
        for (const r of h.rewards) showToast({ tone: 'reward', title: `+${r.xp} XP · +${r.coins} coins`, message: r.message });
        if (h.rewards.length) {
          invalidateLearnerStats();
          notificationsChanged();
        }
        // a new day began while the app was open: that visit counts too
        // and if the first visit could not be recorded (offline at the start), try it again now
        if (!today.current || (h.today && h.today !== today.current)) void visit();
      } catch (err) {
        stopOn(err); // throttled or offline: the next tick tries again
      } finally {
        inFlight = false;
      }
    };
    const timer = setInterval(() => void beat(), HEARTBEAT_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') void beat(); // stops the clock now rather than after a minute
      else lastInteraction.current = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      for (const name of [...INTERACTIONS, 'pointermove'] as const) window.removeEventListener(name, touch);
    };
  }, [enabled]);

  return null;
}
