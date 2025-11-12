"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePaymentStatus } from "@/hooks/use-payment-status";

function PlansPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen for real-time payment status updates via WebSocket
  usePaymentStatus({
    onSuccess: async () => {
      // Payment successful - refresh user data
      await refreshUser();
    },
    showToast: true, // Show toast notifications automatically
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await subscriptionService.getAllPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast.error("Impossible de charger les plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // Navigate to the dedicated checkout page
    router.push(`/compte/abonner?plan_id=${plan.id}`);
  };

  // If user has an active subscription, show subscription details
  if (user?.subscription) {
    const { subscription } = user;
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);

    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mon Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et consultez les détails
          </p>
        </div>

        <div className="grid gap-6 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{subscription.plan.name}</span>
                <span className="text-sm font-normal px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Actif
                </span>
              </CardTitle>
              <CardDescription>
                {subscription.plan.type === "trial"
                  ? "Plan découverte"
                  : "Plan premium"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="text-lg font-semibold">
                    {subscription.plan.price === 0
                      ? "Gratuit"
                      : `${new Intl.NumberFormat("rw-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(subscription.plan.price)}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="text-lg font-semibold">
                    {subscription.plan.duration_days} jours
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date de début
                    </p>
                    <p className="font-medium">
                      {startDate.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de fin</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accéder aux pratiques</CardTitle>
              <CardDescription>
                Commencez vos exercices TCF maintenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/compte">Voir les pratiques</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getButtonType = (planType: string) => {
    if (planType === "premium") {
      return "default";
    }
    if (planType === "advanced") {
      return "secondary";
    }
    return "outline";
  };

  // If user doesn't have a subscription, show plans
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Plans & Tarifs</h1>
        <h2 className="text-muted-foreground">
          Choisissez le plan qui vous convient pour accéder aux exercices TCF
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun plan disponible pour le moment.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Veuillez contacter l'administrateur.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {plans
            .filter((plan) => plan.type !== "trial")
            .map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${plan.type === "premium" ? "border-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      Recommandé
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full"
                    variant={getButtonType(plan.type)}
                  >
                    Choisir ce plan
                  </Button>
                </CardFooter>
                <CardContent>
                  <div className="mb-2">
                    <div className="space-y-1">
                      <div>
                        <span className="text-2xl font-bold tracking-tight">
                          {plan.price_rwf === 0
                            ? "Gratuit"
                            : new Intl.NumberFormat("rw-RW", {
                                style: "currency",
                                currency: "RWF",
                                minimumFractionDigits: 0,
                              }).format(plan.price_rwf)}
                        </span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          / {plan.duration_days} jours
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {plan.price_usd === 0
                          ? ""
                          : `ou ${new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                            }).format(plan.price_usd)}`}
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {plan?.duration_days} jours
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Compréhension Orale: {plan.details?.co} tests
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Compréhension Ecrite: {plan.details?.ce} tests
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Expression Orale: {plan.details?.eo} tests
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Expression Ecrite: {plan.details?.ee} tests
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Correction automatique et détaillée
                      </span>
                    </li>
                    {plan.details.history ? (
                      <li className="flex items-start gap-3">
                        <Check
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 text-green-500 `}
                        />
                        <span className={`text-sm`}>
                          Historique des pratiques
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-3 line-through opacity-50">
                        <Check
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 text-gray-300 `}
                        />
                        <span className={`text-sm  text-gray-400`}>
                          Historique des pratiques
                        </span>
                      </li>
                    )}
                    {plan.details.streak ? (
                      <li className="flex items-start gap-3">
                        <Check
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 text-green-500 `}
                        />
                        <span className={`text-sm`}>
                          Accès aux séries de tests
                        </span>
                      </li>
                    ) : (
                      <li className="flex items-start gap-3 line-through opacity-50">
                        <Check
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 text-gray-300 `}
                        />
                        <span className={`text-sm  text-gray-400`}>
                          Accès aux séries de tests
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

export default PlansPage;
