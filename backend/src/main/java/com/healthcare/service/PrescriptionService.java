package com.healthcare.service;

import com.healthcare.dto.CreatePrescriptionRequest;
import com.healthcare.dto.PrescriptionResponse;
import com.healthcare.entity.Medication;
import com.healthcare.entity.Prescription;
import com.healthcare.entity.PrescriptionDetail;
import com.healthcare.entity.Visit;
import com.healthcare.repository.MedicationRepository;
import com.healthcare.repository.PrescriptionDetailRepository;
import com.healthcare.repository.PrescriptionRepository;
import com.healthcare.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final MedicationRepository medicationRepository;
    private final VisitRepository visitRepository;

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescription(UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found: " + prescriptionId));
        return toResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByVisit(UUID visitId) {
        return prescriptionRepository.findByVisit_VisitId(visitId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PrescriptionResponse createPrescription(CreatePrescriptionRequest request) {
        Visit visit = visitRepository.findById(request.getVisitId())
                .orElseThrow(() -> new IllegalArgumentException("Visit not found: " + request.getVisitId()));

        Prescription prescription = Prescription.builder()
                .visit(visit)
                .note(request.getNote())
                .build();

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<PrescriptionDetail> details = new ArrayList<>();
        if (request.getItems() != null) {
            for (CreatePrescriptionRequest.PrescriptionItem item : request.getItems()) {
                Medication medication;
                if (item.getMedicationId() != null) {
                    medication = medicationRepository.findById(item.getMedicationId())
                            .orElseThrow(() -> new IllegalArgumentException("Medication not found: " + item.getMedicationId()));
                } else if (item.getMedicationName() != null && !item.getMedicationName().isBlank()) {
                    medication = Medication.builder()
                            .name(item.getMedicationName())
                            .build();
                    medication = medicationRepository.save(medication);
                } else {
                    throw new IllegalArgumentException("Either medicationId or medicationName must be provided");
                }

                PrescriptionDetail detail = PrescriptionDetail.builder()
                        .medication(medication)
                        .prescription(savedPrescription)
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .build();

                details.add(detail);
            }
            prescriptionDetailRepository.saveAll(details);
        }

        log.info("Created prescription: {} with {} items for visit {}",
                savedPrescription.getPrescriptionId(), details.size(), request.getVisitId());

        return toResponse(savedPrescription);
    }

    @Transactional
    public void deletePrescription(UUID prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Prescription not found: " + prescriptionId));
        prescriptionDetailRepository.deleteAll(prescription.getPrescriptionDetails());
        prescriptionRepository.delete(prescription);
        log.info("Deleted prescription: {}", prescriptionId);
    }

    private PrescriptionResponse toResponse(Prescription prescription) {
        List<PrescriptionResponse.PrescriptionItemResponse> items;
        if (prescription.getPrescriptionDetails() != null) {
            items = prescription.getPrescriptionDetails().stream()
                    .map(detail -> PrescriptionResponse.PrescriptionItemResponse.builder()
                            .medicationId(detail.getMedication().getMedicationId())
                            .medicationName(detail.getMedication().getName())
                            .unit(detail.getMedication().getUnit())
                            .dosage(detail.getDosage())
                            .frequency(detail.getFrequency())
                            .duration(detail.getDuration())
                            .build())
                    .collect(Collectors.toList());
        } else {
            items = Collections.emptyList();
        }

        return PrescriptionResponse.builder()
                .prescriptionId(prescription.getPrescriptionId())
                .visitId(prescription.getVisit().getVisitId())
                .createdAt(prescription.getCreatedAt())
                .note(prescription.getNote())
                .items(items)
                .build();
    }
}
