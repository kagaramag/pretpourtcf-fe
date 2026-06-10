"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import { toast } from "sonner";
import { Icon } from "@/icons";
import { Permission, Calendar } from "@/icons";
import { useActivityTracker } from "@/hooks/useActivityTracker";

function CorporateSubscription() {
  const router = useRouter();
  const { trackClick } = useActivityTracker();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true);
        const fetchedPlan =
          await subscriptionService.getCorporatePlan("preparation");
        setPlan(fetchedPlan);
      } catch (error) {
        console.error("Failed to load plan:", error);
        toast.error("Impossible de charger le plan(code: C001)");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  const handleSelectPlan = () => {
    if (plan) {
      trackClick({ label: "Payer et débloquer mon accès", metadata: { planId: plan.id, planName: plan.name, planPrice: plan.price_rwf } });
      router.push(`/compte/abonner?plan_id=${plan.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Icon name="loading" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-linear-to-r from-rose-100 via-gray-50 to-teal-100 p-4">
      <div className="rounded-2xl bg-white px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-60 flex-1 flex flex-row items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary">
              <Permission className="h-[18px] w-[18px] text-black" />
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Débloquez votre préparation
              </h3>
              <div className="text-[15px] leading-relaxed text-gray-600">
                Activez votre accès complet pour vous entraîner librement et
                suivre votre progression.
              </div>
            </div>
          </div>

          <div className="min-w-[140px] text-right">
            <div className="text-[28px] font-medium leading-none text-gray-900">
              {plan.price_rwf.toLocaleString()} RWF
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-tertiary text-black px-2.5 py-1">
              <Calendar className="h-[15px] w-[15px]" />
              <span className="text-xs">
                Accès {plan.duration_days} jours
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSelectPlan}
          className="mt-6 w-full cursor-pointer rounded-lg bg-primary py-3 text-[15px] font-medium text-white transition hover:bg-gray-800 active:scale-[0.99]"
        >
          Payer et débloquer mon accès
        </button>

        <p className="mt-3 text-center text-xs text-gray-500">
          Paiement unique · Valable {plan.duration_days} jours à compter de
          l'activation
        </p>
      </div>
    </div>
  );
}

export default CorporateSubscription;
