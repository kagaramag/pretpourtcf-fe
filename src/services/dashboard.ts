import apiClient from "@/lib/api-client";

export interface SubscriptionStats {
  total: number;
  active: number;
}

export interface PracticeSessionInsights {
  total: number;
  completed: number;
  inProgress: number;
  averageScore: number;
  recentSessions: Array<{
    _id: string;
    status: string;
    percentageScore: number;
    totalScore: number;
    createdAt: string;
    completedAt?: string;
    user?: {
      first_name: string;
      last_name: string;
      email: string;
    };
    practice?: {
      title: string;
      type: string;
    };
  }>;
}

export interface RecentUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  createdAt: string;
}

export interface DashboardStats {
  totalQuestions: number;
  totalPractices: number;
  subscriptions: SubscriptionStats;
  totalUsers: number;
  recentUsers: RecentUser[];
  practiceSessionInsights: PracticeSessionInsights;
}

export interface DashboardResponse {
  status: string;
  message: string;
  data: DashboardStats;
}

/**
 * Fetch dashboard overview statistics
 * This function is optimized with both server-side and client-side caching
 */
export const getDashboardOverview = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardResponse>("/dashboard/overview");
  return response.data;
};

export const dashboardService = {
  getDashboardOverview,
};
