"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Search, X } from "lucide-react";
import { subscriptionService } from "@/services/subscription";
import { toast } from "sonner";

type Subscription = any;

export function SubscriptionsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const {
    data: subsData,
    isLoading: subsLoading,
    error: subsError,
  } = useQuery({
    queryKey: [
      "subscriptions",
      pagination.page,
      pagination.limit,
      debouncedSearch,
      statusFilter,
    ],
    queryFn: () =>
      subscriptionService.getAllSubscriptions({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  });

  const subscriptions = subsData?.subscriptions || [];
  const paginationData = subsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter) params.set("status", statusFilter);

    const queryString = params.toString();
    router.push(
      `/dashboard/subscriptions${queryString ? `?${queryString}` : ""}`,
      {
        scroll: false,
      }
    );
  }, [searchQuery, statusFilter, router]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter;

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPlanTypeColor = (type: string) => {
    const colors = {
      trial: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const subscriptionColumns: Column<Subscription>[] = [
    {
      key: "user",
      header: "User",
      render: (subscription) => (
        <div className="flex items-center gap-2">
          {subscription.user.first_name} {subscription.user.last_name}
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (subscription) => (
        <div>
          {subscription.plan.name} ({subscription.plan.price_rwf?.toLocaleString()} RWF)
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (subscription) => (
        <Badge className={getStatusColor(subscription.status)}>
          {subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (subscription) => (
        <div className="flex items-center gap-1 text-sm">
          {formatDate(subscription.start_date)}
        </div>
      ),
    },
    {
      key: "end_date",
      header: "End Date",
      render: (subscription) => (
        <div className="flex items-center gap-1 text-sm">
          {formatDate(subscription.end_date)}
        </div>
      ),
    },
    {
      key: "days_remaining",
      header: "Days Remaining",
      render: (subscription) => (
        <div className="flex items-center gap-1 text-sm">
          {subscription.days_remaining > 0
            ? `${subscription.days_remaining} days`
            : "Expired"}
        </div>
      ),
    },
  ];

  if (subsError) {
    toast.error("Failed to load subscriptions");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter || ""}
          onChange={(value) => setStatusFilter(value || "")}
          options={[
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "cancelled", label: "Cancelled" },
          ]}
          placeholder="All Status"
          className="w-[160px]"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <div>
        <Table
          data={subscriptions}
          columns={subscriptionColumns}
          keyExtractor={(subscription) => subscription.id}
          isLoading={subsLoading}
          emptyMessage="No subscriptions found"
        />

        {!subsLoading && subscriptions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {(paginationData.page - 1) * paginationData.limit + 1}{" "}
              to{" "}
              {Math.min(
                paginationData.page * paginationData.limit,
                paginationData.total
              )}{" "}
              of {paginationData.total} subscriptions
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                disabled={!paginationData.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                disabled={!paginationData.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
