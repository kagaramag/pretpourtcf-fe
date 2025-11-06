"use client";

import { useEffect } from "react";
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
import { BookOpen, Clock, BarChart, Flame } from "lucide-react";
import Link from "next/link";
import { StreakStatusWidget } from "@/components/streak/streak-status-widget";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to plans page if user doesn't have an active subscription
  useEffect(() => {
    if (user && user.role === "client" && !user.subscription) {
      router.push("/compte/plans");
    }
  }, [user, router]);

  // If user has active subscription, show practices
  if (user?.subscription) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">Mes Pratiques</h1>
          <p className="text-muted-foreground">
            Accédez à vos exercices TCF et suivez votre progression
          </p>
        </div>

        {/* Active Streak Status Widget */}
        <div>
          <StreakStatusWidget />
        </div>

        {/* Subscription Status Banner */}
        <div className="border-blue-200 bg-blue-50 py-4 px-6 border rounded-full flex items-center justify-between flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold">
              {user.subscription.plan.name}
            </h3>
            <div className="text-sm text-gray-500/80">
              Abonnement actif: Expire dans {user.subscription.days_remaining}
              jour(s)
            </div>
          </div>
          <div className="">
            <Link href="/compte/plans">
              <Button variant="outline" size="sm">
                Voir détails
              </Button>
            </Link>
          </div>
        </div>

        {/* Premium Streak Feature */}
        <div className="py-4 px-6 border border-gray-200 rounded-3xl">
          <h3 className="flex items-center gap-2">Séries Premium</h3>
          <div>Maintenez votre engagement et gagnez des emblème!</div>
          <div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Relevez le défi! Complétez 20 exercices en 7 jours avec au moins
                90% de score. Gagnez une récompense unique tous les 3 exercices.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-500" />
                <span>12 heures pour chaque exercice</span>
              </div>
              <Link href="/compte/series">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Flame className="mr-2 h-4 w-4" />
                  Gérer mes séries
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 my-2">
          <Link href="/compte/pratique/co">
            <Button variant="secondary" block size="lg">
              Compréhension orale
            </Button>
          </Link>
          <Link href="/compte/pratique/ce">
            <Button variant="secondary" disabled block size="lg">
              Compréhension écrite
            </Button>
          </Link>
          <Link href="/compte/pratique/eo">
            <Button variant="secondary" disabled block size="lg">
              Expression orale
            </Button>
          </Link>
          <Link href="/compte/pratique/ee">
            <Button variant="secondary" disabled block size="lg">
              Expression écrite
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state or no subscription (will redirect)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
