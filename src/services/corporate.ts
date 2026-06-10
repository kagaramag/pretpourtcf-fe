import { apiClient } from "@/lib/api-client";
import {
  Corporate,
  User,
  BackendApiResponse,
  CorporatesPaginatedResponse,
  CreateCorporateRequest,
  UpdateCorporateRequest,
  LearnerActivity,
  TrainerDashboardStats,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface CorporateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const corporateService = {
  // ─── Corporate CRUD ─────────────────────────────────────────────

  getAllCorporates: async (
    params?: CorporateQueryParams
  ): Promise<BackendApiResponse<CorporatesPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.CORPORATES}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<BackendApiResponse<CorporatesPaginatedResponse>>(
      url
    );
  },

  getCorporateById: async (
    id: string
  ): Promise<BackendApiResponse<{ corporate: Corporate }>> => {
    return await apiClient.get<BackendApiResponse<{ corporate: Corporate }>>(
      `${API_ENDPOINTS.CORPORATES}/${id}`
    );
  },

  createCorporate: async (
    data: CreateCorporateRequest
  ): Promise<BackendApiResponse<{ corporate: Corporate }>> => {
    return await apiClient.post<BackendApiResponse<{ corporate: Corporate }>>(
      API_ENDPOINTS.CORPORATES,
      data
    );
  },

  updateCorporate: async (
    id: string,
    data: UpdateCorporateRequest
  ): Promise<BackendApiResponse<{ corporate: Corporate }>> => {
    return await apiClient.patch<BackendApiResponse<{ corporate: Corporate }>>(
      `${API_ENDPOINTS.CORPORATES}/${id}`,
      data
    );
  },

  deleteCorporate: async (
    id: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.CORPORATES}/${id}`
    );
  },

  // ─── Trainers ─────────────────────────────────────────────────────

  getCorporateTrainers: async (
    corporateId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<
    BackendApiResponse<{ trainers: User[]; pagination: PaginationMeta }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_ENDPOINTS.CORPORATES}/${corporateId}/trainers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiClient.get(url);
  },

  assignTrainerToCorporate: async (
    corporateId: string,
    trainerId: string
  ): Promise<BackendApiResponse<{ trainer: User }>> => {
    return await apiClient.post(
      `${API_ENDPOINTS.CORPORATES}/${corporateId}/trainers`,
      { trainerId }
    );
  },

  removeTrainerFromCorporate: async (
    corporateId: string,
    trainerId: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete(
      `${API_ENDPOINTS.CORPORATES}/${corporateId}/trainers/${trainerId}`
    );
  },

  // ─── Learners ─────────────────────────────────────────────────────

  getCorporateLearners: async (
    corporateId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<
    BackendApiResponse<{ learners: User[]; pagination: PaginationMeta }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_ENDPOINTS.CORPORATES}/${corporateId}/learners${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiClient.get(url);
  },

  addLearnerToCorporate: async (
    corporateId: string,
    learnerId: string
  ): Promise<BackendApiResponse<{ learner: User }>> => {
    return await apiClient.post(
      `${API_ENDPOINTS.CORPORATES}/${corporateId}/learners`,
      { learnerId }
    );
  },

  removeLearnerFromCorporate: async (
    corporateId: string,
    learnerId: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete(
      `${API_ENDPOINTS.CORPORATES}/${corporateId}/learners/${learnerId}`
    );
  },

  // ─── Learner Activity ─────────────────────────────────────────────

  getLearnerActivity: async (
    corporateId: string,
    learnerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<
    BackendApiResponse<{
      learner: { id: string; first_name: string; last_name: string; email: string };
      practices: LearnerActivity[];
      pagination: PaginationMeta;
      stats: {
        totalSessions: number;
        averageScore: number;
        totalTimeSpent: number;
      };
    }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_ENDPOINTS.CORPORATES}/${corporateId}/learners/${learnerId}/activity${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiClient.get(url);
  },

  // ─── Learner Session Answers ────────────────────────────────────────

  getLearnerSessionAnswers: async (
    corporateId: string,
    learnerId: string,
    sessionId: string
  ): Promise<
    BackendApiResponse<{
      session: {
        id: string;
        practice: { id: string; title: string; type: string; level?: string };
        totalScore: number;
        maxPossibleScore: number;
        percentageScore: number;
        timeElapsedSeconds: number;
        completedAt: string;
      };
      answers: Array<{
        questionId: string;
        questionNumber: number;
        selectedAnswer?: number;
        textAnswer?: string;
        isCorrect: boolean;
        pointsEarned: number;
        question: {
          number: number;
          type: "mcq" | "short_answer" | "audio" | "essay";
          text: string;
          options?: string[];
          correct?: number;
          answer?: string;
          score: number;
          media?: { audio?: string; image?: string };
        } | null;
      }>;
    }>
  > => {
    const url = `${API_ENDPOINTS.CORPORATES}/${corporateId}/learners/${learnerId}/sessions/${sessionId}/answers`;
    return await apiClient.get(url);
  },

  // ─── Trainer: my dashboard ────────────────────────────────────────

  getMyDashboard: async (): Promise<BackendApiResponse<TrainerDashboardStats>> => {
    return await apiClient.get<BackendApiResponse<TrainerDashboardStats>>(
      `${API_ENDPOINTS.CORPORATES}/my/dashboard`
    );
  },

  // ─── Trainer: my learners ─────────────────────────────────────────

  getMyLearners: async (
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<
    BackendApiResponse<{ learners: User[]; pagination: PaginationMeta }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = `${API_ENDPOINTS.CORPORATES}/my/learners${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return await apiClient.get(url);
  },

};
