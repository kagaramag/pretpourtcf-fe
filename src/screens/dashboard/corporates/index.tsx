"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import { Search, Ellipsis, Loading, Close } from "@/icons";
import { corporateService } from "@/services/corporate";
import { Corporate } from "@/types";
import { toast } from "sonner";
import { CorporateFormDialog } from "@/components/corporates/corporate-form-dialog";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";

function CorporatesScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(
    null
  );

  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => corporateService.deleteCorporate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporates"] });
      toast.success("Corporate deleted successfully");
      fetchCorporates();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete corporate"
      );
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);

    const queryString = params.toString();
    router.push(
      `/dashboard/corporates${queryString ? `?${queryString}` : ""}`,
      { scroll: false }
    );
  }, [searchQuery]);

  useEffect(() => {
    fetchCorporates();
  }, [pagination.page, debouncedSearch]);

  const fetchCorporates = async () => {
    try {
      setIsLoading(true);
      const response = await corporateService.getAllCorporates({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
      });

      if (response.data) {
        setCorporates(response.data.corporates);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch corporates:", error);
      toast.error("Failed to load corporates");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchCorporates();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery;

  const columns: Column<Corporate>[] = [
    {
      key: "name",
      header: "Name",
      render: (corporate) => (
        <Link
          href={`/dashboard/corporates/${corporate._id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none text-left"
        >
          {corporate.name}
        </Link>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (corporate) => <>{corporate.location}</>,
    },
    {
      key: "members",
      header: "Members",
      render: (corporate) => (
        <div className="text-sm">
          <span>{corporate.trainerCount || 0} trainers</span>
          <span className="mx-1 text-gray-300">|</span>
          <span>{corporate.learnerCount || 0} learners</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (corporate) => (
        <Badge
          className={
            corporate.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {corporate.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (corporate) => <>{formatDate(corporate.createdAt)}</>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (corporate) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Menu
            trigger={
              <Button variant="ghost" size="icon" type="button">
                <Ellipsis className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                type: "link",
                label: "View",
                to: `/dashboard/corporates/${corporate._id}`,
                icon: "open",
              },
              {
                type: "button",
                label: "Edit",
                onClick: () => {
                  setSelectedCorporate(corporate);
                  setFormMode("edit");
                  setFormDialog(true);
                },
                icon: "edit",
              },
              {
                type: "button",
                label: "Delete",
                onClick: () => deleteMutation.mutate(corporate._id),
                icon: "dustbin",
                variant: "danger",
                disabled: deleteMutation.isPending,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Corporates</h1>
        <Button
          onClick={() => {
            setSelectedCorporate(null);
            setFormMode("create");
            setFormDialog(true);
          }}
        >
          Create
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search corporates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} icon="close">
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div>
        <Table
          data={corporates}
          columns={columns}
          keyExtractor={(corporate) => corporate._id}
          isLoading={isLoading}
          emptyMessage="No corporates found"
        />

        {/* Pagination */}
        {!isLoading && corporates.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} corporates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <CorporateFormDialog
        open={formDialog}
        onOpenChange={setFormDialog}
        mode={formMode}
        corporate={formMode === "edit" ? selectedCorporate : undefined}
        onSuccess={fetchCorporates}
      />
    </div>
  );
}

export function CorporatesScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CorporatesScreenContent />
    </Suspense>
  );
}
