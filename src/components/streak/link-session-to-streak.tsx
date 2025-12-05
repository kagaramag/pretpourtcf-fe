"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flame, Trophy, Zap } from "lucide-react";
import { streakService } from "@/services/streak";
import { toast } from "sonner";

interface LinkSessionToStreakProps {
  sessionId: string;
  onLinked?: () => void;
}

export function LinkSessionToStreak({
  sessionId,
  onLinked,
}: LinkSessionToStreakProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [activeStreak, setActiveStreak] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveStreak();
  }, []);

  const fetchActiveStreak = async () => {
    try {
      const response = await streakService.getActiveStreak();
      if (response.status === "success" && response.data.streak) {
        setActiveStreak(response.data.streak);
      }
    } catch (error) {
      console.error("Error fetching active streak:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkToStreak = async () => {
    if (!activeStreak) return;

    // Find the next incomplete exercise
    const nextExercise = activeStreak.exercises.find((e: any) => !e.completed);
    if (!nextExercise) {
      toast.error("Tous les exercices sont déjà complétés!");
      return;
    }

    try {
      setIsLinking(true);
      const response = await streakService.completeExercise({
        streakId: activeStreak._id,
        exerciseNumber: nextExercise.exerciseNumber,
        sessionId: sessionId,
      });

      if (response.status === "success") {
        let message = `Exercice ${nextExercise.exerciseNumber}/20 complété!`;

        if (response.data.reward) {
          message += ` 🎉 Nouvelle récompense: ${response.data.reward.name}!`;
        }

        toast.success(message);
        onLinked?.();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la liaison avec la série"
      );
    } finally {
      setIsLinking(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!activeStreak) {
    return null;
  }

  // Find next incomplete exercise
  const nextExercise = activeStreak.exercises.find((e: any) => !e.completed);
  if (!nextExercise) {
    return null;
  }

  const nextMilestone = Math.ceil(activeStreak.currentPoints / 3) * 3;
  const exercisesUntilReward = nextMilestone - activeStreak.currentPoints;

  return (
    <Card className="border-orange-500 border-2 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="p-6" className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-orange-500 p-3">
            <Flame className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-bold text-lg">Série active détectée!</h3>
              <p className="text-sm text-muted-foreground">
                Voulez-vous lier cet exercice à votre série?
              </p>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold">
                    Exercice {nextExercise.exerciseNumber}/20
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p>• Points actuels: {activeStreak.currentPoints}</p>
                  {exercisesUntilReward > 0 && (
                    <p className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-purple-500" />
                      Plus que {exercisesUntilReward} exercice(s) avant la
                      prochaine récompense!
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleLinkToStreak}
              disabled={isLinking}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isLinking ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Liaison en cours...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-4 w-4" />
                  Valider pour la série
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
