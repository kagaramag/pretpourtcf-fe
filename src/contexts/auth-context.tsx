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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
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
        const cachedUser = authService.getCachedUser();
        if (cachedUser) {
          setUser(cachedUser);

          try {
            const currentUser = await authService.getCurrentUser();
            if (currentUser) {
              setUser(currentUser);
            }
          } catch (error) {
            console.error("Failed to verify user:", error);
            setUser(null);
            authService.logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
    async (credentials: LoginCredentials) => {
      try {
        setIsLoading(true);
        const response = await authService.login(credentials);

        if (response.data) {
          const loggedInUser = response.data.user;

          setUser(loggedInUser);

          // Redirect based on role
          setTimeout(() => {
            if (loggedInUser.role === "client") {
              router.push("/compte");
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
