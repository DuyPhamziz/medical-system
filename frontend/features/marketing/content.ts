import { FormListItem } from "@/types/form";

export type RecommendationItem = {
  title: string;
  summary: string;
  tag: string;
};

export type FormulaItem = {
  name: string;
  formula: string;
  useCase: string;
  caution: string;
};

export const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/recommendations", label: "Khuyến cáo" },
  { href: "/formulas", label: "Công thức" },
  { href: "/forms/public", label: "Biểu mẫu" },
];

export const recommendationItems: RecommendationItem[] = [
  {
    title: "Tiêm chủng theo độ tuổi",
    summary: "Theo dõi lịch tiêm, nhắc lịch trước mỗi đợt và lưu lịch sử để đối soát với bác sĩ.",
    tag: "Dự phòng",
  },
  {
    title: "Tầm soát huyết áp định kỳ",
    summary: "Đo huyết áp tại nhà 2-3 lần/tuần theo khung giờ cố định để phát hiện sớm bất thường.",
    tag: "Tim mạch",
  },
  {
    title: "Quản lý đường huyết sau ăn",
    summary: "Người có nguy cơ đái tháo đường cần theo dõi đường huyết sau ăn và điều chỉnh bữa ăn.",
    tag: "Nội tiết",
  },
  {
    title: "Theo dõi cân nặng và BMI",
    summary: "Cập nhật cân nặng mỗi tuần, kết hợp vòng eo để đánh giá nguy cơ chuyển hóa.",
    tag: "Tổng quát",
  },
  {
    title: "Vệ sinh giấc ngủ",
    summary: "Ngủ 7-8h mỗi đêm, hạn chế cà phê sau 15h và không dùng màn hình trước khi ngủ.",
    tag: "Lối sống",
  },
  {
    title: "Vận động 150 phút/tuần",
    summary: "Kết hợp cardio và sức mạnh cơ bắp để giảm nguy cơ bệnh mạn tính.",
    tag: "Lối sống",
  },
];

export const formulaItems: FormulaItem[] = [
  {
    name: "Body Mass Index (BMI)",
    formula: "BMI = Cân nặng (kg) / (Chiều cao (m) x Chiều cao (m))",
    useCase: "Sàng lọc nhanh tình trạng suy dinh dưỡng, thừa cân, béo phì.",
    caution: "Không phân biệt khối mỡ và khối cơ; cần kết hợp vòng eo và lâm sàng.",
  },
  {
    name: "Mean Arterial Pressure (MAP)",
    formula: "MAP = (Huyết áp tâm thu + 2 x Huyết áp tâm trương) / 3",
    useCase: "Đánh giá áp lực tưới máu trung bình trong theo dõi huyết động.",
    caution: "Cần đo huyết áp đúng kỹ thuật, nhất là ở bệnh nhân có rối loạn nhịp.",
  },
  {
    name: "eGFR (Cockcroft-Gault, đơn giản)",
    formula: "CrCl ~ ((140 - tuổi) x cân nặng) / (72 x Creatinine); nữ x 0.85",
    useCase: "Ước tính chức năng thận để điều chỉnh liều thuốc.",
    caution: "Chỉ là công thức ước tính, cần đối chiếu xét nghiệm và hướng dẫn điều trị.",
  },
  {
    name: "QRS Risk Score (Nội bộ)",
    formula: "Tổng điểm = tổng score của các đáp án form",
    useCase: "Tiền đề cho module CDSS xếp hạng nguy cơ theo dữ liệu intake.",
    caution: "Cần xác thực threshold bằng dữ liệu bệnh viện trước khi dùng làm quyết định tự động.",
  },
];

export function buildFormShowcase(forms: FormListItem[]): FormListItem[] {
  return forms;
}
