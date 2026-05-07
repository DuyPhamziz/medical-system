package com.healthcare.service;

import com.healthcare.dto.PedigreeAnswerDTO;
import com.healthcare.entity.*;
import com.healthcare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedigreeSyncService {

    private final FamilyMemberRepository familyMemberRepository;
    private final FamilyRelationshipRepository familyRelationshipRepository;
    private final FamilyMemberDiseaseRepository familyMemberDiseaseRepository;
    private final PatientRepository patientRepository;

    @Transactional
    public void syncPedigree(AnswerSession session, PedigreeAnswerDTO pedigreeData) {
        if (pedigreeData == null || pedigreeData.getNodes() == null) {
            return;
        }

        log.info("Syncing pedigree data for session: {}", session.getSessionId());

        Map<String, FamilyMember> nodeIdToMemberMap = new HashMap<>();

        // 1. Sync Nodes (FamilyMembers and Diseases)
        for (PedigreeAnswerDTO.PedigreeNodeDTO nodeDto : pedigreeData.getNodes()) {
            FamilyMember member = syncFamilyMember(nodeDto);
            syncDiseases(member, nodeDto);
            nodeIdToMemberMap.put(nodeDto.getNodeId(), member);
        }

        // 2. Sync Edges (Relationships)
        if (pedigreeData.getEdges() != null) {
            for (PedigreeAnswerDTO.PedigreeEdgeDTO edgeDto : pedigreeData.getEdges()) {
                syncRelationship(edgeDto, nodeIdToMemberMap);
            }
        }
    }

    private FamilyMember syncFamilyMember(PedigreeAnswerDTO.PedigreeNodeDTO dto) {
        FamilyMember member = null;

        if (dto.getLinkedPatientId() != null) {
            member = familyMemberRepository.findByPatient_PatientId(dto.getLinkedPatientId()).orElse(null);
        }

        if (member == null) {
            member = new FamilyMember();
        }

        member.setFullName(dto.getFullName());
        member.setGender(dto.getGender());
        member.setYearOfBirth(dto.getYearOfBirth());
        member.setIsPatient(dto.getIsProband() != null && dto.getIsProband());

        if (dto.getLinkedPatientId() != null && member.getPatient() == null) {
            patientRepository.findById(dto.getLinkedPatientId()).ifPresent(member::setPatient);
        }

        return familyMemberRepository.save(member);
    }

    private void syncDiseases(FamilyMember member, PedigreeAnswerDTO.PedigreeNodeDTO dto) {
        if (dto.getDiseases() == null) return;

        // Remove existing diseases and re-add to prevent unbounded growth
        // on repeated pedigree edits
        familyMemberDiseaseRepository.findByFamilyMember(member).ifPresent(existing -> {
            familyMemberDiseaseRepository.deleteAll(existing);
            familyMemberDiseaseRepository.flush();
        });

        for (String diseaseName : dto.getDiseases()) {
            FamilyMemberDisease disease = FamilyMemberDisease.builder()
                    .familyMember(member)
                    .diseaseName(diseaseName)
                    .build();
            familyMemberDiseaseRepository.save(disease);
        }
    }

    private void syncRelationship(PedigreeAnswerDTO.PedigreeEdgeDTO dto, Map<String, FamilyMember> map) {
        FamilyMember from = map.get(dto.getFromNodeId());
        FamilyMember to = map.get(dto.getToNodeId());

        if (from != null && to != null) {
            // Relationships are harder to "update" without unique IDs.
            // For now, we just create.
            FamilyRelationship relationship = FamilyRelationship.builder()
                    .person(from)
                    .relatedPerson(to)
                    .relationshipType(dto.getRelationType())
                    .build();
            familyRelationshipRepository.save(relationship);
        }
    }
}
