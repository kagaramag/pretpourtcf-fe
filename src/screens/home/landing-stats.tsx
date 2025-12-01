import Image from "next/image";
import OnBlueBG from "@/assets/images/on-blue-bg.svg";

const stats = [
  { id: 1, name: "Utilisateurs actifs", value: "3K+" },
  { id: 2, name: "Tests complétés", value: "27K+" },
  { id: 3, name: "Taux de réussite", value: "95%" },
  { id: 4, name: "Satisfaction clients", value: "4.9/5" },
];

export default function LandingStats() {
  return (
    <div className="bg-primary py-20 sm:py-20 md:py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
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
          <dl className="mt-4 sm:mt-6 grid grid-cols-2 gap-4 lg:gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col items-center justify-center bg-tertiary p-6 sm:p-8 rounded-2xl"
              >
                <dt className="text-sm font-medium text-primary text-center">
                  {stat.name}
                </dt>
                <h3 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-wide text-primary">
                  {stat.value}
                </h3>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="w-[1000px] h-full bottom-0 absolute right-0 left-0 z-0 mx-auto">
        <Image
          src={OnBlueBG}
          width={1000}
          height={400}
          priority
          alt="lines"
          className="w-full mx-auto"
        />
      </div>
    </div>
  );
}
