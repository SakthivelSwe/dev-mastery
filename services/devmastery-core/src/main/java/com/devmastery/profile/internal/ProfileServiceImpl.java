package com.devmastery.profile.internal;

import com.devmastery.auth.api.AuthService;
import com.devmastery.profile.api.ProfileService;
import com.devmastery.storage.api.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.util.UUID;

@Service
class ProfileServiceImpl implements ProfileService {

    private static final String AVATARS_BUCKET = "avatars";

    private final UserProfileRepository profiles;
    private final AuthService auth;
    private final StorageService storage;

    ProfileServiceImpl(UserProfileRepository profiles, AuthService auth, StorageService storage) {
        this.profiles = profiles; this.auth = auth; this.storage = storage;
    }

    @Override
    public ProfileView getProfile(UUID userId) {
        var user = auth.getCurrent(userId);
        var profile = profiles.findById(userId).orElse(
                UserProfileEntity.builder().userId(userId).timezone("UTC").build());
        return toView(user, profile);
    }

    @Override
    @Transactional
    public ProfileView updateProfile(UUID userId, UpdateProfileRequest req) {
        var user = auth.getCurrent(userId);
        var profile = profiles.findById(userId).orElse(
                UserProfileEntity.builder().userId(userId).build());
        if (req.bio() != null) profile.setBio(req.bio());
        if (req.githubUrl() != null) profile.setGithubUrl(req.githubUrl());
        if (req.linkedinUrl() != null) profile.setLinkedinUrl(req.linkedinUrl());
        if (req.timezone() != null) profile.setTimezone(req.timezone());
        profiles.save(profile);
        return toView(user, profile);
    }

    @Override
    @Transactional
    public String uploadAvatar(UUID userId, byte[] imageData, String contentType) {
        String path = userId + "/avatar." + extensionFor(contentType);
        String url = storage.upload(AVATARS_BUCKET, path,
                new ByteArrayInputStream(imageData), imageData.length, contentType);
        var profile = profiles.findById(userId).orElse(
                UserProfileEntity.builder().userId(userId).build());
        profile.setAvatarUrl(url);
        profiles.save(profile);
        return url;
    }

    private ProfileView toView(AuthService.UserView user, UserProfileEntity p) {
        return new ProfileView(user.id(), user.fullName(), user.email(),
                p.getBio(), p.getAvatarUrl(), p.getGithubUrl(), p.getLinkedinUrl(),
                p.getTimezone() == null ? "UTC" : p.getTimezone());
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }
}
