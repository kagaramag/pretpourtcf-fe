"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Trainer from "@/assets/images/trainer.svg";
import Practice from "@/assets/images/practice.svg";
import { useAuth } from "@/contexts/auth-context";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";
import { toast } from "sonner";
import { usePaymentStatus } from "@/hooks/use-payment-status";
import { Modal } from "@/components/molecules";

function PlansPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [formationPlans, setFormationPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [formationLoading, setFormationLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);

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
    loadFormationPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await subscriptionService.getAllPlans("preparation");
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast.error("Impossible de charger les plans");
    } finally {
      setLoading(false);
    }
  };

  const loadFormationPlans = async () => {
    try {
      setFormationLoading(true);
      const fetchedPlans = await subscriptionService.getAllPlans("training");
      console.log("Formation plans fetched:", fetchedPlans);
      console.log("Formation plans count:", fetchedPlans.length);
      console.log(
        "Formation plans after filter:",
        fetchedPlans.filter((plan) => plan.type !== "trial")
      );
      setFormationPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load formation plans:", error);
      toast.error("Impossible de charger les plans de formation");
    } finally {
      setFormationLoading(false);
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
          <div className="p-4 border border-gray-300 rounded-2xl">
            <h3 className="text-2xl font-semibold flex items-center justify-between">
              <span>{subscription.plan.name}</span>
              <span className="text-sm font-normal px-3 py-1 bg-green-100 text-green-700 rounded-full">
                Actif
              </span>
            </h3>
            {subscription.plan.type === "trial"
              ? "Plan découverte"
              : "Plan premium"}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prix</p>
                  <p className="text-lg font-semibold">
                    {subscription.plan.price === 0
                      ? "Gratuit"
                      : `${new Intl.NumberFormat("us-US", {
                          style: "currency",
                          currency: "USD",
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
            </div>
          </div>

          <div>
            <Button asChild className="w-full">
              <a href="/compte">Voir les pratiques</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getButtonType = (plan: any) => {
    if (plan.popular) {
      return "tertiary";
    }
    return "default";
  };

  const renderPlansForPractices = () => {
    return (
      <>
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
          <div className="flex flex-row gap-3">
            {plans
              .filter((plan) => plan.type !== "trial")
              .map((plan) => (
                <div
                  key={plan.id}
                  className={`relative w-1/3 p-4 border-2  border-primary ${plan.popular ? "bg-primary text-white" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-tertiary text-black px-3 py-1 text-sm">
                        Recommandé
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-semibold">{plan.name}</h3>
                  <div className={`text-sm text-gray-500 ${plan.popular ? "text-white/80" : ""}`}>
                    {plan.description}
                  </div>
                  <div className="my-3">
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full"
                      variant={getButtonType(plan)}
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
                          <span className="text-muted-foreground ml-2 text-sm">
                            / {plan.duration_days} jours
                          </span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          {plan?.duration_days} jours
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          Compréhension Orale: {plan.details?.co} tests
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          Compréhension Ecrite: {plan.details?.ce} tests
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          Expression Orale: {plan.details?.eo} tests
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          Expression Ecrite: {plan.details?.ee} tests
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs">
                          Correction automatique et détaillée
                        </span>
                      </li>
                      {plan.details.history ? (
                        <li className="flex items-start gap-3">
                          <Check
                            className={`h-4 w-4 flex-shrink-0 mt-0.5 text-green-500 `}
                          />
                          <span className={`text-xs`}>
                            Historique des pratiques
                          </span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-3 line-through opacity-50">
                          <Check
                            className={`h-4 w-4 flex-shrink-0 mt-0.5 text-gray-300 `}
                          />
                          <span className={`text-xs text-gray-400`}>
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
                  </div>
                </div>
              ))}
          </div>
        )}
      </>
    );
  };

  const renderPlansForFormation = () => {
    const filteredPlans = formationPlans.filter(
      (plan) => plan.type !== "trial"
    );

    return (
      <>
        {formationLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : formationPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun plan de formation disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Veuillez contacter l'administrateur.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Debug: Total plans = {formationPlans.length}, After filter ={" "}
              {filteredPlans.length}
            </p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Tous les plans de formation sont actuellement en mode essai.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Veuillez contacter l'administrateur pour activer les plans
              premium.
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Debug: Total plans = {formationPlans.length}, After filter ={" "}
              {filteredPlans.length}
            </p>
          </div>
        ) : (
          <div className="flex flex-row gap-3">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative w-1/2 p-4 border-2  border-primary ${plan.popular ? "bg-primary text-white" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-tertiary text-black px-3 py-1 text-sm">
                      Recommandé
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                 <div className={`text-sm text-gray-500 ${plan.popular ? "text-white/80" : ""}`}>
                    {plan.description}
                  </div>
                <div className="my-3">
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full"
                    variant={getButtonType(plan)}
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
                        <span className="text-muted-foreground ml-2 text-sm">
                          /{" "}
                          {plan.training_details?.duration_days ||
                            plan.duration_days}{" "}
                          jours
                        </span>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-3">
                      <Check className={`h-6 w-6 flex-shrink-0 mt-0.5 `} />
                      <span className={`text-sm`}>
                        Duree de la formation:{" "}
                        {plan.training_details?.duration_days} jours
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className={`h-6 w-6 flex-shrink-0 mt-0.5`} />
                      <span className={`text-sm`}>
                        Nombre de seances: {plan.training_details?.sessions}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // If user doesn't have a subscription, show plans
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Plans & Tarifs</h1>
        <h2 className="text-sm">
          Choisissez le plan qui vous convient pour accéder aux exercices TCF
          Canada ou Québec
        </h2>
      </div>
      <div className="flex flex-row gap-2">
        <div className="w-1/2 flex flex-row items-start bg-[#d3f4eb] gap-4 p-6">
          <div className="w-26 h-26">
            <Image
              src={Practice}
              width={72}
              height={72}
              priority
              alt="logo"
              className="w-full mx-auto"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-black/70">
              Pratiquez à votre rythme
            </h2>
            <h3 className="leading-tight mb-4 text-black/50 text-sm my-2">
              Accédez à les exercices interactifs, des examens et des
              corrections. Progressez seul, quand vous voulez, où vous voulez.
            </h3>
            <Button
              variant="tertiary"
              onClick={() => setIsModalOpen(true)}
              className="w-full"
            >
              Voir les Tarifs
            </Button>
          </div>
        </div>
        <div className="w-1/2 flex flex-row items-start bg-[#ece1f5] gap-4 p-6">
          <div className="w-26 h-26">
            <Image
              src={Trainer}
              width={72}
              height={72}
              priority
              alt="logo"
              className="w-full mx-auto"
            />
          </div>
          <div className="flex-1 pr-6">
            <h2 className="text-2xl font-semibold text-black/70">
              Apprenez avec un formateur
            </h2>
            <h3 className="leading-tight mb-4 text-black/50 text-sm my-2">
              Recevez une préparation personnalisée basée sur la méthodologie du
              TCF avec nos formateurs experts.
            </h3>
            <Button
              onClick={() => setIsFormationModalOpen(true)}
              variant={"secondary"}
              className="w-full"
            >
              Voir les Tarifs
            </Button>
          </div>
        </div>
      </div>

      {/* Free Practice Banner */}
      <div className="px-4 sm:px-6 lg:px-8  bg-gray-800 text-white border-none p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-1">
            Essai Gratuit
          </h2>
          <h3 className="text-white/90 leading-none">
            Découvrez notre plateforme avec des exercices gratuits. Aucune carte
            de crédit requise.
          </h3>
        </div>
        <NavigationLink href="/compte/essai-gratuit">
          <Button variant="tertiary">Essai Gratuit</Button>
        </NavigationLink>
      </div>

      {/* Practice Plans Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Plans & Tarifs - Pratique"
      >
        {renderPlansForPractices()}
      </Modal>

      {/* Formation Plans Modal */}
      <Modal
        isOpen={isFormationModalOpen}
        onClose={() => setIsFormationModalOpen(false)}
        title="Plans & Tarifs - Formation"
      >
        {renderPlansForFormation()}
      </Modal>
    </div>
  );
}

export default PlansPage;
