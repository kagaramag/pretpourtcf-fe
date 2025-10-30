"use client";

import { Streak, Reward } from "@/services/streak";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// All possible streak rewards in order
const ALL_REWARDS: Omit<Reward, "earnedAt">[] = [
  {
    type: "badge",
    name: "Étincelle",
    description: "Le début d'une belle aventure.",
    icon: "🥉",
  },
  {
    type: "theme",
    name: "Flamme",
    description: "La motivation prend feu.",
    icon: "🌊",
  },
  {
    type: "bonus_points",
    name: "Lueur",
    description: "Les progrès se font sentir.",
    icon: "⭐",
  },
  {
    type: "avatar",
    name: "Lanterne",
    description: "La constance éclaire ton chemin.",
    icon: "🌟",
  },
  {
    type: "badge",
    name: "Phare",
    description: "Ta lumière guide les autres.",
    icon: "🥈",
  },
  {
    type: "certificate",
    name: "Soleil",
    description: "Tu rayonnes de maîtrise.",
    icon: "📜",
  },
  {
    type: "feature_unlock",
    name: "Étoile",
    description: "L'excellence brille en toi.",
    icon: "📊",
  },
];

interface StreakCardProps {
  streak: Streak;
  onViewDetails?: () => void;
}

export function StreakCard({ streak, onViewDetails }: StreakCardProps) {
  const progressPercentage = Math.round(
    (streak.completedExercises / streak.totalExercises) * 100
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "burned":
        return "bg-red-500";
      case "expired":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "completed":
        return "Terminé";
      case "burned":
        return "Brûlé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const isActive = streak.status === "active";
  const hoursRemaining = streak.hoursUntilBurn || 0;

  return (
    <Card
      className={`relative overflow-hidden ${isActive ? "border-orange-500 border-4" : ""}`}
      onClick={onViewDetails}
    >
      {isActive && (
        <>
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />
        </>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Flame
              className={`h-6 w-6 ${isActive ? "text-orange-500 animate-pulse" : "text-gray-400"}`}
            />
            Série de 7 jours
          </CardTitle>
          <Badge className={getStatusColor(streak.status)}>
            {getStatusLabel(streak.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold">
              {streak.completedExercises} / {streak.totalExercises} exercices
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progressPercentage}% complété
          </p>
        </div>

        {/* Rewards Preview */}
        <div className="pt-3">
          <div className="grid grid-cols-7 gap-2">
            {ALL_REWARDS.map((reward, index) => {
              const isEarned = streak.rewards.some(
                (earnedReward) => earnedReward.name === reward.name
              );

              return (
                <div
                  key={index}
                  className={`flex flex-col text-center items-center gap-2 p-2 rounded-lg border transition-all ${
                    isEarned
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200 grayscale opacity-50"
                  }`}
                >
                  <span className="text-2xl">{reward.icon}</span>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${isEarned ? "" : "text-gray-500"}`}
                    >
                      {reward.name}
                    </p>
                    <p
                      className={`text-xs ${isEarned ? "text-muted-foreground" : "text-gray-400"}`}
                    >
                      {reward.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Points</p>
              <p className="text-lg font-bold">{streak.currentPoints}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Zap className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">Récompenses</p>
              <p className="text-lg font-bold">{streak.rewards.length}</p>
            </div>
          </div>
        </div>

        {/* Burn Timer (only for active streaks) */}
        {isActive && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              hoursRemaining <= 6
                ? "bg-red-50 border border-red-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <Clock
              className={`h-5 w-5 ${hoursRemaining <= 6 ? "text-red-500" : "text-orange-500"}`}
            />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Temps restant</p>
              <p
                className={`text-sm font-bold ${hoursRemaining <= 6 ? "text-red-700" : "text-orange-700"}`}
              >
                {hoursRemaining}h avant de brûler
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>
              Début: {new Date(streak.startDate).toLocaleDateString("fr-FR")}
            </span>
            <span>
              Fin: {new Date(streak.endDate).toLocaleDateString("fr-FR")}
            </span>
          </div>
          {isActive && (
            <p className="mt-1 text-center">
              Dernière activité:{" "}
              {formatDistanceToNow(new Date(streak.lastActivityAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
