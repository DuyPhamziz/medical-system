export interface Organization {
  orgId: string;
  name: string;
  type: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  subscriptionPlan: string;
  subscriptionExpiry: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
}

export interface CreateOrgRequest {
  name: string;
  type?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface OrgSubscription {
  subscriptionId: string;
  orgId: string;
  planType: string;
  amount: number;
  startedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  paymentRef: string | null;
  notes: string | null;
}

export interface FeatureFlag {
  flagId: string;
  featureKey: string;
  isEnabled: boolean;
  configJson: string | null;
  updatedAt: string;
}

export interface OrgDetail {
  organization: Organization;
  activeSubscription: OrgSubscription | null;
  subscriptionHistory: OrgSubscription[];
  featureFlags: FeatureFlag[];
  doctorCount: number;
  patientCount: number;
}

export interface UpgradeSubscriptionRequest {
  planType: string;
  durationMonths: number;
}

export const SUBSCRIPTION_PLANS = [
  { value: "FREE", label: "Miễn phí", price: 0, features: ["1 bác sĩ", "50 bệnh nhân", "Biểu mẫu cơ bản"] },
  { value: "STARTER", label: "Khởi đầu", price: 299000, features: ["3 bác sĩ", "200 bệnh nhân", "Biểu mẫu nâng cao", "Đặt lịch hẹn"] },
  { value: "PROFESSIONAL", label: "Chuyên nghiệp", price: 799000, features: ["10 bác sĩ", "1000 bệnh nhân", "CDSS cơ bản", "API tích hợp", "Hỗ trợ ưu tiên"] },
  { value: "ENTERPRISE", label: "Doanh nghiệp", price: 0, features: ["Không giới hạn", "Tất cả tính năng", "AI Care Plan", "Tích hợp tùy chỉnh", "SLA 99.9%"] },
] as const;
