import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface UploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface UploadQuestionMediaParams {
  file: File;
  practiceTitle?: string;
  questionNumber?: number;
}

export const uploadService = {
  /**
   * Upload audio or image file for a practice question
   */
  uploadQuestionMedia: async (
    params: UploadQuestionMediaParams
  ): Promise<BackendApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append("file", params.file);

    if (params.practiceTitle) {
      formData.append("practiceTitle", params.practiceTitle);
    }

    if (params.questionNumber !== undefined) {
      formData.append("questionNumber", params.questionNumber.toString());
    }

    return await apiClient.post<BackendApiResponse<UploadResponse>>(
      API_ENDPOINTS.UPLOAD_QUESTION_MEDIA,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },
};
