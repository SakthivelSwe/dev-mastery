package com.devmastery.content.mapper;

import com.devmastery.content.dto.CodeExampleResponse;
import com.devmastery.content.dto.LessonResponse;
import com.devmastery.content.dto.TopicResponse;
import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.entity.CodeExample;
import com.devmastery.content.entity.Lesson;
import com.devmastery.content.entity.Topic;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for Topic, Lesson, CodeExample entities → DTOs.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface TopicMapper {

    // ─── Topic → TopicSummaryResponse ──────────────────────
    @Mapping(target = "id", source = "id")
    TopicSummaryResponse toSummary(Topic topic);

    List<TopicSummaryResponse> toSummaryList(List<Topic> topics);

    // ─── Topic → TopicResponse (full) ──────────────────────
    @Mapping(target = "pathSlug", source = "learningPath.slug")
    @Mapping(target = "pathTitle", source = "learningPath.title")
    @Mapping(target = "lessons", source = "lessons")
    @Mapping(target = "codeExamples", source = "codeExamples")
    TopicResponse toResponse(Topic topic);

    // ─── Lesson → LessonResponse ────────────────────────────
    @Mapping(target = "topicId", source = "topic.id")
    @Mapping(target = "sectionType", source = "sectionType", qualifiedByName = "sectionTypeToString")
    LessonResponse toLessonResponse(Lesson lesson);

    List<LessonResponse> toLessonResponseList(List<Lesson> lessons);

    // ─── CodeExample → CodeExampleResponse ──────────────────
    @Mapping(target = "topicId", source = "topic.id")
    @Mapping(target = "lessonId", source = "lesson.id")
    CodeExampleResponse toCodeExampleResponse(CodeExample example);

    List<CodeExampleResponse> toCodeExampleResponseList(List<CodeExample> examples);

    // ─── Named qualifier: enum → string ─────────────────────
    @Named("sectionTypeToString")
    default String sectionTypeToString(Lesson.SectionType sectionType) {
        return sectionType == null ? null : sectionType.name();
    }
}
