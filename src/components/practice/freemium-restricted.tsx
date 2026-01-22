"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
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
      <div className="container mx-auto p-6 max-w-xl">
        <div>
          <div className="p-6 flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-3xl font-semibold mb-2 text-center">
              Cet exercice n&apos;est pas disponible en essai gratuit
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Cet exercice fait partie de nos offres premium.<br />Pour y accéder,
              veuillez souscrire à un abonnement.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/compte/abonner")}
                variant="default"
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
