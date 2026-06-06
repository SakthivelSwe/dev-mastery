package com.devmastery.search.web;

import com.devmastery.search.api.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/search")
public class SearchController {

    private final SearchService search;
    public SearchController(SearchService search) { this.search = search; }

    @GetMapping
    public List<SearchService.SearchHit> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit) {
        return search.search(q, Math.min(limit, 100));
    }
}
