import { apiClient } from "@/lib/api-client";
import {
  Practice,
  BackendApiResponse,
  PracticesPaginatedResponse,
  PracticeType,
  CEFRLevel,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface CreatePracticeData {
  title: string;
  type: PracticeType;
  level?: CEFRLevel;
  durationMinutes: number;
  totalQuestions: number;
  isActive?: boolean;
}

export interface UpdatePracticeData {
  title?: string;
  type?: PracticeType;
  level?: CEFRLevel;
  durationMinutes?: number;
  totalQuestions?: number;
  isActive?: boolean;
}

export interface PracticeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: PracticeType;
  level?: CEFRLevel;
  isActive?: boolean;
  sort?: string;
}

export const practiceService = {
  /**
   * Get all practices with pagination and filters
   */
  getAllPractices: async (
    params?: PracticeQueryParams
  ): Promise<BackendApiResponse<PracticesPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.level) queryParams.append("level", params.level);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.PRACTICES}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<BackendApiResponse<PracticesPaginatedResponse>>(
      url
    );
  },

  /**
   * Get a single practice by ID
   */
  getPracticeById: async (
    id: string
  ): Promise<BackendApiResponse<{ practice: Practice }>> => {
    return await apiClient.get<BackendApiResponse<{ practice: Practice }>>(
      `${API_ENDPOINTS.PRACTICES}/${id}`
    );
  },

  /**
   * Create a new practice (admin only)
   */
  createPractice: async (
    data: CreatePracticeData
  ): Promise<BackendApiResponse<{ practice: Practice }>> => {
    return await apiClient.post<BackendApiResponse<{ practice: Practice }>>(
      API_ENDPOINTS.PRACTICES,
      data
    );
  },

  /**
   * Update an existing practice
   */
  updatePractice: async (
    id: string,
    data: UpdatePracticeData
  ): Promise<BackendApiResponse<{ practice: Practice }>> => {
    return await apiClient.patch<BackendApiResponse<{ practice: Practice }>>(
      `${API_ENDPOINTS.PRACTICES}/${id}`,
      data
    );
  },

  /**
   * Delete a practice
   */
  deletePractice: async (
    id: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.PRACTICES}/${id}`
    );
  },
};
