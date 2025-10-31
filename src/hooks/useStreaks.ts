import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { streakService, Streak } from "@/services/streak";

export interface StreakStats {
  total: number;
  active: number;
  completed: number;
  burned: number;
  expired: number;
}

/**
 * Custom hook to fetch all streaks with stats
 * Implements stale-while-revalidate caching strategy
 */
export const useStreaksStats = (): UseQueryResult<{ streaks: Streak[]; stats: StreakStats }, Error> => {
  return useQuery({
    queryKey: ["streaks", "stats"],
    queryFn: async () => {
      const response = await streakService.getAllStreaks({ page: 1, limit: 1000 }); // Get all
      const streaks = response.data.streaks;

      // Calculate stats
      const stats: StreakStats = {
        total: response.data.pagination.total,
        active: streaks.filter((s) => s.status === "active").length,
        completed: streaks.filter((s) => s.status === "completed").length,
        burned: streaks.filter((s) => s.status === "burned").length,
        expired: streaks.filter((s) => s.status === "expired").length,
      };

      return { streaks, stats };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
