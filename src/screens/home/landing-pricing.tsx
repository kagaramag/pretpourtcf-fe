import { Check } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";

const tiers = [
  {
    name: "Échauffement",
    id: "tier-starter",
    href: "/signup",
    priceMonthly: "$10",
    description: "Idéal pour une préparation courte et ciblée.",
    features: [
      "Accès 3 jours",
      "Tests de compréhension orale",
      "Tests de compréhension écrite",
      "Correction automatique",
      "Statistiques de base",
    ],
    featured: false,
  },
  {
    name: "Entraînement",
    id: "tier-premium",
    href: "/signup",
    priceMonthly: "$15",
    description: "La solution complète pour réussir votre TCF.",
    features: [
      "Accès 10 jours",
      "Tous les tests (oral, écrit, expression)",
      "Correction détaillée",
      "Suivi de progression avancé",
      "Tests blancs complets",
      "Support prioritaire",
      "Fiches de révision",
    ],
    featured: true,
  },
  {
    name: "Performance",
    id: "tier-expert",
    href: "/signup",
    priceMonthly: "$30",
    description: "Pour une préparation intensive et approfondie.",
    features: [
      "Accès 30 jours",
      "Tous les avantages Premium",
      "Sessions individuelles en ligne",
      "Coaching personnalisé",
      "Exercices illimités",
      "Garantie de résultats",
      "Accès à vie aux ressources",
    ],
    featured: false,
  },
];

export default function LandingPricing() {
  return (
    <div className="bg-primary py-16 sm:py-20 md:py-24 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold text-white">Tarifs</h2>
          <h3 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-white leading-tight">
            Choisissez le plan qui vous convient
          </h3>
        </div>
        <p className="mx-auto max-w-2xl text-center text-base sm:text-lg text-white">
          Des prix transparents, sans engagement. Commencez à vous préparer
          aujourd'hui et réussissez votre TCF.
        </p>
        <div className="isolate mx-auto mt-10 sm:mt-12 lg:mt-16 grid max-w-md grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-6 sm:p-8 xl:p-10 border border-white/10 ${
                tier.featured
                  ? "bg-gradient-to-br from-[#4E56C0] to-[#9089fc] ring-2 ring-[#4E56C0] scale-105"
                  : "bg-gray-50 ring-1 ring-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={`text-lg font-semibold ${
                    tier.featured ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.name}
                </h3>
                {tier.featured && (
                  <p className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
                    Populaire
                  </p>
                )}
              </div>
              <p
                className={`mt-4 text-sm ${
                  tier.featured ? "text-white/90" : "text-gray-600"
                }`}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.featured ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.priceMonthly}
                </span>
              </p>
              <NavigationLink
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? "bg-white text-primary hover:bg-gray-100"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                Commencer maintenant
              </NavigationLink>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm ${
                  tier.featured ? "text-white/90" : "text-gray-600"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      aria-hidden="true"
                      className={`h-6 w-5 flex-none ${
                        tier.featured ? "text-white" : "text-primary"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
