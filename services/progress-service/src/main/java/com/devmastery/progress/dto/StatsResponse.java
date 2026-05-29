package com.devmastery.progress.dto;

import com.devmastery.progress.entity.UserBadge;
import com.devmastery.progress.entity.UserStreak;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StatsResponse {
    private UserStreak streak;
    private List<UserBadge> badges;
    private long topicsCompleted;
    private long totalLearningTimeSecs;
}
