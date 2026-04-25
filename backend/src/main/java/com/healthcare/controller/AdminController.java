package com.healthcare.controller;

import com.healthcare.dto.AdminCreateUserRequest;
import com.healthcare.dto.AssignRoleRequest;
import com.healthcare.dto.UserResponse;
import com.healthcare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AuthService authService;

    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> users() {
        return authService.listUsers();
    }

    @PostMapping("/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        return authService.createUserByAdmin(request);
    }

    @PostMapping("/assign-role")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse assignRole(@Valid @RequestBody AssignRoleRequest request) {
        return authService.assignRole(request);
    }

    @GetMapping("/system-config")
    @PreAuthorize("hasAuthority('SYSTEM_CONFIG_READ')")
    public String systemConfig() {
        return "System config protected resource";
    }
}
