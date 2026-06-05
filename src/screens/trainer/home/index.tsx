"use client";

import { Card } from "@/components/ui/card";
import { useTrainerDashboard } from "@/hooks/useTrainerDashboard";
import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { LearnersAttention } from "./learners-attention";
import { QuickActions } from "./quick-actions";
import { DashboardSkeleton } from "./dashboard-skeleton";

export default function TrainerScreen() {
  const { data: stats, isLoading, error } = useTrainerDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <p className="text-center text-destructive">
              Impossible de charger le tableau de bord. Veuillez réessayer.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-3xl tracking-tight">Tableau de bord</h2>
      </div>

      <StatsCards stats={stats} />

      <div className="flex gap-3 flex-col lg:flex-row">
        <div className="flex-1 space-y-3">
          <RecentActivity activities={stats.recentActivity} />
          <LearnersAttention learners={stats.learnersNeedingAttention} />
        </div>
        <div className="w-full lg:max-w-[320px]">
          <QuickActions performanceByType={stats.performanceByType} />
        </div>
      </div>
    </div>
  );
}
