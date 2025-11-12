import { apiClient } from "@/lib/api-client";
import {
  PracticeQuestion,
  BackendApiResponse,
  PracticeQuestionsPaginatedResponse,
  QuestionType,
  CEFRLevel,
  MediaContent,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface CreateQuestionData {
  examId: string;
  number: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correct?: number;
  answer?: string; // For essay and short answer questions - supports markdown
  score: number;
  media?: MediaContent;
  difficulty?: CEFRLevel;
  tags?: string[];
}

export interface UpdateQuestionData {
  number?: number;
  type?: QuestionType;
  text?: string;
  options?: string[];
  correct?: number;
  answer?: string; // For essay and short answer questions - supports markdown
  score?: number;
  media?: MediaContent;
  difficulty?: CEFRLevel;
  tags?: string[];
}

export interface QuestionQueryParams {
  page?: number;
  limit?: number;
  examId?: string;
  type?: QuestionType;
  difficulty?: CEFRLevel;
  sort?: string;
}

export const questionService = {
  /**
   * Get all questions with pagination and filters
   */
  getAllQuestions: async (
    params?: QuestionQueryParams
  ): Promise<BackendApiResponse<PracticeQuestionsPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.examId) queryParams.append("examId", params.examId);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.PRACTICES}/questions/all${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<
      BackendApiResponse<PracticeQuestionsPaginatedResponse>
    >(url);
  },

  /**
   * Get a single question by ID
   */
  getQuestionById: async (
    id: string
  ): Promise<BackendApiResponse<{ question: PracticeQuestion }>> => {
    return await apiClient.get<
      BackendApiResponse<{ question: PracticeQuestion }>
    >(`${API_ENDPOINTS.PRACTICES}/questions/${id}`);
  },

  /**
   * Create a new question (admin only)
   */
  createQuestion: async (
    data: CreateQuestionData
  ): Promise<BackendApiResponse<{ question: PracticeQuestion }>> => {
    return await apiClient.post<
      BackendApiResponse<{ question: PracticeQuestion }>
    >(`${API_ENDPOINTS.PRACTICES}/questions`, data);
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (
    id: string,
    data: UpdateQuestionData
  ): Promise<BackendApiResponse<{ question: PracticeQuestion }>> => {
    return await apiClient.patch<
      BackendApiResponse<{ question: PracticeQuestion }>
    >(`${API_ENDPOINTS.PRACTICES}/questions/${id}`, data);
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (
    id: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.PRACTICES}/questions/${id}`
    );
  },
};
