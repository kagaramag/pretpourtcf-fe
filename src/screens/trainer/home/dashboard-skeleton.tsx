"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-64" />

      {/* Top row: Live tracker | Practices | Users | Streaks */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Live Tracker */}
        <div className="w-full lg:w-[320px] lg:row-span-3 border border-border bg-white p-4 rounded-2xl lg:min-h-[560px]">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5">
              <Skeleton className="h-7 w-7 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-3 w-20 shrink-0" />
            </div>
          ))}
          <Skeleton className="h-3 w-48 mt-3" />
        </div>

        {/* Right side content */}
        <div className="flex-1 space-y-3">
          {/* Stats row: Practices | Users | Streaks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Practices */}
            <div className="border border-border bg-white p-4 rounded-2xl">
              <Skeleton className="h-6 w-24 mb-3" />
              <div className="flex gap-6">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-10" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>

            {/* Users */}
            <div className="border border-border bg-white p-4 rounded-2xl">
              <Skeleton className="h-6 w-16 mb-3" />
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-3 w-24 mt-1.5" />
            </div>

            {/* Streaks */}
            <div className="border border-border bg-white p-4 rounded-2xl">
              <Skeleton className="h-6 w-20 mb-3" />
              <div className="flex gap-6">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          </div>

          {/* Middle row: Subscriptions & Plans | Recent users */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Subscriptions & Plans */}
            <div className="flex-1 border border-border bg-white p-4 rounded-2xl">
              <Skeleton className="h-6 w-44 mb-4" />
              <div className="flex gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent users */}
            <div className="w-full lg:w-[280px] border border-border bg-white p-4 rounded-2xl lg:row-span-2">
              <Skeleton className="h-6 w-28 mb-4" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                  <Skeleton className="h-3 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Practice sessions */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 border border-border bg-white p-4 rounded-2xl">
              <Skeleton className="h-6 w-36 mb-4" />
              {["Total Sessions", "Completed", "In Progress", "Average Score"].map(
                (_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                  >
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                )
              )}
            </div>
            {/* Spacer to align with recent users column above */}
            <div className="hidden lg:block w-[280px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
