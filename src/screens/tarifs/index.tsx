"use client";

import { useEffect, useState } from "react";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Trainer from "@/assets/images/trainer.svg";
import Practice from "@/assets/images/practice.svg";
import { Check, Loading, Notebook, Laptop } from "@/icons";
import { NavigationLink } from "@/components/ui/navigation-link";
import { useActivityTracker } from "@/hooks/useActivityTracker";

const reasons = [
  {
    title: "Tests Authentiques",
    description: "Exercices conformes au format officiel du TCF",
    icon: <Notebook className="h-8 w-8" />,
  },
  {
    title: "Correction Détaillée",
    description: "Feedback immédiat pour progresser rapidement",
    icon: <Check className="h-8 w-8" />,
  },
  {
    title: "Suivi de Progression",
    description: "Analysez vos résultats et identifiez vos points forts",
    icon: <Check className="h-8 w-8" />,
  },
  {
    title: "Accès Flexible",
    description: "Pratiquez où vous voulez, quand vous voulez",
    icon: <Laptop className="h-8 w-8" />,
  },
];

function TarifsPage() {
  const { trackClick } = useActivityTracker();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"preparation" | "training">(
    "preparation"
  );

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await subscriptionService.getPublicPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCardClassName = (plan: SubscriptionPlan) => {
    if (plan.popular) {
      return "p-7 rounded-3xl flex-1 relative border-2 border-primary scale-105 bg-primary text-white";
    }
    return "p-7 rounded-3xl flex-1 relative border-2 border-primary bg-white";
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (plan.popular) {
      return "tertiary";
    }
    return "default";
  };

  return (
    <div className="min-h-screen">
      <div className="pb-2 pt-22">
        <div className="max-w-5xl w-full mx-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl b-4 text-center text-primary">
            Plans & Tarifs
          </h1>
          <div className="bg-primary/10 p-3 mt-4 rounded-full w-fit mx-auto flex gap-2">
            <Button
              variant={category === "preparation" ? "default" : "outline"}
              onClick={() => setCategory("preparation")}
            >
              Preparation
            </Button>
            <Button
              variant={category === "training" ? "default" : "outline"}
              onClick={() => setCategory("training")}
            >
              Formation
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-5xl w-full mx-auto">
        {category === "preparation" && (
          <div className="w-full flex items-center bg-[#d3f4eb] gap-2 p-4 rounded-3xl">
            <div className="w-16 h-16">
              <Image
                src={Practice}
                width={50}
                height={50}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl  text-black/70">
                Pratiquez à votre rythme
              </h2>
              <div className="leading-tight text-black/50 text-sm">
                Accédez à les exercices interactifs, des examens et des
                corrections. Progressez seul, quand vous voulez, où vous voulez.
              </div>
            </div>
          </div>
        )}
        {category === "training" && (
          <div className="w-full flex flex-row items-center bg-[#ece1f5] gap-2 p-4 rounded-3xl">
            <div className="w-16 h-16">
              <Image
                src={Trainer}
                width={50}
                height={50}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl f text-black/70">
                Apprenez avec un formateur
              </h2>
              <div className="leading-tight text-gray-600 text-sm">
                Recevez une préparation personnalisée basée sur la méthodologie
                du TCF avec nos formateurs experts.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-3 lg:px-0 py-8 sm:py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loading className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              Aucun plan disponible pour le moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Veuillez réessayer plus tard.
            </p>
          </div>
        ) : (
          <div className="flex lg:flex-row md:flex-row flex-col gap-6">
            {plans
              .filter(
                (plan) => plan.type !== "trial" && plan.category === category
              )
              .map((plan) => (
                <div key={plan.id} className={getCardClassName(plan)}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-tertiary text-black px-3 py-1.5  text-sm rounded-2xl">
                        Recommandé
                      </span>
                    </div>
                  )}

                  <h3
                    className={`text-2xl ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>

                  <div className="pb-2">
                    {/* Price */}
                    <div className="mb-2">
                      <div className="flex items-baseline gap-2">
                        <h4
                          className={`text-3xl font-bold ${
                            plan.popular ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {plan.price_rwf === 0
                            ? "Gratuit"
                            : new Intl.NumberFormat("us-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 0,
                              }).format(plan.price_usd)}
                        </h4>
                        {plan.price_rwf > 0 && (
                          <span
                            className={
                              plan.popular
                                ? "text-white/80 text-lg"
                                : "text-muted-foreground text-lg"
                            }
                          >
                            / {plan.duration_days} jours
                          </span>
                        )}
                      </div>
                    </div>
                    {/* training_details */}
                    {/* Features */}
                    {plan.category === "training" && (
                      <ul className="space-y-1">
                        <li className="flex items-start gap-3">
                          <Check
                            className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                              plan.popular ? "text-white" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              plan.popular ? "text-white" : "text-gray-700"
                            }`}
                          >
                            Duree de la formation:{" "}
                            {plan.training_details?.duration_days} jours
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check
                            className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                              plan.popular ? "text-white" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              plan.popular ? "text-white" : "text-gray-700"
                            }`}
                          >
                            Nombre de seances:{" "}
                            {plan.training_details?.sessions}
                          </span>
                        </li>
                      </ul>
                    )}
                    {plan.category === "preparation" && (
                      <ul className="space-y-1">
                        <li className="flex items-start gap-3">
                          <Check
                            className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                              plan.popular ? "text-white" : "text-green-500"
                            }`}
                          />
                          <span
                            className={`text-sm ${
                              plan.popular ? "text-white" : "text-gray-700"
                            }`}
                          >
                            Accès pour {plan.duration_days} jour
                            {plan.duration_days > 1 ? "s" : ""}
                          </span>
                        </li>

                        {plan.details && (
                          <>
                            <li className="flex items-start gap-3">
                              <Check
                                className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Compréhension Orale: {plan.details.co} test
                                {plan.details.co > 1 ? "s" : ""}
                              </span>
                            </li>

                            <li className="flex items-start gap-3">
                              <Check
                                className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Compréhension Écrite: {plan.details.ce} test
                                {plan.details.ce > 1 ? "s" : ""}
                              </span>
                            </li>

                            <li className="flex items-start gap-3">
                              <Check
                                className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Expression Orale: {plan.details.eo} test
                                {plan.details.eo > 1 ? "s" : ""}
                              </span>
                            </li>

                            <li className="flex items-start gap-3">
                              <Check
                                className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Expression écrite: {plan.details.ee} test
                                {plan.details.ee > 1 ? "s" : ""}
                              </span>
                            </li>

                            <li className="flex items-start gap-3">
                              <Check
                                className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Correction automatique et détaillée
                              </span>
                            </li>

                            {plan.details.history ? (
                              <li className="flex items-start gap-3">
                                <Check
                                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Historique des pratiques
                                </span>
                              </li>
                            ) : (
                              <li className="flex items-start gap-3 line-through opacity-50">
                                <Check
                                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Historique des pratiques
                                </span>
                              </li>
                            )}

                            {plan.details.streak ? (
                              <li className="flex items-start gap-3">
                                <Check
                                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Accès aux séries de tests
                                </span>
                              </li>
                            ) : (
                              <li className="flex items-start gap-3 line-through opacity-50">
                                <Check
                                  className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-sm ${
                                    plan.popular
                                      ? "text-white"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Accès aux séries de tests
                                </span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                  <NavigationLink href={`/compte/abonner?plan_id=${plan.id}`}>
                    <Button className="w-full" variant={getButtonVariant(plan)} onClick={() => trackClick({ label: "Choisir ce plan", metadata: { planId: plan.id, planName: plan.name, planPrice: plan.price_usd } })}>
                      Choisir ce plan
                    </Button>
                  </NavigationLink>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* Free Practice Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl  bg-gray-800 text-white border-none p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl sm:text-3xl">Essai Gratuit</h2>
          </div>
          <h3 className=" text-white/90 leading-none mt-2">
            Découvrez notre plateforme avec des exercices gratuits. Aucune carte
            de crédit requise.
          </h3>
        </div>
        <NavigationLink href="/compte/essai-gratuit">
          <Button size="lg" onClick={() => trackClick({ label: "Essai Gratuit", metadata: { source: "tarifs-banner" } })}>Essai Gratuit</Button>
        </NavigationLink>
      </div>

      {/* Benefits Section */}
      <div className="py-0 sm:pt-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-4xl">
              Pourquoi choisir notre plateforme?
            </h2>
            <h3 className=" text-gray-600">
              Une préparation complète pour réussir votre Test de Connaissance
              du Français
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {reasons.map((reason: any) => (
              <div
                className="text-center bg-gray-300/30 rounded-3xl p-6 py-8"
                key={reason.title}
              >
                <div className="bg-gray-300/30 w-16 h-16 text-bla rounded-full flex items-center justify-center mx-auto mb-4">
                  {reason.icon}
                </div>
                <h3 className="text-xl text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <div className="text-sm text-gray-600">{reason.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0 py-2 sm:py-4 mb-16">
        <div className="bg-black rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl text-white mb-2">
            Prêt à commencer votre préparation?
          </h2>
          <p className="text-lg text-white/90 mb-4 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont déjà réussi leur TCF avec
            notre plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavigationLink href="/compte/pratique-gratuit">
              <Button size="lg" variant="tertiary" onClick={() => trackClick({ label: "Essai Gratuit", metadata: { source: "tarifs-cta" } })}>
                Essai Gratuit
              </Button>
            </NavigationLink>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TarifsPage;
