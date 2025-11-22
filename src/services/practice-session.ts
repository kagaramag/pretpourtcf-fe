import { apiClient } from "@/lib/api-client";
import {
  BackendApiResponse,
  PracticeSession,
  PracticeSessionsPaginatedResponse,
  SessionResult,
  SubmitAnswerResponse,
  SessionStatistics,
  SessionStatus,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface StartSessionData {
  practiceId: string;
}

export interface SubmitAnswerData {
  sessionId: string;
  questionId: string;
  questionNumber: number;
  selectedAnswer?: number; // Optional for essay/short answer questions
  textAnswer?: string; // For essay and short answer questions - supports markdown
}

export interface CompleteSessionData {
  sessionId: string;
  timeElapsedSeconds: number;
}

export interface BulkSubmitAndCompleteData {
  sessionId: string;
  timeElapsedSeconds: number;
  answers: {
    questionId: string;
    questionNumber: number;
    selectedAnswer?: number; // Optional for essay/short answer questions
    textAnswer?: string; // For essay and short answer questions - supports markdown
  }[];
}

export interface SessionQueryParams {
  page?: number;
  limit?: number;
  practiceId?: string;
  status?: SessionStatus;
  sort?: string;
}

export const practiceSessionService = {
  /**
   * Start a new practice session
   */
  startSession: async (
    data: StartSessionData
  ): Promise<BackendApiResponse<{ session: PracticeSession; message?: string }>> => {
    return await apiClient.post<
      BackendApiResponse<{ session: PracticeSession; message?: string }>
    >(API_ENDPOINTS.START_SESSION, data);
  },

  /**
   * Get a specific practice session
   */
  getSession: async (
    sessionId: string
  ): Promise<BackendApiResponse<{ session: PracticeSession }>> => {
    return await apiClient.get<BackendApiResponse<{ session: PracticeSession }>>(
      `${API_ENDPOINTS.PRACTICE_SESSIONS}/${sessionId}`
    );
  },

  /**
   * Submit an answer for a question
   */
  submitAnswer: async (
    data: SubmitAnswerData
  ): Promise<BackendApiResponse<SubmitAnswerResponse>> => {
    return await apiClient.post<BackendApiResponse<SubmitAnswerResponse>>(
      API_ENDPOINTS.SUBMIT_ANSWER,
      data
    );
  },

  /**
   * Complete a practice session
   */
  completeSession: async (
    data: CompleteSessionData
  ): Promise<BackendApiResponse<{ session: SessionResult }>> => {
    return await apiClient.post<BackendApiResponse<{ session: SessionResult }>>(
      API_ENDPOINTS.COMPLETE_SESSION,
      data
    );
  },

  /**
   * Bulk submit answers and complete session (optimized)
   */
  bulkSubmitAndComplete: async (
    data: BulkSubmitAndCompleteData
  ): Promise<BackendApiResponse<{ session: SessionResult }>> => {
    return await apiClient.post<BackendApiResponse<{ session: SessionResult }>>(
      API_ENDPOINTS.BULK_SUBMIT_COMPLETE,
      data
    );
  },

  /**
   * Get user's practice history
   */
  getHistory: async (
    params?: SessionQueryParams
  ): Promise<BackendApiResponse<PracticeSessionsPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.practiceId) queryParams.append("practiceId", params.practiceId);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.PRACTICE_SESSIONS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<
      BackendApiResponse<PracticeSessionsPaginatedResponse>
    >(url);
  },

  /**
   * Get user's session statistics
   */
  getStatistics: async (): Promise<
    BackendApiResponse<{ statistics: SessionStatistics }>
  > => {
    return await apiClient.get<
      BackendApiResponse<{ statistics: SessionStatistics }>
    >(API_ENDPOINTS.SESSION_STATS);
  },

  /**
   * Cancel/delete a practice session
   */
  cancelSession: async (
    sessionId: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.PRACTICE_SESSIONS}/${sessionId}`
    );
  },
};
