import { apiClient } from "@/lib/api-client";
import { BackendApiResponse } from "@/types";

export type PlanType = "trial" | "premium";
export type PlanCategory = "preparation" | "training";

export interface PlanDetails {
  co: number; // Comprehension & Oral (questions)
  ce: number; // Comprehension & Written
  eo: number; // Expression & Oral
  ee: number; // Expression & Written
  correction: boolean;
  streak: boolean;
  history: boolean;
}

export interface TrainingDetails {
  sessions: number; // Number of sessions (séances)
  duration_days: number; // Duration in days
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  type: PlanType;
  category: PlanCategory;
  duration_days: number;
  price: number;
  description?: string;
  features: string[];
  is_active: boolean;
  popular: boolean;
  details: PlanDetails;
  training_details?: TrainingDetails;
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
  async getAllPlans(category?: PlanCategory): Promise<BackendApiResponse<{ plans: SubscriptionPlan[] }>> {
    const params = category ? { category } : {};
    return apiClient.get("/subscriptions/plans", { params });
  },

  /**
   * Get all subscription plans including inactive (admin only)
   */
  async getAllPlansAdmin(category?: PlanCategory): Promise<BackendApiResponse<{ plans: SubscriptionPlan[] }>> {
    const params = category ? { category } : {};
    return apiClient.get("/subscriptions/plans/all", { params });
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

  /**
   * Create a new plan (admin only)
   */
  async createPlan(planData: Partial<SubscriptionPlan>): Promise<BackendApiResponse<{ plan: SubscriptionPlan }>> {
    return apiClient.post("/subscriptions/plans", planData);
  },

  /**
   * Update a plan (admin only)
   */
  async updatePlan(id: string, planData: Partial<SubscriptionPlan>): Promise<BackendApiResponse<{ plan: SubscriptionPlan }>> {
    return apiClient.put(`/subscriptions/plans/${id}`, planData);
  },

  /**
   * Delete a plan (admin only)
   */
  async deletePlan(id: string): Promise<BackendApiResponse<{ message: string }>> {
    return apiClient.delete(`/subscriptions/plans/${id}`);
  },
};
