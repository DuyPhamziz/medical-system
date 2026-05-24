package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileResponse {
    @JsonProperty("maBenhNhan")
    private UUID MaBenhNhan;

    @JsonProperty("hoTen")
    private String HoTen;

    @JsonProperty("ngaySinh")
    private LocalDate NgaySinh;

    @JsonProperty("gioiTinh")
    private String GioiTinh;

    @JsonProperty("danToc")
    private String DanToc;

    @JsonProperty("quocTich")
    private String QuocTich;

    @JsonProperty("soDienThoaiCaNhan")
    private String SoDienThoaiCaNhan;

    @JsonProperty("email")
    private String Email;

    @JsonProperty("diaChiHienTai")
    private String DiaChiHienTai;

    @JsonProperty("hoTenNguoiLienHe")
    private String HoTenNguoiLienHe;

    @JsonProperty("moiQuanHe")
    private String MoiQuanHe;

    @JsonProperty("soDienThoaiNguoiLienHe")
    private String SoDienThoaiNguoiLienHe;

    @JsonProperty("ngheNghiep")
    private String NgheNghiep;

    @JsonProperty("noiLamViec")
    private String NoiLamViec;
}
