package com.healthcare.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "patient_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ma_benh_nhan", nullable = false)
    private UUID MaBenhNhan;

    @Column(name = "ho_ten", nullable = false, length = 255)
    private String HoTen;

    @Column(name = "ngay_sinh", nullable = false)
    private LocalDate NgaySinh;

    @Column(name = "gioi_tinh", length = 10)
    private String GioiTinh;

    @Column(name = "dan_toc", length = 100)
    private String DanToc;

    @Column(name = "quoc_tich", length = 100)
    private String QuocTich;

    @Column(name = "so_dien_thoai_ca_nhan", nullable = false, length = 20)
    private String SoDienThoaiCaNhan;

    @Column(name = "email", length = 160)
    private String email;

    @Column(name = "dia_chi_hien_tai", length = 500)
    private String DiaChiHienTai;

    @Column(name = "ho_ten_nguoi_lien_he", length = 255)
    private String HoTenNguoiLienHe;

    @Column(name = "moi_quan_he", length = 100)
    private String MoiQuanHe;

    @Column(name = "so_dien_thoai_nguoi_lien_he", nullable = false, length = 20)
    private String SoDienThoaiNguoiLienHe;

    @Column(name = "nghe_nghiep", length = 255)
    private String NgheNghiep;

    @Column(name = "noi_lam_viec", length = 255)
    private String NoiLamViec;
}