package com.devmastery.profile.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface UserProfileRepository extends JpaRepository<UserProfileEntity, UUID> { }
