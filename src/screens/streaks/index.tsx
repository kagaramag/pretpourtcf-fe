"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Loader2,
  Flame,
  Trophy,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Award,
} from "lucide-react";
import { streakService, Streak, StreakStatus } from "@/services/streak";
import { formatDate } from "@/lib/date-utils";
import { Progress } from "@/components/ui/progress";
import { useDebounce } from "@/hooks/use-debounce";

const getStatusBadge = (status: StreakStatus) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">Actif</Badge>;
    case "completed":
      return <Badge className="bg-blue-500">Terminé</Badge>;
    case "burned":
      return <Badge className="bg-red-500">Brûlé</Badge>;
    case "expired":
      return <Badge className="bg-gray-500">Expiré</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getUserName = (userId: Streak["userId"]) => {
    if (typeof userId === "string") return "N/A";
    return `${userId.first_name} ${userId.last_name}`;
  };

  const getUserEmail = (userId: Streak["userId"]) => {
    if (typeof userId === "string") return "N/A";
    return userId.email;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des Streaks
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de tous les streaks des utilisateurs
        </p>
      </div>

      {/* Filters */}
      <div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              onValueChange={(value) => {
                setStatusFilter(value as StreakStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="burned">Brûlé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </div>

      {/* Streaks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          {streaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Flame className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun streak trouvé
              </p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== "all" || searchQuery
                  ? "Essayez de changer les filtres"
                  : "Les utilisateurs n'ont pas encore créé de streaks"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Récompenses</TableHead>
                    <TableHead>Date début</TableHead>
                    <TableHead>Date fin</TableHead>
                    <TableHead>Dernière activité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streaks.map((streak) => (
                    <TableRow key={streak._id}>
                      <TableCell className="font-medium">
                        {getUserName(streak.userId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getUserEmail(streak.userId)}
                      </TableCell>
                      <TableCell>{getStatusBadge(streak.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {streak.completedExercises} /{" "}
                              {streak.totalExercises}
                            </span>
                          </div>
                          <Progress
                            value={
                              (streak.completedExercises /
                                streak.totalExercises) *
                              100
                            }
                            className="h-2 w-24"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-primary">
                            {streak.currentPoints}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">
                            {streak.rewards.length}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(streak.startDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(streak.endDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(streak.lastActivityAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
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
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
