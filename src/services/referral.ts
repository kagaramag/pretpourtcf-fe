import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export interface Referral {
  id: string;
  referrer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  inviteeEmail: string;
  invitee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  status: "pending" | "accepted" | "expired";
  token?: string; // Only present for pending referrals
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendReferralRequest {
  email: string;
}

export interface SendReferralResponse {
  success: boolean;
  message: string;
  referral?: Referral;
}

export interface GetReferralsResponse {
  referrals: Referral[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ValidateReferralResponse {
  success: boolean;
  data?: {
    referrer: {
      first_name: string;
      last_name: string;
    };
    inviteeEmail?: string;
  };
}

class ReferralService {
  /**
   * Send a referral invitation
   */
  async sendInvitation(email: string): Promise<SendReferralResponse> {
    const response = await apiClient.post<SendReferralResponse>(
      "/referrals/send",
      { email }
    );
    return response;
  }

  /**
   * Get user's referrals
   */
  async getUserReferrals(params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "accepted" | "expired";
  }): Promise<GetReferralsResponse> {
    const response = await apiClient.get<
      BackendApiResponse<GetReferralsResponse>
    >("/referrals", { params });
    return response.data;
  }

  /**
   * Get all referrals (Admin only)
   */
  async getAllReferrals(params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "accepted" | "expired";
    search?: string;
  }): Promise<GetReferralsResponse> {
    const response = await apiClient.get<
      BackendApiResponse<GetReferralsResponse>
    >("/referrals/admin/all", { params });
    return response.data;
  }

  /**
   * Validate referral token
   */
  async validateToken(token: string): Promise<ValidateReferralResponse> {
    const response = await apiClient.get<ValidateReferralResponse>(
      `/referrals/validate/${token}`
    );
    return response;
  }

  /**
   * Get specific apprenant profile
   */
  async getApprenantProfile(apprenantId: string): Promise<{
    success: boolean;
    data?: {
      user: any;
      referral: {
        acceptedAt: Date;
        createdAt: Date;
      };
      stats: {
        totalPracticeSessions: number;
        lastActive: Date | null;
      };
    };
  }> {
    const response = await apiClient.get<any>(
      `/referrals/apprenant/${apprenantId}`
    );
    return response;
  }

  /**
   * Get apprenant's practice history
   */
  async getApprenantPractices(
    apprenantId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: {
      practices: Array<{
        id: string;
        practice: {
          id: string;
          title: string;
          category: string;
          difficulty: string;
        };
        completedAt: Date;
        startedAt: Date;
        totalScore: number;
        maxPossibleScore: number;
        percentageScore: number;
        timeElapsedSeconds: number;
        durationMinutes: number;
        totalQuestions: number;
        correctAnswers: number;
        grade: "excellent" | "good" | "needs_improvement";
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
      };
      stats: {
        totalSessions: number;
        averageScore: number;
        totalTimeSpent: number;
        totalPoints: number;
      };
    };
  }> {
    const response = await apiClient.get<any>(
      `/referrals/apprenant/${apprenantId}/practices`,
      { params }
    );
    return response;
  }
}

export const referralService = new ReferralService();
