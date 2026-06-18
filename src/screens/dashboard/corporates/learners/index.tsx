"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Menu } from "@/components/ui/menu";
import {
  Search,
  Ellipsis,
  Plus,
  Loading,
} from "@/icons";
import { corporateService } from "@/services/corporate";
import { userService, UserQueryParams } from "@/services/user";
import { User } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

interface CorporateLearnersScreenProps {
  corporateId: string;
  onViewActivity?: (learnerId: string) => void;
}

const getUserId = (user: User & { _id?: string }) => user._id || user.id;

export default function CorporateLearnersScreen({
  corporateId,
  onViewActivity,
}: CorporateLearnersScreenProps) {
  const queryClient = useQueryClient();

  const [learners, setLearners] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Add modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const debouncedAddSearch = useDebounce(addSearch, 500);
  const [availableLearners, setAvailableLearners] = useState<User[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchLearners = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await corporateService.getCorporateLearners(
        corporateId,
        {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
        }
      );

      if (response.data) {
        setLearners(response.data.learners);
        setPagination((prev) => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error: any) {
      console.error("Failed to fetch learners:", error);
      toast.error("Failed to load learners");
    } finally {
      setIsLoading(false);
    }
  }, [corporateId, pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Fetch available learners (clients not already in this corporate)
  const fetchAvailableLearners = useCallback(async () => {
    try {
      setIsLoadingAvailable(true);
      const params: UserQueryParams = {
        role: "client",
        limit: 20,
        search: debouncedAddSearch || undefined,
      };
      const response = await userService.getAllUsers(params);

      if (response.data) {
        const filtered = response.data.users.filter(
          (u: any) => !learners.some((l: any) => getUserId(l) === getUserId(u))
        );
        setAvailableLearners(filtered);
      }
    } catch (error: any) {
      console.error("Failed to fetch available learners:", error);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [debouncedAddSearch, learners]);

  useEffect(() => {
    if (addModalOpen) {
      fetchAvailableLearners();
    }
  }, [addModalOpen, fetchAvailableLearners]);

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (learnerId: string) =>
      corporateService.addLearnerToCorporate(corporateId, learnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate", corporateId] });
      toast.success("Learner added successfully");
      setAddingId(null);
      fetchLearners();
      fetchAvailableLearners();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to add learner"
      );
      setAddingId(null);
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (learnerId: string) =>
      corporateService.removeLearnerFromCorporate(corporateId, learnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate", corporateId] });
      toast.success("Learner removed successfully");
      fetchLearners();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove learner"
      );
    },
  });

  const handleAdd = (learnerId: string) => {
    setAddingId(learnerId);
    addMutation.mutate(learnerId);
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (learner) => (
        <span className="font-medium">
          {learner.first_name} {learner.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (learner) => <>{learner.email}</>,
      visibleOn: ["md", "lg"],
    },
    {
      key: "phone",
      header: "Phone",
      render: (learner) => <>{learner.phone || "-"}</>,
      visibleOn: ["lg"],
    },
    {
      key: "status",
      header: "Status",
      render: (learner) => (
        <Badge
          className={
            learner.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {learner.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (learner) => <>{formatDate(learner.createdAt)}</>,
      visibleOn: ["md", "lg"],
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (learner) => (
        <Menu
          trigger={
            <Button variant="ghost" size="icon">
              <Ellipsis className="h-4 w-4" />
            </Button>
          }
          items={[
            ...(onViewActivity
              ? [
                  {
                    type: "button" as const,
                    label: "View Activity",
                    onClick: () => onViewActivity(getUserId(learner as any)),
                    icon: "open" as const,
                  },
                ]
              : []),
            {
              type: "button",
              label: "Remove",
              onClick: () => removeMutation.mutate(getUserId(learner as any)),
              icon: "remove",
              variant: "danger",
              disabled: removeMutation.isPending,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search learners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)} icon="plus">
          Add Learner
        </Button>
      </div>

      {/* Learners Table */}
      <Table
        data={learners}
        columns={columns}
        keyExtractor={(learner: any) => getUserId(learner)}
        isLoading={isLoading}
        emptyMessage="No learners assigned to this company"
      />

      {/* Pagination */}
      {!isLoading && learners.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} learners
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

      {/* Add Learner Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddSearch("");
        }}
        title="Add Learner"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              placeholder="Search learners by name or email..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoadingAvailable ? (
              <div className="flex items-center justify-center py-8">
                <Loading className="h-6 w-6 animate-spin text-gray-600" />
              </div>
            ) : availableLearners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available learners found</p>
              </div>
            ) : (
              availableLearners.map((learner) => (
                <div
                  key={getUserId(learner as any)}
                  className="flex items-center justify-between border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-tertiary flex items-center justify-center text-sm font-medium">
                      {learner.first_name?.[0]?.toUpperCase()}
                      {learner.last_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {learner.first_name} {learner.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{learner.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(getUserId(learner as any))}
                    disabled={addingId === getUserId(learner as any)}
                  >
                    {addingId === getUserId(learner as any) ? (
                      <Loading className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
