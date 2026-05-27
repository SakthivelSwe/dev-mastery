package com.devmastery.content.repository;

import com.devmastery.content.entity.Topic;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TopicSpecification {

    public static Specification<Topic> buildSpecification(String pathSlug, Integer level, Boolean hasVisualizer, List<String> tags) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Only fetch published topics via this spec by default
            predicates.add(cb.isTrue(root.get("isPublished")));

            if (pathSlug != null && !pathSlug.isBlank()) {
                predicates.add(cb.equal(root.get("learningPath").get("slug"), pathSlug));
            }

            if (level != null) {
                predicates.add(cb.equal(root.get("level"), level));
            }

            if (hasVisualizer != null) {
                predicates.add(cb.equal(root.get("hasVisualizer"), hasVisualizer));
            }

            if (tags != null && !tags.isEmpty()) {
                // Handling PostgreSQL arrays in JPA Criteria API is tricky.
                // A simpler alternative is to use native query or the array overlap operator, 
                // but for standard JPA we can use the cb.isMember if it was an @ElementCollection.
                // Since it's a String[], we use a custom function or cb.like as a workaround,
                // or ideally a custom dialect function. Let's use array overlap via a native-like expression.
                
                // For each tag, we need it to be in the tags array.
                // In Postgres: ? = ANY(tags)
                for (String tag : tags) {
                    predicates.add(cb.isTrue(cb.function("array_contains", Boolean.class, root.get("tags"), cb.literal(tag))));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
