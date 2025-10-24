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
import { BookOpen, Clock, BarChart } from "lucide-react";
import Link from "next/link";

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
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mes Pratiques</h1>
          <p className="text-muted-foreground">
            Accédez à vos exercices TCF et suivez votre progression
          </p>
        </div>

        {/* Subscription Status Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Abonnement actif
                </p>
                <p className="text-lg font-semibold">
                  {user.subscription.plan.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expire dans</p>
                <p className="text-lg font-semibold text-blue-700">
                  {user.subscription.days_remaining} jour(s)
                </p>
              </div>
              <Link href="/compte/plans">
                <Button variant="outline" size="sm">
                  Voir détails
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Practices Placeholder */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exercices TCF
              </CardTitle>
              <CardDescription>
                Les exercices de pratique seront affichés ici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border-gray-300 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Pratiques à venir
                </h3>
                <div className="max-w-4xl grid lg:grid-cols-2 grid-cols-1 gap-4">
                  <Link
                    href="/compte/pratique/co"
                    className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc]  px-6 py-3.5 font-semibold text-sm text-white"
                  >
                    Compréhension orale
                  </Link>
                  <Link
                    href="/compte/pratique/ce"
                    className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc]  px-6 py-3.5 font-semibold text-sm text-white"
                  >
                    Compréhension écrite
                  </Link>
                  <Link
                    href="/compte/pratique/eo"
                    className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc]  px-6 py-3.5 font-semibold text-sm text-white"
                  >
                    Expression orale
                  </Link>
                  <Link
                    href="/compte/pratique/ee"
                    className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc]  px-6 py-3.5 font-semibold text-sm text-white"
                  >
                    Expression écrite
                  </Link>
                </div>
                {/* <p className="text-muted-foreground mb-4">
                  Les exercices de compréhension orale, écrite, expression orale et écrite
                  seront disponibles ici
                </p>
                <p className="text-sm text-muted-foreground">
                  Cette fonctionnalité sera implémentée prochainement
                </p> */}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historique
                </CardTitle>
                <CardDescription>Vos pratiques récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune pratique effectuée pour le moment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Statistiques
                </CardTitle>
                <CardDescription>Votre progression</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Les statistiques seront disponibles après vos premières
                  pratiques
                </p>
              </CardContent>
            </Card>
          </div>
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
