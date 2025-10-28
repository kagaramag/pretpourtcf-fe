import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";

const features = [
  {
    name: "Tests réalistes",
    description:
      "Entraînez-vous avec des tests qui reproduisent fidèlement les conditions réelles du TCF.",
    icon: BookOpen,
  },
  {
    name: "Disponible 24/7",
    description:
      "Accédez à vos exercices à tout moment, où que vous soyez. Apprenez à votre rythme.",
    icon: Clock,
  },
  {
    name: "Certification officielle",
    description:
      "Préparez-vous pour tous les niveaux du CECR, de A1 à C2, avec nos exercices adaptés.",
    icon: Award,
  },
  {
    name: "Suivi de progression",
    description:
      "Visualisez vos progrès en temps réel et identifiez vos points à améliorer.",
    icon: TrendingUp,
  },
  {
    name: "Exercices ciblés",
    description:
      "Compréhension orale, écrite, expression orale et écrite - toutes les sections du TCF.",
    icon: Target,
  },
  {
    name: "Communauté active",
    description:
      "Rejoignez des milliers d'apprenants qui préparent leur TCF avec succès.",
    icon: Users,
  },
];

export default function LandingFeatures() {
  return (
    <div className="bg-white py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold text-primary">
            Tout ce dont vous avez besoin
          </h2>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 leading-tight">
            Une préparation complète au TCF
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Nous mettons à votre disposition tous les outils nécessaires pour
            réussir votre test de connaissance du français. Notre plateforme est
            conçue pour vous accompagner à chaque étape.
          </p>
        </div>
        <div className="mx-auto mt-12 sm:mt-16 lg:mt-20 max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-6 sm:gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <h3 className="flex items-center gap-x-3 text-lg font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="h-6 w-6 flex-none text-primary"
                  />
                  {feature.name}
                </h3>
                <dd className="mt-4 flex flex-auto flex-col text-base text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
