package com.devmastery.auth.api;

import java.util.List;
import java.util.UUID;

/**
 * Public auth API. Other modules MUST depend on this interface,
 * never on {@code AuthServiceImpl} or internal entities.
 */
public interface AuthService {

    AuthResult register(String email, String rawPassword, String fullName);

    AuthResult login(String email, String rawPassword);

    UserView getCurrent(UUID userId);

    record AuthResult(String token, UserView user) { }

    record UserView(UUID id, String email, String fullName, List<String> roles) { }
}
