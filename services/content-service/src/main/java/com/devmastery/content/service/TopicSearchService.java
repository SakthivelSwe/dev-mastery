package com.devmastery.content.service;

import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.mapper.TopicMapper;
import com.devmastery.content.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.opensearch.core.search.Hit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicSearchService {

    private final OpenSearchClient openSearchClient;
    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    private static final String INDEX_NAME = "devmastery_content";

    // Standard fallback implementation without Resilience4j annotation to avoid adding dependency right now
    public Page<TopicSummaryResponse> searchTopics(String query, int page, int size) {
        log.info("Searching topics for query: {}", query);
        try {
            return searchOpenSearch(query, page, size);
        } catch (Exception e) {
            log.warn("OpenSearch failed, falling back to database query: {}", e.getMessage());
            return searchDatabaseFallback(query, page, size);
        }
    }

    private Page<TopicSummaryResponse> searchOpenSearch(String q, int page, int size) throws Exception {
        SearchRequest searchRequest = SearchRequest.of(s -> s
                .index(INDEX_NAME)
                .from(page * size)
                .size(size)
                .query(qB -> qB
                        .multiMatch(m -> m
                                .query(q)
                                .fields(List.of("title^3", "description", "tags^2"))
                                .fuzziness("AUTO")
                        )
                )
        );

        SearchResponse<Map> response = openSearchClient.search(searchRequest, Map.class);
        
        List<TopicSummaryResponse> results = response.hits().hits().stream()
                .map(Hit::source)
                .filter(java.util.Objects::nonNull)
                .map(source -> TopicSummaryResponse.builder()
                        .id(UUID.fromString((String) source.get("id")))
                        .title((String) source.get("title"))
                        .description((String) source.get("description"))
                        // Need to fetch missing summary details from DB or store everything in OpenSearch.
                        // Here we fetch from DB for accurate full DTO since index only has partial fields
                        .build())
                .toList();
        
        // Since the index might not have all fields for TopicSummaryResponse, 
        // a better approach is to fetch the full entities from DB using the IDs.
        List<UUID> topicIds = response.hits().hits().stream()
                .map(Hit::source)
                .filter(java.util.Objects::nonNull)
                .map(source -> UUID.fromString((String) source.get("id")))
                .toList();

        if (topicIds.isEmpty()) {
            return new PageImpl<>(List.of(), PageRequest.of(page, size), 0);
        }

        var topics = topicRepository.findAllById(topicIds);
        long totalHits = response.hits().total() != null ? response.hits().total().value() : topics.size();
        
        return new PageImpl<>(topicMapper.toSummaryList(topics), PageRequest.of(page, size), totalHits);
    }

    private Page<TopicSummaryResponse> searchDatabaseFallback(String query, int page, int size) {
        return topicRepository.findByTitleContainingIgnoreCaseAndIsPublishedTrue(query, PageRequest.of(page, size))
                .map(topicMapper::toSummary);
    }
}
