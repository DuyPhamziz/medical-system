package com.healthcare.security;

import com.healthcare.entity.*;
import com.healthcare.repository.FormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FormPermissionService {
    private final FormRepository formRepository;
    private final SecurityUtils securityUtils;

    public User getCurrentUser() { return securityUtils.getCurrentUser(); }
    public Role getCurrentRole() { return securityUtils.getCurrentRole(); }

    public boolean canView(UUID id) { return formRepository.findById(id).map(this::canView).orElse(false); }

    public boolean canView(Form form) {
        if (form == null) return false;
        Role role = getCurrentRole();
        User user = getCurrentUser();
        if (role == null || user == null) return false;
        return switch (role) {
            case ADMIN -> true;
            case DOCTOR -> isOwner(form, user) || form.isTemplate() || (form.isPublicForm() && form.getStatus() == FormStatus.PUBLISHED);
            case STAFF -> form.isPublicForm() && form.getStatus() == FormStatus.PUBLISHED;
            case PATIENT -> form.isPublicForm();
            default -> false;
        };
    }

    public boolean canEdit(UUID id) { return formRepository.findById(id).map(this::canEdit).orElse(false); }

    public boolean canEdit(Form form) {
        if (form == null) return false;
        Role role = getCurrentRole();
        User user = getCurrentUser();
        if (user == null || role == null) return false;

        if (role == Role.ADMIN) return true;
        if (role == Role.DOCTOR) {
            // Allow doctor to edit if they are the owner, regardless of status or template flag
            return isOwner(form, user);
        }
        return false;
    }

    private boolean isOwner(Form form, User user) {
        if (form == null || user == null) return false;
        try {
            // Access ID directly from proxy if possible, but getCurrentUser() returns a managed entity or detached one
            // Comparison by ID is safest
            User owner = form.getCreatedBy();
            return owner != null && owner.getUserId().equals(user.getUserId());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean canCreate() { return getCurrentRole() == Role.DOCTOR; }
    public boolean canPublish(UUID id) { return canEdit(id); }
    public boolean canDelete(UUID id) { return canEdit(id); }
    public boolean canArchive(UUID id) { return canArchive(formRepository.findById(id).orElse(null)); }

    public boolean canArchive(Form form) {
        Role role = getCurrentRole();
        if (role == Role.ADMIN) return true;
        return role == Role.DOCTOR && isOwner(form, getCurrentUser());
    }

    public boolean canClone(UUID id) {
        return formRepository.findById(id).map(f -> (getCurrentRole() == Role.ADMIN || getCurrentRole() == Role.DOCTOR) && f.isTemplate()).orElse(false);
    }

    public boolean canFillForm(UUID id) {
        return formRepository.findById(id).map(f -> {
            Role r = getCurrentRole();
            if (r == Role.DOCTOR || r == Role.STAFF) return true;
            return r == Role.PATIENT && f.isPublicForm();
        }).orElse(false);
    }

    public boolean canFillForm(Form form) {
        if (form == null) return false;
        Role r = getCurrentRole();
        if (r == Role.DOCTOR || r == Role.STAFF) return true;
        return r == Role.PATIENT && form.isPublicForm();
    }

    public void assertCanCreate() { if (!canCreate()) throwDenied("create", "form"); }
    public void assertCanView(Form f) { if (!canView(f)) throwDenied("view", f.getFormId().toString()); }
    public void assertCanEdit(Form f) { if (!canEdit(f)) throwDenied("edit", f.getFormId().toString()); }
    public void assertCanPublish(Form f) { if (!canEdit(f)) throwDenied("publish", f.getFormId().toString()); }
    public void assertCanDelete(Form f) { if (!canEdit(f)) throwDenied("delete", f.getFormId().toString()); }
    public void assertCanArchive(Form f) { if (!canArchive(f)) throwDenied("archive", f.getFormId().toString()); }

    private void throwDenied(String action, String resId) {
        throw new AccessDeniedException("No permission to " + action + " resource: " + resId);
    }
}
