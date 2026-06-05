"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Trainer from "@/assets/images/trainer.svg";
import Practice from "@/assets/images/practice.svg";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

function IndividualSubscription() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [formationPlans, setFormationPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formationLoading, setFormationLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        setLoading(true);
        const fetchedPlans =
          await subscriptionService.getPublicPlans("preparation");
        setPlans(fetchedPlans.filter((p) => p.type !== "trial"));
      } catch (error) {
        console.error("Failed to load plan:", error);
        toast.error("Impossible de charger le plan(code: I001)");
      } finally {
        setLoading(false);
      }
    };

    const loadFormationPlan = async () => {
      try {
        setFormationLoading(true);
        const fetchedPlans =
          await subscriptionService.getPublicPlans("training");
        setFormationPlans(fetchedPlans.filter((p) => p.type !== "trial"));
      } catch (error) {
        console.error("Failed to load formation plan:", error);
        toast.error("Impossible de charger le plan de formation(code: I002)");
      } finally {
        setFormationLoading(false);
      }
    };

    loadPlan();
    loadFormationPlan();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    router.push(`/compte/abonner?plan_id=${plan.id}`);
  };

  const getButtonVariant = (plan: SubscriptionPlan) =>
    plan.popular ? "tertiary" : "default";

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <div
      key={plan.id}
      className={`relative rounded-3xl p-4 border-2 border-primary ${plan.popular ? "bg-primary text-white" : ""}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-tertiary text-black px-3 py-1 text-sm rounded-full">
            Recommandé
          </span>
        </div>
      )}
      <h3 className="text-2xl">{plan.name}</h3>
      <div
        className={`text-sm text-gray-500 ${plan.popular ? "text-white/80" : ""}`}
      >
        {plan.description}
      </div>
      <div className="my-3">
        <Button
          onClick={() => handleSelectPlan(plan)}
          className="w-full"
          variant={getButtonVariant(plan)}
        >
          Choisir ce plan
        </Button>
      </div>
      <div>
        <div className="mb-2">
          <div className="space-y-1">
            <div>
              <span className="text-2xl font-bold tracking-tight">
                {plan.price_rwf === 0
                  ? "Gratuit"
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(plan.price_usd)}
              </span>
              <span className="text-gray-600 ml-2 text-sm">
                / {plan.duration_days} jours
              </span>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">{plan?.duration_days} jours</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">
              Compréhension Orale: {plan.details?.co} tests
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">
              Compréhension Ecrite: {plan.details?.ce} tests
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">
              Expression Orale: {plan.details?.eo} tests
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">
              Expression Ecrite: {plan.details?.ee} tests
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span className="text-xs">Correction automatique et détaillée</span>
          </li>
          {plan.details.history ? (
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
              <span className="text-xs">Historique des pratiques</span>
            </li>
          ) : (
            <li className="flex items-start gap-3 line-through opacity-50">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-gray-300" />
              <span className="text-xs text-gray-400">
                Historique des pratiques
              </span>
            </li>
          )}
          {plan.details.streak ? (
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-500" />
              <span className="text-sm">Accès aux séries de tests</span>
            </li>
          ) : (
            <li className="flex items-start gap-3 line-through opacity-50">
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-gray-300" />
              <span className="text-sm text-gray-400">
                Accès aux séries de tests
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );

  const renderFormationPlanCard = (plan: SubscriptionPlan) => (
    <div
      key={plan.id}
      className={`relative rounded-3xl lg:w-1/2 p-4 border-2 border-primary ${plan.popular ? "bg-primary text-white" : ""}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-tertiary text-black px-3 py-1 text-sm rounded-full">
            Recommandé
          </span>
        </div>
      )}
      <h3 className="text-2xl">{plan.name}</h3>
      <div
        className={`text-sm text-gray-500 ${plan.popular ? "text-white/80" : ""}`}
      >
        {plan.description}
      </div>
      <div className="my-3">
        <Button
          onClick={() => handleSelectPlan(plan)}
          className="w-full"
          variant={getButtonVariant(plan)}
        >
          Choisir ce plan
        </Button>
      </div>
      <div>
        <div className="mb-2">
          <div className="space-y-1">
            <div>
              <span className="text-2xl font-bold tracking-tight">
                {plan.price_rwf === 0
                  ? "Gratuit"
                  : new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                    }).format(plan.price_usd)}
              </span>
              <span className="ml-2 text-sm">
                / {plan.training_details?.duration_days || plan.duration_days}{" "}
                jours
              </span>
            </div>
          </div>
        </div>
        <ul className="space-y-1">
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 mt-0.5" />
            <span className="text-sm">
              Duree de la formation: {plan.training_details?.duration_days}{" "}
              jours
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Check className="h-6 w-6 shrink-0 mt-0.5" />
            <span className="text-sm">
              Nombre de seances: {plan.training_details?.sessions}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Débloquez votre préparation</h1>
        <h2 className="text-sm text-gray-600">
          Choisissez le plan qui vous convient pour accéder aux exercices TCF
          Canada ou Québec
        </h2>
      </div>
      {/* Practice section */}
      <div className="bg-linear-to-r from-rose-100 via-gray-50 to-teal-100 p-4 rounded-4xl">
        <div className="rounded-3xl bg-white p-4 lg:p-6">
          <div className="flex flex-row items-center mb-4">
            <div className="lg:w-16 w-16 lg:h-16 h-16">
              <Image
                src={Practice}
                width={40}
                height={40}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="flex-1">
              <h2 className="lg:text-2xl text-xl text-black/70">
                Pratiquez à votre rythme
              </h2>
              <div className="leading-tight text-gray-700 text-sm">
                Accédez à les exercices interactifs, des examens et des
                corrections. Progressez seul, quand vous voulez, où vous voulez.
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Aucun plan disponible pour le moment.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Veuillez contacter l&apos;administrateur.
              </p>
            </div>
          ) : (
            <div className="flex lg:flex-row flex-col gap-3">
              {plans.map((p) => (
                <div key={p.id} className="lg:w-1/3">
                  {renderPlanCard(p)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formation section */}
      <div className="bg-linear-to-r from-teal-100 via-gray-50 to-rose-100 p-4 rounded-4xl">
        <div className="rounded-3xl bg-white p-4 lg:p-6">
          <div className="flex flex-row items-center mb-4">
            <div className="lg:w-16 w-16 lg:h-16 h-16">
              <Image
                src={Trainer}
                width={40}
                height={40}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="flex-1">
              <h2 className="lg:text-2xl text-xl text-black/70">
                Apprenez avec un formateur
              </h2>
              <div className="leading-tight text-gray-700 text-sm">
                Recevez une préparation personnalisée basée sur la méthodologie du
                TCF avec nos formateurs experts.
              </div>
            </div>
          </div>
          {/* <div className="flex flex-row items-start rounded-3xl bg-[#ece1f5] lg:gap-4 gap-2 lg:p-6 p-4 mb-4">
          <div className="lg:w-26 w-20 lg:h-26 h-20">
            <Image
              src={Trainer}
              width={64}
              height={64}
              priority
              alt="logo"
              className="w-full mx-auto"
            />
          </div>
          <div className="flex-1">
            <h2 className="lg:text-2xl text-xl text-black/70">
              Apprenez avec un formateur
            </h2>
            <h3 className="leading-tight text-black/50 text-sm">
              Recevez une préparation personnalisée basée sur la méthodologie du
              TCF avec nos formateurs experts.
            </h3>
          </div>
        </div> */}
          {formationLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : formationPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Aucun plan de formation disponible pour le moment.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Veuillez contacter l&apos;administrateur.
              </p>
            </div>
          ) : (
            <div className="flex lg:flex-row flex-col gap-3">
              {formationPlans.map((p) => renderFormationPlanCard(p))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IndividualSubscription;
