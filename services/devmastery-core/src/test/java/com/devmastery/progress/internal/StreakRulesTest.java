package com.devmastery.progress.internal;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StreakRulesTest {

    private static final LocalDate T   = LocalDate.of(2026, 7, 4);
    private static final LocalDate T_1 = T.minusDays(1);
    private static final LocalDate T_2 = T.minusDays(2);
    private static final LocalDate T_3 = T.minusDays(3);

    // ─── First-activity / same-day ────────────────────────────────────

    @Test
    void firstEverActivitySetsStreakToOne() {
        UserStreakEntity s = fresh();
        StreakRules.apply(s, T);
        assertThat(s.getCurrentStreak()).isEqualTo(1);
        assertThat(s.getLongestStreak()).isEqualTo(1);
        assertThat(s.getLastActivityDate()).isEqualTo(T);
    }

    @Test
    void sameDayIsIdempotent() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(5);
        s.setLongestStreak(5);
        s.setLastActivityDate(T);
        StreakRules.apply(s, T);
        // No change whatsoever.
        assertThat(s.getCurrentStreak()).isEqualTo(5);
        assertThat(s.getFreezeCount()).isZero();
    }

    // ─── Consecutive-day bump ─────────────────────────────────────────

    @Test
    void consecutiveDayIncrementsStreak() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(3);
        s.setLongestStreak(3);
        s.setLastActivityDate(T_1);
        StreakRules.apply(s, T);
        assertThat(s.getCurrentStreak()).isEqualTo(4);
        assertThat(s.getLongestStreak()).isEqualTo(4);
    }

    @Test
    void longestStreakOnlyGrowsMonotonically() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(10);
        s.setLongestStreak(20); // historical high
        s.setLastActivityDate(T_1);
        StreakRules.apply(s, T);
        assertThat(s.getCurrentStreak()).isEqualTo(11);
        assertThat(s.getLongestStreak()).isEqualTo(20); // unchanged
    }

    // ─── Freeze protection ────────────────────────────────────────────

    @Test
    void oneMissedDayWithFreezeAvailableConsumesFreezeAndKeepsStreak() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(6);
        s.setLongestStreak(6);
        s.setFreezeCount(2);
        s.setLastActivityDate(T_2); // yesterday was missed

        StreakRules.apply(s, T);

        assertThat(s.getCurrentStreak()).isEqualTo(7);      // survived + bumped
        assertThat(s.getFreezeCount()).isEqualTo(2);        // 2 -> 1 consumed, then 7-day bonus grants +1
        assertThat(s.getTotalFreezesUsed()).isEqualTo(1);
        assertThat(s.getLastFreezeUsed()).isEqualTo(T_1);
    }

    @Test
    void oneMissedDayWithNoFreezeResetsStreak() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(6);
        s.setLongestStreak(6);
        s.setFreezeCount(0);
        s.setLastActivityDate(T_2);

        StreakRules.apply(s, T);

        assertThat(s.getCurrentStreak()).isEqualTo(1);
        assertThat(s.getTotalFreezesUsed()).isZero();
        assertThat(s.getLastFreezeUsed()).isNull();
    }

    @Test
    void twoDaysMissedResetsStreakEvenWithFreezes() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(9);
        s.setFreezeCount(3);
        s.setLastActivityDate(T_3); // 2 days gap — freeze covers only 1

        StreakRules.apply(s, T);

        assertThat(s.getCurrentStreak()).isEqualTo(1);
        assertThat(s.getFreezeCount()).isEqualTo(3); // untouched
        assertThat(s.getTotalFreezesUsed()).isZero();
    }

    // ─── 7-day freeze grant ───────────────────────────────────────────

    @Test
    void sevenDayStreakGrantsBonusFreeze() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(6);
        s.setFreezeCount(0);
        s.setLastActivityDate(T_1);

        StreakRules.apply(s, T); // → 7

        assertThat(s.getCurrentStreak()).isEqualTo(7);
        assertThat(s.getFreezeCount()).isEqualTo(1);
    }

    @Test
    void freezeGrantIsCappedAtMax() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(13);
        s.setFreezeCount(StreakRules.MAX_FREEZES);
        s.setLastActivityDate(T_1);

        StreakRules.apply(s, T); // → 14, would grant a freeze but cap kicks in

        assertThat(s.getCurrentStreak()).isEqualTo(14);
        assertThat(s.getFreezeCount()).isEqualTo(StreakRules.MAX_FREEZES);
    }

    @Test
    void nonMultipleOfSevenGrantsNoFreeze() {
        UserStreakEntity s = fresh();
        s.setCurrentStreak(4);
        s.setFreezeCount(0);
        s.setLastActivityDate(T_1);

        StreakRules.apply(s, T); // → 5

        assertThat(s.getCurrentStreak()).isEqualTo(5);
        assertThat(s.getFreezeCount()).isZero();
    }

    private static UserStreakEntity fresh() {
        return UserStreakEntity.builder()
                .userId(UUID.randomUUID())
                .currentStreak(0)
                .longestStreak(0)
                .freezeCount(0)
                .totalFreezesUsed(0)
                .build();
    }
}

