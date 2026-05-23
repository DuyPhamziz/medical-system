package com.healthcare.security;

import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SecurityUtils {
    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof User) return (User) principal;

        String email = auth.getName();
        if (email == null || email.isEmpty() || email.equals("anonymousUser")) return null;

        return userRepository.findByEmail(email).orElse(null);
    }

    public UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getUserId() : null;
    }

    public String getCurrentUserEmail() {
        User user = getCurrentUser();
        return user != null ? user.getEmail() : null;
    }

    public Role getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.startsWith("ROLE_")) {
                try { return Role.valueOf(role.substring(5)); } catch (Exception e) {}
            }
        }
        return null;
    }

    /**
     * Check if the current authenticated user has a specific role.
     * @param roleName role name without ROLE_ prefix (e.g., "ADMIN", "DOCTOR")
     */
    public boolean hasRole(String roleName) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        String targetAuthority = "ROLE_" + roleName.toUpperCase();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase(targetAuthority));
    }

    /**
     * Check if the current authenticated user has any of the given roles.
     */
    public boolean hasAnyRole(String... roleNames) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> {
                    String authority = a.getAuthority().replace("ROLE_", "");
                    for (String role : roleNames) {
                        if (role.equalsIgnoreCase(authority)) return true;
                    }
                    return false;
                });
    }
}
