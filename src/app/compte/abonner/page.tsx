"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { paymentService } from "@/services/payment";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import AccountLayout from "@/layouts/account";

type PaymentStatus = "form" | "processing" | "success" | "failed" | "pending";

function AbonnerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cc" | "spenn">(
    "momo"
  );
  const [msisdn, setMsisdn] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState<PaymentStatus>("form");
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for real-time payment status updates via WebSocket
  usePaymentStatus({
    onSuccess: async (data) => {
      // Only handle if it's for the current transaction
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log("[WEBSOCKET] Payment success received for current transaction");

        // Stop polling since we got the result via WebSocket
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Refresh user to get updated subscription
        console.log("[WEBSOCKET] Refreshing user data to get updated subscription...");
        await refreshUser();

        setPageStatus("success");
        toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
      }
    },
    onFailed: (data) => {
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log("[WEBSOCKET] Payment failed received for current transaction");

        // Stop polling since we got the result via WebSocket
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        setPageStatus("failed");
        toast.error(data.message || "Le paiement a échoué. Veuillez réessayer.");
      }
    },
    onPending: (data) => {
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log("[WEBSOCKET] Payment pending received for current transaction");
        // Only update to pending if not already in a final state
        if (pageStatus !== "success" && pageStatus !== "failed") {
          setPageStatus("pending");
        }
      }
    },
    showToast: false, // We'll handle toasts manually
  });

  useEffect(() => {
    loadPlan();
    checkCallbackStatus();

    // Cleanup function to clear polling interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const loadPlan = async () => {
    const planId = searchParams.get("plan_id");
    if (!planId) {
      router.push("/compte/plans");
      return;
    }

    try {
      const plans = await subscriptionService.getAllPlans();
      const selectedPlan = plans.find((p) => p.id === planId);

      if (!selectedPlan) {
        toast.error("Plan non trouvé");
        router.push("/compte/plans");
        return;
      }

      setPlan(selectedPlan);
    } catch (error) {
      console.error("Failed to load plan:", error);
      toast.error("Impossible de charger le plan");
      router.push("/compte/plans");
    }
  };

  const checkCallbackStatus = async () => {
    // Check if this is a callback from Kpay
    const status = searchParams.get("status");
    const txnId = searchParams.get("transaction_id");
    const method = searchParams.get("method"); // Get payment method from URL

    if (status === "callback" && txnId) {
      setCurrentTransactionId(txnId);
      setCurrentPaymentMethod(method);
      setPageStatus("processing");

      // For card/spenn payments, check status immediately since user is coming back from payment page
      // The payment should already be processed
      if (method === "cc" || method === "spenn") {
        console.log("[CALLBACK] Card/SPENN payment - checking status immediately");
        await checkImmediateStatus(txnId);
      } else {
        // For mobile money, start polling since payment might still be processing
        console.log("[CALLBACK] Mobile money payment - starting polling");
        pollTransactionStatus(txnId);
      }
    }
  };

  const checkImmediateStatus = async (txnId: string) => {
    try {
      const transaction = await paymentService.checkTransactionStatus(txnId);

      console.log(`[IMMEDIATE CHECK] Transaction status: ${transaction.status}`);

      if (transaction.status === "successful") {
        // Ensure subscription was created
        if (transaction.subscription_id) {
          console.log(`[IMMEDIATE CHECK] Subscription found: ${transaction.subscription_id}`);
        } else {
          console.warn(`[IMMEDIATE CHECK] Transaction successful but no subscription_id found`);
        }

        setPageStatus("success");
        await refreshUser();
        toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
      } else if (transaction.status === "failed") {
        setPageStatus("failed");
        toast.error("Le paiement a échoué. Veuillez réessayer.");
      } else {
        // If still pending for card payment, poll with shorter interval and fewer attempts
        // Card payments should be resolved quickly after redirect
        console.log("[IMMEDIATE CHECK] Status still pending, will poll briefly");
        setPageStatus("processing");
        pollTransactionStatus(txnId, 3000, 20); // Poll every 3 seconds for max 1 minute
      }
    } catch (error) {
      console.error("Error checking transaction status:", error);
      toast.error("Impossible de vérifier le statut du paiement.");
      setPageStatus("failed");
    }
  };

  const pollTransactionStatus = async (
    txnId: string,
    intervalMs: number = 10000, // Default: 10 seconds
    maxAttempts: number = 60 // Default: 60 attempts (10 minutes at 10s interval)
  ) => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    let attempts = 0;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;

      try {
        const transaction = await paymentService.checkTransactionStatus(txnId);

        console.log(`[POLLING] Attempt ${attempts}/${maxAttempts}: Transaction status = ${transaction.status}`);

        if (transaction.status === "successful") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Verify subscription was created
          if (transaction.subscription_id) {
            console.log(`[POLLING] Subscription verified: ${transaction.subscription_id}`);
          } else {
            console.warn(`[POLLING] Transaction successful but no subscription_id found, refreshing user anyway`);
          }

          setPageStatus("success");
          await refreshUser();
          toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
        } else if (transaction.status === "failed") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPageStatus("failed");
          toast.error("Le paiement a échoué. Veuillez réessayer.");
        } else if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPageStatus("failed");
          toast.warning("Le délai d'attente du paiement est dépassé. Veuillez vérifier l'historique des transactions.");
        }
        // If still pending, continue polling
      } catch (error) {
        console.error("Error polling transaction status:", error);
        if (attempts >= maxAttempts) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPageStatus("failed");
          toast.error("Impossible de vérifier le statut du paiement. Veuillez contacter le support.");
        }
      }
    }, intervalMs);
  };

  const handlePayment = async () => {
    if (!plan) return;

    try {
      // Validate phone number for mobile money
      if (paymentMethod === "momo" && !msisdn) {
        toast.error("Veuillez entrer votre numéro de téléphone");
        return;
      }

      if (
        paymentMethod === "momo" &&
        !/^(078|079|072|073)\d{7}$/.test(msisdn)
      ) {
        toast.error(
          "Veuillez entrer un numéro de téléphone valide (ex: 0781234567)"
        );
        return;
      }

      setLoading(true);

      const response = await paymentService.initiatePayment({
        plan_id: plan.id,
        payment_method: paymentMethod,
        msisdn: msisdn ? `250${msisdn.substring(1)}` : undefined,
      });

      setCurrentTransactionId(response.transaction.id);
      setCurrentPaymentMethod(paymentMethod);

      // If there's a checkout URL (for card/spenn payments), redirect to it
      if (response.transaction.checkout_url) {
        console.log(`[PAYMENT] Redirecting to ${paymentMethod} checkout page`);
        window.location.href = response.transaction.checkout_url;
        return;
      }

      // For mobile money, if payment was initiated successfully (not failed), show waiting screen
      // The transaction will be in "pending" status when retcode = 0 (being processed)
      if (response.transaction.status !== "failed") {
        console.log(`[PAYMENT] Mobile money payment initiated (status: ${response.transaction.status})`);
        console.log("[PAYMENT] Showing waiting screen and starting WebSocket listener + polling");

        // Show the waiting screen immediately
        setPageStatus("processing");
        toast.success(
          "Paiement initié! Veuillez vérifier votre téléphone pour approuver le paiement."
        );

        // Start polling for transaction status as backup to WebSocket
        // WebSocket should deliver updates faster, but polling ensures we don't miss anything
        pollTransactionStatus(response.transaction.id, 10000, 60); // 10 seconds interval, 10 minutes max
      } else {
        // Payment initiation failed
        console.log("[PAYMENT] Payment initiation failed");
        toast.error("Échec de l'initiation du paiement. Veuillez réessayer.");
        setPageStatus("form");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Échec de l'initiation du paiement. Veuillez réessayer."
      );
      setPageStatus("form");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!plan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success State
  if (pageStatus === "success") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Paiement réussi!
            </CardTitle>
            <CardDescription>
              Votre abonnement a été activé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="font-semibold">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <span className="font-semibold">
                    {plan.duration_days} jours
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant accéder à toutes les fonctionnalités de
                votre abonnement.
              </p>
              <p className="text-xs text-green-600 font-medium">
                ✓ Abonnement activé et enregistré
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={() => router.push("/compte")} className="w-full">
              Commencer les exercices
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/compte/plans")}
              className="w-full"
            >
              Voir mon abonnement
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Failed State
  if (pageStatus === "failed") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-red-200">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">
              Paiement échoué
            </CardTitle>
            <CardDescription>
              Le paiement n'a pas pu être traité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                Votre paiement n'a pas pu être complété. Veuillez vérifier vos
                informations et réessayer.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Raisons possibles:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Solde insuffisant</li>
                <li>Transaction annulée</li>
                <li>Problème de connexion</li>
                <li>Carte expirée ou invalide</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              onClick={() => {
                setPageStatus("form");
                setCurrentTransactionId(null);
              }}
              className="w-full"
            >
              Réessayer le paiement
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/compte/plans")}
              className="w-full"
            >
              Retour aux plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Pending/Processing State
  if (pageStatus === "pending" || pageStatus === "processing") {
    const isMobileMoney = currentPaymentMethod === "momo";
    const isCardPayment = currentPaymentMethod === "cc" || currentPaymentMethod === "spenn";

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-yellow-200">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-yellow-700">
              {isCardPayment ? "Vérification du paiement..." : "En attente de confirmation..."}
            </CardTitle>
            <CardDescription>
              {isCardPayment
                ? "Nous vérifions votre paiement"
                : "Veuillez approuver le paiement sur votre téléphone"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {isMobileMoney ? (
                <div className="space-y-3">
                  <p className="text-sm text-yellow-900 text-center font-medium">
                    Une demande de paiement a été envoyée à votre téléphone
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs text-yellow-800 text-center">
                      📱 Vérifiez votre téléphone Mobile Money
                    </p>
                    <p className="text-xs text-yellow-800 text-center">
                      ✓ Approuvez la transaction
                    </p>
                    <p className="text-xs text-yellow-800 text-center">
                      ⏱️ Cette page se mettra à jour automatiquement
                    </p>
                  </div>
                </div>
              ) : isCardPayment ? (
                <p className="text-sm text-yellow-900 text-center">
                  Votre paiement par carte a été traité. Nous vérifions maintenant son statut...
                </p>
              ) : (
                <p className="text-sm text-yellow-900 text-center">
                  Veuillez patienter pendant que nous vérifions votre paiement.
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>

            <p className="text-xs text-center text-muted-foreground">
              {isMobileMoney
                ? "Nous écoutons les mises à jour en temps réel de Mobile Money..."
                : "Vérification en cours..."}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground w-full">
              Ne fermez pas cette page pendant le traitement
            </p>
            <Button
              variant="outline"
              onClick={() => {
                // Clean up polling when user leaves
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }
                router.push("/compte/plans");
              }}
              className="w-full"
            >
              Retour aux plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/compte/plans")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux plans
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Finaliser votre abonnement</CardTitle>
          <CardDescription>
            Choisissez votre méthode de paiement pour activer votre abonnement
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Plan Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="font-semibold">{plan.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Durée</span>
              <span className="font-semibold">{plan.duration_days} jours</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(plan.price)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base">Méthode de paiement</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
            >
              <div className="">
                <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="momo" id="momo" />
                  <Label
                    htmlFor="momo"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-xs text-muted-foreground">
                        MTN, Airtel
                      </div>
                    </div>
                  </Label>
                </div>
                {/* Phone Number Input for Mobile Money */}
                {paymentMethod === "momo" && (
                  <div className="space-y-2 mt-2 px-4">
                    <Label htmlFor="msisdn">Numéro de téléphone</Label>
                    <Input
                      id="msisdn"
                      type="tel"
                      placeholder="078XXXXXXX"
                      value={msisdn}
                      onChange={(e) => setMsisdn(e.target.value)}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Entrez votre numéro Mobile Money pour recevoir la demande
                      de paiement
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="cc" id="cc" />
                <Label
                  htmlFor="cc"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Carte bancaire</div>
                    <div className="text-xs text-muted-foreground">
                      Visa, Mastercard, Amex
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="spenn" id="spenn" />
                <Label
                  htmlFor="spenn"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Wallet className="h-5 w-5" />
                  <div>
                    <div className="font-medium">SPENN</div>
                    <div className="text-xs text-muted-foreground">
                      Paiement via SPENN
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/compte/plans")}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button onClick={handlePayment} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer ${formatPrice(plan.price)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AbonnerPage() {
  return (
    <AccountLayout>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <AbonnerPageContent />
      </Suspense>
    </AccountLayout>
  );
}
