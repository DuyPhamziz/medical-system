package com.healthcare.security;

import com.healthcare.entity.Form;
import com.healthcare.entity.FormStatus;
import com.healthcare.entity.Role;
import com.healthcare.entity.User;
import com.healthcare.repository.UserRepository;
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

    private final FormPermissionService service = new FormPermissionService(Mockito.mock(UserRepository.class));

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doctorCanCreateButAdminCannot() {
        mockAuth(Role.DOCTOR, randomUser());
        assertTrue(service.canCreate());

        mockAuth(Role.ADMIN, randomUser());
        assertFalse(service.canCreate());
    }

    @Test
    void doctorCanEditOnlyOwnDraftForm() {
        User owner = randomUser();
        User other = randomUser();

        Form ownDraft = form(owner, FormStatus.DRAFT, true);
        Form ownPublished = form(owner, FormStatus.PUBLISHED, true);
        Form othersDraft = form(other, FormStatus.DRAFT, true);

        mockAuth(Role.DOCTOR, owner);

        assertTrue(service.canEdit(ownDraft));
        assertFalse(service.canEdit(ownPublished));
        assertFalse(service.canEdit(othersDraft));
    }

    @Test
    void adminCanViewAllForms() {
        mockAuth(Role.ADMIN, randomUser());
        assertTrue(service.canView(form(randomUser(), FormStatus.DRAFT, false)));
        assertTrue(service.canView(form(randomUser(), FormStatus.PUBLISHED, true)));
    }

    @Test
    void staffCanViewOnlyPublicPublished() {
        mockAuth(Role.STAFF, randomUser());
        assertTrue(service.canView(form(randomUser(), FormStatus.PUBLISHED, true)));
        assertFalse(service.canView(form(randomUser(), FormStatus.DRAFT, true)));
        assertFalse(service.canView(form(randomUser(), FormStatus.PUBLISHED, false)));
    }

    @Test
    void patientCanViewOnlyPublicForms() {
        mockAuth(Role.PATIENT, randomUser());
        assertTrue(service.canView(form(randomUser(), FormStatus.PUBLISHED, true)));
        assertFalse(service.canView(form(randomUser(), FormStatus.PUBLISHED, false)));
    }

    @Test
    void archivePermissionAdminAnyDoctorOwnOnly() {
        User owner = randomUser();
        User other = randomUser();
        Form target = form(owner, FormStatus.PUBLISHED, true);

        mockAuth(Role.ADMIN, randomUser());
        assertTrue(service.canArchive(target));

        mockAuth(Role.DOCTOR, owner);
        assertTrue(service.canArchive(target));

        mockAuth(Role.DOCTOR, other);
        assertFalse(service.canArchive(target));
    }

    @Test
    void patientCanViewOwnAnswersOnly() {
        User patient = randomUser();
        Form form = form(randomUser(), FormStatus.PUBLISHED, true);

        mockAuth(Role.PATIENT, patient);
        assertTrue(service.canViewAnswers(form, patient.getUserId()));
        assertFalse(service.canViewAnswers(form, UUID.randomUUID()));
        assertFalse(service.canViewAnswers(form, null));
    }

    private static User randomUser() {
        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setEmail("user" + UUID.randomUUID() + "@test.local");
        user.setUsername("user");
        user.setPassword("x");
        user.setRole(Role.DOCTOR);
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

    private static void mockAuth(Role role, User principalUser) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principalUser,
                "N/A",
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
