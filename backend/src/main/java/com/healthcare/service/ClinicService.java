package com.healthcare.service;

import com.healthcare.entity.Clinic;
import com.healthcare.entity.Room;
import com.healthcare.repository.ClinicRepository;
import com.healthcare.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicService {

    private final ClinicRepository clinicRepository;
    private final RoomRepository roomRepository;

    // ============================================================
    // Clinic CRUD
    // ============================================================

    @Transactional(readOnly = true)
    public List<Clinic> getAllClinics() {
        return clinicRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Clinic> getClinicsByOrgId(UUID orgId) {
        return clinicRepository.findAllByOrgId(orgId);
    }

    @Transactional(readOnly = true)
    public Clinic getClinic(UUID clinicId) {
        return clinicRepository.findById(clinicId)
                .orElseThrow(() -> new IllegalArgumentException("Clinic not found: " + clinicId));
    }

    @Transactional
    public Clinic createClinic(String name, String address, String phone, UUID orgId) {
        Clinic clinic = Clinic.builder()
                .name(name)
                .address(address)
                .phone(phone)
                .orgId(orgId)
                .build();
        var saved = clinicRepository.save(clinic);
        log.info("Created clinic: {} (ID: {})", name, saved.getClinicId());
        return saved;
    }

    @Transactional
    public Clinic updateClinic(UUID clinicId, String name, String address, String phone) {
        Clinic clinic = getClinic(clinicId);
        if (name != null) clinic.setName(name);
        if (address != null) clinic.setAddress(address);
        if (phone != null) clinic.setPhone(phone);
        return clinicRepository.save(clinic);
    }

    @Transactional
    public void deleteClinic(UUID clinicId) {
        Clinic clinic = getClinic(clinicId);
        clinicRepository.delete(clinic);
        log.info("Deleted clinic: {} (ID: {})", clinic.getName(), clinicId);
    }

    // ============================================================
    // Room CRUD
    // ============================================================

    @Transactional(readOnly = true)
    public List<Room> getRoomsByClinicId(UUID clinicId) {
        // Verify clinic exists
        getClinic(clinicId);
        return roomRepository.findByClinic_ClinicId(clinicId);
    }

    @Transactional
    public Room createRoom(UUID clinicId, String name, String type) {
        Clinic clinic = getClinic(clinicId);
        Room room = Room.builder()
                .name(name)
                .type(type)
                .clinic(clinic)
                .build();
        var saved = roomRepository.save(room);
        log.info("Created room: {} (ID: {}) for clinic: {}", name, saved.getRoomId(), clinicId);
        return saved;
    }

    @Transactional
    public Room updateRoom(UUID roomId, String name, String type) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));
        if (name != null) room.setName(name);
        if (type != null) room.setType(type);
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));
        roomRepository.delete(room);
        log.info("Deleted room: {} (ID: {})", room.getName(), roomId);
    }
}
