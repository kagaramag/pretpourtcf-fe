import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { planService, SubscriptionPlan } from "@/services/plan";

export interface PlanStats {
  total: number;
  active: number;
  premium: number;
  trial: number;
}

/**
 * Custom hook to fetch all plans with stats
 * Implements stale-while-revalidate caching strategy
 */
export const usePlansStats = (): UseQueryResult<{ plans: SubscriptionPlan[]; stats: PlanStats }, Error> => {
  return useQuery({
    queryKey: ["plans", "stats"],
    queryFn: async () => {
      const response = await planService.getAllPlansAdmin();
      const plans = response.data.plans;

      // Calculate stats
      const stats: PlanStats = {
        total: plans.length,
        active: plans.filter((p) => p.is_active).length,
        premium: plans.filter((p) => p.type === "premium").length,
        trial: plans.filter((p) => p.type === "trial").length,
      };

      return { plans, stats };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
