package com.devmastery.profile.web;

import com.devmastery.profile.api.ProfileService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/v1/profile")
public class ProfileController {

    private final ProfileService profile;
    public ProfileController(ProfileService profile) { this.profile = profile; }

    @GetMapping
    public ProfileService.ProfileView get(@AuthenticationPrincipal UUID userId) {
        return profile.getProfile(userId);
    }

    @PutMapping
    public ProfileService.ProfileView update(@AuthenticationPrincipal UUID userId,
                                             @RequestBody ProfileService.UpdateProfileRequest req) {
        return profile.updateProfile(userId, req);
    }

    @PostMapping("/avatar")
    public java.util.Map<String, String> uploadAvatar(
            @AuthenticationPrincipal UUID userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        String url = profile.uploadAvatar(userId, file.getBytes(), file.getContentType());
        return java.util.Map.of("url", url);
    }
}
