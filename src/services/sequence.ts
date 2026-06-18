import { apiClient } from "@/lib/api-client";
import {
  BackendApiResponse,
  Sequence,
  SequencesPaginatedResponse,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface CreateSequenceData {
  type: "speaking" | "writing";
  questions: {
    tache: number;
    questionId?: string | null;
    practiceId?: string | null;
  }[];
}

export interface UpdateSequenceData {
  questions?: {
    tache: number;
    questionId?: string | null;
    practiceId?: string | null;
  }[];
}

export interface SequenceQueryParams {
  page?: number;
  limit?: number;
  type?: "speaking" | "writing";
  sort?: string;
}

export const sequenceService = {
  getAll: async (
    params?: SequenceQueryParams
  ): Promise<BackendApiResponse<SequencesPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.type) queryParams.append("type", params.type);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.SEQUENCES}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<
      BackendApiResponse<SequencesPaginatedResponse>
    >(url);
  },

  getById: async (
    id: string
  ): Promise<BackendApiResponse<{ sequence: Sequence }>> => {
    return await apiClient.get<BackendApiResponse<{ sequence: Sequence }>>(
      `${API_ENDPOINTS.SEQUENCES}/${id}`
    );
  },

  create: async (
    data: CreateSequenceData
  ): Promise<BackendApiResponse<{ sequence: Sequence }>> => {
    return await apiClient.post<BackendApiResponse<{ sequence: Sequence }>>(
      API_ENDPOINTS.SEQUENCES,
      data
    );
  },

  update: async (
    id: string,
    data: UpdateSequenceData
  ): Promise<BackendApiResponse<{ sequence: Sequence }>> => {
    return await apiClient.patch<BackendApiResponse<{ sequence: Sequence }>>(
      `${API_ENDPOINTS.SEQUENCES}/${id}`,
      data
    );
  },

  delete: async (
    id: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.SEQUENCES}/${id}`
    );
  },

  getByType: async (
    type: "speaking" | "writing"
  ): Promise<BackendApiResponse<{ sequences: Sequence[]; total: number }>> => {
    return await apiClient.get<
      BackendApiResponse<{ sequences: Sequence[]; total: number }>
    >(`${API_ENDPOINTS.SEQUENCES}/by-type/${type}`);
  },

  getByTypeAndNumber: async (
    type: "speaking" | "writing",
    number: number
  ): Promise<BackendApiResponse<{ sequence: Sequence }>> => {
    return await apiClient.get<BackendApiResponse<{ sequence: Sequence }>>(
      `${API_ENDPOINTS.SEQUENCES}/by-type/${type}/${number}`
    );
  },
};
