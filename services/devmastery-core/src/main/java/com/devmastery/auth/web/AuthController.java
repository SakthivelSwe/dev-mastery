package com.devmastery.auth.web;

import com.devmastery.auth.api.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    public AuthService.AuthResult register(@RequestBody @Valid RegisterRequest req) {
        return auth.register(req.email(), req.password(), req.fullName());
    }

    @PostMapping("/login")
    public AuthService.AuthResult login(@RequestBody @Valid LoginRequest req) {
        return auth.login(req.email(), req.password());
    }

    @GetMapping("/me")
    public AuthService.UserView me(@AuthenticationPrincipal UUID userId) {
        return auth.getCurrent(userId);
    }

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotBlank String fullName) { }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password) { }
}
