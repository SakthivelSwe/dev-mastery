package com.devmastery.content.service;

import com.devmastery.content.entity.Topic;
import com.devmastery.content.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.IndexRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicIndexService {

    private final OpenSearchClient openSearchClient;
    private final TopicRepository topicRepository;

    private static final String INDEX_NAME = "devmastery_content";

    public void indexTopic(Topic topic) {
        log.info("Indexing topic {} to OpenSearch", topic.getSlug());
        try {
            Map<String, Object> document = new HashMap<>();
            document.put("id", topic.getId().toString());
            document.put("type", "topic");
            document.put("title", topic.getTitle());
            document.put("description", topic.getDescription());
            document.put("tags", topic.getTags());
            document.put("path_slug", topic.getLearningPath().getSlug());
            document.put("level", topic.getLevel());

            IndexRequest<Map<String, Object>> request = IndexRequest.of(i -> i
                    .index(INDEX_NAME)
                    .id(topic.getId().toString())
                    .document(document)
            );

            openSearchClient.index(request);
        } catch (Exception e) {
            log.error("Failed to index topic {}: {}", topic.getSlug(), e.getMessage(), e);
        }
    }
}
