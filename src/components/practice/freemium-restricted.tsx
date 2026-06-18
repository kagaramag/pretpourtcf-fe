"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "@/icons";
import PracticeLayout from "@/layouts/practice";
import Header from "@/components/organisms/header-practice";

type CategorySlug = "ce" | "co" | "ee" | "eo";

interface FreemiumRestrictedProps {
  categorySlug: CategorySlug;
}

const categoryLabels: Record<CategorySlug, string> = {
  ce: "Compréhension Écrite",
  co: "Compréhension Orale",
  ee: "Expression Écrite",
  eo: "Expression Orale",
};

export function FreemiumRestricted({ categorySlug }: FreemiumRestrictedProps) {
  const router = useRouter();

  return (
    <PracticeLayout>
      <Header
        title="Accès restreint"
        onClose={() => router.push(`/compte/essai-gratuit?type=${categorySlug}`)}
      />
      <div className="container mx-auto lg:p-6 p-2 max-w-xl">
        <div>
          <div className="flex flex-col items-center justify-center py-12">
            <Info className="h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-2xl mb-2 text-center">
              Cet exercice n&apos;est pas disponible en essai gratuit
            </h3>
            <p className="text-gray-600 text-center text-sm max-w-sm mb-6">
              Cet exercice fait partie de nos offres premium. Pour y accéder,
              veuillez souscrire à un abonnement.
            </p>
            <div className="flex lg:flex-row flex-col gap-3">
              <Button
                onClick={() => router.push("/compte/abonner")}
                variant="tertiary"
              >
                S'abonner maintenant
              </Button>
              <Button
                onClick={() =>
                  router.push(`/compte/essai-gratuit?type=${categorySlug}`)
                }
                variant="outline"
              >
                Voir les exercices gratuits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PracticeLayout>
  );
}
