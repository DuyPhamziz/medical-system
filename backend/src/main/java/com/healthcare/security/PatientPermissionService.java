package com.healthcare.security;

import com.healthcare.entity.Patient;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.PatientRepository;
import com.healthcare.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PatientPermissionService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public PatientPermissionService(UserRepository userRepository, PatientRepository patientRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) return null;
        
        if (auth.getPrincipal() instanceof User) return (User) auth.getPrincipal();
        
        String username = auth.getName();
        return userRepository.findByEmail(username).orElse(null);
    }

    public Role getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.startsWith("ROLE_")) {
                try {
                    return Role.valueOf(role.substring(5));
                } catch (IllegalArgumentException e) {}
            }
        }
        return null;
    }

    /**
     * Check if user can view a specific patient record
     */
    public boolean canViewPatient(UUID patientId) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        if (role == null || user == null) return false;

        // Admin, Doctor, and Staff can view patient records
        if (role == Role.ADMIN || role == Role.DOCTOR || role == Role.STAFF) {
            return true;
        }

        // Patients can only view their own record
        if (role == Role.PATIENT) {
            return patientRepository.findById(patientId)
                    .map(p -> p.getUser() != null && p.getUser().getUserId().equals(user.getUserId()))
                    .orElse(false);
        }

        return false;
    }

    /**
     * Check if user can list patients
     * Only Admin, Doctor, and Staff can list all patients
     */
    public boolean canListPatients() {
        Role role = getCurrentRole();
        return role == Role.ADMIN || role == Role.DOCTOR || role == Role.STAFF;
    }

    /**
     * Check if user can update a patient record
     */
    public boolean canUpdatePatient(UUID patientId) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        if (role == null || user == null) return false;

        // Admin and Staff can update any record
        if (role == Role.ADMIN || role == Role.STAFF) {
            return true;
        }

        // Patients can update their own record
        if (role == Role.PATIENT) {
            return patientRepository.findById(patientId)
                    .map(p -> p.getUser() != null && p.getUser().getUserId().equals(user.getUserId()))
                    .orElse(false);
        }

        return false;
    }
}
