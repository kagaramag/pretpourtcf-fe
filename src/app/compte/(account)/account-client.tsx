"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  PRACTICE_CATEGORIES,
  PracticeCategoryCard,
} from "@/components/molecules/practice-category";
import Serie from "@/assets/images/serie.svg";
import { StreakStatusWidget } from "@/components/streak/streak-status-widget";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackClick } = useActivityTracker();

  useEffect(() => {
    if (user && user.role === "client" && !user.subscription) {
      router.push("/compte/plans");
    }
  }, [user, router]);

  if (user?.subscription) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl">Mes Pratiques</h1>
          <div className="text-gray-700 text-sm">
            Accédez à vos exercices TCF et suivez votre progression
          </div>
        </div>
        {/* Active Streak Status Widget */}
        <div>
          <StreakStatusWidget />
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 my-4">
          {PRACTICE_CATEGORIES.map((category) => (
            <PracticeCategoryCard
              key={category.slug}
              category={category}
              href={`/compte/pratique/${category.slug}`}
              onClick={() => trackClick({ action: "link_clicked", label: category.label })}
            />
          ))}
        </div>
        {/* Premium Streak Feature */}
        <div className="py-4 px-6 border-4 border-tertiary rounded-3xl my-5 flex lg:flex-row flex-col items-center gap-4">
          <div className="lg:w-22 lg:h-28 w-16 h-20 rounded-2xl flex items-center justify-center">
            <Image src={Serie} width={80} height={96} priority alt="Serie" />
          </div>
          <div className="flex-1">
            <h3 className="flex items-center gap-2 text-2xl">
              Flamme TCF – Jeu de série
            </h3>
            <h5>Pratiquez quotidiennement, maintenez votre série.</h5>
            <div className="text-sm max-w-[650px] text-gray-600 mt-2">
              Relevez le défi! Complétez 20 exercices en 7 jours avec au moins
              90% de score. Gagnez une récompense unique tous les 3 exercices.
            </div>
          </div>
          <div className="mt-4">
            <Link href="/compte/series" onClick={() => trackClick({ action: "link_clicked", label: "Gérer mes séries" })}>
              <Button variant="tertiary" size="lg">
                Gérer mes séries
              </Button>
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
