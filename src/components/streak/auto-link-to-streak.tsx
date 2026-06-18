"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Verified, Flame, Trophy, Zap } from "@/icons";
import { streakService } from "@/services/streak";
import { toast } from "sonner";

interface AutoLinkToStreakProps {
  sessionId: string;
  percentageScore: number;
}

export function AutoLinkToStreak({
  sessionId,
  percentageScore,
}: AutoLinkToStreakProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [exerciseNumber, setExerciseNumber] = useState<number | null>(null);

  useEffect(() => {
    // Only auto-link if score >= 90%
    if (percentageScore >= 90) {
      autoLinkToStreak();
    }
  }, [sessionId, percentageScore]);

  const autoLinkToStreak = async () => {
    try {
      setIsLinking(true);

      // Get active streak
      const streakResponse = await streakService.getActiveStreak();
      if (
        streakResponse.status !== "success" ||
        !streakResponse.data.streak
      ) {
        // No active streak, silently do nothing
        return;
      }

      const activeStreak = streakResponse.data.streak;

      // Find the next incomplete exercise
      const nextExercise = activeStreak.exercises.find(
        (e: any) => !e.completed
      );
      if (!nextExercise) {
        // All exercises completed
        return;
      }

      // Automatically link the session to the streak
      const response = await streakService.completeExercise({
        streakId: activeStreak._id,
        exerciseNumber: nextExercise.exerciseNumber,
        sessionId: sessionId,
      });

      if (response.status === "success") {
        setLinked(true);
        setExerciseNumber(nextExercise.exerciseNumber);
        setReward(response.data.reward);

        // Show success message
        let message = `✅ Exercice ${nextExercise.exerciseNumber}/20 ajouté à votre série!`;

        if (response.data.reward) {
          message = `🎉 Exercice ${nextExercise.exerciseNumber}/20 complété! Nouvelle récompense: ${response.data.reward.name}!`;
        }

        if (response.data.streak.status === "completed") {
          message = `🏆 Félicitations! Vous avez complété toute la série! Exercice ${nextExercise.exerciseNumber}/20 était le dernier!`;
        }

        toast.success(message, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      // Silently fail if there's an error (e.g., no active streak)
      console.log("Auto-link failed:", error.response?.data?.message);
    } finally {
      setIsLinking(false);
    }
  };

  // Don't show anything while linking
  if (isLinking) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
        <AlertDescription className="text-sm">
          Vérification de la série active...
        </AlertDescription>
      </Alert>
    );
  }

  // Show success message if linked
  if (linked && exerciseNumber) {
    return (
      <Alert className="border-green-200 bg-white">
        <Verified className="h-4 w-4 text-green-600" />
        <AlertDescription className="space-y-2">
          <div className="flex items-center gap-2 font-semibold text-green-900">
            <Flame className="h-5 w-5 text-orange-500" />
            Exercice ajouté à votre série!
          </div>
          <div className="text-sm text-green-800">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4" />
              <span>Exercice {exerciseNumber}/20 complété</span>
            </div>
            {reward && (
              <div className="flex items-center gap-2 p-2 mt-2 rounded bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                <span className="text-lg">{reward.icon}</span>
                <div>
                  <p className="font-semibold text-xs">{reward.name}</p>
                  <p className="text-xs text-gray-600">
                    {reward.description}
                  </p>
                </div>
                <Zap className="h-4 w-4 text-purple-500 ml-auto" />
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Don't show anything if not linked (no active streak or score < 90%)
  return null;
}
