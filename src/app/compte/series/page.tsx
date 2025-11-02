"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Flame,
  Trophy,
  TrendingUp,
  AlertCircle,
  Plus,
  Crown,
} from "lucide-react";
import { streakService, Streak, StreakEligibility } from "@/services/streak";
import { StreakCard } from "@/components/streak/streak-card";
import { CreateStreakDialog } from "@/components/streak/create-streak-dialog";
import { StreakDetailsDialog } from "@/components/streak/streak-details-dialog";
import { toast } from "sonner";
import Link from "next/link";

export default function StreaksPage() {
  const [activeStreak, setActiveStreak] = useState<Streak | null>(null);
  const [streakHistory, setStreakHistory] = useState<Streak[]>([]);
  const [eligibility, setEligibility] = useState<StreakEligibility | null>(
    null
  );
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStreak, setSelectedStreak] = useState<Streak | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eligibilityRes, activeStreakRes, historyRes, statsRes] =
        await Promise.all([
          streakService.checkEligibility(),
          streakService.getActiveStreak(),
          streakService.getStreakHistory({ page: historyPage, limit: 10 }),
          streakService.getStreakStats(),
        ]);

      if (eligibilityRes.status === "success") {
        setEligibility(eligibilityRes.data);
      }

      if (activeStreakRes.status === "success") {
        setActiveStreak(activeStreakRes.data.streak);
      }

      if (historyRes.status === "success") {
        setStreakHistory(historyRes.data.streaks);
        setTotalPages(historyRes.data.pagination.pages);
      }

      if (statsRes.status === "success") {
        setStats(statsRes.data.stats);
      }
    } catch (error: any) {
      console.error("Error fetching streak data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [historyPage]);

  const handleViewDetails = (streak: Streak) => {
    setSelectedStreak(streak);
    setDetailsDialogOpen(true);
  };

  const handleStreakCreated = () => {
    fetchData();
  };

  // Not premium user
  if (!eligibility?.isPremium && !isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-2xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-600" />
                Fonctionnalité Premium
              </CardTitle>
              <CardDescription>
                Les séries sont réservées aux abonnés premium
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Relevez le défi des séries de 7 jours! Complétez 20 exercices
                avec au moins 90% de score et gagnez des emblème exclusives.
              </p>
              <Alert>
                <Flame className="h-4 w-4 text-orange-500" />
                <AlertDescription>
                  Maintenez votre série active en complétant un exercice toutes
                  les 12 heures. Gagnez une récompense unique tous les 3
                  exercices complétés!
                </AlertDescription>
              </Alert>
              <Link href="/compte/plans">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  <Crown className="mr-2 h-4 w-4" />
                  Passer à Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              Mes Séries
            </h1>
            <p className="text-muted-foreground">
              Maintenez votre engagement et gagnez des emblème!
            </p>
          </div>
          {eligibility?.eligible && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle série
            </Button>
          )}
        </div>
      </div>

      {/* Eligibility Alert */}
      {/* {!eligibility?.eligible && (
        <Alert className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{eligibility?.message}</AlertDescription>
        </Alert>
      )} */}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-1 mb-2">
        {activeStreak && activeStreak.rewards.length > 0 && (
          <div className=" p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 p-2">
              <span className="text-2xl h-10 w-10 flex items-center justify-center rounded-lg bg-white p-6">
                {activeStreak.rewards[activeStreak.rewards.length - 1].icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {activeStreak.rewards[activeStreak.rewards.length - 1].name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {
                    activeStreak.rewards[activeStreak.rewards.length - 1]
                      .description
                  }
                </p>
              </div>
            </div>
          </div>
        )}
        {stats && (
          <>
            <div className="border-2 border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Total séries
              </h4>
              <p className="text-2xl font-bold">{stats.totalStreaks}</p>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-3">
              <div className="">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  Emblèmes gagnées
                </h3>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {stats.byStatus?.reduce(
                  (sum: number, s: any) => sum + s.totalRewards,
                  0
                ) || 0}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-2">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Active Streak */}
        <TabsContent value="active" className="space-y-4">
          {activeStreak ? (
            <StreakCard
              streak={activeStreak}
              onViewDetails={() => handleViewDetails(activeStreak)}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Flame className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucune série active
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez une nouvelle série pour gagner des emblème!
                  </p>
                  {eligibility?.eligible && (
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Démarrer une série
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          {streakHistory.length > 0 ? (
            <>
              <div className="grid gap-4">
                {streakHistory.map((streak) => (
                  <StreakCard
                    key={streak._id}
                    streak={streak}
                    onViewDetails={() => handleViewDetails(streak)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                  >
                    Précédent
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {historyPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setHistoryPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={historyPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Aucun historique
                  </h3>
                  <p className="text-muted-foreground">
                    Vos séries passées apparaîtront ici
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateStreakDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onStreakCreated={handleStreakCreated}
      />

      <StreakDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        streak={selectedStreak}
      />
    </div>
  );
}
