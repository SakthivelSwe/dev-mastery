package com.devmastery.auth.internal;

import com.devmastery.auth.api.AuthService;
import com.devmastery.common.exception.BadRequestException;
import com.devmastery.common.exception.ResourceNotFoundException;
import com.devmastery.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
class AuthServiceImpl implements AuthService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final org.springframework.context.ApplicationEventPublisher events;

    AuthServiceImpl(UserRepository repo, PasswordEncoder encoder, JwtTokenProvider jwt, org.springframework.context.ApplicationEventPublisher events) {
        this.repo = repo; this.encoder = encoder; this.jwt = jwt; this.events = events;
    }

    @Override
    @Transactional
    public AuthResult register(String email, String rawPassword, String fullName) {
        if (repo.existsByEmail(email)) {
            throw new BadRequestException("Email already registered");
        }
        UserEntity u = UserEntity.builder()
                .email(email)
                .passwordHash(encoder.encode(rawPassword))
                .fullName(fullName)
                .build();
        u = repo.save(u);
        return issue(u);
    }

    @Override
    public AuthResult login(String email, String rawPassword) {
        UserEntity u = repo.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        if (!encoder.matches(rawPassword, u.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }
        return issue(u);
    }

    @Override
    public UserView getCurrent(UUID userId) {
        return repo.findById(userId).map(this::toView)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId) {
        if (!repo.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        repo.deleteById(userId);
        events.publishEvent(new com.devmastery.common.events.UserDeletedEvent(userId, java.time.Instant.now()));
    }

    private AuthResult issue(UserEntity u) {
        // DB stores role as lowercase ('user'|'admin'); Spring Security uses ROLE_<UPPER>.
        String roleUpper = u.getRole() == null ? "USER" : u.getRole().toUpperCase();
        String token = jwt.generate(u.getId(), u.getEmail(), List.of(roleUpper));
        return new AuthResult(token, toView(u));
    }

    private UserView toView(UserEntity u) {
        String roleUpper = u.getRole() == null ? "USER" : u.getRole().toUpperCase();
        return new UserView(u.getId(), u.getEmail(), u.getFullName(), List.of(roleUpper));
    }
}
