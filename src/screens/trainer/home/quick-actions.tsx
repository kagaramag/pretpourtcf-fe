"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/icons";
import Link from "next/link";
import { TrainerPerformanceByType } from "@/types";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import {
  PRACTICE_CATEGORIES,
  PracticeCategoryCard,
} from "@/components/molecules/practice-category";

interface QuickActionsProps {
  performanceByType: TrainerPerformanceByType[];
}

const practiceTypeLabels: Record<string, string> = {
  listening: "Compréhension orale",
  reading: "Compréhension écrite",
  writing: "Expression écrite",
  speaking: "Expression orale",
};

const practiceTypeColors: Record<string, string> = {
  listening: "bg-blue-500",
  reading: "bg-green-500",
  writing: "bg-purple-500",
  speaking: "bg-orange-500",
};

export function QuickActions({ performanceByType }: QuickActionsProps) {
  const { trackClick } = useActivityTracker();
  return (
    <div className="space-y-3">
      {/* Exams */}
      <div className="">
        {/* <h3 className="text-lg mb-3">Simulations des exams</h3> */}
        <div className="grid grid-cols-1 gap-3">
          {PRACTICE_CATEGORIES.map((category) => (
            <PracticeCategoryCard
              key={category.slug}
              category={category}
              variant="compact"
              href={`/trainer/pratiques/${category.slug}`}
              onClick={() => trackClick({ action: "link_clicked", label: category.label })}
            />
          ))}
        </div>
      </div>
      {/* Quick Action Buttons */}
      <div className="border border-border bg-white p-4 rounded-2xl">
        <h3 className="text-lg mb-3">Actions rapides</h3>
        <div className="flex flex-col gap-2">
          <Link href="/trainer/apprenants" onClick={() => trackClick({ action: "link_clicked", label: "Voir mes apprenants" })}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="user" size={16} />
              Voir mes apprenants
            </Button>
          </Link>
          <Link href="/trainer/apprenants?invite=true" onClick={() => trackClick({ action: "link_clicked", label: "Inviter un apprenant" })}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="plus" size={16} />
              Inviter un apprenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Performance by Type */}
      {performanceByType.length > 0 && (
        <div className="border border-border bg-white p-4 rounded-2xl">
          <h3 className="text-lg mb-3">Performance par type</h3>
          <div className="space-y-3">
            {performanceByType.map((perf) => (
              <div key={perf.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {practiceTypeLabels[perf.type] || perf.type}
                  </span>
                  <span className="font-medium">{perf.averageScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${practiceTypeColors[perf.type] || "bg-primary"}`}
                    style={{ width: `${Math.min(perf.averageScore, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {perf.totalSessions} session
                  {perf.totalSessions > 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
