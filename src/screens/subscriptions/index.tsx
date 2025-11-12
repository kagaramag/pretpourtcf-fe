"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  X,
  Calendar,
  Clock,
  User,
  CreditCard,
} from "lucide-react";
import { subscriptionService } from "@/services/subscription";
import { toast } from "sonner";

function SubscriptionsScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get filters from URL
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

  // Fetch subscriptions
  const {
    data,
    isLoading,
    error,
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

  const subscriptions = data?.subscriptions || [];
  const paginationData = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Update URL when filters change
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

  if (error) {
    toast.error("Failed to load subscriptions");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all user subscriptions
          </p>
        </div>
      </div>

      <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Subscriptions</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={statusFilter || undefined}
                onValueChange={(value) => setStatusFilter(value || "")}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

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
          </div>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading subscriptions...
                    </p>
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {subscription.user.first_name}{" "}
                            {subscription.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {subscription.plan.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${subscription.plan.price}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanTypeColor(subscription.plan.type)}>
                        {subscription.plan.type.charAt(0).toUpperCase() +
                          subscription.plan.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(subscription.start_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(subscription.end_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {subscription.days_remaining > 0
                          ? `${subscription.days_remaining} days`
                          : "Expired"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && subscriptions.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={!paginationData.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={!paginationData.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SubscriptionsScreenContent />
    </Suspense>
  );
}
