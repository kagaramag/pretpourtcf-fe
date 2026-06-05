"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import {
  Plus,
  Search,
  MoreVertical,
  Loader2,
  X,
  Clock,
  FileQuestion,
} from "lucide-react";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import { PracticeFormDialog } from "@/components/practices/practice-form-dialog";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS } from "@/config/permissions";
import Link from "next/link";

function PracticesScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(PERMISSIONS.PRACTICES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PRACTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRACTICES_DELETE);

  // Get filters from URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [levelFilter, setLevelFilter] = useState(
    searchParams.get("level") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("isActive") || ""
  );

  // Dialogs
  const [practiceFormDialog, setPracticeFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(
    null
  );

  const [practices, setPractices] = useState<Practice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 40,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Delete practice mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => practiceService.deletePractice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practices"] });
      toast.success("Practice deleted successfully");
      fetchPractices();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete practice");
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (typeFilter) params.set("type", typeFilter);
    if (levelFilter) params.set("level", levelFilter);
    if (statusFilter) params.set("isActive", statusFilter);

    const queryString = params.toString();
    router.push(`/dashboard/practices${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchQuery, typeFilter, levelFilter, statusFilter]);

  useEffect(() => {
    fetchPractices();
  }, [pagination.page, debouncedSearch, typeFilter, levelFilter, statusFilter]);

  const fetchPractices = async () => {
    try {
      setIsLoading(true);
      const response = await practiceService.getAllPractices({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        type: (typeFilter || undefined) as any,
        level: (levelFilter || undefined) as any,
        isActive: statusFilter !== "" ? statusFilter === "true" : undefined,
      });

      if (response.data) {
        setPractices(response.data.practices);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch practices:", error);
      toast.error("Failed to load practices");
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setLevelFilter("");
    setStatusFilter("");
  };

  const hasActiveFilters =
    searchQuery || typeFilter || levelFilter || statusFilter;

  const getTypeColor = (type: string) => {
    const colors = {
      listening: "bg-blue-100 text-blue-800",
      reading: "bg-green-100 text-green-800",
      writing: "bg-purple-100 text-purple-800",
      speaking: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || colors.listening;
  };

  const getLevelColor = (level?: string) => {
    if (!level) return "bg-gray-100 text-gray-800";
    const colors = {
      A1: "bg-emerald-100 text-emerald-800",
      A2: "bg-teal-100 text-teal-800",
      B1: "bg-blue-100 text-blue-800",
      B2: "bg-indigo-100 text-indigo-800",
      C1: "bg-purple-100 text-purple-800",
      C2: "bg-pink-100 text-pink-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleDeletePractice = (practice: Practice) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${practice.title}"? This will also delete all associated questions.`
      )
    ) {
      deleteMutation.mutate(practice._id);
    }
  };

  const columns: Column<Practice>[] = [
    {
      key: "title",
      header: "Title",
      render: (practice) => (
        <div className="gap-2 truncate">
          <Link
            href={`/dashboard/practices/${practice._id}`}
            className="flex items-center gap-2"
          >
            <span>{practice.title}</span>
          </Link>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (practice) => (
        <Badge className={getTypeColor(practice.type)}>
          {practice.type.charAt(0).toUpperCase() + practice.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (practice) =>
        practice.level ? (
          <Badge className={getLevelColor(practice.level)}>
            {practice.level}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "durationMinutes",
      header: "Duration",
      render: (practice) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {practice.durationMinutes} min
        </div>
      ),
    },
    {
      key: "totalQuestions",
      header: "Questions",
      render: (practice) => (
        <div className="flex items-center gap-1 text-sm">
          <FileQuestion className="h-3 w-3 text-muted-foreground" />
          {practice.totalQuestions}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (practice) => (
        <Badge
          className={
            practice.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {practice.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (practice) => (
        <Menu
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              type: "link",
              label: "View Details",
              to: `/dashboard/practices/${practice._id}`,
              icon: "open",
            },
            ...(canUpdate
              ? [
                  {
                    type: "button" as const,
                    label: "Edit Practice",
                    onClick: () => {
                      setSelectedPractice(practice);
                      setFormMode("edit");
                      setPracticeFormDialog(true);
                    },
                    icon: "edit" as const,
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    type: "button" as const,
                    label: "Delete Practice",
                    onClick: () => handleDeletePractice(practice),
                    icon: "dustbin" as const,
                    variant: "danger" as const,
                    disabled: deleteMutation.isPending,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Practices</h1>
      </div>

      <div className="space-y-1 flex items-center gap-2 flex-wrap">
        {/* Filters */}
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Input
              placeholder="Search practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={typeFilter || ""}
            onChange={(value) => setTypeFilter(value || "")}
            options={[
              { value: "listening", label: "Listening" },
              { value: "reading", label: "Reading" },
              { value: "writing", label: "Writing" },
              { value: "speaking", label: "Speaking" },
            ]}
            placeholder="All Types"
            className="w-[160px]"
          />

          <Select
            value={levelFilter || ""}
            onChange={(value) => setLevelFilter(value || "")}
            options={[
              { value: "A1", label: "A1" },
              { value: "A2", label: "A2" },
              { value: "B1", label: "B1" },
              { value: "B2", label: "B2" },
              { value: "C1", label: "C1" },
              { value: "C2", label: "C2" },
            ]}
            placeholder="All Levels"
            className="w-[160px]"
          />

          <Select
            value={statusFilter || ""}
            onChange={(value) => setStatusFilter(value || "")}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
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

        {canCreate && (
          <Button
            onClick={() => {
              setSelectedPractice(null);
              setFormMode("create");
              setPracticeFormDialog(true);
            }}
            icon="plus"
            iconOnly
          />
        )}
      </div>

      <Table
        data={practices}
        columns={columns}
        keyExtractor={(p) => p._id}
        isLoading={isLoading}
        emptyMessage="No practices found"
      />

      {/* Pagination */}
      {!isLoading && practices.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} practices
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

      {/* Practice Form Dialog */}
      <PracticeFormDialog
        open={practiceFormDialog}
        onOpenChange={setPracticeFormDialog}
        mode={formMode}
        practice={formMode === "edit" ? selectedPractice : undefined}
        onSuccess={fetchPractices}
      />
    </div>
  );
}

export function PracticesScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PracticesScreenContent />
    </Suspense>
  );
}
