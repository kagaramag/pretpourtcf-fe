import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface LoginActivityLog {
  _id: string;
  user_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  } | null;
  action: string;
  category: string;
  metadata: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface LoginActivityStats {
  totalLogins: number;
  failedLogins: number;
  suspiciousLogins: number;
  sessionsRevoked: number;
  activeSessions: number;
  totalFlaggedAccounts: number;
}

export interface SuspiciousAccount {
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    status: string;
  } | null;
  flagCount: number;
  lastFlagged: string;
  recentEvents: Array<{
    timestamp: string;
    previous_ip: string;
    current_ip: string;
    previous_device: string;
    current_device: string;
    minutes_since_last_activity: number;
  }>;
}

export interface ActiveSession {
  _id: string;
  userId: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  deviceId: string;
  deviceName: string;
  deviceType: string;
  ipAddress: string;
  isActive: boolean;
  lastActivityAt: string;
  loginAt: string;
}

interface PaginatedResponse<T> {
  data: T;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const loginActivityService = {
  getStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<LoginActivityStats> => {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    const query = searchParams.toString();
    const response = await apiClient.get<BackendApiResponse<LoginActivityStats>>(
      `/login-activity/stats${query ? `?${query}` : ""}`
    );
    return response.data;
  },

  getLogs: async (params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    logs: LoginActivityLog[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.user_id) searchParams.set("user_id", params.user_id);
    if (params?.action) searchParams.set("action", params.action);
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    const query = searchParams.toString();
    const response = await apiClient.get<
      BackendApiResponse<{
        logs: LoginActivityLog[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>
    >(`/login-activity${query ? `?${query}` : ""}`);
    return response.data;
  },

  getSuspiciousAccounts: async (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    flaggedAccounts: SuspiciousAccount[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.start_date) searchParams.set("start_date", params.start_date);
    if (params?.end_date) searchParams.set("end_date", params.end_date);
    const query = searchParams.toString();
    const response = await apiClient.get<
      BackendApiResponse<{
        flaggedAccounts: SuspiciousAccount[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>
    >(`/login-activity/suspicious${query ? `?${query}` : ""}`);
    return response.data;
  },

  getActiveSessions: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    sessions: ActiveSession[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    const response = await apiClient.get<
      BackendApiResponse<{
        sessions: ActiveSession[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>
    >(`/login-activity/sessions${query ? `?${query}` : ""}`);
    return response.data;
  },
};
