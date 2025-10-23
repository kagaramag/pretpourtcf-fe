import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pret Pour TCF",
  description: "Bienvenue à l'application Pret Pour TCF",
};

export default function IndexPage() {
  return (
    <>
      <div className="relative isolate px-6 pt-14 lg:px-8">
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
                className="rounded-md bg-primary px-4 py-2 font-semibold text-sm text-white border-2 border-primary"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-white px-4 py-2 font-semibold text-sm text-primary border-2 border-primary"
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
      <div className="bg-primary">
        <div className="px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
              Prêt à améliorer votre français?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-indigo-200">
              Préparez-vous où que vous soyez, quand vous voulez.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-white px-8 py-3 font-semibold text-secondary border-2 border-secondary"
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
