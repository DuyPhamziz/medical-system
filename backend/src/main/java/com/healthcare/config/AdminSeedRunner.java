package com.healthcare.config;

import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Component
public class AdminSeedRunner implements ApplicationRunner {

    private final AdminSeedProperties properties;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public AdminSeedRunner(
            AdminSeedProperties properties,
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRolesExist();

        if (!properties.isEnabled()) {
            return;
        }

        seedAccount(properties.getUsername(), properties.getEmail(), properties.getPassword(), Role.ADMIN, "System Admin");
        seedAccount(properties.getDoctorUsername(), properties.getDoctorEmail(), properties.getDoctorPassword(), Role.DOCTOR, "Dr. Demo");
        seedAccount(properties.getPatientUsername(), properties.getPatientEmail(), properties.getPatientPassword(), Role.PATIENT, "Patient Demo");
    }

    private void seedAccount(String username, String email, String password, Role role, String defaultUsername) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return;
        }

        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing != null) {
            boolean changed = false;

            if (existing.getRole() != role) {
                existing.setRole(role);
                changed = true;
            }

            if (!existing.isRoleLocked()) {
                existing.setRoleLocked(true);
                changed = true;
            }

            if (changed) {
                userRepository.save(existing);
            }
            return;
        }

        User user = new User();
        user.setUsername(StringUtils.hasText(username) ? username : defaultUsername);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setRoleLocked(true);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void ensureRolesExist() {
        for (Role role : Role.values()) {
            jdbcTemplate.update(
                    "INSERT INTO role (role_id, role_name) VALUES (?, ?) ON CONFLICT (role_id) DO NOTHING",
                    role.getDbId(),
                    role.name()
            );
        }
    }
}
