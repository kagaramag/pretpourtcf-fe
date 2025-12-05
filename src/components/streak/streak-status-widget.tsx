"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Clock, Trophy } from "lucide-react";
import { streakService, Streak } from "@/services/streak";
import Link from "next/link";

export function StreakStatusWidget() {
  const [activeStreak, setActiveStreak] = useState<Streak | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveStreak = async () => {
      try {
        const response = await streakService.getActiveStreak();
        if (response.status === "success") {
          setActiveStreak(response.data.streak);
        }
      } catch (error) {
        console.error("Error fetching active streak:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveStreak();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!activeStreak) {
    return null;
  }

  const hoursRemaining = activeStreak.hoursUntilBurn || 0;
  const isUrgent = hoursRemaining <= 6;

  return (
    <Card className={`border-2 ${isUrgent ? "border-red-500 bg-red-50" : "border-orange-500 bg-orange-50"}`}>
      <div className="p-6" className="px-4 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className={`h-6 w-6 ${isUrgent ? "text-red-500" : "text-orange-500"} animate-pulse`} />
            <div>
              <p className="font-semibold text-sm">Série active</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {activeStreak.completedExercises}/{activeStreak.totalExercises}
                </span>
                <span className={`flex items-center gap-1 font-medium ${isUrgent ? "text-red-600" : "text-orange-600"}`}>
                  <Clock className="h-3 w-3" />
                  {hoursRemaining}h restantes
                </span>
              </div>
            </div>
          </div>
          <Link href="/compte/series">
            <Button size="sm" variant="outline" className="border-orange-500 hover:bg-orange-100">
              Voir
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
