"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { paymentService } from "@/services/payment";
import { SubscriptionPlan } from "@/types";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Visa from "@/assets/images/visa.svg";
import Mastercard from "@/assets/images/mastercard.svg";
import Amex from "@/assets/images/amex.svg";
import Momo from "@/assets/images/mtn-momo.jpg";
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
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@/icons";
import { config } from "@/config";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import AccountLayout from "@/layouts/account";

type PaymentStatus = "form" | "processing" | "success" | "failed" | "pending";

function Abonner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cc" | "spenn">(
    "cc"
  );
  const [currency, setCurrency] = useState<"RWF" | "USD">("USD"); // Default to USD (Pesapal)
  const [msisdn, setMsisdn] = useState("");
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
      const foundPlan = await subscriptionService.getPlanById(planId);

      if (!foundPlan) {
        toast.error("Plan non trouvé");
        router.push("/compte/plans");
        return;
      }

      setPlan(foundPlan);
    } catch (error) {
      console.error("Failed to load plan:", error);
      toast.error("Impossible de charger le plan(code: A001)");
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

    // Validate phone number for mobile money
    if (paymentMethod === "momo") {
      if (!msisdn) {
        toast.error("Veuillez entrer votre numéro de téléphone");
        return;
      }
      if (!/^(078|079|072|073)\d{7}$/.test(msisdn)) {
        toast.error(
          "Veuillez entrer un numéro de téléphone valide (ex: 0781234567)"
        );
        return;
      }
    }

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
        msisdn:
          paymentMethod === "momo" ? `250${msisdn.substring(1)}` : undefined,
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
                  <span className="text-sm text-gray-600">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Montant</span>
                  <span className="font-semibold">
                    {formatPrice(getPrice(), currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Durée</span>
                  <span className="font-semibold">
                    {plan.duration_days} jours
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Vous pouvez maintenant accéder à toutes les fonctionnalités de
                votre abonnement.
              </p>
              <p className="text-xs text-green-600 font-medium">
                ✓ Abonnement activé et enregistré
              </p>
            </div>
          </div>
          <CardFooter className="flex flex-col gap-2">
            <Button
              size="lg"
              onClick={() => router.push("/compte")}
              className="w-full"
            >
              Commencer les exercices
            </Button>
            <Button
              variant="outline"
              size="lg"
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
          <h3 className="font-semibold text-2xl text-red-700">
            Paiement échoué
          </h3>
          Le paiement n'a pas pu être traité
          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                Votre paiement n'a pas pu être complété. Veuillez vérifier vos
                informations et réessayer.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Raisons possibles:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Solde insuffisant</li>
                <li>Transaction annulée</li>
                <li>Problème de connexion</li>
                <li>Carte expirée ou invalide</li>
              </ul>
            </div>
          </div>
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
              Retour
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
          <h3 className="font-semibold text-2xl text-yellow-700">
            {isCardPayment
              ? "Vérification du paiement..."
              : "En attente de confirmation..."}
          </h3>
          {isCardPayment
            ? "Nous vérifions votre paiement"
            : "Veuillez approuver le paiement sur votre téléphone"}
          <div className="space-y-4">
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

            <p className="text-xs text-center text-gray-600">
              {isMobileMoney
                ? "Nous écoutons les mises à jour en temps réel de Mobile Money..."
                : "Vérification en cours..."}
            </p>
          </div>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-xs text-center text-gray-600 w-full">
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
              Retour
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-5 flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => router.push("/compte/plans")}
          icon="arrowLeft"
          size="sm"
        >
          Retour
        </Button>
        <h3 className="text-2xl font-semibold">Finaliser votre abonnement</h3>
      </div>

      <div className="bg-linear-to-r from-rose-100 via-gray-50 to-teal-100 p-4 rounded-4xl">
        <div className="bg-white rounded-3xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {/* <div className="mb-3">
            Choisissez votre méthode de paiement pour activer votre abonnement
          </div> */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg">Plan {plan.name}</h2>
                  {plan.description && (
                    <div className="text-gray-600 mt-1">{plan.description}</div>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-3">
                    <Icon name="check" size={20} />
                    <span>{plan.duration_days} jours</span>
                  </li>
                  {plan.details.co > 0 && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Compréhension Orale: {plan.details.co} tests</span>
                    </li>
                  )}
                  {plan.details.ce > 0 && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Compréhension Ecrite: {plan.details.ce} tests</span>
                    </li>
                  )}
                  {plan.details.eo > 0 && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Expression Orale: {plan.details.eo} tests</span>
                    </li>
                  )}
                  {plan.details.ee > 0 && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Expression Ecrite: {plan.details.ee} tests</span>
                    </li>
                  )}
                  {plan.details.correction && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Correction automatique et détaillée</span>
                    </li>
                  )}
                  {plan.details.history && (
                    <li className="flex items-center gap-3">
                      <Icon name="check" size={20} />
                      <span>Historique des pratiques</span>
                    </li>
                  )}
                  {plan.features
                    .filter(
                      (f) =>
                        ![
                          "co",
                          "ce",
                          "eo",
                          "ee",
                          "correction",
                          "history",
                        ].includes(f.toLowerCase())
                    )
                    .map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Icon
                          name="check"
                          size={20}
                          className="text-green-500 shrink-0"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>

                <div className="bg-primary/5 rounded-lg p-3 text-sm text-primary">
                  Accès à plus de 3 000 exercices pour préparer votre TCF
                </div>
              </div>
            </div>
            <div className="w-full lg:w-120 p-4 rounded-3xl border border-gray-200">
              <div className="space-y-2">
                {/* Plan Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Plan</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Durée</span>
                    <span>{plan.duration_days} jours</span>
                  </div>
                  {promoCodeApplied && discountPercentage > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Prix original</span>
                        <span className="line-through text-gray-600">
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
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="text-xl text-primary">
                      {formatPrice(calculateFinalPrice(), currency)}
                    </span>
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    Code promo
                  </h3>
                  {!promoCodeApplied ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrez votre code promo"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        disabled={validatingPromo}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && promoCode.trim()) {
                            handleApplyPromoCode();
                          }
                        }}
                      />
                      <Button
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
                          <p className="font-medium text-green-900">
                            {promoCode}
                          </p>
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
                    onValueChange={(value) =>
                      setCurrency(value as "RWF" | "USD")
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="RWF" id="rwf" />
                      <Label htmlFor="rwf" className="cursor-pointer flex-1">
                        {/* <div className="font-medium">RWF</div> */}
                        <div className="text-sm text-gray-600">
                          {formatPrice(plan.price_rwf || 0, "RWF")}
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="USD" id="usd" />
                      <Label htmlFor="usd" className="cursor-pointer flex-1">
                        {/* <div className="font-medium">USD</div> */}
                        <div className="text-sm text-gray-600">
                          {formatPrice(plan.price_usd || 0, "USD")}
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Method Selection - Only show if price > 0 */}
                {calculateFinalPrice() > 0 && (
                  <div className="space-y-3">
                    <h4>Méthode de paiement</h4>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as "momo" | "cc" | "spenn")
                      }
                    >
                      <div
                        className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${paymentMethod === "cc" ? "border-primary bg-primary/5" : ""}`}
                      >
                        <RadioGroupItem value="cc" id="cc" />
                        <Label
                          htmlFor="cc"
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <CreditCard className="h-5 w-5" />
                          <div className="flex-1">Carte bancaire</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Image
                              src={Visa}
                              width={32}
                              height={12}
                              priority
                              alt="Visa"
                            />
                            <Image
                              src={Mastercard}
                              width={32}
                              height={12}
                              priority
                              alt="Mastercard"
                            />
                            <Image
                              src={Amex}
                              width={32}
                              height={12}
                              priority
                              alt="Amex"
                            />
                          </div>
                        </Label>
                      </div>
                      {/* Mobile Money - temporarily disabled
                <div
                  className={`flex items-center space-x-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${paymentMethod === "momo" ? "border-primary bg-primary/5" : ""}`}
                >
                  <RadioGroupItem value="momo" id="momo" />
                  <Label
                    htmlFor="momo"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Smartphone className="h-5 w-5" />
                    <div className="flex-1">Mobile Money(Rwanda)</div>
                    <div>
                      <Image
                        src={Momo}
                        width={64}
                        height={20}
                        priority
                        alt="MTN MoMo"
                        className="rounded"
                      />
                    </div>
                  </Label>
                </div>
                */}
                    </RadioGroup>

                    {/* Phone Number Input for Mobile Money - temporarily disabled
              {paymentMethod === "momo" && (
                <div className="space-y-2">
                  <Label htmlFor="msisdn">Numéro de téléphone</Label>
                  <Input
                    id="msisdn"
                    type="tel"
                    placeholder="078XXXXXXX"
                    value={msisdn}
                    onChange={(e) => setMsisdn(e.target.value)}
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-600">
                    Entrez votre numéro MTN Mobile Money pour recevoir la
                    demande de paiement
                  </p>
                </div>
              )}
              */}
                  </div>
                )}
              </div>
              <div className="flex gap-2 my-3">
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  size={"lg"}
                  block
                  variant="tertiary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : calculateFinalPrice() === 0 ? (
                    "Activer l'abonnement gratuitement"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Icon name="verified" size={18} />
                      Payer {formatPrice(calculateFinalPrice(), currency)}
                    </span>
                  )}
                </Button>
              </div>
              <div className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
                <Icon name="verified" size={14} />
                Paiement sécurisé et chiffré
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-sm text-gray-500 mb-2">
                  Besoin d&apos;un autre moyen de paiement ou d&apos;aide ?
                </p>
                <div className="space-y-1.5 text-sm">
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  >
                    <Icon name="email" size={16} />
                    {config.contactEmail}
                  </a>
                  <a
                    href={`tel:${config.contactPhone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary"
                  >
                    <Icon name="phone" size={16} />
                    {config.contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
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
        <Abonner />
      </Suspense>
    </AccountLayout>
  );
}
