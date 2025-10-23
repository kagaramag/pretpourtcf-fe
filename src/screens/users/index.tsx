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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Loader2,
  X,
  Ban,
  CheckCircle,
  Users,
  Shield,
  UserCog,
} from "lucide-react";
import { userService } from "@/services/user";
import { User } from "@/types";
import { toast } from "sonner";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { formatDate } from "@/lib/date-utils";

function UsersScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Active tab state
  const [activeTab, setActiveTab] = useState("all");

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


  // Get effective role filter based on active tab
  const effectiveRoleFilter =
    activeTab === "all"
      ? roleFilter
      : activeTab === "admins"
      ? "admin"
      : "client";

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
  }, [
    pagination.page,
    debouncedSearch,
    roleFilter,
    statusFilter,
    activeTab,
  ]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        role: (effectiveRoleFilter || undefined) as any,
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

  const hasActiveFilters =
    searchQuery || roleFilter || statusFilter;

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

  const renderUsersTable = () => (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <button
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none text-left"
                  >
                    {user.first_name} {user.last_name}
                  </button>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadge(user.role)}>
                    {user.role.replace("_", " ").charAt(0).toUpperCase() +
                      user.role.replace("_", " ").slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                          setSelectedUser(user);
                          setFormMode("edit");
                          setUserFormDialog(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          className="text-orange-600"
                          onClick={() => deactivateMutation.mutate(user.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Deactivate User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => activateMutation.mutate(user.id)}
                          disabled={activateMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
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
      {!isLoading && users.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
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
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setSelectedUser(null);
            setFormMode("create");
            setUserFormDialog(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Users className="h-4 w-4" />
            All Users
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Shield className="h-4 w-4" />
            Admins
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <UserCog className="h-4 w-4" />
            Clients
          </TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>All Users</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={roleFilter || undefined}
                    onValueChange={(value) => setRoleFilter(value || "")}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
            <CardContent>{renderUsersTable()}</CardContent>
          </Card>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Administrators</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search admins..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters (without role filter) */}
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
                      <SelectItem value="inactive">Inactive</SelectItem>
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
            <CardContent>{renderUsersTable()}</CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Clients</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters (without role filter) */}
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
                      <SelectItem value="inactive">Inactive</SelectItem>
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
            <CardContent>{renderUsersTable()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
