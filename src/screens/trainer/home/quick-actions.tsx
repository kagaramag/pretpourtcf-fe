"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/icons";
import Link from "next/link";
import { TrainerPerformanceByType } from "@/types";

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
  return (
    <div className="space-y-3">
      {/* Exams */}
      <div className="">
        {/* <h3 className="text-lg mb-3">Simulations des exams</h3> */}
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              href: "/trainer/pratiques/co",
              icon: "listen" as const,
              title: "Compréhension orale",
              description: "Tendez l'oreille — chaque son compte",
              color: "bg-primary",
              iconBg: "bg-primary/70",
              iconColor: "text-white",
              border: "border-primary/30",
            },
            {
              href: "/trainer/pratiques/ce",
              icon: "read" as const,
              title: "Compréhension écrite",
              description: "Décodez les mots, maîtrisez le sens",
              color: "bg-secondary",
              iconBg: "bg-secondary/70",
              iconColor: "text-white",
              border: "border-secondary/30",
            },
            {
              href: "/trainer/pratiques/eo",
              icon: "speak" as const,
              title: "Expression orale",
              description: "Prenez la parole avec assurance",
              color: "bg-accent",
              iconBg: "bg-accent",
              iconColor: "text-white",
              border: "border-accent/30",
            },
            {
              href: "/trainer/pratiques/ee",
              icon: "write" as const,
              title: "Expression écrite",
              description: "Transformez vos idées en mots justes",
              color: "bg-orange-400",
              iconBg: "bg-orange-500",
              iconColor: "text-white",
              border: "border-orange-200",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border ${item.border} p-4 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                  >
                    <Icon name={item.icon} size={16} color={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 text-sm">
                      {item.title}
                    </h3>
                  </div>
                  <div className="shrink-0 mt-1 transition-transform group-hover:translate-x-1">
                    <Icon
                      name="arrowRight"
                      size={16}
                      className="text-gray-400"
                    />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full ${item.color}`}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Quick Action Buttons */}
      <div className="border border-border bg-white p-4 rounded-2xl">
        <h3 className="text-lg mb-3">Actions rapides</h3>
        <div className="flex flex-col gap-2">
          <Link href="/trainer/apprenants">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icon name="user" size={16} />
              Voir mes apprenants
            </Button>
          </Link>
          <Link href="/trainer/apprenants?invite=true">
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
