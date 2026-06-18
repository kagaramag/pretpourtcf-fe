"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Loading, DollarSign, ReceiptText, Tag } from "@/icons";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";
import { date } from "@/utils";
import Link from "next/link";
import { PageWrapper } from "@/components/molecules/page-wrapper";

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
      admin_offer: "Admin (Gratuit)",
      admin_manual: "Admin (Manuel)",
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

  const columns: Column<(typeof transactions)[number]>[] = [
    {
      key: "client",
      header: "Client",
      render: (transaction) =>
        transaction.user ? (
          <div>
            <Link
              className="text-blue-500 hover:underline"
              href={`$/dashboard/users/${transaction.user._id}`}
            >
              {transaction.user.first_name} {transaction.user.last_name}
            </Link>
          </div>
        ) : (
          <span className="text-gray-600">N/A</span>
        ),
    },
    {
      key: "plan",
      header: "Plan",
      width: "w-40",
      render: (transaction) => (
        <div className="flex items-center gap-2">{transaction.plan.name}</div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "w-28",
      render: (transaction) => (
        <div className="flex items-center gap-1 truncate">
          <div>{formatAmount(transaction.amount, transaction.currency)}</div>
          {transaction.promo_code && transaction.original_amount && (
            <div className="text-xs text-gray-600 line-through">
              {formatAmount(transaction.original_amount, transaction.currency)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      width: "w-28",
      render: (transaction) => (
        <>{getPaymentMethodLabel(transaction.payment_method)}</>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-24",
      render: (transaction) => (
        <Badge className={getStatusColor(transaction.status)}>
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "refid",
      header: "Ref ID",
      width: "w-56",
      render: (transaction) => (
        <div className="font-mono text-xs truncate">{transaction.refid}</div>
      ),
    },
    // {
    //   key: "kpay_tid",
    //   header: "Kpay TID",
    //   width: "50px",
    //   render: (transaction) => (
    //     <div className="font-mono text-xs text-gray-600">
    //       {transaction.kpay_tid || "—"}
    //     </div>
    //   ),
    // },
    {
      key: "created_at",
      header: "Date",
      align: "right",
      width: "w-44",
      render: (transaction) => (
        <div>
          {date(transaction.created_at, false, "DD/MMM hh:mmA")}
          {/* {formatDate(transaction.created_at)} */}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Transactions">
      <div className="space-y-2">
        <div className="space-y-2 flex items-start gap-2">
          <div className="relative w-64">
            <Input
              placeholder="Search by client name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={statusFilter || ""}
              onChange={(value) => setStatusFilter(value || "")}
              options={[
                { value: "successful", label: "Successful" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
              placeholder="All Status"
              className="w-[160px]"
            />

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <div>
          <Table
            data={transactions}
            columns={columns}
            keyExtractor={(transaction) => transaction._id}
            isLoading={isLoading}
            emptyMessage="No transactions found"
            striped
          />

          {/* Pagination */}
          {!isLoading && transactions.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="text-sm text-gray-600">
                Showing {(paginationData.page - 1) * paginationData.limit + 1}{" "}
                to{" "}
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
    </PageWrapper>
  );
}

export default function TransactionsScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      }
    >
      <TransactionsScreenContent />
    </Suspense>
  );
}
