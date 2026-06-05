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
  MoreVertical,
  Plus,
  Loader2,
} from "lucide-react";
import { corporateService } from "@/services/corporate";
import { userService, UserQueryParams } from "@/services/user";
import { User } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";

interface CorporateTrainersScreenProps {
  corporateId: string;
}

const getUserId = (user: User & { _id?: string }) => user._id || user.id;

export default function CorporateTrainersScreen({
  corporateId,
}: CorporateTrainersScreenProps) {
  const queryClient = useQueryClient();

  const [trainers, setTrainers] = useState<User[]>([]);
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

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const debouncedAssignSearch = useDebounce(assignSearch, 500);
  const [availableTrainers, setAvailableTrainers] = useState<User[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const fetchTrainers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await corporateService.getCorporateTrainers(
        corporateId,
        {
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearch || undefined,
        }
      );

      if (response.data) {
        setTrainers(response.data.trainers);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch trainers:", error);
      toast.error("Failed to load trainers");
    } finally {
      setIsLoading(false);
    }
  }, [corporateId, pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  // Reset page on search change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Fetch available trainers for assignment (trainers without a corporate)
  const fetchAvailableTrainers = useCallback(async () => {
    try {
      setIsLoadingAvailable(true);
      const params: UserQueryParams = {
        role: "trainer",
        limit: 20,
        search: debouncedAssignSearch || undefined,
      };
      const response = await userService.getAllUsers(params);

      if (response.data) {
        // Filter out trainers already assigned to this corporate
        const filtered = response.data.users.filter(
          (u: any) => !trainers.some((t: any) => getUserId(t) === getUserId(u))
        );
        setAvailableTrainers(filtered);
      }
    } catch (error: any) {
      console.error("Failed to fetch available trainers:", error);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [debouncedAssignSearch, trainers]);

  useEffect(() => {
    if (assignModalOpen) {
      fetchAvailableTrainers();
    }
  }, [assignModalOpen, fetchAvailableTrainers]);

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (trainerId: string) =>
      corporateService.assignTrainerToCorporate(corporateId, trainerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate", corporateId] });
      toast.success("Trainer assigned successfully");
      setAssigningId(null);
      fetchTrainers();
      fetchAvailableTrainers();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to assign trainer"
      );
      setAssigningId(null);
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: (trainerId: string) =>
      corporateService.removeTrainerFromCorporate(corporateId, trainerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate", corporateId] });
      toast.success("Trainer removed successfully");
      fetchTrainers();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove trainer"
      );
    },
  });

  const handleAssign = (trainerId: string) => {
    setAssigningId(trainerId);
    assignMutation.mutate(trainerId);
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (trainer) => (
        <span className="font-medium">
          {trainer.first_name} {trainer.last_name}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (trainer) => <>{trainer.email}</>,
      visibleOn: ["md", "lg"],
    },
    {
      key: "phone",
      header: "Phone",
      render: (trainer) => <>{trainer.phone || "-"}</>,
      visibleOn: ["lg"],
    },
    {
      key: "status",
      header: "Status",
      render: (trainer) => (
        <Badge
          className={
            trainer.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {trainer.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (trainer) => <>{formatDate(trainer.createdAt)}</>,
      visibleOn: ["md", "lg"],
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (trainer) => (
        <Menu
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={[
            {
              type: "button",
              label: "Remove",
              onClick: () => removeMutation.mutate(getUserId(trainer as any)),
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setAssignModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Trainer
        </Button>
      </div>

      {/* Trainers Table */}
      <Table
        data={trainers}
        columns={columns}
        keyExtractor={(trainer: any) => getUserId(trainer)}
        isLoading={isLoading}
        emptyMessage="No trainers assigned to this company"
      />

      {/* Pagination */}
      {!isLoading && trainers.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} trainers
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

      {/* Assign Trainer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setAssignSearch("");
        }}
        title="Assign Trainer"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trainers by name or email..."
              value={assignSearch}
              onChange={(e) => setAssignSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {isLoadingAvailable ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : availableTrainers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available trainers found</p>
              </div>
            ) : (
              availableTrainers.map((trainer) => (
                <div
                  key={getUserId(trainer as any)}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-tertiary flex items-center justify-center text-sm font-medium">
                      {trainer.first_name?.[0]?.toUpperCase()}
                      {trainer.last_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {trainer.first_name} {trainer.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{trainer.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssign(getUserId(trainer as any))}
                    disabled={assigningId === getUserId(trainer as any)}
                  >
                    {assigningId === getUserId(trainer as any) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Assign"
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
