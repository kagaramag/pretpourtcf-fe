"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  FileQuestion,
  Users,
  CreditCard,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function DashboardOverview() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const mainStats = [
    {
      title: "Total Practices",
      value: stats.totalPractices.toLocaleString(),
      change: "Available for students",
      icon: BookOpen,
    },
    {
      title: "Total Questions",
      value: stats.totalQuestions.toLocaleString(),
      change: "Across all practices",
      icon: FileQuestion,
    },
    {
      title: "Active Subscriptions",
      value: `${stats.subscriptions.active} / ${stats.subscriptions.total}`,
      change: `${stats.subscriptions.total - stats.subscriptions.active} inactive`,
      icon: CreditCard,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "Registered users",
      icon: Users,
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform performance
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="flex gap-3 flex-col md:flex-row lg:flex-row">
        <div className="flex-1 flex gap-3 flex-col">
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {mainStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div>
            {/* Practice Session Insights Card */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Practice Session Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                  );
                })}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {stats.practiceSessionInsights.averageScore}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="w-full  md:max-w-[350px] lg:max-w-[420px]">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No users registered yet
                  </p>
                ) : (
                  stats.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
      <div className="flex gap-3">
        {/* Left Section */}
        <div className="flex-1 flex gap-3 flex-col">
          {/* Main Stats Grid - 2 columns */}
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Practice Session Insights Card */}
          <div>
            <Card className="col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Recent Users */}
        <div className="w-[420px]">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
