"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Streak } from "@/services/streak";
import { CheckCircle2, Circle, Trophy, Clock } from "lucide-react";

interface StreakDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: Streak | null;
}

export function StreakDetailsDialog({
  open,
  onOpenChange,
  streak,
}: StreakDetailsDialogProps) {
  if (!streak) return null;

  const progressPercentage = Math.round(
    (streak.completedExercises / streak.totalExercises) * 100
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Détails de la série</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Progression globale</h3>
                <span className="text-sm font-semibold">
                  {streak.completedExercises} / {streak.totalExercises}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-muted-foreground text-right">
                {progressPercentage}% complété
              </p>
            </div>

            {/* Exercises List */}
            <div>
              <h3 className="font-semibold mb-3">Exercices</h3>
              <div className="grid gap-2">
                {streak.exercises.map((exercise) => (
                  <div
                    key={exercise.exerciseNumber}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      exercise.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-muted/30"
                    }`}
                  >
                    {exercise.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        Exercice {exercise.exerciseNumber}
                      </p>
                      {exercise.completed && (
                        <p className="text-xs text-muted-foreground">
                          Score: {exercise.score}% •{" "}
                          {new Date(exercise.completedAt!).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                    {exercise.completed && (
                      <Badge variant="outline" className="bg-green-100">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            {streak.rewards.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Emblème gagnées ({streak.rewards.length})
                </h3>
                <div className="grid gap-2">
                  {streak.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50"
                    >
                      <span className="text-3xl">{reward.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Gagné le{" "}
                          {new Date(reward.earnedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500">
                        {reward.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Milestone */}
            {streak.status === "active" && (
              <div className="p-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">
                    Prochaine récompense
                  </h3>
                </div>
                <p className="text-sm text-purple-700">
                  Complétez{" "}
                  <strong>
                    {3 - (streak.currentPoints % 3)} exercice(s)
                  </strong>{" "}
                  de plus pour gagner une nouvelle récompense!
                </p>
              </div>
            )}

            {/* Timer Warning */}
            {streak.status === "active" && streak.hoursUntilBurn !== undefined && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  streak.hoursUntilBurn <= 6
                    ? "border-red-300 bg-red-50"
                    : "border-orange-300 bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock
                    className={`h-5 w-5 ${
                      streak.hoursUntilBurn <= 6
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  />
                  <h3
                    className={`font-semibold ${
                      streak.hoursUntilBurn <= 6
                        ? "text-red-900"
                        : "text-orange-900"
                    }`}
                  >
                    Temps restant
                  </h3>
                </div>
                <p
                  className={`text-sm ${
                    streak.hoursUntilBurn <= 6
                      ? "text-red-700"
                      : "text-orange-700"
                  }`}
                >
                  {streak.hoursUntilBurn <= 6
                    ? "⚠️ Attention! "
                    : ""}
                  Il vous reste <strong>{streak.hoursUntilBurn} heures</strong>{" "}
                  pour completer un exercice avant que votre série ne brûle.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
