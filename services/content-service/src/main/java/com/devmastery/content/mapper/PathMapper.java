package com.devmastery.content.mapper;

import com.devmastery.content.dto.CodeExampleResponse;
import com.devmastery.content.dto.PathResponse;
import com.devmastery.content.dto.TopicSummaryResponse;
import com.devmastery.content.entity.LearningPath;
import org.mapstruct.*;

import java.util.List;

/**
 * MapStruct mapper for LearningPath entity → DTOs.
 * All mapping is compile-time generated — zero reflection overhead.
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface PathMapper {

    /**
     * Full path response (without topics — topics populated separately).
     */
    @Named("toSummaryResponse")
    @Mapping(target = "topics", ignore = true)
    PathResponse toResponse(LearningPath path);

    /**
     * Path response with nested topic summaries.
     */
    @Mapping(target = "topics", source = "topics")
    PathResponse toDetailResponse(LearningPath path);

    @IterableMapping(qualifiedByName = "toSummaryResponse")
    List<PathResponse> toResponseList(List<LearningPath> paths);
}
