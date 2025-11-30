"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Serie from "@/assets/images/serie.svg";
import { StreakStatusWidget } from "@/components/streak/streak-status-widget";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role === "client" && !user.subscription) {
      router.push("/compte/plans");
    }
  }, [user, router]);

  if (user?.subscription) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold">Mes Pratiques</h1>
          <h4>Accédez à vos exercices TCF et suivez votre progression</h4>
        </div>
        {/* Active Streak Status Widget */}
        <div>
          <StreakStatusWidget />
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-2 my-2">
          <Link href="/compte/pratique/co">
            <Button variant="tertiary" block size="lg">
              Compréhension orale
            </Button>
          </Link>
          <Link href="/compte/pratique/ce">
            <Button variant="tertiary" block size="lg">
              Compréhension écrite
            </Button>
          </Link>
          <Link href="/compte/pratique/eo">
            <Button variant="tertiary" block size="lg">
              Expression orale
            </Button>
          </Link>
          <Link href="/compte/pratique/ee">
            <Button variant="tertiary" block size="lg">
              Expression écrite
            </Button>
          </Link>
        </div>
        {/* Premium Streak Feature */}
        <div className="py-4 px-6 border-4 border-tertiary rounded-3xl my-5 flex lg:flex-row flex-col items-center gap-4">
          <div className="lg:w-22 lg:h-28 w-16 h-20 rounded-2xl flex items-center justify-center">
            <Image src={Serie} width={80} height={96} priority alt="Serie" />
          </div>
          <div className="flex-1">
            <h3 className="flex items-center gap-2 font-semibold text-2xl">
              Flamme TCF – Jeu de série
            </h3>
            <h5>Pratiquez quotidiennement, maintenez votre série.</h5>
            <div className="text-sm max-w-[650px] mt-2">
              Relevez le défi! Complétez 20 exercices en 7 jours avec au moins
              90% de score. Gagnez une récompense unique tous les 3 exercices.
            </div>
          </div>
          <div className="mt-4">
            <Link href="/compte/series">
              <Button variant="tertiary">Gérer mes séries</Button>
            </Link>
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
