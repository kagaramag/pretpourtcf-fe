"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { practiceSessionService } from "@/services/practice-session";
import { PracticeSession, Practice, SessionStatistics } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PracticeHistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [statistics, setStatistics] = useState<SessionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch sessions history
      const sessionsResponse = await practiceSessionService.getHistory({
        page: currentPage,
        limit: 10,
        sort: "-createdAt",
      });

      setSessions(sessionsResponse.data.sessions);
      setTotalPages(sessionsResponse.data.pagination.totalPages);

      // Fetch statistics
      const statsResponse = await practiceSessionService.getStatistics();
      setStatistics(statsResponse.data.statistics);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de l'historique"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { icon: any; label: string; className: string }
    > = {
      completed: {
        icon: CheckCircle2,
        label: "Complété",
        className: "bg-green-100 text-green-800",
      },
      expired: {
        icon: XCircle,
        label: "Expiré",
        className: "bg-red-100 text-red-800",
      },
      in_progress: {
        icon: AlertCircle,
        label: "En cours",
        className: "bg-yellow-100 text-yellow-800",
      },
    };

    const badge = badges[status] || badges.in_progress;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}
      >
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <Trophy className="h-3 w-3" />
          Excellent
        </span>
      );
    } else if (percentage >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          <TrendingUp className="h-3 w-3" />
          Bien
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          À améliorer
        </span>
      );
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historique des pratiques</h1>
        <p className="text-muted-foreground">
          Consultez vos résultats et suivez votre progression
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Sessions totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statistics.totalSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Score moyen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {Math.round(statistics.averageScore)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Meilleur score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {Math.round(statistics.highestScore)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Temps total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {Math.floor(statistics.totalTimeSeconds / 3600)}h{" "}
                {Math.floor((statistics.totalTimeSeconds % 3600) / 60)}m
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des sessions</CardTitle>
          <CardDescription>
            Toutes vos sessions de pratique passées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune session trouvée
              </h3>
              <p className="text-muted-foreground mb-4">
                Commencez une pratique pour voir votre historique ici
              </p>
              <Button onClick={() => router.push("/compte/pratique/co")}>
                Commencer une pratique
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exercice</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Durée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => {
                      const practice = session.practiceId as Practice;
                      return (
                        <TableRow key={session._id}>
                          <TableCell className="font-medium">
                            {typeof practice === "object"
                              ? practice?.title
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(
                                new Date(session.createdAt),
                                "dd MMM yyyy",
                                { locale: fr }
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              {session.totalScore}/{session.maxPossibleScore}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.percentageScore}%
                            </div>
                          </TableCell>
                          <TableCell>
                            {getGradeBadge(session.percentageScore)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatDuration(session.timeElapsedSeconds)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Précédent
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
