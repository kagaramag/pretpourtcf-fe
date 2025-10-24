import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/assets/images/hero-bg.svg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Pret Pour TCF",
  description: "Bienvenue à l'application Pret Pour TCF",
};
const features = [
  {
    name: "Créez un compte",
    description:
      "Inscrivez-vous en quelques clics pour accéder à votre espace personnel et sauvegarder vos progrès.",
  },
  {
    name: "Choisissez un plan",
    description:
      "Sélectionnez l’abonnement qui correspond à votre objectif — que ce soit pour quelques jours de révision ou une préparation complète.",
  },
  {
    name: "Commencez à vous entraîner",
    description:
      "Accédez immédiatement à vos tests et exercices. Pratiquez quand vous voulez, où que vous soyez.",
  },
];

export default function IndexPage() {
  return (
    <>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="w-[1200px] absolute bottom-0 right-0 left-0 mx-auto -z-10">
          <Image
            src={Hero}
            width={1200}
            height={514}
            priority
            alt="logo"
            className="w-[1200px] mx-auto"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="mx-auto max-w-77xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tighter pb-2 text-balance bg-gradient-to-r from-[#4E56C0] via-[#9B5DE0] to-[#D78FEE] bg-clip-text text-transparent sm:text-6xl">
              Préparez votre test TCF avec assurance.
              <br />
              La réussite, c’est 0% magie, 100% préparation.
            </h1>
            <p className="mb-4 text-lg font-light text-pretty text-gray-500 sm:text-xl/8">
              Entraînez-vous en ligne, progressez à votre rythme, et réussissez
              votre test du premier coup
            </p>
            <div className="mt-1 flex items-center justify-center gap-x-2">
              <Link
                href="/login"
                className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc]  px-6 py-3.5 font-semibold text-sm text-white"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-white px-6 py-3 font-semibold text-sm text-primary border-2 border-primary"
              >
                Découvrir nos plans
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
      <div className="bg-linear-to-tr from-[#4E56C0] to-[#9089fc] py-24 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-semibold tracking-tighter leading-14 text-pretty text-white sm:text-7xl">
              Trois étapes simples <br /> pour commencer
            </h2>
            <p className="mt-6 text-lg/8 text-white leading-tight">
              Préparer le TCF n’a jamais été aussi facile. En quelques minutes,
              créez votre compte, choisissez un plan adapté à vos besoins et
              commencez à progresser à votre rythme.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl sm:mt-20 lg:mt-6 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col bg-accent-foreground/70 p-6">
                  <dt className="text-xl text-white">
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base/7 text-white/80 leading-snug">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-accent-foreground">
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-4xl font-semibold tracking-tighter leading-14 text-balance text-white sm:text-7xl">
              Prêt à améliorer votre français?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-white/80">
              Préparez-vous où que vous soyez, quand vous voulez.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-8 py-3 font-bold text-white"
              >
                Inscrivez-vous maintenant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
