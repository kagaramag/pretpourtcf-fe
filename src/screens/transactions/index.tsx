"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardTitle } from "@/components/ui/card";
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
  User,
  CreditCard,
  DollarSign,
  Receipt,
  Tag,
} from "lucide-react";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";

function TransactionsScreenContent() {
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

  // Fetch transactions
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "all-transactions",
      pagination.page,
      pagination.limit,
      debouncedSearch,
      statusFilter,
    ],
    queryFn: () =>
      paymentService.getAllTransactions({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }),
  });

  const transactions = data?.transactions || [];
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
      `/dashboard/transactions${queryString ? `?${queryString}` : ""}`,
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
      successful: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      momo: "Mobile Money",
      cc: "Credit Card",
      // spenn: "Spenn",
    };
    return methods[method] || method.toUpperCase();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  if (error) {
    toast.error("Failed to load transactions");
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Transactions</h1>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
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
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
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
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Promo Code</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ref ID</TableHead>
              <TableHead>Kpay TID</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-muted-foreground">
                    Loading transactions...
                  </p>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {transaction.user ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {transaction.user.first_name}{" "}
                            {transaction.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.user.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {transaction.plan.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.plan.type.charAt(0).toUpperCase() +
                            transaction.plan.type.slice(1)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {formatAmount(
                            transaction.amount,
                            transaction.currency
                          )}
                        </div>
                        {transaction.promo_code &&
                          transaction.original_amount && (
                            <div className="text-xs text-muted-foreground line-through">
                              {formatAmount(
                                transaction.original_amount,
                                transaction.currency
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.promo_code ? (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-green-600" />
                        <div>
                          <div className="font-mono text-xs font-medium text-green-700">
                            {transaction.promo_code}
                          </div>
                          {transaction.discount_percentage && (
                            <div className="text-xs text-green-600">
                              -{transaction.discount_percentage}%
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPaymentMethodLabel(transaction.payment_method)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <Receipt className="h-3 w-3 text-muted-foreground" />
                      {transaction.refid}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs text-muted-foreground">
                      {transaction.kpay_tid || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(transaction.created_at)}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && transactions.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {(paginationData.page - 1) * paginationData.limit + 1} to{" "}
              {Math.min(
                paginationData.page * paginationData.limit,
                paginationData.total
              )}{" "}
              of {paginationData.total} transactions
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
      </div>
    </div>
  );
}

export default function TransactionsScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TransactionsScreenContent />
    </Suspense>
  );
}
