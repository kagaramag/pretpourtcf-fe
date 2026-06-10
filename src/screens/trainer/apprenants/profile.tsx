"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/icons";

const categoryStyles: Record<
  string,
  {
    icon: "listen" | "read" | "speak" | "write";
    iconBg: string;
    border: string;
    color: string;
  }
> = {
  listening: {
    icon: "listen",
    iconBg: "bg-primary/70",
    border: "border-primary/30",
    color: "bg-primary",
  },
  reading: {
    icon: "read",
    iconBg: "bg-secondary/70",
    border: "border-secondary/30",
    color: "bg-secondary",
  },
  speaking: {
    icon: "speak",
    iconBg: "bg-accent",
    border: "border-accent/30",
    color: "bg-accent",
  },
  writing: {
    icon: "write",
    iconBg: "bg-orange-500",
    border: "border-orange-200",
    color: "bg-orange-400",
  },
};
const categoryLabels: Record<string, string> = {
  listening: "Compréhension Orale",
  reading: "Compréhension Écrite",
  speaking: "Expression Orale",
  writing: "Expression Écrite",
};

import { toast } from "sonner";
import { corporateService } from "@/services/corporate";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import { LearnerActivity } from "@/types";
import AnswersContent, { SessionAnswersData } from "./apprenant/answers";

interface ActivityResponse {
  learner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  practices: LearnerActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalSessions: number;
    averageScore: number;
    totalTimeSpent: number;
  };
}

export default function ApprenantProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activityData, setActivityData] = useState<ActivityResponse | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [answersModal, setAnswersModal] = useState<{
    open: boolean;
    loading: boolean;
    data: SessionAnswersData | null;
  }>({ open: false, loading: false, data: null });

  const apprenantId = params?.id as string;
  const corporateId = user?.corporate?.id;

  useEffect(() => {
    if (apprenantId && corporateId) {
      fetchActivity(1);
    }
  }, [apprenantId, corporateId]);

  useEffect(() => {
    if (apprenantId && corporateId && currentPage > 1) {
      fetchActivity(currentPage);
    }
  }, [currentPage]);

  const fetchActivity = async (page: number) => {
    if (!corporateId) return;

    try {
      setIsLoading(true);
      const response = await corporateService.getLearnerActivity(
        corporateId,
        apprenantId,
        { page, limit: 15 }
      );

      if (response.data) {
        setActivityData(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching activity:", error);
      const errorMessage =
        error?.response?.data?.message || "Erreur lors du chargement";
      toast.error(errorMessage);

      if (error?.response?.status === 403 || error?.response?.status === 404) {
        router.push("/trainer/apprenants");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const fetchSessionAnswers = async (sessionId: string) => {
    if (!corporateId) return;
    setAnswersModal({ open: true, loading: true, data: null });
    try {
      const response = await corporateService.getLearnerSessionAnswers(
        corporateId,
        apprenantId,
        sessionId
      );
      if (response.data) {
        setAnswersModal({ open: true, loading: false, data: response.data });
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement des réponses");
      setAnswersModal({ open: false, loading: false, data: null });
    }
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

  if (isLoading && !activityData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon name="loading" className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="text-center py-12">
        <Icon name="user" className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
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

  const { learner, practices, stats, pagination } = activityData;

  return (
    <div className="space-y-6">
      <div className="">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            icon="arrowLeft"
            iconOnly
            onClick={() => router.push("/trainer/apprenants")}
          />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {learner.first_name} {learner.last_name}
            </h1>
            <div className="text-sm">{learner.email}</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-1 md:grid-cols-3 mt-2">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h5 className="text-sm">Sessions pratiques</h5>
            <div>
              <div className="font-semibold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">Total complété</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <h5 className="text-sm">Score moyen</h5>
            <div>
              <div className="font-semibold">
                {stats.averageScore.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Sur les 12 derniers mois
              </p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <h5 className="text-sm">Temps total</h5>
            <div>
              <div className="font-semibold">
                {formatTime(stats.totalTimeSpent)}
              </div>
              <p className="text-xs text-muted-foreground">D'entraînement</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="flex items-center justify-between">
          <span>Historique des Pratiques</span>
          {practices.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <Icon name="trophy" className="inline h-4 w-4 mr-1" />
                Moyenne: {stats.averageScore.toFixed(1)}%
              </span>
            </div>
          )}
        </h4>
        <div className="text-sm text-gray-600 mb-4">
          Performances des 12 derniers mois (15 résultats par page)
        </div>
        <div>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Icon name="loading" className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : practices.length > 0 ? (
            <div className="space-y-4">
              {practices.map((session) => {
                const style = categoryStyles[session.practice.type];
                return (
                  <div
                    key={session.id}
                    className={`relative overflow-hidden p-4 border ${style?.border || "border-gray-100"} rounded-2xl`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {style && (
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${style.iconBg}`}
                          >
                            <Icon
                              name={style.icon}
                              size={20}
                              color="text-white"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {session.practice.title}
                          </h4>
                          <div className="flex items-center flex-wrap gap-4 my-2 text-sm text-gray-700">
                            <span className="flex items-center">
                              <Icon name="calendar" className="inline h-4 w-4 mr-1" />
                              <span>
                                {formatDate(new Date(session.completedAt))}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <Icon name="clock" className="inline h-4 w-4 mr-1" />
                              <span>
                                {formatTime(session.timeElapsedSeconds)}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <Icon name="read" className="inline h-4 w-4 mr-1" />
                              <span>
                                {session.correctAnswers}/
                                {session.totalQuestions} correctes
                              </span>
                            </span>
                            <span className="flex items-center">
                              <Icon name="certificate" className="inline h-4 w-4 mr-1" />
                              <span>{session.totalScore} points</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {session.practice.type && (
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[session.practice.type] ||
                                  session.practice.type}
                              </Badge>
                            )}
                            {session.practice.level && (
                              <Badge variant="outline" className="text-xs">
                                {session.practice.level}
                              </Badge>
                            )}
                            <Badge
                              variant={getGradeBadgeVariant(session.grade)}
                              className="text-xs"
                            >
                              {getGradeLabel(session.grade)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="font-semibold">
                            {session.percentageScore.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Résultat
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchSessionAnswers(session.id)}
                        >
                          <Icon name="eyeOpen" className="h-3 w-3 mr-1" />
                          Voir les réponses
                        </Button>
                      </div>
                    </div>
                    {style && (
                      <div
                        className={`absolute bottom-0 left-0 h-1 w-full ${style.color}`}
                      />
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} sur {pagination.totalPages} (
                    {pagination.total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Icon name="caretLeft" className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages}
                    >
                      Suivant
                      <Icon name="caretRight" className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune pratique complétée dans les 12 derniers mois
            </div>
          )}
        </div>
      </div>

      {/* Answers Modal */}
      <Modal
        isOpen={answersModal.open}
        onClose={() =>
          setAnswersModal({ open: false, loading: false, data: null })
        }
        title={
          answersModal.data
            ? `Réponses — ${answersModal.data.session.practice.title}`
            : "Chargement..."
        }
        size="xl"
      >
        <AnswersContent
          loading={answersModal.loading}
          data={answersModal.data}
        />
      </Modal>
    </div>
  );
}
