import apiClient from "@/lib/axios";
import { Invoice, ServiceItem, CreateInvoiceRequest, Payment, PaymentMethod } from "@/types/invoice";

const API = "";

export const invoiceApi = {
  getByVisit: async (visitId: string): Promise<Invoice[]> => {
    const { data } = await apiClient.get(`${API}/invoices/visit/${visitId}`);
    return data;
  },

  getInvoice: async (invoiceId: string): Promise<Invoice> => {
    const { data } = await apiClient.get(`${API}/invoices/${invoiceId}`);
    return data;
  },

  createInvoice: async (request: CreateInvoiceRequest): Promise<Invoice> => {
    const { data } = await apiClient.post(`${API}/invoices`, request);
    return data;
  },

  getServices: async (): Promise<ServiceItem[]> => {
    const { data } = await apiClient.get(`${API}/services`);
    return data;
  },

  searchServices: async (q: string): Promise<ServiceItem[]> => {
    const { data } = await apiClient.get(`${API}/services/search`, { params: { q } });
    return data;
  },

  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const { data } = await apiClient.get(`${API}/payments/methods`);
    return data;
  },
};
