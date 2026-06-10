"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import { Plus, Search, Ellipsis, Loading, Close } from "@/icons";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS } from "@/config/permissions";
import Link from "next/link";

function BlogScreenContent() {
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

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Delete blog mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
      fetchBlogs();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter) params.set("status", statusFilter);

    const queryString = params.toString();
    router.push(`/dashboard/blog${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, debouncedSearch, statusFilter]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getAllBlogs({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: (statusFilter || undefined) as any,
        sort: "-createdAt",
      });

      setBlogs(response.data.blogs);
      setPagination({
        ...pagination,
        ...response.data.pagination,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchQuery || statusFilter;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      published: "default",
      archived: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toLocaleUpperCase()}
      </Badge>
    );
  };

  const columns: Column<Blog>[] = [
    {
      key: "title",
      header: "Title",
      render: (blog) => (
        <div className="max-w-[450px]">
          <h4 className="text-lg/60 font-normal leading-none">{blog.title}</h4>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (blog) => (
        <span>
          {blog.written_by.first_name} {blog.written_by.last_name}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (blog) => getStatusBadge(blog.status),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (blog) => <span>{formatDate(blog.createdAt)}</span>,
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (blog) => (
        <span>{blog.published_at ? formatDate(blog.published_at) : "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (blog) => (
        <div className="text-right">
          <Menu
            trigger={
              <Button variant="ghost" size="icon">
                <Ellipsis className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                type: "link",
                label: "View",
                to: `/dashboard/blog/${blog._id}`,
                icon: "open",
              },
              ...(canUpdate
                ? [
                    {
                      type: "link" as const,
                      label: "Edit",
                      to: `/dashboard/blog/${blog._id}/edit`,
                      icon: "edit" as const,
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      type: "button" as const,
                      label: "Delete",
                      onClick: () => handleDelete(blog._id),
                      icon: "dustbin" as const,
                      variant: "danger" as const,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">Blog</h1>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <Select
              value={statusFilter || "all"}
              onChange={(value) =>
                setStatusFilter(value === "all" ? "" : value)
              }
              options={[
                { value: "all", label: "All Statuses" },
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
                { value: "archived", label: "Archived" },
              ]}
              placeholder="Status"
              className="w-full sm:w-[200px]"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {canCreate && (
            <Button onClick={() => router.push("/dashboard/blog/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      <Table
        data={blogs}
        columns={columns}
        keyExtractor={(blog) => blog._id}
        isLoading={isLoading}
        emptyMessage="No blogs found"
      />

      {/* Pagination */}
      {!isLoading && blogs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogScreen() {
  return (
    <Suspense fallback={<Loading className="h-8 w-8 animate-spin" />}>
      <BlogScreenContent />
    </Suspense>
  );
}
