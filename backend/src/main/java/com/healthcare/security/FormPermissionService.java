package com.healthcare.security;

import com.healthcare.entity.Form;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Form-level permission and access control service.
 * Enforces DOCTOR ownership, ADMIN oversight, STAFF read-only, PATIENT self-only.
 */
@Service
public class FormPermissionService {

    private final UserRepository userRepository;

    public FormPermissionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get current authenticated user from security context
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        // If principal is already entity, use it directly.
        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        // For JWT/UserDetails flows, auth name is usually email.
        String username = auth.getName();
        if (username == null || username.isBlank()) {
            return null;
        }

        return userRepository.findByEmail(username).orElse(null);
    }

    private boolean isOwner(Form form, User user) {
        return form != null
                && user != null
                && form.getCreatedBy() != null
                && form.getCreatedBy().getUserId() != null
                && form.getCreatedBy().getUserId().equals(user.getUserId());
    }

    /**
     * Get current user's role
     */
    public Role getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        
        for (GrantedAuthority authority : auth.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.startsWith("ROLE_")) {
                try {
                    return Role.valueOf(role.substring(5));
                } catch (IllegalArgumentException e) {
                    // Continue to next authority
                }
            }
        }
        return null;
    }

    // ============ FORM ACCESS CONTROL ============

    /**
     * Check if current user can VIEW form
     * Rules:
     * - DOCTOR: own forms + public forms
     * - ADMIN: all forms
    * - STAFF: all published forms (read-only)
     * - PATIENT: public forms only
     */
    public boolean canView(Form form) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        
        if (role == null || user == null) {
            return false;
        }

        return switch (role) {
            case ADMIN -> true;  // ADMIN can view all
            case DOCTOR -> isOwner(form, user) || form.isPublicForm();  // Own forms + public
            case STAFF -> form.isPublicForm() && form.getStatus() == FormStatus.PUBLISHED;
            case PATIENT -> form.isPublicForm();  // Only published ones
            default -> false;
        };
    }

    /**
     * Check if current user can CREATE forms
     * Rules:
     * - DOCTOR: yes
     * - ADMIN: NO (oversight only, create via doctor)
    * - STAFF: NO
     * - PATIENT: NO
     */
    public boolean canCreate() {
        Role role = getCurrentRole();
        return role == Role.DOCTOR;
    }

    /**
     * Check if current user can EDIT/UPDATE form
     * Rules:
     * - DOCTOR: only own forms in DRAFT status
     * - ADMIN: cannot edit (no business logic changes)
    * - STAFF: cannot edit
     * - PATIENT: cannot edit
     */
    public boolean canEdit(Form form) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        
        if (role == null || user == null) {
            return false;
        }

        if (role != Role.DOCTOR) {
            return false;  // Only DOCTOR can edit
        }

        // DOCTOR can only edit own DRAFT forms
        boolean isOwner = isOwner(form, user);
        boolean isDraft = form.getStatus() == FormStatus.DRAFT;
        
        return isOwner && isDraft;
    }

    /**
     * Check if current user can DELETE form
     * Rules:
     * - DOCTOR: only own DRAFT forms
     * - ADMIN: NO (no destructive ops)
    * - STAFF: NO
     * - PATIENT: NO
     */
    public boolean canDelete(Form form) {
        return canEdit(form);  // Same rules as edit
    }

    /**
     * Check if current user can PUBLISH form
     * Rules:
     * - DOCTOR: own forms in DRAFT status
     * - ADMIN: N/A
     * - Others: NO
     */
    public boolean canPublish(Form form) {
        return canEdit(form);  // Same rules: own DRAFT forms
    }

    /**
     * Check if current user can FILL form as patient
     * Rules:
     * - DOCTOR: can fill for any patient (on behalf)
     * - PATIENT: only published forms (self-service)
     * - ADMIN: cannot fill
    * - STAFF: can fill for patients
     */
    public boolean canFillForm(Form form) {
        Role role = getCurrentRole();
        
        if (role == null) {
            return false;
        }

        if (role == Role.DOCTOR || role == Role.STAFF) {
            return true;  // Can fill any form for patient
        }

        if (role == Role.PATIENT) {
            return form.isPublicForm();  // Can only fill published forms
        }

        return false;
    }

    /**
     * Check if current user can VIEW form submissions/answers
     * Rules:
     * - DOCTOR: own forms' answers + can view patient records
     * - ADMIN: all answers
    * - STAFF: answers for patients they manage
     * - PATIENT: only own answers
     */
    public boolean canViewAnswers(Form form, UUID submittedBy) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        
        if (role == null || user == null) {
            return false;
        }

        return switch (role) {
            case ADMIN -> true;  // ADMIN can view all
            case DOCTOR -> isOwner(form, user);  // Own forms
            case STAFF -> true;  // Can view for their patients
            case PATIENT -> submittedBy != null && submittedBy.equals(user.getUserId());  // Only own answers
            default -> false;
        };
    }

    /**
     * Check if current user can ARCHIVE form
     * Rules:
     * - DOCTOR: own forms
     * - ADMIN: any form (oversight action)
     * - Others: NO
     */
    public boolean canArchive(Form form) {
        Role role = getCurrentRole();
        User user = getCurrentUser();
        
        if (role == null || user == null) {
            return false;
        }

        if (role == Role.ADMIN) {
            return true;
        }

        if (role == Role.DOCTOR) {
            return isOwner(form, user);
        }

        return false;
    }

    // ============ HELPER METHODS ============

    /**
     * Assert current user can perform action, throw exception if not
     */
    public void assertCanView(Form form) {
        if (!canView(form)) {
            throwAccessDenied("view form", form.getFormId().toString());
        }
    }

    public void assertCanEdit(Form form) {
        if (!canEdit(form)) {
            throwAccessDenied("edit form", form.getFormId().toString());
        }
    }

    public void assertCanDelete(Form form) {
        if (!canDelete(form)) {
            throwAccessDenied("delete form", form.getFormId().toString());
        }
    }

    public void assertCanPublish(Form form) {
        if (!canPublish(form)) {
            throwAccessDenied("publish form", form.getFormId().toString());
        }
    }

    public void assertCanCreate() {
        if (!canCreate()) {
            throwAccessDenied("create form", "");
        }
    }

    private void throwAccessDenied(String action, String resourceId) {
        throw new org.springframework.security.access.AccessDeniedException(
            String.format("User does not have permission to %s (resource: %s)", action, resourceId)
        );
    }
}
