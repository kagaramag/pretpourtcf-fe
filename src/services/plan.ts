import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export type PlanType = "trial" | "premium";

export interface PlanDetails {
  co: number; // Comprehension & Oral (questions)
  ce: number; // Comprehension & Written
  eo: number; // Expression & Oral
  ee: number; // Expression & Written
  correction: boolean;
  streak: boolean;
  history: boolean;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  type: PlanType;
  duration_days: number;
  price: number;
  description?: string;
  features: string[];
  is_active: boolean;
  popular: boolean;
  details: PlanDetails;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  user_id: string;
  plan_id: string;
  plan: SubscriptionPlan;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  days_remaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeData {
  planId: string;
}

export const planService = {
  /**
   * Get all available subscription plans (active only)
   */
  async getAllPlans(): Promise<BackendApiResponse<{ plans: SubscriptionPlan[] }>> {
    return apiClient.get("/subscriptions/plans");
  },

  /**
   * Get all subscription plans including inactive (admin only)
   */
  async getAllPlansAdmin(): Promise<BackendApiResponse<{ plans: SubscriptionPlan[] }>> {
    return apiClient.get("/subscriptions/plans/all");
  },

  /**
   * Get user's current subscription
   */
  async getMySubscription(): Promise<BackendApiResponse<{ subscription: Subscription | null }>> {
    return apiClient.get("/subscriptions/my-subscription");
  },

  /**
   * Subscribe to a plan
   */
  async subscribe(data: SubscribeData): Promise<BackendApiResponse<{ subscription: Subscription }>> {
    return apiClient.post("/subscriptions/subscribe", data);
  },

  /**
   * Cancel current subscription
   */
  async cancelSubscription(): Promise<BackendApiResponse<{ message: string }>> {
    return apiClient.post("/subscriptions/cancel");
  },

  /**
   * Get all subscriptions (admin only)
   */
  async getAllSubscriptions(): Promise<BackendApiResponse<{ subscriptions: Subscription[] }>> {
    return apiClient.get("/subscriptions");
  },
};
