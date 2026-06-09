"use client";

import { Card } from "@/components/ui/card";
import {
  BookOpen,
  FileQuestion,
  Users,
  CreditCard,
  Activity,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  Trophy,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { usePlansStats } from "@/hooks/usePlans";
import { useStreaksStats } from "@/hooks/useStreaks";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { LiveTracker } from "@/components/organisms/live-tracker";

export function DashboardOverview() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const { data: plansData, isLoading: isLoadingPlans } = usePlansStats();
  const { data: streaksData, isLoading: isLoadingStreaks } = useStreaksStats();

  if (isLoading || isLoadingPlans || isLoadingStreaks) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <div className="p-6 pt-6">
            <p className="text-center text-destructive">
              Failed to load dashboard data. Please try again.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Practices group stats
  const practiceStats = [
    {
      title: "Practices",
      value: stats.totalPractices.toLocaleString(),
      change: "Available for learners",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "Questions",
      value: stats.totalQuestions.toLocaleString(),
      change: "Across all practices",
      icon: FileQuestion,
      color: "text-blue-500",
    },
  ];

  // Subscriptions & Plans group stats
  const subscriptionStats = plansData?.stats
    ? [
        {
          title: "Active Subscriptions",
          value: stats.subscriptions.active.toLocaleString(),
          change: `${stats.subscriptions.total} total`,
          icon: CreditCard,
          color: "text-purple-500",
        },
        {
          title: "Total Plans",
          value: plansData.stats.total,
          change: `${plansData.stats.active} active`,
          icon: Crown,
          color: "text-purple-500",
        },
        {
          title: "Premium Plans",
          value: plansData.stats.premium,
          change: "Premium subscriptions",
          icon: Crown,
          color: "text-purple-500",
        },
      ]
    : [];

  // Streaks group stats
  const streakStatsDisplay = streaksData?.stats
    ? [
        {
          title: "Total Streaks",
          value: streaksData.stats.total,
          change: `${streaksData.stats.active} active`,
          icon: Flame,
          color: "text-orange-500",
        },
        {
          title: "Completed",
          value: streaksData.stats.completed,
          change: "Successfully finished",
          icon: Trophy,
          color: "text-orange-500",
        },
      ]
    : [];

  // Additional stats
  const additionalStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "Registered users",
      icon: Users,
      color: "text-muted-foreground",
    },
  ];

  const sessionStats = [
    {
      label: "Total Sessions",
      value: stats.practiceSessionInsights.total,
      icon: Activity,
    },
    {
      label: "Completed",
      value: stats.practiceSessionInsights.completed,
      icon: CheckCircle2,
    },
    {
      label: "In Progress",
      value: stats.practiceSessionInsights.inProgress,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-3xl tracking-tight">Dashboard</h2>
      </div>

      {/* Overview Cards - Grouped by Category */}
      <div className="flex gap-3 flex-col md:flex-row lg:flex-row">
        <div className="w-full md:max-w-[350px] lg:max-w-[420px] space-y-4">
          <div className="p-4 border border-border bg-white rounded-2xl">
            <LiveTracker />
          </div>
        </div>
        <div className="flex-1 flex gap-3 flex-col">
          {/* Grouped Stats Cards */}
          <div className="flex lg:flex-row flex-col gap-2">
            {/* Practices Group */}
            {practiceStats.length > 0 && (
              <div className="w-full lg:w-5/12 border border-border  bg-white p-4 rounded-2xl">
                <h3 className="text-xl">Practices</h3>
                <div className="space-y-3 flex flex-row">
                  {practiceStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.title} className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {stat.title}
                            </span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.change}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Stats - Total Users */}
            {additionalStats.length > 0 && (
              <div className="w-full lg:w-2/12 grid gap-3 md:grid-cols-1 lg:grid-cols-3 border border-border bg-white p-4 rounded-2xl">
                {additionalStats.map((stat) => {
                  return (
                    <div key={stat.title}>
                      <h3 className="text-sm font-medium">Users</h3>
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Streaks Group */}
            {streakStatsDisplay.length > 0 && (
              <div className="w-full lg:w-5/12 border border-border  bg-white p-4 rounded-2xl">
                <h3 className="text-xl">Streaks</h3>
                <div className="space-y-3 flex flex-row">
                  {streakStatsDisplay.map((stat) => {
                    return (
                      <div key={stat.title} className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {stat.title}
                            </span>
                          </div>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                          {stat.change}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex lg:flex-row flex-col gap-2">
            <div className="flex-1  space-y-2">
              <div className="flex flex-row w-full gap-3 p-4 border border-border bg-white rounded-2xl">
                {/* Subscriptions & Plans Group */}
                {subscriptionStats.length > 0 && (
                  <div className="flex-1">
                    <h3>Subscriptions & Plans</h3>
                    <div className="space-y-3 flex flex-col lg:flex-row">
                      {subscriptionStats.map((stat) => {
                        return (
                          <div
                            key={stat.title}
                            className="space-y-1 flex-1 py-4 rounded-2xl"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {stat.title}
                                </span>
                              </div>
                            </div>
                            <div className="text-2xl">
                              {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {stat.change}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="">
                {/* Practice Session Insights Card */}
                <div className="col-span-3 p-4 border border-border bg-white rounded-2xl">
                  <h5>Practice sessions</h5>
                  <div className="space-y-2 divide-y divide-divide mt-2">
                    {sessionStats.map((stat) => {
                      return (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between"
                        >
                          <div className="text-sm flex items-center gap-2">
                            {stat.label}
                          </div>
                          <span className="text-lg">
                            {stat.value}
                          </span>
                        </div>
                      );
                    })}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm flex items-center gap-2">
                          Average Score
                        </div>
                        <span className="text-lg text-primary">
                          {stats.practiceSessionInsights.averageScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-4 p-4 border border-border bg-white rounded-2xl lg:w-[340px] ">
              <h4 className="mb-4">Recent users</h4>
              <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
                {stats.recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users registered yet
                  </p>
                ) : (
                  stats.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center py-2">
                      <div className="space-y-1 flex-1">
                        <div className="text-sm leading-none">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {user.email}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      {/* Main Layout: Left section + Right sidebar */}
      <div className="flex gap-3 flex-col md:flex-row lg:flex-row">
        {/* Left Section */}
        <div className="flex-1 flex gap-3 flex-col">
          {/* Grouped Stats Cards - 3 columns */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Practices Group Skeleton */}
            <Card className="border-blue-200 dark:border-blue-900">
              <div className="p-6">
                <Skeleton className="h-5 w-20" />
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Subscriptions & Plans Group Skeleton */}
            <div className="border-purple-200 dark:border-purple-900">
              <div className="p-6">
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="p-6 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>

            {/* Streaks Group Skeleton */}
            <div className="border-orange-200 dark:border-orange-900">
              <div className="p-6">
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="p-6 space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats - Total Users Skeleton */}
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
            <Card>
              <div className="p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <div className="p-6">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </Card>
          </div>

          {/* Practice Session Insights Card */}
          <div>
            <Card className="col-span-3">
              <div className="p-6">
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ))}
                {/* Average Score */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Recent Users */}
        <div className="w-full md:max-w-[350px] lg:max-w-[420px]">
          <Card className="col-span-4">
            <div className="p-6">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="ml-4 space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
