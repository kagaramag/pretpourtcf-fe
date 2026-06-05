"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, Building2 } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import CorporateSubscription from "./corporate-subscription";
import IndividualSubscription from "./individual-subscription";

function PlansPage() {
  const { user, refreshUser, isLoading } = useAuth();

  // Listen for real-time payment status updates via WebSocket
  usePaymentStatus({
    onSuccess: async () => {
      await refreshUser();
    },
    showToast: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Active subscription — show details regardless of corporate status
  if (user?.subscription) {
    const { subscription } = user;
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);

    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl">Mon abonnement</h1>
          <h5 className="text-gray-600">
            Gérez votre abonnement et consultez les détails
          </h5>
        </div>

        <div className="grid gap-6 max-w-3xl">
          {user?.corporate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">
                    {user.corporate.name}
                  </p>
                  <p className="text-sm text-blue-700">Abonnement entreprise</p>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  ENTREPRISE
                </span>
              </div>
            </div>
          )}
          <div className="lg:p-4 p-2 border border-gray-200 rounded-xl">
            <h3 className="lg:text-2xl text-xl flex items-center justify-between">
              <span>{subscription.plan.name}</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                ACTIF
              </span>
            </h3>
            {subscription.plan.type === "trial"
              ? "Plan découverte"
              : user?.corporate
                ? "Plan entreprise"
                : "Plan premium"}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Prix</p>
                  <p className="text-lg">
                    {subscription.plan.price_rwf === 0
                      ? "Gratuit"
                      : `${new Intl.NumberFormat("fr-RW").format(subscription.plan.price_rwf)} RWF / $${subscription.plan.price_usd}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg">
                    {subscription.plan.duration_days} jours
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">
                      {startDate.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de fin</p>
                    <p className="font-medium">
                      {endDate.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">
                      {subscription.days_remaining} jour(s)
                    </span>{" "}
                    restant(s) sur votre abonnement
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button href="/compte" className="w-full">
              Voir les pratiques
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No active subscription — show plan selection + free practice banner
  return (
    <div className="flex flex-col gap-6">

      {user?.corporate ? (
        <CorporateSubscription />
      ) : (
        <IndividualSubscription />
      )}

      {/* Free Practice Banner */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 rounded-3xl bg-primary/10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 flex flex-col text-center md:text-left">
          <h2 className="text-xl sm:text-2xl">Essai Gratuit</h2>
          <div className="leading-none text-gray-900/60">
            Découvrez notre plateforme avec des exercices gratuits. Aucune carte
            de crédit requise.
          </div>
        </div>
        <NavigationLink href="/compte/essai-gratuit">
          <Button variant="outline" size="lg">Essai Gratuit</Button>
        </NavigationLink>
      </div>
    </div>
  );
}

export default PlansPage;
