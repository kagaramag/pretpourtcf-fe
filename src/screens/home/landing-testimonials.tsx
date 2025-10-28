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
    <div className="bg-gray-50 py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 leading-tight">
            Ce que disent nos utilisateurs
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600">
            Rejoignez des milliers de personnes qui ont réussi leur TCF grâce à
            notre plateforme.
          </p>
        </div>
        <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col bg-white p-6 sm:p-8 rounded-2xl shadow-sm"
            >
              <div className="flex gap-x-1 text-primary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 flex-1">
                <p className="text-base text-gray-900">
                  "{testimonial.content}"
                </p>
              </blockquote>
              <div className="mt-6 flex items-center gap-x-4">
                <img
                  alt={testimonial.name}
                  src={testimonial.image}
                  className="h-12 w-12 rounded-full bg-gray-50"
                />
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
