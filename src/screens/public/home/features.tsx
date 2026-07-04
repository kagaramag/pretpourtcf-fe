import { Read, Certificate, Check, User, Clock, ChartView } from "@/icons";

const features = [
  {
    name: "Tests réalistes",
    description:
      "Entraînez-vous avec des tests qui reproduisent fidèlement les conditions réelles du TCF.",
    icon: Read,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    barColor: "bg-primary",
  },
  {
    name: "Disponible 24/7",
    description:
      "Accédez à vos exercices à tout moment, où que vous soyez. Apprenez à votre rythme.",
    icon: Clock,
    iconBg: "bg-secondary/15",
    iconColor: "text-secondary",
    barColor: "bg-secondary",
  },
  {
    name: "Certification officielle",
    description:
      "Préparez-vous pour tous les niveaux du CECR, de A1 à C2, avec nos exercices adaptés.",
    icon: Certificate,
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    barColor: "bg-accent",
  },
  {
    name: "Suivi de progression",
    description:
      "Visualisez vos progrès en temps réel et identifiez vos points à améliorer.",
    icon: ChartView,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    barColor: "bg-orange-400",
  },
  {
    name: "Exercices ciblés",
    description:
      "Compréhension orale, écrite, expression orale et écrite - toutes les sections du TCF.",
    icon: Check,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    barColor: "bg-green-500",
  },
  {
    name: "Communauté active",
    description:
      "Rejoignez des milliers d'apprenants qui préparent leur TCF avec succès.",
    icon: User,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    barColor: "bg-blue-500",
  },
];

export default function LandingFeatures() {
  return (
    <div className="bg-white py-12 sm:py-20 md:py-24 lg:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base">
            Tout ce dont vous avez besoin
          </h2>
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter leading-none">
            Une préparation complète au TCF
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 font-light  mt-2">
            Nous mettons à votre disposition tous les outils nécessaires pour
            réussir votre test de connaissance du français. Notre plateforme est
            conçue pour vous accompagner à chaque étape.
          </p>
        </div>
        <div className="mt-8 sm:mt-4 lg:mt-4 px-2 sm:px-12">
          <dl className="grid max-w-xl grid-cols-1 gap-4 sm:gap-4 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="relative overflow-hidden flex flex-col bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-md transition-all duration-200"
              >
                <h3 className="flex items-center gap-x-3 text-lg font-semibold text-gray-900">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.iconBg}`}
                  >
                    <feature.icon
                      aria-hidden="true"
                      className={`h-5 w-5 flex-none ${feature.iconColor}`}
                    />
                  </div>
                  {feature.name}
                </h3>
                <div className="flex flex-auto flex-col text-sm text-gray-700 mt-2">
                  {feature.description}
                </div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full ${feature.barColor}`}
                />
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
