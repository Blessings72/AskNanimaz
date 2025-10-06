import { api } from './api';
import type { InvoiceResponse, InvoiceList, InvoiceSummary } from '../types';

export const invoicesApi = {
  // Get current user's invoices
  getMyInvoices: async (params?: {
    skip?: number;
    limit?: number;
    paid?: boolean;
  }): Promise<InvoiceList> => {
    const response = await api.get<InvoiceList>('/invoices/my-invoices', { params });
    return response.data;
  },

  // Get all invoices (for managers/admins)
  getAllInvoices: async (params?: {
    skip?: number;
    limit?: number;
    paid?: boolean;
    user_id?: number;
  }): Promise<InvoiceList> => {
    const response = await api.get<InvoiceList>('/invoices/all', { params });
    return response.data;
  },

  // Get invoice summary
  getInvoiceSummary: async (): Promise<InvoiceSummary> => {
    const response = await api.get<InvoiceSummary>('/invoices/summary');
    return response.data;
  },

  // Generate invoices for all verified readings
  generateAllInvoices: async (): Promise<InvoiceResponse[]> => {
    const response = await api.post<InvoiceResponse[]>('/invoices/generate-all');
    return response.data;
  },

  // Generate invoices for a specific user
  generateInvoicesForUser: async (userId: number): Promise<InvoiceResponse[]> => {
    const response = await api.post<InvoiceResponse[]>(`/invoices/generate-for-user/${userId}`);
    return response.data;
  },

  // Mark invoice as paid
  markInvoicePaid: async (invoiceId: number): Promise<InvoiceResponse> => {
    const response = await api.patch<InvoiceResponse>(`/invoices/${invoiceId}/pay`);
    return response.data;
  },

  // Get specific invoice
  getInvoice: async (invoiceId: number): Promise<InvoiceResponse> => {
    const response = await api.get<InvoiceResponse>(`/invoices/${invoiceId}`);
    return response.data;
  },
};