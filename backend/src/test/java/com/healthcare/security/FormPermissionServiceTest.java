package com.healthcare.security;

import com.healthcare.entity.Form;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.FormRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class FormPermissionServiceTest {

    private final FormRepository formRepository = Mockito.mock(FormRepository.class);
    private final SecurityUtils securityUtils = Mockito.mock(SecurityUtils.class);
    private final FormPermissionService service = new FormPermissionService(formRepository, securityUtils);

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityUtilsUser(User user) {
        Mockito.when(securityUtils.getCurrentUser()).thenReturn(user);
        Mockito.when(securityUtils.getCurrentUserId()).thenReturn(user.getUserId());
        Mockito.when(securityUtils.getCurrentRole()).thenReturn(user.getRole());
    }

    @Test
    void doctorCanCreateButAdminCannot() {
        User doctor = randomUser(Role.DOCTOR);
        mockSecurityUtilsUser(doctor);
        assertTrue(service.canCreate());

        User admin = randomUser(Role.ADMIN);
        mockSecurityUtilsUser(admin);
        assertFalse(service.canCreate());
    }

    @Test
    void doctorCanEditOnlyOwnDraftForm() {
        User owner = randomUser(Role.DOCTOR);
        User other = randomUser(Role.DOCTOR);

        Form ownDraft = form(owner, FormStatus.DRAFT, true);
        Form ownPublished = form(owner, FormStatus.PUBLISHED, true);
        Form othersDraft = form(other, FormStatus.DRAFT, true);

        mockSecurityUtilsUser(owner);

        assertTrue(service.canEdit(ownDraft));
        assertFalse(service.canEdit(ownPublished));
        assertFalse(service.canEdit(othersDraft));
    }

    @Test
    void adminCanViewAllForms() {
        User admin = randomUser(Role.ADMIN);
        mockSecurityUtilsUser(admin);
        assertTrue(service.canView(form(randomUser(Role.DOCTOR), FormStatus.DRAFT, false)));
        assertTrue(service.canView(form(randomUser(Role.DOCTOR), FormStatus.PUBLISHED, true)));
    }

    @Test
    void staffCanViewOnlyPublicPublished() {
        User staff = randomUser(Role.STAFF);
        mockSecurityUtilsUser(staff);
        assertTrue(service.canView(form(randomUser(Role.DOCTOR), FormStatus.PUBLISHED, true)));
        assertFalse(service.canView(form(randomUser(Role.DOCTOR), FormStatus.DRAFT, true)));
        assertFalse(service.canView(form(randomUser(Role.DOCTOR), FormStatus.PUBLISHED, false)));
    }

    @Test
    void patientCanViewOnlyPublicForms() {
        User patient = randomUser(Role.PATIENT);
        mockSecurityUtilsUser(patient);
        assertTrue(service.canView(form(randomUser(Role.DOCTOR), FormStatus.PUBLISHED, true)));
        assertFalse(service.canView(form(randomUser(Role.DOCTOR), FormStatus.PUBLISHED, false)));
    }

    @Test
    void archivePermissionAdminAnyDoctorOwnOnly() {
        User owner = randomUser(Role.DOCTOR);
        User other = randomUser(Role.DOCTOR);
        Form target = form(owner, FormStatus.PUBLISHED, true);

        User admin = randomUser(Role.ADMIN);
        mockSecurityUtilsUser(admin);
        assertTrue(service.canArchive(target));

        mockSecurityUtilsUser(owner);
        assertTrue(service.canArchive(target));

        mockSecurityUtilsUser(other);
        assertFalse(service.canArchive(target));
    }

    private static User randomUser(Role role) {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("user" + UUID.randomUUID() + "@test.local");
        user.setUsername("user");
        user.setPassword("x");
        user.setRole(role);
        return user;
    }

    private static Form form(User owner, FormStatus status, boolean isPublic) {
        Form form = new Form();
        form.setFormId(UUID.randomUUID());
        form.setCreatedBy(owner);
        form.setStatus(status);
        form.setPublicForm(isPublic);
        return form;
    }
}
