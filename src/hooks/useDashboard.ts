import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { dashboardService, DashboardStats } from "@/services/dashboard";

/**
 * Custom hook to fetch dashboard statistics
 * Implements stale-while-revalidate caching strategy
 *
 * Caching strategy:
 * - Data is cached for 5 minutes (staleTime)
 * - Cache persists for 10 minutes (cacheTime)
 * - Background refetch every 5 minutes when component is mounted
 * - Refetch on window focus (disabled to prevent excessive requests)
 */
export const useDashboardStats = (): UseQueryResult<DashboardStats, Error> => {
  return useQuery<DashboardStats, Error>({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getDashboardOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for this duration
    gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for this duration (previously cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

/**
 * Hook to manually refetch dashboard data
 * Use this when you want to force a refresh (e.g., after creating new data)
 */
export const useRefetchDashboard = () => {
  const { refetch } = useDashboardStats();
  return refetch;
};
