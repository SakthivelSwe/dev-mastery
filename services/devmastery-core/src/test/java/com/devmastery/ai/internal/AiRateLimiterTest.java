package com.devmastery.ai.internal;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiRateLimiterTest {

    @Test
    void reservesUpToDailyLimitThenRejects() {
        AiRateLimiter limiter = new AiRateLimiter(3);
        UUID user = UUID.randomUUID();

        limiter.tryReserve(user);
        limiter.tryReserve(user);
        limiter.tryReserve(user);
        assertThat(limiter.currentUsage(user)).isEqualTo(3);

        assertThatThrownBy(() -> limiter.tryReserve(user))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Daily AI limit reached");

        // Rejected request must NOT increment the counter further.
        assertThat(limiter.currentUsage(user)).isEqualTo(3);
    }

    @Test
    void nullUserIdShortCircuits() {
        AiRateLimiter limiter = new AiRateLimiter(1);
        limiter.tryReserve(null);
        limiter.tryReserve(null);
        assertThat(limiter.currentUsage(null)).isZero();
    }

    @Test
    void countersAreIsolatedPerUser() {
        AiRateLimiter limiter = new AiRateLimiter(2);
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();

        limiter.tryReserve(a);
        limiter.tryReserve(a);
        limiter.tryReserve(b);

        assertThat(limiter.currentUsage(a)).isEqualTo(2);
        assertThat(limiter.currentUsage(b)).isEqualTo(1);
        assertThatThrownBy(() -> limiter.tryReserve(a)).isInstanceOf(RateLimitExceededException.class);
        limiter.tryReserve(b);
        assertThat(limiter.currentUsage(b)).isEqualTo(2);
    }
}

