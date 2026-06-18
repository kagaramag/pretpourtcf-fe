"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/icons";
import { TrainerRecentActivity } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface RecentActivityProps {
  activities: TrainerRecentActivity[];
}

const practiceTypeLabels: Record<string, string> = {
  listening: "CO",
  reading: "CE",
  writing: "EE",
  speaking: "EO",
};

const gradeConfig: Record<string, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  excellent: { label: "Excellent", variant: "success" },
  good: { label: "Bien", variant: "secondary" },
  needs_improvement: { label: "À améliorer", variant: "destructive" },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="border border-border bg-white p-4 rounded-2xl">
      <h3 className="text-lg mb-4">Activité récente</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">
            Aucune activité récente
          </p>
        ) : (
          activities.map((activity) => {
            const grade = gradeConfig[activity.grade];
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Icon name="play" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.learner.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {activity.practice.title}
                    {activity.practice.level && ` · ${activity.practice.level}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={grade.variant}>{activity.percentageScore}%</Badge>
                  <span className="text-xs text-gray-600 hidden md:block">
                    {formatDistanceToNow(new Date(activity.completedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
