package com.devmastery.admin.internal;

import com.devmastery.admin.api.AdminService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
class AdminServiceImpl implements AdminService {

    @PersistenceContext private EntityManager em;
    private final RunnerTemplateRepository runners;

    AdminServiceImpl(RunnerTemplateRepository runners) { this.runners = runners; }

    @Override
    public DashboardStats getDashboard() {
        long users = count("users");
        long topics = count("topics");
        long lessons = count("lessons");
        long completions = count("lesson_completions");
        long quizzes = count("quiz_questions"); // proxy for quiz attempts
        return new DashboardStats(users, topics, lessons, completions, quizzes);
    }

    @Override
    @Transactional
    public void updateTopicSection(String slug, String section, String content) {
        // Validate section name
        List<String> validSections = List.of("why", "theory", "visual", "code",
                "real_world", "interview", "feynman", "build", "spaced_review");
        if (!validSections.contains(section)) {
            throw new IllegalArgumentException("Invalid section: " + section);
        }
        em.createNativeQuery("UPDATE topics SET " + section + " = :content WHERE slug = :slug")
                .setParameter("content", content)
                .setParameter("slug", slug)
                .executeUpdate();
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
        return ((Number) em.createNativeQuery("SELECT count(*) FROM " + table)
                .getSingleResult()).longValue();
    }
}
