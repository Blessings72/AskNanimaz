export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'resident' | 'manager' | 'admin';
  apartment_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  apartment_number?: string;
  role: 'resident' | 'manager' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiError {
  detail: string;
}

// Meter Reading Types
export type MeterType = 'water' | 'electricity';

export interface MeterReadingBase {
  meter_type: MeterType;
  reading_value: number;
  image_url: string;
}

export interface MeterReadingCreate {
  meter_type: MeterType;
  reading_value: number;
}

export interface MeterReadingResponse extends MeterReadingBase {
  id: number;
  user_id: number;
  user: User;
  reading_date: string;
  verified: boolean;
  verified_by?: number;
  verified_at?: string;
}

export interface MeterReadingList {
  readings: MeterReadingResponse[];
  total: number;
}

// Invoice Types
export interface InvoiceBase {
  amount: number;
  consumption: number;
  rate: number;
  due_date: string;
}

export interface InvoiceResponse extends InvoiceBase {
  id: number;
  user_id: number;
  meter_reading_id: number;
  invoice_number: string;
  issue_date: string;
  paid: boolean;
  paid_at?: string;
  user: User;
  meter_reading: MeterReadingResponse;
}

export interface InvoiceList {
  invoices: InvoiceResponse[];
  total: number;
}

export interface InvoiceSummary {
  total_invoices: number;
  total_amount: number;
  paid_invoices: number;
  paid_amount: number;
  pending_invoices: number;
  pending_amount: number;
}