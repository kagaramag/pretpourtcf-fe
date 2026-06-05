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
import { Search, MoreVertical, Loader2, X } from "lucide-react";
import { userService } from "@/services/user";
import { User } from "@/types";
import { toast } from "sonner";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";

function UsersScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Get filters from URL
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  // Dialogs
  const [userFormDialog, setUserFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated successfully");
      fetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to deactivate user");
    },
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated successfully");
      fetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to activate user");
    },
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);

    const queryString = params.toString();
    router.push(`/dashboard/users${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        role: (roleFilter || undefined) as any,
        status: (statusFilter || undefined) as any,
      });

      if (response.data) {
        const mappedUsers = response.data.users.map((user: any) => ({
          id: user._id || user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        }));

        setUsers(mappedUsers);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("");
    setStatusFilter("");
  };

  const hasActiveFilters = searchQuery || roleFilter || statusFilter;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-purple-100 text-purple-800",
      client: "bg-blue-100 text-blue-800",
    };
    return colors[role as keyof typeof colors] || colors.client;
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <Link
          href={`/dashboard/users/${user.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none text-left"
        >
          {user.first_name} {user.last_name}
        </Link>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <div className="truncate">{user.email}</div>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) => <>{user.phone || "N/A"}</>,
    },
    {
      key: "role",
      header: "Role",

      render: (user) => (
        <Badge className={getRoleBadge(user.role)}>
          {user.role.replace("_", " ").charAt(0).toUpperCase() +
            user.role.replace("_", " ").slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-32",
      render: (user) => (
        <Badge className={getStatusColor(user.status)}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: "w-32",
      render: (user) => <div>{formatDate(user.createdAt)}</div>,
    },
    {
      key: "actions",
      align: "right",
      width: "w-32",
      header: "Actions",
      render: (user) => (
        <Menu
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              type: "button",
              label: "Edit User",
              onClick: () => {
                setSelectedUser(user);
                setFormMode("edit");
                setUserFormDialog(true);
              },
              icon: "edit",
            },
            user.status === "active"
              ? {
                  type: "button" as const,
                  label: "Deactivate User",
                  onClick: () => deactivateMutation.mutate(user.id),
                  icon: "stop" as const,
                  variant: "danger" as const,
                  disabled: deactivateMutation.isPending,
                }
              : {
                  type: "button" as const,
                  label: "Activate User",
                  onClick: () => activateMutation.mutate(user.id),
                  icon: "validate" as const,
                },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setFormMode("create");
            setUserFormDialog(true);
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={roleFilter || "all"}
          onChange={(value) => setRoleFilter(value === "all" ? "" : value)}
          options={[
            { value: "all", label: "All Types" },
            { value: "super_admin", label: "Super Admin" },
            { value: "admin", label: "Admin" },
            { value: "client", label: "Client" },
          ]}
          placeholder="User Type"
          className="w-[160px]"
        />

        <Select
          value={statusFilter || "all"}
          onChange={(value) => setStatusFilter(value === "all" ? "" : value)}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          placeholder="Status"
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

      {/* Users Table */}
      <div>
        <Table
          data={users}
          columns={columns}
          keyExtractor={(user) => user.id}
          isLoading={isLoading}
          emptyMessage="No users found"
        />

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
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

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormDialog}
        onOpenChange={setUserFormDialog}
        mode={formMode}
        user={formMode === "edit" ? selectedUser : undefined}
        onSuccess={fetchUsers}
      />
    </div>
  );
}

export function UsersScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <UsersScreenContent />
    </Suspense>
  );
}
