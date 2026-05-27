package com.devmastery.content.repository;

import com.devmastery.content.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByTopicIdOrderByOrderIndexAsc(UUID topicId);

    List<Lesson> findByTopicIdAndIsPublishedTrueOrderByOrderIndexAsc(UUID topicId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.topic.id = :topicId AND l.isPublished = true")
    long countPublishedByTopicId(@Param("topicId") UUID topicId);
}
