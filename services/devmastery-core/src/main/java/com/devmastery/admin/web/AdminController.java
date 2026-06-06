package com.devmastery.admin.web;

import com.devmastery.admin.api.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService admin;
    public AdminController(AdminService admin) { this.admin = admin; }

    @GetMapping("/dashboard")
    public AdminService.DashboardStats dashboard() { return admin.getDashboard(); }

    @PutMapping("/topics/{slug}/section")
    public void updateSection(@PathVariable String slug,
                              @RequestBody SectionUpdate body) {
        admin.updateTopicSection(slug, body.section(), body.content());
    }

    @GetMapping("/runners")
    public List<AdminService.RunnerTemplate> runners() { return admin.getRunnerTemplates(); }

    @PutMapping("/runners/{language}")
    public void upsertRunner(@PathVariable String language,
                             @RequestBody RunnerUpdate body) {
        admin.upsertRunnerTemplate(language, body.name(), body.urlTemplate());
    }

    public record SectionUpdate(String section, String content) { }
    public record RunnerUpdate(String name, String urlTemplate) { }
}
