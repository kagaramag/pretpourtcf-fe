import { UserPlus, CreditCard, BookOpen, TrendingUp } from "lucide-react";

const steps = [
  {
    name: "Créez votre compte",
    description:
      "Inscrivez-vous gratuitement en quelques secondes. Aucune carte de crédit nécessaire pour commencer.",
    icon: UserPlus,
  },
  {
    name: "Choisissez votre plan",
    description:
      "Sélectionnez l'abonnement qui correspond à votre objectif et à votre durée de préparation.",
    icon: CreditCard,
  },
  {
    name: "Commencez à pratiquer",
    description:
      "Accédez immédiatement à tous les tests et exercices. Entraînez-vous quand vous voulez, où que vous soyez.",
    icon: BookOpen,
  },
  {
    name: "Suivez vos progrès",
    description:
      "Visualisez votre évolution en temps réel et identifiez les domaines à améliorer pour réussir.",
    icon: TrendingUp,
  },
];

export default function LandingHowItWorks() {
  return (
    <div className="bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold text-primary">
            Comment ça marche
          </h2>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 leading-tight">
            Commencez en 4 étapes simples
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Préparer le TCF n'a jamais été aussi simple. Suivez ces étapes et
            commencez votre entraînement dès aujourd'hui.
          </p>
        </div>
        <div className="mx-auto mt-12 sm:mt-16 lg:mt-20 max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.name} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <step.icon
                      aria-hidden="true"
                      className="h-8 w-8 text-white"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center justify-center gap-x-2">
                      <span className="text-sm font-semibold text-primary">
                        Étape {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      {step.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-8 left-1/2 hidden lg:block w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
