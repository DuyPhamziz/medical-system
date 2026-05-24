package com.healthcare.service;

import com.healthcare.dto.PatientProfileRequest;
import com.healthcare.dto.PatientProfileResponse;
import com.healthcare.entity.PatientProfile;
import com.healthcare.repository.PatientProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;

    public PatientProfileService(PatientProfileRepository patientProfileRepository) {
        this.patientProfileRepository = patientProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientProfileResponse> listAll() {
        return patientProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getById(UUID maBenhNhan) {
        PatientProfile entity = patientProfileRepository.findById(maBenhNhan)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ bệnh nhân"));
        return toResponse(entity);
    }

    @Transactional
    public PatientProfileResponse upsertByDoctor(UUID maBenhNhan, PatientProfileRequest request) {
        validateGender(request.getGioiTinh());

        PatientProfile entity = patientProfileRepository.findById(maBenhNhan)
                .orElseGet(() -> {
                    PatientProfile created = new PatientProfile();
                    created.setMaBenhNhan(maBenhNhan);
                    return created;
                });

        ensureEmailNotUsed(entity.getMaBenhNhan(), request.getEmail());
        applyRequest(entity, request);

        return toResponse(patientProfileRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile(String currentUserEmail) {
        PatientProfile entity = patientProfileRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("Bạn chưa có hồ sơ bệnh nhân"));
        return toResponse(entity);
    }

    @Transactional
    public PatientProfileResponse upsertMyProfile(String currentUserEmail, PatientProfileRequest request) {
        validateGender(request.getGioiTinh());

        PatientProfile entity = patientProfileRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseGet(PatientProfile::new);

        boolean isNewProfile = entity.getMaBenhNhan() == null;

        if (isNewProfile) {
            entity.setEmail(currentUserEmail);
            entity.setHoTen(request.getHoTen());
            entity.setNgaySinh(request.getNgaySinh());
        }

        entity.setEmail(currentUserEmail);
        entity.setGioiTinh(request.getGioiTinh());
        entity.setDanToc(request.getDanToc());
        entity.setQuocTich(request.getQuocTich());
        entity.setSoDienThoaiCaNhan(request.getSoDienThoaiCaNhan());
        entity.setDiaChiHienTai(request.getDiaChiHienTai());
        entity.setHoTenNguoiLienHe(request.getHoTenNguoiLienHe());
        entity.setMoiQuanHe(request.getMoiQuanHe());
        entity.setSoDienThoaiNguoiLienHe(request.getSoDienThoaiNguoiLienHe());
        entity.setNgheNghiep(request.getNgheNghiep());
        entity.setNoiLamViec(request.getNoiLamViec());

        return toResponse(patientProfileRepository.save(entity));
    }

    private void applyRequest(PatientProfile entity, PatientProfileRequest request) {
        entity.setHoTen(request.getHoTen());
        entity.setNgaySinh(request.getNgaySinh());
        entity.setGioiTinh(request.getGioiTinh());
        entity.setDanToc(request.getDanToc());
        entity.setQuocTich(request.getQuocTich());
        entity.setSoDienThoaiCaNhan(request.getSoDienThoaiCaNhan());
        entity.setEmail(request.getEmail());
        entity.setDiaChiHienTai(request.getDiaChiHienTai());
        entity.setHoTenNguoiLienHe(request.getHoTenNguoiLienHe());
        entity.setMoiQuanHe(request.getMoiQuanHe());
        entity.setSoDienThoaiNguoiLienHe(request.getSoDienThoaiNguoiLienHe());
        entity.setNgheNghiep(request.getNgheNghiep());
        entity.setNoiLamViec(request.getNoiLamViec());
    }

    private void validateGender(String gioiTinh) {
        if (gioiTinh == null || gioiTinh.isBlank()) {
            return;
        }

        List<String> values = List.of("Nam", "Nu", "Khac");
        if (!values.contains(gioiTinh)) {
            throw new IllegalArgumentException("Giới tính chỉ nhận: Nam, Nữ, Khác");
        }
    }

    private void ensureEmailNotUsed(UUID currentId, String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        patientProfileRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
                .filter(existing -> !existing.getMaBenhNhan().equals(currentId))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email đã được sử dụng cho hồ sơ khác");
                });
    }

    private PatientProfileResponse toResponse(PatientProfile entity) {
        return PatientProfileResponse.builder()
                .MaBenhNhan(entity.getMaBenhNhan())
                .HoTen(entity.getHoTen())
                .NgaySinh(entity.getNgaySinh())
                .GioiTinh(entity.getGioiTinh())
                .DanToc(entity.getDanToc())
                .QuocTich(entity.getQuocTich())
                .SoDienThoaiCaNhan(entity.getSoDienThoaiCaNhan())
                .Email(entity.getEmail())
                .DiaChiHienTai(entity.getDiaChiHienTai())
                .HoTenNguoiLienHe(entity.getHoTenNguoiLienHe())
                .MoiQuanHe(entity.getMoiQuanHe())
                .SoDienThoaiNguoiLienHe(entity.getSoDienThoaiNguoiLienHe())
                .NgheNghiep(entity.getNgheNghiep())
                .NoiLamViec(entity.getNoiLamViec())
                .build();
    }
}
