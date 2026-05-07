package com.healthcare.controller;

import com.healthcare.dto.ServiceResponse;
import com.healthcare.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ServiceResponse>> searchServices(@RequestParam String q) {
        return ResponseEntity.ok(serviceService.searchServices(q));
    }

    @GetMapping("/{serviceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ServiceResponse> getService(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(serviceService.getService(serviceId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceResponse> createService(@RequestBody ServiceResponse request) {
        return ResponseEntity.ok(serviceService.createService(request));
    }
}
