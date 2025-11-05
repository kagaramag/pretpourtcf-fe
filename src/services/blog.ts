import { apiClient } from "@/lib/api-client";
import {
  Blog,
  BackendApiResponse,
  BlogsPaginatedResponse,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogStatus,
} from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface BlogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  written_by?: string;
  sort?: string;
}

export const blogService = {
  // Admin Blog Services
  /**
   * Get all blogs with pagination and filters (Admin)
   */
  getAllBlogs: async (
    params?: BlogQueryParams
  ): Promise<BackendApiResponse<BlogsPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.written_by) queryParams.append("written_by", params.written_by);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.BLOGS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<BackendApiResponse<BlogsPaginatedResponse>>(url);
  },

  /**
   * Get a single blog by ID (Admin)
   */
  getBlogById: async (
    id: string
  ): Promise<BackendApiResponse<{ blog: Blog }>> => {
    return await apiClient.get<BackendApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.BLOGS}/${id}`
    );
  },

  /**
   * Create a new blog (admin only)
   */
  createBlog: async (
    data: CreateBlogRequest
  ): Promise<BackendApiResponse<{ blog: Blog }>> => {
    return await apiClient.post<BackendApiResponse<{ blog: Blog }>>(
      API_ENDPOINTS.BLOGS,
      data
    );
  },

  /**
   * Update an existing blog
   */
  updateBlog: async (
    id: string,
    data: UpdateBlogRequest
  ): Promise<BackendApiResponse<{ blog: Blog }>> => {
    return await apiClient.patch<BackendApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.BLOGS}/${id}`,
      data
    );
  },

  /**
   * Delete a blog
   */
  deleteBlog: async (
    id: string
  ): Promise<BackendApiResponse<Record<string, never>>> => {
    return await apiClient.delete<BackendApiResponse<Record<string, never>>>(
      `${API_ENDPOINTS.BLOGS}/${id}`
    );
  },

  // Public Blog Services (no authentication required)
  /**
   * Get all published blogs (Public)
   */
  getPublishedBlogs: async (
    params?: Omit<BlogQueryParams, "status" | "written_by">
  ): Promise<BackendApiResponse<BlogsPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort) queryParams.append("sort", params.sort);

    const url = `${API_ENDPOINTS.PUBLIC_BLOGS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<BackendApiResponse<BlogsPaginatedResponse>>(url);
  },

  /**
   * Get a single published blog by ID (Public)
   */
  getPublishedBlogById: async (
    id: string
  ): Promise<BackendApiResponse<{ blog: Blog }>> => {
    return await apiClient.get<BackendApiResponse<{ blog: Blog }>>(
      `${API_ENDPOINTS.PUBLIC_BLOGS}/${id}`
    );
  },
};
