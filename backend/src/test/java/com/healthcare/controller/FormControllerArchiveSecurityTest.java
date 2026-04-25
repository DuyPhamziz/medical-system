package com.healthcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.dto.FormResponse;
import com.healthcare.entity.FormStatus;
import com.healthcare.security.CustomUserDetailsService;
import com.healthcare.security.JwtService;
import com.healthcare.service.FormService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FormController.class)
@Import(TestMethodSecurityConfig.class)
class FormControllerArchiveSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FormService formService;

        @MockBean
        private JwtService jwtService;

        @MockBean
        private CustomUserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void archive_allowsAdmin() throws Exception {
        UUID formId = UUID.randomUUID();
        when(formService.archive(any(UUID.class))).thenReturn(
                FormResponse.builder().formId(formId).status(FormStatus.ARCHIVED).build()
        );

        mockMvc.perform(post("/api/forms/{formId}/archive", formId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(formService).archive(formId);
    }

    @Test
    @WithMockUser(roles = {"DOCTOR"})
    void archive_allowsDoctor() throws Exception {
        UUID formId = UUID.randomUUID();
        when(formService.archive(any(UUID.class))).thenReturn(
                FormResponse.builder().formId(formId).status(FormStatus.ARCHIVED).build()
        );

        mockMvc.perform(post("/api/forms/{formId}/archive", formId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(formService).archive(formId);
    }

    @Test
    @WithMockUser(roles = {"STAFF"})
    void archive_forbiddenForStaff() throws Exception {
        UUID formId = UUID.randomUUID();

        mockMvc.perform(post("/api/forms/{formId}/archive", formId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void unarchive_allowsAdmin() throws Exception {
        UUID formId = UUID.randomUUID();
        when(formService.unarchive(any(UUID.class))).thenReturn(
                FormResponse.builder().formId(formId).status(FormStatus.DRAFT).build()
        );

        mockMvc.perform(post("/api/forms/{formId}/unarchive", formId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(formService).unarchive(formId);
    }

    @Test
    @WithMockUser(roles = {"PATIENT"})
    void unarchive_forbiddenForPatient() throws Exception {
        UUID formId = UUID.randomUUID();

        mockMvc.perform(post("/api/forms/{formId}/unarchive", formId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
