package com.devmastery.search.api;

import java.util.List;
import java.util.UUID;

public interface SearchService {

    List<SearchHit> search(String query, int limit);

    /** Hit type: TOPIC, LESSON, EXAMPLE. */
    record SearchHit(UUID id, String type, String slug, String title,
                     String snippet, double rank) { }
}
