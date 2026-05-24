CREATE TABLE patient_profile (
    ma_benh_nhan uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ho_ten varchar(255) NOT NULL,
    ngay_sinh date NOT NULL,
    gioi_tinh varchar(10),
    dan_toc varchar(100),
    quoc_tich varchar(100),
    so_dien_thoai_ca_nhan varchar(20) NOT NULL,
    email varchar(160),
    dia_chi_hien_tai varchar(500),
    ho_ten_nguoi_lien_he varchar(255),
    moi_quan_he varchar(100),
    so_dien_thoai_nguoi_lien_he varchar(20) NOT NULL,
    nghe_nghiep varchar(255),
    noi_lam_viec varchar(255),
    CONSTRAINT patient_profile_gioi_tinh_check CHECK (gioi_tinh IN ('Nam', 'Nu', 'Khac'))
);

CREATE UNIQUE INDEX ux_patient_profile_email ON patient_profile (email) WHERE email IS NOT NULL;