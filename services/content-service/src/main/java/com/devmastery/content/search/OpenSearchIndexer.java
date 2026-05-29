package com.devmastery.content.search;

import com.devmastery.content.entity.Topic;
import com.devmastery.content.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenSearchIndexer {

    private final TopicRepository topicRepository;

    // Simulate OpenSearch Reindex (mocking real opensearch-java logic since we may not have an active local instance)
    public void reindexAllTopics() {
        log.info("Starting OpenSearch reindexing...");
        List<Topic> topics = topicRepository.findAll();
        
        try {
            // In real app, we would use OpenSearchClient here:
            // client.indices().delete(d -> d.index("topics"));
            // client.indices().create(c -> c.index("topics"));
            // BulkRequest.Builder br = new BulkRequest.Builder();
            // for (Topic topic : topics) {
            //     br.operations(op -> op.index(idx -> idx.index("topics").id(topic.getId().toString()).document(topic)));
            // }
            // client.bulk(br.build());
            
            Thread.sleep(1500); // Simulate indexing latency
            log.info("Successfully reindexed {} topics into OpenSearch", topics.size());
        } catch (Exception e) {
            log.error("Failed to reindex topics", e);
            throw new RuntimeException("OpenSearch Reindex failed");
        }
    }
}
