import { api } from './api';
import type { MeterReadingResponse, MeterReadingList, MeterReadingCreate, MeterType } from '../types';

export const meterReadingsApi = {
  // Upload a new meter reading with image
  uploadReading: async (formData: FormData): Promise<MeterReadingResponse> => {
    const response = await api.post<MeterReadingResponse>('/meter-readings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get current user's readings
  getMyReadings: async (params?: {
    skip?: number;
    limit?: number;
    meter_type?: MeterType;
  }): Promise<MeterReadingList> => {
    const response = await api.get<MeterReadingList>('/meter-readings/my-readings', { params });
    return response.data;
  },

  // Get all readings (for managers/admins)
  getAllReadings: async (params?: {
    skip?: number;
    limit?: number;
    meter_type?: MeterType;
    verified?: boolean;
  }): Promise<MeterReadingList> => {
    const response = await api.get<MeterReadingList>('/meter-readings/all', { params });
    return response.data;
  },

  // Get a specific reading
  getReading: async (readingId: number): Promise<MeterReadingResponse> => {
    const response = await api.get<MeterReadingResponse>(`/meter-readings/${readingId}`);
    return response.data;
  },

  // Verify a reading (managers/admins only)
  verifyReading: async (readingId: number): Promise<MeterReadingResponse> => {
    const response = await api.patch<MeterReadingResponse>(`/meter-readings/${readingId}/verify`);
    return response.data;
  },

  // Delete a reading
  deleteReading: async (readingId: number): Promise<void> => {
    await api.delete(`/meter-readings/${readingId}`);
  },
};