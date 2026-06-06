package com.devmastery.profile.api;

import java.util.UUID;

public interface ProfileService {

    ProfileView getProfile(UUID userId);

    ProfileView updateProfile(UUID userId, UpdateProfileRequest request);

    String uploadAvatar(UUID userId, byte[] imageData, String contentType);

    record ProfileView(UUID userId, String fullName, String email, String bio,
                       String avatarUrl, String githubUrl, String linkedinUrl, String timezone) { }

    record UpdateProfileRequest(String bio, String githubUrl, String linkedinUrl, String timezone) { }
}
