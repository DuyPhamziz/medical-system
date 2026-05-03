export const siteConfig = {
  name: "Y Học Gia Đình",
  description: "Nền tảng quản lý y tế thông minh, kết nối bác sĩ và bệnh nhân hiệu quả.",
  contact: {
    phone: "0123.456.789",
    email: "contact@yhocgiadinh.com",
    address: "123 Đường Y Học, Quận Trung Tâm, TP. Hồ Chí Minh",
    workingHours: "Thứ 2 - Thứ 7: 8:00 - 17:30",
  },
  links: {
    facebook: "https://facebook.com/yhocgiadinh",
    zalo: "https://zalo.me/yhocgiadinh",
    youtube: "https://youtube.com/yhocgiadinh",
  },
  footerSections: [
    {
      title: "Hệ thống",
      links: [
        { label: "Giới thiệu", href: "/about" },
        { label: "Bảng giá", href: "/pricing" },
        { label: "Công thức y khoa", href: "/formulas" },
        { label: "Khuyến nghị CDSS", href: "/recommendations" },
      ],
    },
    {
      title: "Hỗ trợ",
      links: [
        { label: "Trung tâm trợ giúp", href: "#" },
        { label: "Quy trình đăng ký", href: "#" },
        { label: "Chính sách bảo mật", href: "#" },
        { label: "Điều khoản sử dụng", href: "#" },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
