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