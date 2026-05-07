package com.healthcare.service;

import com.healthcare.dto.ServiceResponse;
import com.healthcare.repository.ServiceRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(ServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> searchServices(String query) {
        return serviceRepository.findByNameContainingIgnoreCase(query).stream()
                .map(ServiceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ServiceResponse getService(UUID serviceId) {
        return serviceRepository.findById(serviceId)
                .map(ServiceResponse::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
    }

    @Transactional
    public ServiceResponse createService(ServiceResponse request) {
        com.healthcare.entity.Service service = com.healthcare.entity.Service.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .type(request.getType())
                .build();
        return ServiceResponse.fromEntity(serviceRepository.save(service));
    }
}
