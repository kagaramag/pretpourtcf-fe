import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/config';
import {
  AnalyticsOverview,
  AgentAnalytics,
  ClientAnalytics,
  DateAnalytics,
  ReportFilter,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const analyticsService = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const response = await apiClient.get<ApiResponse<AnalyticsOverview>>(
      API_ENDPOINTS.ANALYTICS_OVERVIEW
    );
    return response.data;
  },

  getByAgent: async (filters?: ReportFilter): Promise<PaginatedResponse<AgentAnalytics>> => {
    const params = new URLSearchParams(filters as any).toString();
    const url = `${API_ENDPOINTS.ANALYTICS_BY_AGENT}${params ? `?${params}` : ''}`;
    return apiClient.get<PaginatedResponse<AgentAnalytics>>(url);
  },

  getByClient: async (filters?: ReportFilter): Promise<PaginatedResponse<ClientAnalytics>> => {
    const params = new URLSearchParams(filters as any).toString();
    const url = `${API_ENDPOINTS.ANALYTICS_BY_CLIENT}${params ? `?${params}` : ''}`;
    return apiClient.get<PaginatedResponse<ClientAnalytics>>(url);
  },

  getByDate: async (filters?: ReportFilter): Promise<PaginatedResponse<DateAnalytics>> => {
    const params = new URLSearchParams(filters as any).toString();
    const url = `${API_ENDPOINTS.ANALYTICS_BY_DATE}${params ? `?${params}` : ''}`;
    return apiClient.get<PaginatedResponse<DateAnalytics>>(url);
  },

  exportReport: async (format: 'csv' | 'excel' | 'pdf', filters?: ReportFilter): Promise<Blob> => {
    const params = new URLSearchParams({ format, ...(filters as any) }).toString();
    const url = `${API_ENDPOINTS.ANALYTICS_EXPORT}?${params}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    return response.blob();
  },
};
