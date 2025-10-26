import { useEffect, useCallback, useRef } from "react";
import { socketService } from "@/lib/socket";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

export interface PaymentStatusUpdate {
  transactionId: string;
  refid: string;
  amount: number;
  currency: string;
  status: "successful" | "failed" | "pending";
  message: string;
  timestamp: string;
}

interface UsePaymentStatusOptions {
  onSuccess?: (data: PaymentStatusUpdate) => void;
  onFailed?: (data: PaymentStatusUpdate) => void;
  onPending?: (data: PaymentStatusUpdate) => void;
  showToast?: boolean;
}

/**
 * Hook to listen for real-time payment status updates via WebSocket
 */
export function usePaymentStatus(options: UsePaymentStatusOptions = {}) {
  const { showToast = true, onSuccess, onFailed, onPending } = options;
  const { refreshUser } = useAuth();
  const toastIdRef = useRef<string | number | null>(null);

  const handlePaymentSuccess = useCallback(
    async (data: PaymentStatusUpdate) => {
      console.log("[PAYMENT] ✅ Payment successful:", data);

      // Dismiss any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      if (showToast) {
        toast.success(data.message || "Paiement effectué avec succès!", {
          description: `Montant: ${data.amount} ${data.currency}`,
          duration: 5000,
        });
      }

      // Refresh user data to get updated subscription
      try {
        await refreshUser();
      } catch (error) {
        console.error("[PAYMENT] Error refreshing user:", error);
      }

      // Call custom callback
      onSuccess?.(data);
    },
    [showToast, onSuccess, refreshUser]
  );

  const handlePaymentFailed = useCallback(
    (data: PaymentStatusUpdate) => {
      console.log("[PAYMENT] ❌ Payment failed:", data);

      // Dismiss any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      if (showToast) {
        toast.error(data.message || "Le paiement a échoué", {
          description: `Montant: ${data.amount} ${data.currency}`,
          duration: 5000,
        });
      }

      // Call custom callback
      onFailed?.(data);
    },
    [showToast, onFailed]
  );

  const handlePaymentPending = useCallback(
    (data: PaymentStatusUpdate) => {
      console.log("[PAYMENT] ⏳ Payment pending:", data);

      // Dismiss any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      if (showToast) {
        toastIdRef.current = toast.loading(
          data.message || "Paiement en cours de traitement...",
          {
            description: `Montant: ${data.amount} ${data.currency}`,
          }
        );
      }

      // Call custom callback
      onPending?.(data);
    },
    [showToast, onPending]
  );

  useEffect(() => {
    // Subscribe to payment events
    socketService.on("payment:success", handlePaymentSuccess);
    socketService.on("payment:failed", handlePaymentFailed);
    socketService.on("payment:pending", handlePaymentPending);

    console.log("[PAYMENT] Subscribed to payment status updates");

    // Cleanup on unmount
    return () => {
      socketService.off("payment:success", handlePaymentSuccess);
      socketService.off("payment:failed", handlePaymentFailed);
      socketService.off("payment:pending", handlePaymentPending);

      // Dismiss any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      console.log("[PAYMENT] Unsubscribed from payment status updates");
    };
  }, [handlePaymentSuccess, handlePaymentFailed, handlePaymentPending]);

  return {
    isConnected: socketService.isConnected(),
  };
}
