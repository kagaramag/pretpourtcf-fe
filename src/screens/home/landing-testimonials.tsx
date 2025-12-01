import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Étudiante",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marie",
    content:
      "Grâce à cette plateforme, j'ai obtenu le niveau B2 requis pour mon admission universitaire. Les tests sont très réalistes et m'ont parfaitement préparée!",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Professionnel",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed",
    content:
      "J'avais besoin de mon TCF pour immigrer au Canada. En 2 mois de pratique régulière, j'ai atteint mes objectifs. Interface intuitive et exercices variés.",
    rating: 5,
  },
  {
    name: "Sofia Martinez",
    role: "Enseignante",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    content:
      "Excellente plateforme! Le suivi de progression m'a vraiment aidée à identifier mes points faibles. Je recommande vivement pour une préparation sérieuse.",
    rating: 5,
  },
];

export default function LandingTestimonials() {
  return (
    <div className="bg-gray-50 py-10 sm:py-20 md:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-4xl md:text-4xl font-semibold tracking-tighter text-primary leading-tight">
            Ce que disent nos utilisateurs
          </h2>
          <h5 className="text-base sm:text-lg">
            Rejoignez des milliers de personnes qui ont réussi leur TCF grâce à
            notre plateforme.
          </h5>
        </div>
        <div className="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-2 sm:gap-4 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col bg-white p-6 sm:p-8 rounded-2xl border border-gray-300/50"
            >
              <blockquote className="flex-1">
                <p className="text-base text-gray-900">
                  "{testimonial.content}"
                </p>
              </blockquote>
              <div className="mt-3 flex items-center gap-x-4">
                <img
                  alt={testimonial.name}
                  src={testimonial.image}
                  className="h-8 w-8 rounded-full bg-gray-50"
                />
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
