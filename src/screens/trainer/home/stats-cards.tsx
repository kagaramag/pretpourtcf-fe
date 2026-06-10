"use client";

import { Icon } from "@/icons";
import { TrainerDashboardStats } from "@/types";

interface StatsCardsProps {
  stats: TrainerDashboardStats;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="flex lg:flex-row flex-col gap-3">
      {/* Learners & Subscriptions */}
      <div className="w-full lg:w-1/2 border border-border bg-white p-4 rounded-2xl">
        <h3 className="text-xl mb-2">Apprenants</h3>
        <div className="flex flex-row">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="user" size={18} color="#3b82f6" />
              <span className="text-sm font-medium text-muted-foreground">
                Total
              </span>
            </div>
            <div className="text-2xl font-bold">{stats.totalLearners}</div>
            <p className="text-xs text-muted-foreground">Apprenants assignés</p>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="subscription" size={18} color="#22c55e" />
              <span className="text-sm font-medium text-muted-foreground">
                Abonnés
              </span>
            </div>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expiredSubscriptions} expiré{stats.expiredSubscriptions > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Practice Sessions & Score */}
      <div className="w-full lg:w-1/2 border border-border bg-white p-4 rounded-2xl">
        <h3 className="text-xl mb-2">Pratiques</h3>
        <div className="flex flex-row">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="chartView" size={16} color="#a855f7" />
              <span className="text-sm font-medium text-muted-foreground">
                Sessions
              </span>
            </div>
            <div className="text-2xl font-bold">
              {stats.totalPracticeSessions}
            </div>
            <p className="text-xs text-muted-foreground">
              Moyenne: {stats.averageScore}%
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={16} color="#f97316" />
              <span className="text-sm font-medium text-muted-foreground">
                Temps total
              </span>
            </div>
            <div className="text-2xl font-bold">
              {formatTime(stats.totalPracticeTime)}
            </div>
            <p className="text-xs text-muted-foreground">De pratique</p>
          </div>
        </div>
      </div>
    </div>
  );
}
