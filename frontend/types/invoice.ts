export interface ServiceItem {
  serviceId: string;
  name: string;
  description: string | null;
  price: number;
  type: string | null;
}

export interface InvoiceDetail {
  detailId: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  invoiceId: string;
  visitId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  details: InvoiceDetail[];
}

export interface CreateInvoiceItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceRequest {
  visitId: string;
  items: CreateInvoiceItem[];
}

export interface PaymentMethod {
  methodId: string;
  name: string;
}

export interface Payment {
  paymentId: string;
  amount: number;
  description: string | null;
  methodId: string;
  methodName: string | null;
  status: string;
  createdAt: string;
}
