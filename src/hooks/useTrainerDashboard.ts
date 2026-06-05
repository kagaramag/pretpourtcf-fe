import { useQuery } from "@tanstack/react-query";
import { corporateService } from "@/services/corporate";
import { TrainerDashboardStats } from "@/types";

export const useTrainerDashboard = () => {
  return useQuery<TrainerDashboardStats, Error>({
    queryKey: ["trainer", "dashboard"],
    queryFn: async () => {
      const response = await corporateService.getMyDashboard();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });
};
