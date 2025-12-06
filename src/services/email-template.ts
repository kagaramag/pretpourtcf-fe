import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description?: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables?: string[];
  description?: string;
  isActive?: boolean;
}

export interface UpdateEmailTemplateData {
  name?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
  description?: string;
  isActive?: boolean;
}

export interface SendBulkEmailData {
  templateId: string;
  recipientIds: string[];
  variables?: Record<string, any>;
}

export interface BulkEmailResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

export interface TemplatePreview {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailTemplateQueryParams {
  isActive?: boolean;
  name?: string;
}

export const emailTemplateService = {
  /**
   * Get all email templates
   */
  getAllTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await apiClient.get<BackendApiResponse<{ templates: EmailTemplate[] }>>("/email-templates");
    console.log("??response", response);
    return response.data.templates;
  },

  /**
   * Get a single email template by ID
   */
  getTemplateById: async (
    id: string
  ): Promise<EmailTemplate> => {
    const response = await apiClient.get<BackendApiResponse<{ template: EmailTemplate }>>(`/email-templates/${id}`);
    return response.data.template;
  },

  /**
   * Create a new email template
   */
  createTemplate: async (
    data: CreateEmailTemplateData
  ): Promise<EmailTemplate> => {
    const response = await apiClient.post<BackendApiResponse<EmailTemplate>>("/email-templates", data);
    return response.data;
  },

  /**
   * Update an email template
   */
  updateTemplate: async (
    id: string,
    data: UpdateEmailTemplateData
  ): Promise<EmailTemplate> => {
    const response = await apiClient.patch<BackendApiResponse<{ template: EmailTemplate }>>(`/email-templates/${id}`, data);
    return response.data.template;
  },

  /**
   * Delete an email template
   */
  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete<BackendApiResponse<null>>(`/email-templates/${id}`);
  },

  /**
   * Preview template with sample data
   */
  previewTemplate: async (
    id: string,
    sampleData?: Record<string, any>
  ): Promise<TemplatePreview> => {
    const response = await apiClient.post<BackendApiResponse<{ preview: TemplatePreview }>>(
      `/email-templates/${id}/preview`,
      sampleData || {}
    );
    return response.data.preview;
  },

  /**
   * Send bulk emails using a template
   */
  sendBulkEmail: async (
    data: SendBulkEmailData
  ): Promise<BulkEmailResult> => {
    const response = await apiClient.post<BackendApiResponse<BulkEmailResult>>("/email-templates/send-bulk", data);
    return response.data;
  },
};
