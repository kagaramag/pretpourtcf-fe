"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  User,
  Activity,
  BookOpen,
  Trophy,
  TrendingUp,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Timer,
  Target,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { referralService } from "@/services/referral";
import { formatDate, cn } from "@/lib/utils";

interface ApprenantProfileData {
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    status: string;
    createdAt: Date;
    lastLogin?: Date;
    referredBy?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  referral: {
    acceptedAt: Date;
    createdAt: Date;
  };
  stats: {
    totalPracticeSessions: number;
    lastActive: Date | null;
  };
}

interface PracticeData {
  practices: Array<{
    id: string;
    practice: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
    };
    completedAt: Date;
    startedAt: Date;
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    timeElapsedSeconds: number;
    durationMinutes: number;
    totalQuestions: number;
    correctAnswers: number;
    grade: "excellent" | "good" | "needs_improvement";
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    totalSessions: number;
    averageScore: number;
    totalTimeSpent: number;
    totalPoints: number;
  };
}

export default function ApprenantProfile() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ApprenantProfileData | null>(
    null
  );
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [practicesLoading, setPracticesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const apprenantId = params?.id as string;

  useEffect(() => {
    if (apprenantId) {
      fetchApprenantProfile();
      fetchPracticeHistory(1);
    }
  }, [apprenantId]);

  useEffect(() => {
    if (apprenantId && currentPage > 1) {
      fetchPracticeHistory(currentPage);
    }
  }, [currentPage]);

  const fetchApprenantProfile = async () => {
    try {
      setIsLoading(true);
      const response = await referralService.getApprenantProfile(apprenantId);

      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        toast.error("Impossible de charger le profil de l'apprenant");
        router.push("/trainer/apprenants");
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      const errorMessage =
        error?.response?.data?.message || "Erreur lors du chargement du profil";
      toast.error(errorMessage);

      // Redirect back to list if unauthorized or not found
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        router.push("/trainer/apprenants");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPracticeHistory = async (page: number) => {
    try {
      setPracticesLoading(true);
      const response = await referralService.getApprenantPractices(apprenantId, {
        page,
        limit: 15,
      });

      if (response.success && response.data) {
        setPracticeData(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching practice history:", error);
      toast.error("Erreur lors du chargement de l'historique des pratiques");
    } finally {
      setPracticesLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case "excellent":
        return "default";
      case "good":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getGradeLabel = (grade: string) => {
    switch (grade) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Bien";
      default:
        return "À améliorer";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profil non trouvé</p>
        <Button
          variant="link"
          onClick={() => router.push("/trainer/apprenants")}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  const { user, referral, stats } = profileData;

  console.log(":##:", practiceData)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/trainer/apprenants")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {user.first_name} {user.last_name}
          </h1>
          <div className="text-sm">{user.email}</div>
        </div>
        <Badge
          variant={user.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {user.status === "active" ? "Actif" : "Inactif"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
            <CardTitle className="text-sm font-medium">
              Date d'inscription
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(new Date(user.createdAt))}
            </div>
            <p className="text-xs text-muted-foreground">
              Invité le {formatDate(new Date(referral.createdAt))}
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">
              Sessions pratiques
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPracticeSessions}
            </div>
            <p className="text-xs text-muted-foreground">Total complété</p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">
              Dernière activité
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastActive
                ? formatDate(new Date(stats.lastActive))
                : "Jamais"}
            </div>
            <p className="text-xs text-muted-foreground">Dernière connexion</p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">
              Acceptation invitation
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(new Date(referral.acceptedAt))}
            </div>
            <p className="text-xs text-muted-foreground">Date d'acceptation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardTitle className="flex items-center justify-between">
            <span>Historique des Pratiques</span>
            {practiceData && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <Trophy className="inline h-4 w-4 mr-1" />
                  Moyenne: {practiceData.stats.averageScore.toFixed(1)}%
                </span>
                <span>
                  <Target className="inline h-4 w-4 mr-1" />
                  Total: {practiceData.stats.totalPoints} points
                </span>
              </div>
            )}
          </CardTitle>
            Performances des 3 derniers mois (15 résultats par page)
        <CardContent>
          {practicesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : practiceData && practiceData.practices.length > 0 ? (
            <div className="space-y-4">
              {practiceData.practices.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{session.practice.title}</h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {formatDate(new Date(session.completedAt))}
                        </span>
                        <span>
                          <Timer className="inline h-3 w-3 mr-1" />
                          {formatTime(session.timeElapsedSeconds)}
                        </span>
                        <span>
                          <BookOpen className="inline h-3 w-3 mr-1" />
                          {session.correctAnswers}/{session.totalQuestions} correctes
                        </span>
                        <span>
                          <Award className="inline h-3 w-3 mr-1" />
                          {session.totalScore} points
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {session.practice.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {session.practice.difficulty}
                        </Badge>
                        <Badge
                          variant={getGradeBadgeVariant(session.grade)}
                          className="text-xs"
                        >
                          {getGradeLabel(session.grade)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {session.percentageScore.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Score
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              {practiceData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {practiceData.pagination.page} sur {practiceData.pagination.totalPages}
                    {" "}({practiceData.pagination.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!practiceData.pagination.hasMore}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune pratique complétée dans les 3 derniers mois
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
