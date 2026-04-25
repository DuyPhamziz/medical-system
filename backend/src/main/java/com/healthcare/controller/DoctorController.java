package com.healthcare.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR','STAFF')")
    public String profile() {
        return "Doctor/Staff protected resource";
    }

    @GetMapping("/diagnosis")
    @PreAuthorize("hasAuthority('DIAGNOSIS_WRITE')")
    public String diagnosis() {
        return "Diagnosis write protected resource";
    }
}
