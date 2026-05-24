package com.healthcare.service;

import com.healthcare.dto.AdminCreateUserRequest;
import com.healthcare.dto.AssignRoleRequest;
import com.healthcare.dto.AuthRequest;
import com.healthcare.dto.AuthResponse;
import com.healthcare.dto.RefreshTokenRequest;
import com.healthcare.dto.RegisterRequest;
import com.healthcare.dto.UserResponse;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import com.healthcare.security.JwtService;
import com.healthcare.security.RolePermissionMatrix;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final com.healthcare.repository.PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            com.healthcare.repository.PatientRepository patientRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Role role = request.getRole() == null ? Role.PATIENT : request.getRole();
        if (role != Role.PATIENT) {
            throw new IllegalArgumentException("Self-register only supports PATIENT role");
        }

        User user = createUser(request.getUsername(), request.getEmail(), request.getPassword(), role);
        return buildAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        if (!jwtService.isRefreshToken(request.getRefreshToken()) || !jwtService.isTokenValid(request.getRefreshToken())) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        UUID userId = jwtService.extractUserId(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return buildAuthResponse(user);
    }

    public UserResponse getCurrentUser() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return toUserResponse(user);
    }

    @Transactional
    public UserResponse createUserByAdmin(AdminCreateUserRequest request) {
        User user = createUser(request.getUsername(), request.getEmail(), request.getPassword(), request.getRole());
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse assignRole(AssignRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isRoleLocked()) {
            throw new IllegalArgumentException("This account is protected and its role cannot be changed");
        }

        user.setRole(request.getRole());
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    private User createUser(String username, String email, String password, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(role);
        newUser.setRoleLocked(false);
        newUser.setCreatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(newUser);

        // If it's a patient, create a patient profile
        if (role == Role.PATIENT) {
            com.healthcare.entity.Patient patient = new com.healthcare.entity.Patient();
            patient.setFullName(username);
            patient.setUser(savedUser);
            patient.setCreatedAt(LocalDateTime.now());
            patientRepository.save(patient);
        }

        return savedUser;
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs())
                .user(toUserResponse(user))
                .build();
    }

    private UserResponse toUserResponse(User user) {
        UserResponse response = UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .permissions(RolePermissionMatrix.permissionsOf(user.getRole()).stream().map(Enum::name).toList())
                .roleLocked(user.isRoleLocked())
                .createdAt(user.getCreatedAt())
                .build();

        // Populate profile info if available
        if (user.getRole() == Role.PATIENT) {
            patientRepository.findByUser(user).ifPresent(patient -> {
                response.setFullName(patient.getFullName());
                response.setPhoneNumber(patient.getPhoneNumber());
                response.setAddress(patient.getAddress());
                response.setDateOfBirth(patient.getDateOfBirth());
                response.setGender(patient.getGender());
            });
        }

        return response;
    }
}
