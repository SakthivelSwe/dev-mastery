package com.devmastery.common.events;

import java.time.Instant;
import java.util.UUID;

public record TopicCompletedEvent(
        UUID userId,
        UUID topicId,
        Instant occurredAt
) { }
