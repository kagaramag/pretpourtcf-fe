"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { paymentService } from "@/services/payment";
import { SubscriptionPlan } from "@/types";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Visa from "@/assets/images/visa.svg";
import Mastercard from "@/assets/images/mastercard.svg";
import Amex from "@/assets/images/amex.svg";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Tag,
  X,
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
  const [paymentMethod] = useState<"momo" | "cc" | "spenn">("cc"); // Fixed to card payment only
  const [currency, setCurrency] = useState<"RWF" | "USD">("USD"); // Default to USD (Pesapal)
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageStatus, setPageStatus] = useState<PaymentStatus>("form");
  const [currentTransactionId, setCurrentTransactionId] = useState<
    string | null
  >(null);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<
    string | null
  >(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for real-time payment status updates via WebSocket
  usePaymentStatus({
    onSuccess: async (data) => {
      // Only handle if it's for the current transaction
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log(
          "[WEBSOCKET] Payment success received for current transaction"
        );

        // Stop polling since we got the result via WebSocket
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Refresh user to get updated subscription
        console.log(
          "[WEBSOCKET] Refreshing user data to get updated subscription..."
        );
        await refreshUser();

        setPageStatus("success");
        toast.success(
          "Paiement réussi! Votre abonnement est maintenant actif."
        );
      }
    },
    onFailed: (data) => {
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log(
          "[WEBSOCKET] Payment failed received for current transaction"
        );

        // Stop polling since we got the result via WebSocket
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        setPageStatus("failed");
        toast.error(
          data.message || "Le paiement a échoué. Veuillez réessayer."
        );
      }
    },
    onPending: (data) => {
      if (currentTransactionId && data.transactionId === currentTransactionId) {
        console.log(
          "[WEBSOCKET] Payment pending received for current transaction"
        );
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
    // Check if this is a callback from payment gateway (KPay or Pesapal)
    const status = searchParams.get("status");
    const txnId = searchParams.get("transaction_id");
    const method = searchParams.get("method"); // Get payment method from URL
    const gateway = searchParams.get("gateway"); // Get payment gateway from URL

    if (status === "callback" && txnId) {
      console.log(
        `[CALLBACK] Received callback for ${gateway || "unknown"} gateway, method: ${method}, transaction: ${txnId}`
      );
      setCurrentTransactionId(txnId);
      setCurrentPaymentMethod(method);
      setPageStatus("processing");

      // For Pesapal or card/spenn payments, check status immediately since user is coming back from payment page
      // The payment should already be processed
      if (gateway === "pesapal" || method === "cc" || method === "spenn") {
        console.log(
          "[CALLBACK] Pesapal/Card/SPENN payment - checking status immediately"
        );
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

      console.log(
        `[IMMEDIATE CHECK] Transaction status: ${transaction.status}`
      );

      if (transaction.status === "successful") {
        // Ensure subscription was created
        if (transaction.subscription_id) {
          console.log(
            `[IMMEDIATE CHECK] Subscription found: ${transaction.subscription_id}`
          );
        } else {
          console.warn(
            `[IMMEDIATE CHECK] Transaction successful but no subscription_id found`
          );
        }

        setPageStatus("success");
        await refreshUser();
        toast.success(
          "Paiement réussi! Votre abonnement est maintenant actif."
        );
      } else if (transaction.status === "failed") {
        setPageStatus("failed");
        toast.error("Le paiement a échoué. Veuillez réessayer.");
      } else {
        // If still pending for card payment, poll with shorter interval and fewer attempts
        // Card payments should be resolved quickly after redirect
        console.log(
          "[IMMEDIATE CHECK] Status still pending, will poll briefly"
        );
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

        console.log(
          `[POLLING] Attempt ${attempts}/${maxAttempts}: Transaction status = ${transaction.status}`
        );

        if (transaction.status === "successful") {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Verify subscription was created
          if (transaction.subscription_id) {
            console.log(
              `[POLLING] Subscription verified: ${transaction.subscription_id}`
            );
          } else {
            console.warn(
              `[POLLING] Transaction successful but no subscription_id found, refreshing user anyway`
            );
          }

          setPageStatus("success");
          await refreshUser();
          toast.success(
            "Paiement réussi! Votre abonnement est maintenant actif."
          );
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
          toast.warning(
            "Le délai d'attente du paiement est dépassé. Veuillez vérifier l'historique des transactions."
          );
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
          toast.error(
            "Impossible de vérifier le statut du paiement. Veuillez contacter le support."
          );
        }
      }
    }, intervalMs);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim() || !plan) return;

    try {
      setValidatingPromo(true);
      const validation = await paymentService.validatePromoCode(
        promoCode.trim(),
        plan.id
      );

      if (validation.valid && validation.discount_percentage !== undefined) {
        setPromoCodeApplied(true);
        setDiscountPercentage(validation.discount_percentage);
        toast.success(
          `Code promo appliqué! ${validation.discount_percentage}% de réduction`
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code promo invalide");
      setPromoCodeApplied(false);
      setDiscountPercentage(0);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setPromoCodeApplied(false);
    setDiscountPercentage(0);
  };

  const calculateFinalPrice = () => {
    if (!plan) return 0;
    const basePrice = currency === "USD" ? plan.price_usd : plan.price_rwf;
    if (promoCodeApplied && discountPercentage > 0) {
      return Math.max(0, basePrice - (basePrice * discountPercentage) / 100);
    }
    return basePrice;
  };

  const handlePayment = async () => {
    if (!plan) return;

    try {
      const finalPrice = calculateFinalPrice();

      setLoading(true);

      console.log(
        `[PAYMENT] Initiating ${finalPrice === 0 ? "free" : paymentMethod} payment for plan: ${plan.name}`
      );

      const response = await paymentService.initiatePayment({
        plan_id: plan.id,
        payment_method: paymentMethod,
        currency: currency,
        payment_gateway: "pesapal", // Use Pesapal as default gateway
        promo_code: promoCodeApplied ? promoCode.trim() : undefined,
      });

      console.log("[PAYMENT] Payment initiation response:", {
        transactionId: response.transaction.id,
        status: response.transaction.status,
        paymentMethod: response.transaction.payment_method,
        hasCheckoutUrl: !!response.transaction.checkout_url,
      });

      setCurrentTransactionId(response.transaction.id);
      setCurrentPaymentMethod(paymentMethod);

      // If the payment was immediately successful (e.g., 100% promo code), show success
      if (response.transaction.status === "successful") {
        console.log(
          "[PAYMENT] Payment immediately successful (likely 100% discount)"
        );
        setPageStatus("success");
        await refreshUser();
        toast.success("Abonnement activé avec succès!");
        return;
      }

      // Check payment method to determine the flow
      // Card/SPENN payments redirect to checkout page
      // Mobile Money stays on waiting screen (even if KPay returns a checkout_url in test mode)
      if (paymentMethod === "cc" || paymentMethod === "spenn") {
        // Card/SPENN payment - redirect to checkout page if URL is provided
        if (response.transaction.checkout_url) {
          console.log(
            `[PAYMENT] Redirecting to ${paymentMethod} checkout page`
          );
          window.location.href = response.transaction.checkout_url;
          return;
        } else {
          console.error(
            `[PAYMENT] No checkout URL for ${paymentMethod} payment`
          );
          toast.error("Erreur: URL de paiement manquante");
          setPageStatus("form");
          return;
        }
      }

      // Mobile Money flow - show waiting screen and listen for status updates
      // Note: In test environment, KPay might return a checkout_url for MoMo but we ignore it
      console.log(
        `[PAYMENT] Checking transaction status: "${response.transaction.status}"`
      );

      if (response.transaction.status !== "failed") {
        console.log(`[PAYMENT] ✓ Mobile money payment initiated successfully`);
        console.log(
          "[PAYMENT] Showing waiting screen and starting WebSocket listener + polling"
        );

        // Show the waiting screen immediately
        setPageStatus("processing");

        toast.success(
          "Paiement initié! Veuillez vérifier votre téléphone pour approuver le paiement."
        );

        // Start polling for transaction status as backup to WebSocket
        // WebSocket should deliver updates faster, but polling ensures we don't miss anything
        console.log(
          "[PAYMENT] Starting polling every 10 seconds for transaction:",
          response.transaction.id
        );
        pollTransactionStatus(response.transaction.id, 10000, 60); // 10 seconds interval, 10 minutes max
      } else {
        // Payment initiation failed
        console.error(
          "[PAYMENT] ✗ Payment initiation failed with status:",
          response.transaction.status
        );
        toast.error("Échec de l'initiation du paiement. Veuillez réessayer.");
        setPageStatus("form");
      }
    } catch (error: any) {
      console.error("[PAYMENT] ✗ Payment error:", error);
      console.error("[PAYMENT] Error details:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });

      toast.error(
        error?.response?.data?.message ||
          "Échec de l'initiation du paiement. Veuillez réessayer."
      );
      setPageStatus("form");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, curr: "RWF" | "USD") => {
    return new Intl.NumberFormat(curr === "RWF" ? "rw-RW" : "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the price based on selected currency
  const getPrice = () => {
    if (!plan) return 0;
    if (currency === "USD") {
      return plan.price_usd;
    }
    return plan.price_rwf;
  };

  // Check if transaction has discount info (for showing in success screen)
  const hasTransactionDiscount = () => {
    // This would be populated from the transaction response
    return promoCodeApplied && discountPercentage > 0;
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
      <div className="container">
        <div>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-700">
              Paiement réussi!
            </h3>
            <div>Votre abonnement a été activé avec succès</div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="font-semibold">
                    {formatPrice(getPrice(), currency)}
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
          </div>
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
        </div>
      </div>
    );
  }

  // Failed State
  if (pageStatus === "failed") {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-red-200">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">
            Paiement échoué
          </CardTitle>
          Le paiement n'a pas pu être traité
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
    const isCardPayment =
      currentPaymentMethod === "cc" || currentPaymentMethod === "spenn";

    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-yellow-200">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-10 w-10 text-yellow-600 animate-pulse" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">
            {isCardPayment
              ? "Vérification du paiement..."
              : "En attente de confirmation..."}
          </CardTitle>
          {isCardPayment
            ? "Nous vérifions votre paiement"
            : "Veuillez approuver le paiement sur votre téléphone"}
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
                  Votre paiement par carte a été traité. Nous vérifions
                  maintenant son statut...
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

      <div>
        <h3 className="text-lg font-semibold">Finaliser votre abonnement</h3>
        Choisissez votre méthode de paiement pour activer votre abonnement
        <div className="space-y-2">
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
            {promoCodeApplied && discountPercentage > 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Prix original</span>
                  <span className="line-through text-muted-foreground">
                    {formatPrice(getPrice(), currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Réduction ({discountPercentage}%)</span>
                  <span>
                    -
                    {formatPrice(
                      (getPrice() * discountPercentage) / 100,
                      currency
                    )}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(calculateFinalPrice(), currency)}
              </span>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Code promo
            </h3>
            {!promoCodeApplied ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Entrez votre code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={validatingPromo}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && promoCode.trim()) {
                      handleApplyPromoCode();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim() || validatingPromo}
                >
                  {validatingPromo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validation...
                    </>
                  ) : (
                    "Appliquer"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{promoCode}</p>
                    <p className="text-xs text-green-700">
                      {discountPercentage}% de réduction appliquée
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Currency Selection */}
          <div className="space-y-3 hidden">
            <Label className="text-base">Devise</Label>
            <RadioGroup
              value={currency}
              onValueChange={(value) => setCurrency(value as "RWF" | "USD")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="RWF" id="rwf" />
                <Label htmlFor="rwf" className="cursor-pointer flex-1">
                  {/* <div className="font-medium">RWF</div> */}
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(plan.price_rwf || plan.price, "RWF")}
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="USD" id="usd" />
                <Label htmlFor="usd" className="cursor-pointer flex-1">
                  {/* <div className="font-medium">USD</div> */}
                  <div className="text-sm text-muted-foreground">
                    {formatPrice(plan.price_usd || plan.price, "USD")}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Payment Method Info - Only show if price > 0 */}
          {calculateFinalPrice() > 0 && (
            <div className="space-y-3">
              {/* <h4 className="font-semibold">Méthode de paiement</h4> */}
              <div className="flex items-start space-x-2">
                <Image
                  src={Mastercard}
                  width={54}
                  height={20}
                  priority
                  alt="VISA"
                />
                <Image src={Visa} width={54} height={20} priority alt="VISA" />
                <Image src={Amex} width={54} height={20} priority alt="VISA" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 my-3">
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1"
            size={"lg"}
            variant={"accent"}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : calculateFinalPrice() === 0 ? (
              "Activer l'abonnement gratuitement"
            ) : (
              `Payer ${formatPrice(calculateFinalPrice(), currency)}`
            )}
          </Button>
        </div>
      </div>
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
