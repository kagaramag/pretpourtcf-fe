import { apiClient } from "@/lib/api-client";
import { User, BackendApiResponse, UsersPaginatedResponse, PracticeSession } from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: "admin" | "client";
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "client";
  status?: "active" | "inactive";
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: "active" | "inactive";
  quartier?: string;
  avenue?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface CreateUserResponse {
  user: User;
  temp_password: string;
}

export const userService = {
  /**
   * Get all users with pagination and filters
   */
  getAllUsers: async (
    params?: UserQueryParams
  ): Promise<BackendApiResponse<UsersPaginatedResponse>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.quartier) queryParams.append("quartier", params.quartier);
    if (params?.avenue) queryParams.append("avenue", params.avenue);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const url = `${API_ENDPOINTS.USERS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await apiClient.get<BackendApiResponse<UsersPaginatedResponse>>(url);
  },

  /**
   * Get a single user by ID
   */
  getUserById: async (
    id: string
  ): Promise<BackendApiResponse<{ user: User; practiceHistory: PracticeSession[] | null; subscriptions: Array<any> }>> => {
    return await apiClient.get<BackendApiResponse<{ user: User; practiceHistory: PracticeSession[] | null; subscriptions: Array<any> }>>(
      `${API_ENDPOINTS.USERS}/${id}`
    );
  },

  /**
   * Create a new user (admin only)
   * Returns user and temporary password
   */
  createUser: async (
    data: CreateUserData
  ): Promise<BackendApiResponse<CreateUserResponse>> => {
    return await apiClient.post<BackendApiResponse<CreateUserResponse>>(
      API_ENDPOINTS.USERS,
      data
    );
  },

  /**
   * Update an existing user
   */
  updateUser: async (
    id: string,
    data: UpdateUserData
  ): Promise<BackendApiResponse<{ user: User }>> => {
    return await apiClient.patch<BackendApiResponse<{ user: User }>>(
      `${API_ENDPOINTS.USERS}/${id}`,
      data
    );
  },

  /**
   * Deactivate user (change status to inactive)
   */
  deactivateUser: async (
    id: string
  ): Promise<BackendApiResponse<{ user: User }>> => {
    return await apiClient.patch<BackendApiResponse<{ user: User }>>(
      `${API_ENDPOINTS.USERS}/${id}/deactivate`
    );
  },

  /**
   * Activate user (change status to active)
   */
  activateUser: async (
    id: string
  ): Promise<BackendApiResponse<{ user: User }>> => {
    return await apiClient.patch<BackendApiResponse<{ user: User }>>(
      `${API_ENDPOINTS.USERS}/${id}/activate`
    );
  },
};
