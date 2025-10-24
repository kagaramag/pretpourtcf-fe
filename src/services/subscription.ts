import { apiClient } from "@/lib/api-client";
import { BackendApiResponse, SubscriptionPlan, Subscription } from "@/types";

export interface SubscribeData {
  plan_id: string;
}

export interface UserSubscription {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  plan: {
    id: string;
    name: string;
    type: "trial" | "premium";
    duration_days: number;
    price: number;
  };
  status: "active" | "expired" | "cancelled";
  start_date: Date;
  end_date: Date;
  days_remaining: number;
  createdAt: Date;
}

export interface GetAllSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface SubscriptionsPaginatedResponse {
  subscriptions: UserSubscription[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const subscriptionService = {
  getAllSubscriptions: async (
    params: GetAllSubscriptionsParams = {}
  ): Promise<SubscriptionsPaginatedResponse> => {
    const response = await apiClient.get<
      BackendApiResponse<SubscriptionsPaginatedResponse>
    >("/subscriptions", { params });

    if (response.data) {
      return response.data;
    }

    throw new Error("Failed to fetch subscriptions");
  },

  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<
      BackendApiResponse<{ plans: SubscriptionPlan[] }>
    >("/subscriptions/plans");

    return response.data?.plans || [];
  },

  getMySubscription: async (): Promise<Subscription | null> => {
    const response = await apiClient.get<
      BackendApiResponse<{ subscription: Subscription | null }>
    >("/subscriptions/my-subscription");

    return response.data?.subscription || null;
  },

  subscribeToPlan: async (data: SubscribeData): Promise<Subscription> => {
    const response = await apiClient.post<
      BackendApiResponse<{ subscription: Subscription }>
    >("/subscriptions/subscribe", data);

    if (response.data?.subscription) {
      return response.data.subscription;
    }

    throw new Error("Failed to subscribe to plan");
  },

  cancelSubscription: async (): Promise<void> => {
    await apiClient.post<BackendApiResponse<any>>("/subscriptions/cancel");
  },
};
