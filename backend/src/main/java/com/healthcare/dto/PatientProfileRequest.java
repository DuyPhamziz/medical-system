package com.healthcare.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileRequest {

    @JsonProperty("hoTen")
    @NotBlank
    private String HoTen;

    @JsonProperty("ngaySinh")
    @NotNull
    private LocalDate NgaySinh;

    @JsonProperty("gioiTinh")
    private String GioiTinh;

    @JsonProperty("danToc")
    private String DanToc;

    @JsonProperty("quocTich")
    private String QuocTich;

    @JsonProperty("soDienThoaiCaNhan")
    @NotBlank
    private String SoDienThoaiCaNhan;

    @JsonProperty("email")
    @Email
    private String Email;

    @JsonProperty("diaChiHienTai")
    private String DiaChiHienTai;

    @JsonProperty("hoTenNguoiLienHe")
    private String HoTenNguoiLienHe;

    @JsonProperty("moiQuanHe")
    private String MoiQuanHe;

    @JsonProperty("soDienThoaiNguoiLienHe")
    @NotBlank
    private String SoDienThoaiNguoiLienHe;

    @JsonProperty("ngheNghiep")
    private String NgheNghiep;

    @JsonProperty("noiLamViec")
    private String NoiLamViec;
}
