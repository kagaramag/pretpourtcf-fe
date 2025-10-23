"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Loader2,
  X,
  Trash2,
  BookOpen,
  Clock,
  FileQuestion,
  Eye,
} from "lucide-react";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import { PracticeFormDialog } from "@/components/practices/practice-form-dialog";
import { formatDate } from "@/lib/date-utils";
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
    limit: 10,
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
    router.push(
      `/dashboard/practices${queryString ? `?${queryString}` : ""}`,
      {
        scroll: false,
      }
    );
  }, [searchQuery, typeFilter, levelFilter, statusFilter]);

  useEffect(() => {
    fetchPractices();
  }, [
    pagination.page,
    debouncedSearch,
    typeFilter,
    levelFilter,
    statusFilter,
  ]);

  const fetchPractices = async () => {
    try {
      setIsLoading(true);
      const response = await practiceService.getAllPractices({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        type: (typeFilter || undefined) as any,
        level: (levelFilter || undefined) as any,
        isActive:
          statusFilter !== ""
            ? statusFilter === "true"
            : undefined,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Practice Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage TCF practice exams and questions
          </p>
        </div>
        {canCreate && (
          <Button
            className="gap-2"
            onClick={() => {
              setSelectedPractice(null);
              setFormMode("create");
              setPracticeFormDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Practice
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Practices</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search practices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <Select
                value={typeFilter || undefined}
                onValueChange={(value) => setTypeFilter(value || "")}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={levelFilter || undefined}
                onValueChange={(value) => setLevelFilter(value || "")}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="B1">B1</SelectItem>
                  <SelectItem value="B2">B2</SelectItem>
                  <SelectItem value="C1">C1</SelectItem>
                  <SelectItem value="C2">C2</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter || undefined}
                onValueChange={(value) => setStatusFilter(value || "")}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className=" max-w-[200px]">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading practices...
                    </p>
                  </TableCell>
                </TableRow>
              ) : practices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No practices found
                  </TableCell>
                </TableRow>
              ) : (
                practices.map((practice) => (
                  <TableRow key={practice._id}>
                    <TableCell className="max-w-[200px]">
                      <div className="gap-2 truncate">
                        <Link href={`/dashboard/practices/${practice._id}`} className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium ">{practice.title}</span>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(practice.type)}>
                        {practice.type.charAt(0).toUpperCase() +
                          practice.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {practice.level ? (
                        <Badge className={getLevelColor(practice.level)}>
                          {practice.level}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {practice.durationMinutes} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <FileQuestion className="h-3 w-3 text-muted-foreground" />
                        {practice.totalQuestions}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          practice.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {practice.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              router.push(`/dashboard/practices/${practice._id}`);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canUpdate && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedPractice(practice);
                                  setFormMode("edit");
                                  setPracticeFormDialog(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Practice
                              </DropdownMenuItem>
                            </>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeletePractice(practice)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Practice
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!isLoading && practices.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} practices
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
        </CardContent>
      </Card>

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
