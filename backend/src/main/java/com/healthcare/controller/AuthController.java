package com.healthcare.controller;

import com.healthcare.dto.AuthRequest;
import com.healthcare.dto.AuthResponse;
import com.healthcare.dto.RefreshTokenRequest;
import com.healthcare.dto.RegisterRequest;
import com.healthcare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @GetMapping("/me")
    public com.healthcare.dto.UserResponse getCurrentUser() {
        return authService.getCurrentUser();
    }
}
