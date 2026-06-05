"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-64" />

      {/* Stats Cards */}
      <div className="flex lg:flex-row flex-col gap-3">
        <div className="w-full lg:w-1/2 border border-border bg-white p-4 rounded-2xl">
          <Skeleton className="h-6 w-28 mb-3" />
          <div className="flex flex-row">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 border border-border bg-white p-4 rounded-2xl">
          <Skeleton className="h-6 w-28 mb-3" />
          <div className="flex flex-row">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-3 flex-col lg:flex-row">
        <div className="flex-1 space-y-3">
          {/* Recent Activity */}
          <div className="border border-border bg-white p-4 rounded-2xl">
            <Skeleton className="h-6 w-36 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>

          {/* Learners Attention */}
          <div className="border border-border bg-white p-4 rounded-2xl">
            <Skeleton className="h-6 w-44 mb-4" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:max-w-[320px] space-y-3">
          <div className="border border-border bg-white p-4 rounded-2xl">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="border border-border bg-white p-4 rounded-2xl">
            <Skeleton className="h-6 w-40 mb-3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 mb-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
