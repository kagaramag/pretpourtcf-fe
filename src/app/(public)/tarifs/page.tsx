"use client";

import { useEffect, useState } from "react";
import { subscriptionService } from "@/services/subscription";
import { SubscriptionPlan } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";

const reasons = [
  {
    title: "Tests Authentiques",
    description: "Exercices conformes au format officiel du TCF",
    icon: <Check className="h-8 w-8 text-primary" />,
  },
  {
    title: "Correction Détaillée",
    description: "Feedback immédiat pour progresser rapidement",
    icon: <Check className="h-8 w-8 text-primary" />,
  },
  {
    title: "Suivi de Progression",
    description: "Analysez vos résultats et identifiez vos points forts",
    icon: <Check className="h-8 w-8 text-primary" />,
  },
  {
    title: "Accès Flexible",
    description: "Pratiquez où vous voulez, quand vous voulez",
    icon: <Check className="h-8 w-8 text-primary" />,
  },
];

function TarifsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const fetchedPlans = await subscriptionService.getAllPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCardClassName = (plan: SubscriptionPlan) => {
    if (plan.popular) {
      return "p-7 rounded-3xl relative border border-primary scale-105 bg-primary text-white";
    }
    return "p-7 rounded-3xl relative border border-gray-200 bg-white";
  };

  const getButtonVariant = (plan: SubscriptionPlan) => {
    if (plan.type === "premium") {
      return "default";
    }
    if (plan.type === "advanced") {
      return "secondary";
    }
    return "outline";

    // return plan.type === "trial" ? "outline" : "secondary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold b-4">
              Plans & Tarifs
            </h1>
            <p className="text-gray-600/90 max-w-3xl mx-auto">
              Choisissez le plan qui vous convient pour réussir votre TCF
            </p>
            <p className="text-gray-600/80 max-w-2xl mx-auto">
              Des prix transparents, sans engagement. Commencez à vous préparer
              aujourd'hui.
            </p>
          </div>
        </div>
      </div>

      {/* Free Practice Banner */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 max-w-4xl secondary-gradient text-white border-none p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold">Essai Gratuit</h2>
          </div>
          <p className=" text-white/90 leading-none">
            Découvrez notre plateforme avec des exercices gratuits. Aucune carte
            de crédit requise.
          </p>
        </div>
        <NavigationLink href="/compte/essai-gratuit">
          <Button size="lg">Essai Gratuit</Button>
        </NavigationLink>
      </div>

      {/* Pricing Plans */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans
              .filter((plan) => plan.type !== "trial")
              .map((plan) => (
                <div key={plan.id} className={getCardClassName(plan)}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-secondary text-white px-4 py-2 rounded-full text-sm font-bold">
                        ⭐ Recommandé
                      </span>
                    </div>
                  )}

                  <h3
                    className={`text-3xl ${
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
                          {plan.price === 0
                            ? "Gratuit"
                            : new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 0,
                              }).format(plan.price)}
                        </h4>
                        {plan.price > 0 && (
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

                    {/* Features */}
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
                              Expression Écrite: {plan.details.ee} test
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
                                  plan.popular ? "text-white" : "text-green-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  plan.popular ? "text-white" : "text-gray-700"
                                }`}
                              >
                                Historique des pratiques
                              </span>
                            </li>
                          ) : (
                            <li className="flex items-start gap-3 line-through opacity-50">
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
                                Historique des pratiques
                              </span>
                            </li>
                          )}

                          {plan.details.streak ? (
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
                                Accès aux séries de tests
                              </span>
                            </li>
                          ) : (
                            <li className="flex items-start gap-3 line-through opacity-50">
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
                                Accès aux séries de tests
                              </span>
                            </li>
                          )}
                        </>
                      )}
                    </ul>
                  </div>

                  {/* className={`w-full text-lg py-6 ${
                    plan.type === "advanced"
                      ? "bg-white text-primary hover:bg-gray-100"
                      : ""
                  }`} */}
                  <NavigationLink href="/signup">
                    <Button
                      className="w-full"
                      size={"lg"}
                      variant={getButtonVariant(plan)}
                    >
                      Choisir ce plan
                    </Button>
                  </NavigationLink>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-0 sm:py-12">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre plateforme?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une préparation complète pour réussir votre Test de Connaissance
              du Français
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {reasons.map((reason: any) => (
              <div className="text-center bg-gray-200/50 p-6 rounded-xl py-8" key={reason.title}>
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}

            {/* <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Correction Détaillée
              </h3>
              <p className="text-gray-600">
                Feedback immédiat pour progresser rapidement
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Suivi de Progression
              </h3>
              <p className="text-gray-600">
                Analysez vos résultats et identifiez vos points forts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Accès Flexible
              </h3>
              <p className="text-gray-600">
                Pratiquez où vous voulez, quand vous voulez
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <div className="bg-gradient-to-r from-[#4E56C0] to-[#9089fc] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à commencer votre préparation?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'étudiants qui ont déjà réussi leur TCF avec
            notre plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavigationLink href="/compte/pratique-gratuit">
              <Button size="lg" variant="outline">
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
