import Image from "next/image";
import OnBlueBG from "@/assets/images/on-blue-bg.svg";
import { Card } from "./card";

const stats = [
  { id: 1, name: "Utilisateurs actifs", value: "3K+" },
  { id: 2, name: "Tests complétés", value: "27K+" },
  { id: 3, name: "Taux de réussite", value: "95%" },
  { id: 4, name: "Satisfaction clients", value: "4.9/5" },
];

export default function LandingStats() {
  return (
    <div className="bg-black py-14 sm:py-20 md:py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="lg:text-4xl text-3xl tracking-tighter text-white sm:text-4xl">
              Des résultats qui parlent d'eux-mêmes
            </h2>
            <p className="text-base sm:text-lg text-gray-500">
              Rejoignez une communauté grandissante de candidats qui ont réussi
              leur TCF
            </p>
          </div>
          <dl className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 lg:gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.id} className="items-center justify-center">
                <dt className="text-sm font-medium text-white/80 text-center">
                  {stat.name}
                </dt>
                <h3 className="mt-2 text-3xl sm:text-4xl tracking-wide text-white">
                  {stat.value}
                </h3>
              </Card>
            ))}
          </dl>
        </div>
      </div>
      <div className="w-[1000px] h-full bottom-0 absolute right-0 left-0 z-0 mx-auto lg:block hidden opacity-20">
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
