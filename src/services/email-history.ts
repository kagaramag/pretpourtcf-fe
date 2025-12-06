import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface EmailHistoryRecipient {
  userId: string;
  email: string;
  name: string;
  status: "success" | "failed";
  error?: string;
}

export interface EmailHistory {
  _id: string;
  templateId: {
    _id: string;
    name: string;
    description?: string;
  };
  templateName: string;
  subject: string;
  recipients: EmailHistoryRecipient[];
  sentBy: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailHistoryQueryParams {
  page?: number;
  limit?: number;
  templateId?: string;
  sentBy?: string;
}

export interface EmailHistoryResponse {
  history: EmailHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface EmailStatistics {
  totalEmailsSent: number;
  totalRecipients: number;
  totalSuccess: number;
  totalFailures: number;
  recentHistory: EmailHistory[];
}

export const emailHistoryService = {
  /**
   * Get all email history
   */
  getAllHistory: async (
    params?: EmailHistoryQueryParams
  ): Promise<EmailHistoryResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.templateId) queryParams.append("templateId", params.templateId);
    if (params?.sentBy) queryParams.append("sentBy", params.sentBy);

    const url = `/email-history${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiClient.get<
      BackendApiResponse<EmailHistoryResponse>
    >(url);
    return response.data;
  },

  /**
   * Get a single email history by ID
   */
  getHistoryById: async (id: string): Promise<EmailHistory> => {
    const response = await apiClient.get<
      BackendApiResponse<{ history: EmailHistory }>
    >(`/email-history/${id}`);
    return response.data.history;
  },

  /**
   * Get email statistics
   */
  getStatistics: async (): Promise<EmailStatistics> => {
    const response = await apiClient.get<
      BackendApiResponse<{ statistics: EmailStatistics }>
    >("/email-history/statistics");
    return response.data.statistics;
  },
};
