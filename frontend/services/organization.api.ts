import apiClient from "@/lib/axios";
import { CreateOrgRequest, FeatureFlag, OrgDetail, Organization, OrgSubscription, UpgradeSubscriptionRequest } from "@/types/organization";

const ORG_API = "/admin/orgs";

export const organizationApi = {
  list: async (): Promise<Organization[]> => {
    const { data } = await apiClient.get(ORG_API);
    return data;
  },

  getDetail: async (orgId: string): Promise<OrgDetail> => {
    const { data } = await apiClient.get(`${ORG_API}/${orgId}`);
    return data;
  },

  create: async (request: CreateOrgRequest): Promise<Organization> => {
    const { data } = await apiClient.post(ORG_API, request);
    return data;
  },

  update: async (orgId: string, request: CreateOrgRequest): Promise<Organization> => {
    const { data } = await apiClient.put(`${ORG_API}/${orgId}`, request);
    return data;
  },

  deactivate: async (orgId: string): Promise<void> => {
    await apiClient.post(`${ORG_API}/${orgId}/deactivate`);
  },

  activate: async (orgId: string): Promise<void> => {
    await apiClient.post(`${ORG_API}/${orgId}/activate`);
  },

  getSubscriptionHistory: async (orgId: string): Promise<OrgSubscription[]> => {
    const { data } = await apiClient.get(`${ORG_API}/${orgId}/subscriptions`);
    return data;
  },

  upgradeSubscription: async (orgId: string, request: UpgradeSubscriptionRequest): Promise<OrgSubscription> => {
    const { data } = await apiClient.post(`${ORG_API}/${orgId}/subscriptions/upgrade`, request);
    return data;
  },

  getFeatureFlags: async (orgId: string): Promise<FeatureFlag[]> => {
    const { data } = await apiClient.get(`${ORG_API}/${orgId}/features`);
    return data;
  },

  setFeatureFlag: async (orgId: string, featureKey: string, enabled: boolean, config?: string): Promise<void> => {
    await apiClient.put(`${ORG_API}/${orgId}/features/${featureKey}`, { enabled, config });
  },
};
