const stats = [
  { id: 1, name: "Utilisateurs actifs", value: "10,000+" },
  { id: 2, name: "Tests complétés", value: "50,000+" },
  { id: 3, name: "Taux de réussite", value: "95%" },
  { id: 4, name: "Satisfaction clients", value: "4.9/5" },
];

export default function LandingStats() {
  return (
    <div className="primary-gradient py-20 sm:py-20 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tighter text-white sm:text-4xl">
              Des résultats qui parlent d'eux-mêmes
            </h2>
            <p className="text-base sm:text-lg text-white/90">
              Rejoignez une communauté grandissante de candidats qui ont réussi
              leur TCF
            </p>
          </div>
          <dl className="mt-4 sm:mt-6 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col items-center justify-center bg-white/10 p-6 sm:p-8 rounded-2xl"
              >
                <dt className="text-sm font-medium text-white text-center">
                  {stat.name}
                </dt>
                <h3 className="mt-2 text-3xl sm:text-4xl font-bold tracking-wide text-white">
                  {stat.value}
                </h3>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
