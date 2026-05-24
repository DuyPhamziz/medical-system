export type GioiTinh = "Nam" | "Nu" | "Khac";

export type PatientProfile = {
  maBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh?: GioiTinh | null;
  danToc?: string | null;
  quocTich?: string | null;
  soDienThoaiCaNhan: string;
  email?: string | null;
  diaChiHienTai?: string | null;
  hoTenNguoiLienHe?: string | null;
  moiQuanHe?: string | null;
  soDienThoaiNguoiLienHe: string;
  ngheNghiep?: string | null;
  noiLamViec?: string | null;
};

export type PatientProfileRequest = {
  hoTen: string;
  ngaySinh: string;
  gioiTinh?: GioiTinh | "";
  danToc?: string;
  quocTich?: string;
  soDienThoaiCaNhan: string;
  email?: string;
  diaChiHienTai?: string;
  hoTenNguoiLienHe?: string;
  moiQuanHe?: string;
  soDienThoaiNguoiLienHe: string;
  ngheNghiep?: string;
  noiLamViec?: string;
};
