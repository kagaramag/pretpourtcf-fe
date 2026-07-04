import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { config } from "@/config";

// Cookie max-age: keep session alive for 30 days so middleware doesn't redirect on return visits.
// The JWT itself expires in 1h — the refresh interceptor handles silent renewal.
const COOKIE_MAX_AGE = 30 * 24 * 3600; // 30 days in seconds

// Refresh the token when 80% of the JWT lifetime has elapsed (JWT expires in 1h)
const REFRESH_THRESHOLD_MS = 3600 * 1000 * 0.8; // 48 minutes

type TokenRefreshListener = (newToken: string) => void;

class ApiClient {
  private client: AxiosInstance;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private tokenRefreshListeners: TokenRefreshListener[] = [];
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  /** Register a callback invoked whenever the access token is refreshed */
  onTokenRefresh(listener: TokenRefreshListener) {
    this.tokenRefreshListeners.push(listener);
    return () => {
      this.tokenRefreshListeners = this.tokenRefreshListeners.filter(
        (l) => l !== listener
      );
    };
  }

  /** Schedule a proactive token refresh before the access token expires */
  scheduleTokenRefresh() {
    this.clearRefreshTimer();

    const token = this.getToken();
    if (!token) return;

    this.refreshTimer = setTimeout(() => {
      this.performTokenRefresh();
    }, REFRESH_THRESHOLD_MS);
  }

  /** Stop the proactive refresh timer (e.g. on logout) */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private async performTokenRefresh() {
    try {
      await this.refreshTokenOnce();
    } catch {
      // Refresh failed — clear everything and redirect
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  /**
   * Ensures only one refresh request runs at a time. If multiple 401s fire
   * simultaneously (common on page reload), they all await the same promise.
   */
  private refreshTokenOnce(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const response = await this.client.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token: new_refresh_token } =
        response.data.data;

      this.setToken(access_token);
      if (new_refresh_token) {
        localStorage.setItem("refresh_token", new_refresh_token);
      }

      // Sync cookies with the new tokens
      document.cookie = `access_token=${access_token}; path=/; max-age=${COOKIE_MAX_AGE}`;
      document.cookie = `refresh_token=1; path=/; max-age=${COOKIE_MAX_AGE}`;

      // Notify listeners (e.g. socket reconnect)
      this.tokenRefreshListeners.forEach((fn) => fn(access_token));

      // Restart proactive refresh schedule
      this.scheduleTokenRefresh();

      return access_token;
    })().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 errors — use shared refresh promise to avoid concurrent refresh calls
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshTokenOnce();
            if (newToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed — clear everything and redirect
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      // Also clear cookies so middleware doesn't redirect away from /login
      document.cookie =
        "access_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
