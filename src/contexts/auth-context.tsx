"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import {
  authService,
  LoginCredentials,
  UpdateProfileData,
  ChangePasswordData,
} from "@/services/auth";
import { toast } from "sonner";
import { socketService } from "@/lib/socket";
import apiClient from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      try {
        const token = authService.getToken();

        // Only proceed if we have a token
        if (token) {
          try {
            // Verify token is still valid by fetching current user from API
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            } else {
              // Token exists but couldn't get user - clear everything
              setUser(null);
              authService.logout();
            }
          } catch (error) {
            console.error("Failed to verify user:", error);
            // Token is invalid or expired - clear everything
            setUser(null);
            authService.logout();
          }
        } else {
          // No token found - ensure user state is null
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user) {
      const token = authService.getToken();
      if (token) {
        console.log("[AUTH] Initializing socket connection for user:", user.id);
        socketService.connect(token);

        // Listen for force_logout (another device logged in)
        const handleForceLogout = (data: { reason?: string }) => {
          console.log("[AUTH] Force logout received:", data.reason);
          toast.error(
            data.reason ||
              "Vous avez été déconnecté car votre compte s'est connecté sur un autre appareil."
          );
          authService.logout();
          setUser(null);
          router.push("/login");
        };

        socketService.on("force_logout", handleForceLogout);

        return () => {
          socketService.off("force_logout", handleForceLogout);
        };
      }
    } else {
      // Disconnect socket when user logs out
      console.log("[AUTH] Disconnecting socket");
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!user) {
        socketService.disconnect();
      }
    };
  }, [user, router]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      // Track logout before clearing tokens (needs auth)
      try {
        await apiClient.post("/analytics/track", {
          action: "logout",
          category: "auth",
          metadata: { timestamp: new Date().toISOString() },
        });
      } catch {
        // Don't block logout if tracking fails
      }
      await authService.logout();
      setUser(null);
      router.push("/");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      await logout();
    }
  }, [logout]);

  const login = useCallback(
    async (credentials: LoginCredentials, redirectTo?: string) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);

        if (response.data) {
          const loggedInUser = response.data.user;

          setUser(loggedInUser);
          console.log("loggedInUser", loggedInUser)

          // Redirect based on redirectTo parameter or role
          setTimeout(() => {
            if (redirectTo) {
              router.push(redirectTo);
            } else if (loggedInUser.role === "client") {
              router.push("/compte");
            } else if (loggedInUser.role === "trainer") {
              router.push("/trainer");
            } else if (loggedInUser.role === "super_admin" || loggedInUser.role === "admin") {
              router.push("/dashboard");
            }
            router.refresh();
          }, 100);
        }
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      await authService.changePassword(data);
      toast.success("Password changed successfully");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to change password";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
