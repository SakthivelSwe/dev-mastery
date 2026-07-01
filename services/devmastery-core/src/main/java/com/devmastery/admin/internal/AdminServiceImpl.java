package com.devmastery.admin.internal;

import com.devmastery.admin.api.AdminService;
import com.devmastery.content.api.ContentCommandService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);

    private static final List<String> VALID_SECTIONS = List.of(
            "why", "theory", "visual", "code",
            "realworld", "interview", "feynman", "build", "spacedreview");

    @PersistenceContext private EntityManager em;
    private final RunnerTemplateRepository runners;
    private final ContentCommandService content;

    AdminServiceImpl(RunnerTemplateRepository runners, ContentCommandService content) {
        this.runners = runners;
        this.content = content;
    }

    @Override
    public DashboardStats getDashboard() {
        return new DashboardStats(count("users"), count("topics"), count("lessons"),
                count("lesson_completions"), count("quiz_questions"));
    }

    @Override
    @Transactional
    public void updateTopicSection(String slug, String section, String mdxContent) {
        content.upsertTopicSection(slug, section, mdxContent);
    }

    @Override
    @Transactional
    public void importTopicLayers(List<TopicLayerImport> topicImports) {
        // Map AdminService.TopicLayerImport → ContentCommandService.TopicImport
        List<ContentCommandService.TopicImport> mapped = topicImports.stream()
                .map(ti -> new ContentCommandService.TopicImport(ti.slug(), ti.layers()))
                .toList();
        content.importTopicLayers(mapped);
    }

    @Override
    public List<RunnerTemplate> getRunnerTemplates() {
        return runners.findAll().stream()
                .map(r -> new RunnerTemplate(r.getId(), r.getLanguage(), r.getName(),
                        r.getUrlTemplate(), r.isActive()))
                .toList();
    }

    @Override
    @Transactional
    public void upsertRunnerTemplate(String language, String name, String urlTemplate) {
        var entity = runners.findByLanguage(language).orElse(
                RunnerTemplateEntity.builder().language(language).active(true).build());
        entity.setName(name);
        entity.setUrlTemplate(urlTemplate);
        runners.save(entity);
    }

    private long count(String table) {
        try {
            return ((Number) em.createNativeQuery("SELECT count(*) FROM " + table)
                    .getSingleResult()).longValue();
        } catch (Exception e) {
            return 0L;
        }
    }
}
