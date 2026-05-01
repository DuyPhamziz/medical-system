package com.healthcare.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDashboardDTO {
    private PatientResponse patientInfo;
    private List<VisitResponse> recentVisits;
    private List<VitalSignsResponse> vitalSignsHistory;
    private List<PatientFormResponse> recentForms;
}
