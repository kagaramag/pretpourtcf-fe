"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { SubscriptionPlan } from "@/types";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: SubscriptionPlan | null;
  onSuccess?: () => void;
}

export function CheckoutDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cc" | "spenn">("momo");
  const [msisdn, setMsisdn] = useState("");
  // Currency is determined by payment method: momo → RWF (kpay), cc → USD (pesapal)
  const currency: "RWF" | "USD" = paymentMethod === "momo" ? "RWF" : "USD";
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  // Get the price based on selected currency
  const getPrice = () => {
    if (currency === "USD") {
      return plan.price_usd || 0;
    }
    return plan.price_rwf || 0;
  };

  const handlePayment = async () => {
    try {
      // Validate phone number for mobile money
      if (paymentMethod === "momo" && !msisdn) {
        toast.error("Veuillez entrer votre numéro de téléphone");
        return;
      }

      if (paymentMethod === "momo" && !/^(078|079|072|073)\d{7}$/.test(msisdn)) {
        toast.error("Veuillez entrer un numéro de téléphone valide (ex: 0781234567)");
        return;
      }

      setLoading(true);

      const response = await paymentService.initiatePayment({
        plan_id: plan.id,
        payment_method: paymentMethod,
        currency: paymentMethod === "momo" ? "RWF" : "USD",
        msisdn: msisdn ? `250${msisdn.substring(1)}` : undefined,
      });

      // If there's a checkout URL (for card payments), redirect to it
      if (response.transaction.checkout_url) {
        window.location.href = response.transaction.checkout_url;
        return;
      }

      // For mobile money, show success message
      toast.success("Paiement initié! Veuillez vérifier votre téléphone pour approuver le paiement.");

      // Poll for transaction status
      pollTransactionStatus(response.transaction.id);

    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Échec de l'initiation du paiement. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const pollTransactionStatus = async (transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const transaction = await paymentService.checkTransactionStatus(transactionId);

        if (transaction.status === "successful") {
          clearInterval(interval);
          toast.success("Paiement réussi! Votre abonnement est maintenant actif.");
          onOpenChange(false);
          if (onSuccess) {
            onSuccess();
          }
        } else if (transaction.status === "failed") {
          clearInterval(interval);
          toast.error("Le paiement a échoué. Veuillez réessayer.");
          onOpenChange(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.warning("Le paiement est en attente. Veuillez vérifier l'historique des transactions.");
          onOpenChange(false);
        }
      } catch (error) {
        console.error("Error polling transaction status:", error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }
    }, 10000); // Poll every 10 seconds
  };

  const formatPrice = (price: number, curr: "RWF" | "USD") => {
    return new Intl.NumberFormat(curr === "RWF" ? "rw-RW" : "en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Finaliser votre abonnement"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={handlePayment} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer ${formatPrice(getPrice(), currency)}`
            )}
          </Button>
        </>
      }
    >
        <p className="text-muted-foreground">
          Choisissez votre méthode de paiement pour activer votre abonnement
        </p>

        <div className="space-y-6 py-4">
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
                {formatPrice(getPrice(), currency)}
              </span>
            </div>
          </div>


          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h4 className="text-base">Méthode de paiement</h4>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="momo" id="momo" />
                <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Smartphone className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Mobile Money</div>
                    <div className="text-sm text-muted-foreground">MTN, Airtel</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="cc" id="cc" />
                <Label htmlFor="cc" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Carte bancaire</div>
                    <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="spenn" id="spenn" />
                <Label htmlFor="spenn" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="h-5 w-5" />
                  <div>
                    <div className="font-medium">SPENN</div>
                    <div className="text-sm text-muted-foreground">Paiement via SPENN</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Phone Number Input for Mobile Money */}
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
              <p className="text-xs text-muted-foreground">
                Entrez votre numéro Mobile Money pour recevoir la demande de paiement
              </p>
            </div>
          )}
        </div>

    </Modal>
  );
}
