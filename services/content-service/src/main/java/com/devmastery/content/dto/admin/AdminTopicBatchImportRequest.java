package com.devmastery.content.dto.admin;

import java.util.List;

public record AdminTopicBatchImportRequest(
        List<TopicImport> topics
) {
    public record TopicImport(
            String slug,
            AdminTopicSectionsImportRequest layers
    ) {}
}
