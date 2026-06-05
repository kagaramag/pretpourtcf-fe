"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/icons";
import { TrainerLearnerAttention } from "@/types";
import Link from "next/link";

interface LearnersAttentionProps {
  learners: TrainerLearnerAttention[];
}

const reasonLabels: Record<string, { label: string; variant: "destructive" | "secondary" | "outline" }> = {
  no_activity_30_days: { label: "Inactif", variant: "destructive" },
  low_score: { label: "Score faible", variant: "destructive" },
  subscription_expiring: { label: "Abo. expire bientôt", variant: "secondary" },
  subscription_expired: { label: "Abo. expiré", variant: "destructive" },
  no_subscription: { label: "Pas d'abo.", variant: "outline" },
};

export function LearnersAttention({ learners }: LearnersAttentionProps) {
  return (
    <div className="border border-border bg-white p-4 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="info" size={20} color="#f59e0b" />
        <h3 className="text-lg">Apprenants à suivre</h3>
      </div>
      <div className="space-y-3">
        {learners.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Tous vos apprenants sont en bonne voie
          </p>
        ) : (
          learners.map((learner) => (
            <Link
              key={learner.id}
              href={`/trainer/apprenants/${learner.id}`}
              className="flex items-center gap-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 shrink-0">
                <span className="text-xs font-bold text-amber-700">
                  {learner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{learner.name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {learner.reasons.map((reason) => {
                    const config = reasonLabels[reason];
                    if (!config) return null;
                    return (
                      <Badge key={reason} variant={config.variant} className="text-[10px] px-1.5 py-0">
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {learner.averageScore !== null && (
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {Math.round(learner.averageScore)}%
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
