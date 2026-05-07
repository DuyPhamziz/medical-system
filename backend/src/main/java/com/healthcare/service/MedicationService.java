package com.healthcare.service;

import com.healthcare.dto.CreateMedicationRequest;
import com.healthcare.entity.Medication;
import com.healthcare.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;

    @Transactional(readOnly = true)
    public List<Medication> getAllMedications() {
        return medicationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Medication getMedication(UUID medicationId) {
        return medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found: " + medicationId));
    }

    @Transactional(readOnly = true)
    public List<Medication> searchMedications(String name) {
        return medicationRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Medication createMedication(CreateMedicationRequest request) {
        Medication medication = Medication.builder()
                .name(request.getName())
                .unit(request.getUnit())
                .build();

        Medication saved = medicationRepository.save(medication);
        log.info("Created medication: {} ({})", saved.getName(), saved.getMedicationId());
        return saved;
    }

    @Transactional
    public Medication updateMedication(UUID medicationId, CreateMedicationRequest request) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("Medication not found: " + medicationId));

        medication.setName(request.getName());
        medication.setUnit(request.getUnit());

        Medication saved = medicationRepository.save(medication);
        log.info("Updated medication: {} ({})", saved.getName(), saved.getMedicationId());
        return saved;
    }

    @Transactional
    public void deleteMedication(UUID medicationId) {
        if (!medicationRepository.existsById(medicationId)) {
            throw new IllegalArgumentException("Medication not found: " + medicationId);
        }
        medicationRepository.deleteById(medicationId);
        log.info("Deleted medication: {}", medicationId);
    }
}
