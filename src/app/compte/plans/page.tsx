"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { paymentService } from "@/services/payment";
import { SubscriptionPlan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CheckoutDialog } from "@/components/subscription/checkout-dialog";
import { useSearchParams } from "next/navigation";

// Separate component for handling search params
function PaymentCallbackHandler({ onPaymentCheck }: { onPaymentCheck: (checking: boolean) => void }) {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    const paymentStatus = searchParams.get("payment");
    const transactionId = searchParams.get("transaction_id");

    if (paymentStatus === "success") {
      onPaymentCheck(true);
      toast.loading("Vérification du paiement...");

      try {
        // Get user's recent transactions to find the pending one
        const transactionsData = await paymentService.getMyTransactions(1, 5);

        // Find the most recent pending or successful transaction
        const recentTransaction = transactionsData.transactions.find(
          (t) => t.status === "pending" || t.status === "successful"
        );

        if (recentTransaction) {
          // Check the transaction status
          const transaction = await paymentService.checkTransactionStatus(recentTransaction.id);

          if (transaction.status === "successful") {
            toast.dismiss();
            toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
            await refreshUser();
            // Remove query params from URL
            window.history.replaceState({}, "", "/compte/plans");
          } else if (transaction.status === "failed") {
            toast.dismiss();
            toast.error("Le paiement a échoué. Veuillez réessayer.");
            window.history.replaceState({}, "", "/compte/plans");
          } else {
            // Still pending - poll for status
            toast.dismiss();
            toast.info("Paiement en cours de traitement...");
            pollForPaymentStatus(recentTransaction.id);
          }
        } else {
          toast.dismiss();
          toast.info("Vérification du paiement. Veuillez patienter...");
          // Refresh user to check if subscription was created
          await refreshUser();
          window.history.replaceState({}, "", "/compte/plans");
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        toast.dismiss();
        toast.warning("Impossible de vérifier le statut du paiement. Veuillez rafraîchir la page.");
      } finally {
        onPaymentCheck(false);
      }
    }
  };

  const pollForPaymentStatus = async (transactionId: string, attempts = 0) => {
    const maxAttempts = 20; // Poll for ~3 minutes (20 * 10 seconds)

    if (attempts >= maxAttempts) {
      toast.warning("Le paiement prend plus de temps que prévu. Veuillez vérifier votre historique des transactions.");
      window.history.replaceState({}, "", "/compte/plans");
      return;
    }

    setTimeout(async () => {
      try {
        const transaction = await paymentService.checkTransactionStatus(transactionId);

        if (transaction.status === "successful") {
          toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
          await refreshUser();
          window.history.replaceState({}, "", "/compte/plans");
        } else if (transaction.status === "failed") {
          toast.error("Le paiement a échoué. Veuillez réessayer.");
          window.history.replaceState({}, "", "/compte/plans");
        } else {
          // Still pending, continue polling
          pollForPaymentStatus(transactionId, attempts + 1);
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
        // Stop polling on error
        window.history.replaceState({}, "", "/compte/plans");
      }
    }, 10000); // Poll every 10 seconds
  };

  return null;
}

function PlansPageContent() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      console.log("Loading plans...");
      const fetchedPlans = await subscriptionService.getAllPlans();
      console.log("Fetched plans:", fetchedPlans);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast.error("Impossible de charger les plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = async () => {
    await refreshUser();
  };

  // If user has an active subscription, show subscription details
  if (user?.subscription) {
    const { subscription } = user;
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);

    return (
      <div className="container mx-auto p-6">
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
                {subscription.plan.type === "trial" ? "Plan découverte" : "Plan premium"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="text-lg font-semibold">
                    {subscription.plan.price === 0
                      ? "Gratuit"
                      : `${new Intl.NumberFormat("fr-RW", {
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
                    <p className="text-sm text-muted-foreground">Date de début</p>
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

  // If user doesn't have a subscription, show plans
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Plans & Tarifs</h1>
        <p className="text-muted-foreground">
          Choisissez le plan qui vous convient pour accéder aux exercices TCF
        </p>
      </div>

      {loading || checkingPayment ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {checkingPayment && (
            <p className="ml-3 text-muted-foreground">Vérification du paiement...</p>
          )}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun plan disponible pour le moment.</p>
          <p className="text-sm text-muted-foreground mt-2">Veuillez contacter l'administrateur.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.type === "premium" ? "border-primary shadow-lg" : ""}`}
            >
              {plan.type === "premium" && (
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
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0
                      ? "Gratuit"
                      : new Intl.NumberFormat("fr-RW", {
                          style: "currency",
                          currency: "RWF",
                          minimumFractionDigits: 0,
                        }).format(plan.price)}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    / {plan.duration_days} jours
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full"
                  variant={plan.type === "premium" ? "default" : "outline"}
                >
                  Choisir ce plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        plan={selectedPlan}
        onSuccess={handlePaymentSuccess}
      />

      {/* Payment callback handler wrapped in Suspense */}
      <Suspense fallback={null}>
        <PaymentCallbackHandler onPaymentCheck={setCheckingPayment} />
      </Suspense>
    </div>
  );
}

// Main page component wrapper
export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PlansPageContent />
    </Suspense>
  );
}
