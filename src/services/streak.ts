import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export type StreakStatus = "active" | "completed" | "burned" | "expired";
export type RewardType = "badge" | "certificate" | "bonus_points" | "feature_unlock" | "theme" | "avatar";

export interface Reward {
  type: RewardType;
  name: string;
  description: string;
  icon?: string;
  earnedAt: string;
}

export interface StreakExercise {
  exerciseNumber: number;
  questionId: string;
  completed: boolean;
  score: number;
  completedAt?: string;
}

export interface Streak {
  _id: string;
  userId: string | {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  status: StreakStatus;
  currentPoints: number;
  totalExercises: number;
  completedExercises: number;
  exercises: StreakExercise[];
  lastActivityAt: string;
  burnDeadline: string;
  rewards: Reward[];
  createdAt: string;
  updatedAt: string;
  hoursUntilBurn?: number;
}

export interface StreakEligibility {
  eligible: boolean;
  isPremium: boolean;
  hasActiveStreak: boolean;
  message: string;
}

export interface StreakStats {
  totalStreaks: number;
  completedStreaks: number;
  completionRate: number;
  byStatus: {
    _id: StreakStatus;
    count: number;
    totalPoints: number;
    totalRewards: number;
  }[];
}

export interface CreateStreakData {
  practiceId: string;
}

export interface CompleteExerciseData {
  streakId: string;
  exerciseNumber: number;
  sessionId: string;
}

export interface StreakHistoryParams {
  page?: number;
  limit?: number;
  status?: StreakStatus;
}

export const streakService = {
  /**
   * Check if user is eligible to create a streak
   */
  async checkEligibility(): Promise<BackendApiResponse<StreakEligibility>> {
    return apiClient.get("/streaks/eligibility");
  },

  /**
   * Get user's current active streak
   */
  async getActiveStreak(): Promise<BackendApiResponse<{ streak: Streak | null }>> {
    return apiClient.get("/streaks/active");
  },

  /**
   * Create a new streak
   */
  async createStreak(data: CreateStreakData): Promise<BackendApiResponse<{ streak: Streak; message: string }>> {
    return apiClient.post("/streaks", data);
  },

  /**
   * Complete an exercise in the streak
   */
  async completeExercise(data: CompleteExerciseData): Promise<BackendApiResponse<{ streak: Streak; reward: Reward | null }>> {
    return apiClient.post("/streaks/complete-exercise", data);
  },

  /**
   * Get streak history
   */
  async getStreakHistory(params?: StreakHistoryParams): Promise<BackendApiResponse<{
    streaks: Streak[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    return apiClient.get("/streaks/history", { params });
  },

  /**
   * Get streak statistics
   */
  async getStreakStats(): Promise<BackendApiResponse<{ stats: StreakStats }>> {
    return apiClient.get("/streaks/stats");
  },

  /**
   * Get all streaks (admin only)
   */
  async getAllStreaks(params?: {
    page?: number;
    limit?: number;
    status?: StreakStatus;
    search?: string;
  }): Promise<BackendApiResponse<{
    streaks: Streak[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    return apiClient.get("/streaks/all", { params });
  },
};
