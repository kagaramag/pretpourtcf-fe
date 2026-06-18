"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Loading, ArrowRight, Search, Certificate, Flame, Trophy, CaretLeft } from "@/icons";
import { streakService, Streak, StreakStatus } from "@/services/streak";
import { formatDate } from "@/lib/date-utils";
import { Progress } from "@/components/ui/progress";
import { useDebounce } from "@/hooks/use-debounce";

const getStatusBadge = (status: StreakStatus) => {
  switch (status) {
    case "active":
      return <Badge variant={"success"}>Actif</Badge>;
    case "completed":
      return <Badge variant={"destructive"}>Terminé</Badge>;
    case "burned":
      return <Badge variant={"secondary"}>Brûlé</Badge>;
    case "expired":
      return <Badge variant={"outline"}>Expiré</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getUserName = (userId: Streak["userId"]) => {
  if (typeof userId === "string") return "N/A";
  return `${userId.first_name} ${userId.last_name}`;
};

const getUserEmail = (userId: Streak["userId"]) => {
  if (typeof userId === "string") return "N/A";
  return userId.email;
};

const columns: Column<Streak>[] = [
  {
    key: "userName",
    header: "Utilisateur",
    render: (streak) => (
      <span className="font-medium">{getUserName(streak.userId)}</span>
    ),
  },
  {
    key: "status",
    header: "Statut",
    render: (streak) => getStatusBadge(streak.status),
  },
  {
    key: "progression",
    header: "Progression",
    render: (streak) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {streak.completedExercises} / {streak.totalExercises}
          </span>
        </div>
        <Progress
          value={(streak.completedExercises / streak.totalExercises) * 100}
          className="h-2 w-24"
        />
      </div>
    ),
  },
  {
    key: "currentPoints",
    header: "Points",
    render: (streak) => (
      <div className="flex items-center gap-1">
        <Trophy className="h-4 w-4 text-primary" />
        <span className="font-semibold text-primary">{streak.currentPoints}</span>
      </div>
    ),
  },
  {
    key: "rewards",
    header: "Récompenses",
    render: (streak) => (
      <div className="flex items-center gap-1">
        <Certificate className="h-4 w-4 text-orange-500" />
        <span className="font-medium">{streak.rewards.length}</span>
      </div>
    ),
  },
  {
    key: "startDate",
    header: "Date début",
    render: (streak) => (
      <span className="text-sm">{formatDate(streak.startDate)}</span>
    ),
  },
  {
    key: "endDate",
    header: "Date fin",
    render: (streak) => (
      <span className="text-sm">{formatDate(streak.endDate)}</span>
    ),
  },
  {
    key: "lastActivityAt",
    header: "Dernière activité",
    render: (streak) => (
      <span className="text-sm text-gray-600">
        {formatDate(streak.lastActivityAt)}
      </span>
    ),
  },
];

export function StreaksScreen() {
  const [statusFilter, setStatusFilter] = useState<StreakStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch all streaks (admin view)
  const { data, isLoading } = useQuery({
    queryKey: ["all-streaks", page, limit, statusFilter, debouncedSearch],
    queryFn: async () => {
      const response = await streakService.getAllStreaks({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      });
      return response.data;
    },
  });

  const streaks = data?.streaks || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Streaks</h1>
      </div>

      {/* Filters */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value as StreakStatus | "all");
              setPage(1);
            }}
            options={[
              { value: "all", label: "Tous" },
              { value: "active", label: "Actif" },
              { value: "completed", label: "Terminé" },
              { value: "burned", label: "Brûlé" },
              { value: "expired", label: "Expiré" },
            ]}
            placeholder="Filtrer par statut"
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Streaks Table */}
      <Table
        data={streaks}
        columns={columns}
        keyExtractor={(s) => s._id}
        emptyComponent={
          <div className="flex flex-col items-center justify-center py-12">
            <Flame className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-600">
              Aucun streak trouvé
            </p>
            <p className="text-sm text-gray-600">
              {statusFilter !== "all" || searchQuery
                ? "Essayez de changer les filtres"
                : "Les utilisateurs n'ont pas encore créé de streaks"}
            </p>
          </div>
        }
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.total} au total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <CaretLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
