package com.healthcare.dto;

import com.healthcare.entity.Clinic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClinicResponse {
    private UUID clinicId;
    private String name;
    private String address;
    private String phone;
    private UUID orgId;

    public static ClinicResponse fromEntity(Clinic clinic) {
        return ClinicResponse.builder()
                .clinicId(clinic.getClinicId())
                .name(clinic.getName())
                .address(clinic.getAddress())
                .phone(clinic.getPhone())
                .orgId(clinic.getOrgId())
                .build();
    }
}
