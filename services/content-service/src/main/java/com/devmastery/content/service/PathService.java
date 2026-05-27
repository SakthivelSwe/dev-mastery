package com.devmastery.content.service;

import com.devmastery.content.cache.ContentCacheLoader;
import com.devmastery.content.dto.PathResponse;
import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.mapper.PathMapper;
import com.devmastery.content.mapper.TopicMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PathService {

    private final ContentCacheLoader cacheLoader;   // NOT self-invocation — proxy works correctly
    private final PathMapper pathMapper;
    private final TopicMapper topicMapper;

    /**
     * Returns all active learning paths (ordered by order_index).
     * Result cached in Valkey: devmastery:content:topics key='all-paths' TTL 24h.
     */
    public List<PathResponse> getAllPaths() {
        log.debug("Loading all active learning paths");
        var paths = cacheLoader.loadAllPaths();
        return pathMapper.toResponseList(paths);
    }

    /**
     * Returns a single path with paginated topic summaries.
     * Path cached at key='path:{slug}' TTL 24h.
     */
    public PathResponse getPath(String slug, int page, int size) {
        log.debug("Loading path: {}", slug);
        var path = cacheLoader.loadPath(slug);
        var topics = topicMapper.toSummaryList(path.getTopics());

        // Manual pagination of the cached topic list
        int start = page * size;
        int end = Math.min(start + size, topics.size());
        List<TopicSummaryResponse> paginatedTopics = (start < topics.size())
                ? topics.subList(start, end)
                : List.of();

        return new PathResponse(
                path.getId(), path.getSlug(), path.getTitle(), path.getDescription(),
                path.getIcon(), path.getAccentColor(), path.getLevelMin(), path.getLevelMax(),
                path.getTotalTopics(), path.getEstimatedHours(), path.getOrderIndex(),
                path.getIsActive(), path.getCreatedAt(), paginatedTopics
        );
    }
}
