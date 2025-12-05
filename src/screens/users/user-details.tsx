"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  // Fetch user details from backend
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });

  const user = userData?.data?.user;
  const practiceHistory = userData?.data?.practiceHistory;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      case "super_admin":
        return "bg-green-100 text-green-800";
      case "trainer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "client":
        return "Client";
      case "super_admin":
        return "Super Admin";
      case "trainer":
        return "Formateur";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {error
                ? "Erreur lors du chargement de l'utilisateur"
                : "Utilisateur non trouvé"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/users")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux utilisateurs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/users")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Header */}

        {/* User Profile */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-tertiary flex items-center justify-center text-black text-2xl font-bold">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={
                    user.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {user.status === "active" ? "Actif" : "Inactif"}
                </Badge>
                <Badge className={getRoleBadge(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de création</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-medium">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info (if applicable) */}
        {user.subscription && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Abonnement</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Plan</p>
                <p className="font-medium">
                  {user.subscription.plan?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Statut</p>
                <Badge
                  className={
                    user.subscription.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {user.subscription.status || "N/A"}
                </Badge>
              </div>
              {user.subscription.start_date && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de début</p>
                  <p className="font-medium">
                    {format(
                      new Date(user.subscription.start_date),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
              )}
              {user.subscription.end_date && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date de fin</p>
                  <p className="font-medium">
                    {format(
                      new Date(user.subscription.end_date),
                      "dd MMM yyyy"
                    )}
                  </p>
                </div>
              )}
              {user.subscription.days_remaining !== undefined && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Jours restants</p>
                  <p className="font-medium">
                    {user.subscription.days_remaining} jours
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Practice History (for clients only) */}
        {user.role === "client" &&
          practiceHistory &&
          practiceHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Practice history
              </h2>
              <div className="space-y-2">
                {practiceHistory.map((session) => {
                  const practice =
                    typeof session.practiceId === "object"
                      ? session.practiceId
                      : null;
                  const getStatusBadge = (status: string) => {
                    switch (status) {
                      case "completed":
                        return "bg-green-100 text-green-800";
                      case "in_progress":
                        return "bg-yellow-100 text-yellow-800";
                      case "expired":
                        return "bg-red-100 text-red-800";
                      default:
                        return "bg-gray-100 text-gray-800";
                    }
                  };

                  const getTypeBadge = (type: string) => {
                    switch (type) {
                      case "listening":
                        return "bg-blue-100 text-blue-800";
                      case "reading":
                        return "bg-purple-100 text-purple-800";
                      case "writing":
                        return "bg-pink-100 text-pink-800";
                      case "speaking":
                        return "bg-orange-100 text-orange-800";
                      default:
                        return "bg-gray-100 text-gray-800";
                    }
                  };

                  const getTypeLabel = (type: string) => {
                    switch (type) {
                      case "listening":
                        return "Compréhension Orale";
                      case "reading":
                        return "Compréhension Écrite";
                      case "writing":
                        return "Expression Écrite";
                      case "speaking":
                        return "Expression Orale";
                      default:
                        return type;
                    }
                  };

                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case "completed":
                        return "Terminé";
                      case "in_progress":
                        return "En cours";
                      case "expired":
                        return "Expiré";
                      default:
                        return status;
                    }
                  };

                  return (
                    <div
                      key={session._id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">
                              {practice?.title || "N/A"}
                            </h3>
                            {practice?.type && (
                              <Badge className={getTypeBadge(practice.type)}>
                                {getTypeLabel(practice.type)}
                              </Badge>
                            )}
                            <Badge className={getStatusBadge(session.status)}>
                              {getStatusLabel(session.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Target className="h-4 w-4" />
                              <span>
                                {session.totalScore}/{session.maxPossibleScore}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{session.percentageScore}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>
                                {Math.floor(session.timeElapsedSeconds / 60)}{" "}
                                min
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(session.startedAt),
                                  "dd MMM yyyy"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Empty state for clients with no practice history */}
        {user.role === "client" &&
          (!practiceHistory || practiceHistory.length === 0) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Historique des pratiques
              </h2>
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Aucune pratique enregistrée pour le moment</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
