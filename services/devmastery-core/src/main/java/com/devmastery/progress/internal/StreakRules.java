package com.devmastery.progress.internal;

import java.time.LocalDate;

/**
 * Pure, side-effect-free rules for evolving a {@link UserStreakEntity} when
 * a learner records activity on a given day. Extracted from
 * {@code ProgressServiceImpl} so the branching can be unit-tested without
 * spinning up a Spring context.
 *
 * <p>Rules:</p>
 * <ul>
 *   <li>Same day → no-op (idempotent).</li>
 *   <li>Consecutive day → increment streak.</li>
 *   <li>Exactly one day missed AND {@code freezeCount > 0} → consume a
 *       freeze, streak survives.</li>
 *   <li>Otherwise → reset streak to 1.</li>
 *   <li>Every 7-day multiple grants a fresh freeze, capped at
 *       {@link #MAX_FREEZES}.</li>
 * </ul>
 */
final class StreakRules {

    static final int MAX_FREEZES = 3;
    static final int FREEZE_GRANT_INTERVAL = 7;

    private StreakRules() { /* util */ }

    /**
     * Mutates {@code s} in place with today's activity applied. Returns the
     * same entity for fluent chaining in tests.
     */
    static UserStreakEntity apply(UserStreakEntity s, LocalDate today) {
        if (today.equals(s.getLastActivityDate())) return s;

        LocalDate last = s.getLastActivityDate();
        if (last != null && today.minusDays(1).equals(last)) {
            // Consecutive day — normal bump.
            s.setCurrentStreak(s.getCurrentStreak() + 1);
        } else if (last != null && today.minusDays(2).equals(last) && s.getFreezeCount() > 0) {
            // Exactly one day missed AND we have a freeze → protect streak.
            s.setFreezeCount(s.getFreezeCount() - 1);
            s.setTotalFreezesUsed(s.getTotalFreezesUsed() + 1);
            s.setLastFreezeUsed(today.minusDays(1));
            s.setCurrentStreak(s.getCurrentStreak() + 1);
        } else {
            // Broken streak (2+ days missed, or first activity).
            s.setCurrentStreak(1);
        }

        s.setLongestStreak(Math.max(s.getLongestStreak(), s.getCurrentStreak()));
        s.setLastActivityDate(today);

        // Reward: every 7-day streak grants a fresh freeze, capped at MAX_FREEZES.
        if (s.getCurrentStreak() > 0
                && s.getCurrentStreak() % FREEZE_GRANT_INTERVAL == 0
                && s.getFreezeCount() < MAX_FREEZES) {
            s.setFreezeCount(s.getFreezeCount() + 1);
        }
        return s;
    }
}

