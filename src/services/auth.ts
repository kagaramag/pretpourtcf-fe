import { apiClient } from "@/lib/api-client";
import { User, BackendApiResponse, LoginResponse } from "@/types";
import { API_ENDPOINTS } from "@/config";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  referralToken?: string;
  role?: "client" | "trainer";
}

export const authService = {
  register: async (
    data: RegisterData
  ): Promise<BackendApiResponse<LoginResponse>> => {
    const response = await apiClient.post<BackendApiResponse<LoginResponse>>(
      API_ENDPOINTS.REGISTER,
      data
    );

    if (response.data) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));

      document.cookie = `access_token=${response.data.access_token}; path=/; max-age=86400`;
    }

    return response;
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<BackendApiResponse<LoginResponse>> => {
    const response = await apiClient.post<BackendApiResponse<LoginResponse>>(
      API_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.data) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));

      document.cookie = `access_token=${response.data.access_token}; path=/; max-age=86400`;
    }

    return response;
  },

  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      // Clear all auth-related data from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");

      // Clear cookies
      document.cookie =
        "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      document.cookie =
        "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Always fetch from API to verify token is still valid
      const response = await apiClient.get<BackendApiResponse<{ user: User }>>(
        "/auth/me"
      );

      if (response.data?.user) {
        // Update cache with fresh data
        if (typeof window !== "undefined") {
          localStorage.setItem("user_data", JSON.stringify(response.data.user));
        }
        return response.data.user;
      }

      // API returned no user - clear stale cache
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_data");
      }
      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      // Clear stale cache on error
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_data");
      }
      throw error;
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<BackendApiResponse<{ user: User }>>(
      "/auth/me"
    );

    if (response.data?.user) {
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      return response.data.user;
    }

    throw new Error("Failed to fetch user profile");
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.patch<BackendApiResponse<{ user: User }>>(
      "/auth/profile",
      data
    );

    if (response.data?.user) {
      localStorage.setItem("user_data", JSON.stringify(response.data.user));
      return response.data.user;
    }

    throw new Error("Failed to update profile");
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post<BackendApiResponse<any>>(
      "/auth/change-password",
      data
    );
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post<BackendApiResponse<any>>("/auth/forgot-password", {
      email,
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<BackendApiResponse<any>>("/auth/reset-password", {
      token,
      newPassword,
    });
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    // Only consider authenticated if BOTH token and user data exist
    return !!token && !!userData;
  },

  getCachedUser: (): User | null => {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("user_data");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },

  verifyEmail: async (
    token: string
  ): Promise<BackendApiResponse<LoginResponse>> => {
    const response = await apiClient.post<BackendApiResponse<LoginResponse>>(
      "/auth/verify-email",
      { token }
    );

    // Store tokens if verification returns them (auto-login)
    if (response.data?.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user_data", JSON.stringify(response.data.user));

      document.cookie = `access_token=${response.data.access_token}; path=/; max-age=86400`;
    }

    return response;
  },

  resendVerificationEmail: async (email: string): Promise<void> => {
    await apiClient.post<BackendApiResponse<any>>(
      "/auth/resend-verification-email",
      { email }
    );
  },
};
