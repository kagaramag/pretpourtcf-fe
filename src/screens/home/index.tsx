import Hero from "@/assets/images/hero-bg.svg";
import Image from "next/image";
import { NavigationLink } from "@/components/ui/navigation-link";
import LandingFeatures from "./landing-features";
import LandingHowItWorks from "./landing-how-it-works";
import LandingPricing from "./landing-pricing";
import LandingTestimonials from "./landing-testimonials";
import LandingFAQ from "./landing-faq";
import LandingStats from "./landing-stats";


const quickSteps = [
  {
    name: "Créez un compte",
    description:
      "Inscrivez-vous en quelques clics pour accéder à votre espace personnel et sauvegarder vos progrès.",
  },
  {
    name: "Choisissez un plan",
    description:
      "Sélectionnez l'abonnement qui correspond à votre objectif — que ce soit pour quelques jours de révision ou une préparation complète.",
  },
  {
    name: "Commencez à vous entraîner",
    description:
      "Accédez immédiatement à vos tests et exercices. Pratiquez quand vous voulez, où que vous soyez.",
  },
];

export function IndexScreen() {
  return (
    <>
      <div className="relative isolate px-4 sm:px-6 pt-14 lg:px-8">
        <div className="w-full max-w-[1200px] absolute bottom-0 right-0 left-0 mx-auto -z-10">
          <Image
            src={Hero}
            width={1200}
            height={514}
            priority
            alt="logo"
            className="w-full mx-auto"
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
        <div className="mx-auto max-w-77xl py-24 sm:py-32 md:py-48 lg:py-56">
          <div className="text-center px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tighter pb-2 text-balance bg-gradient-to-r from-[#4E56C0] via-[#9B5DE0] to-[#D78FEE] bg-clip-text text-transparent leading-tight">
              Préparez votre test TCF avec assurance.
              <br className="hidden sm:block" />
              <span className="sm:inline"> </span>La réussite, c'est 0% magie, 100% préparation.
            </h1>
            <p className="mb-4 mt-4 text-base sm:text-lg md:text-xl font-light text-pretty text-gray-500 px-2">
              Entraînez-vous en ligne, progressez à votre rythme, et réussissez
              votre test du premier coup
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-x-2 px-4">
              <NavigationLink
                href="/login"
                className="w-full sm:w-auto rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-6 py-3.5 font-semibold text-sm text-white text-center"
              >
                Commencer maintenant
              </NavigationLink>
              <NavigationLink
                href="/signup"
                className="w-full sm:w-auto rounded-md bg-white px-6 py-3 font-semibold text-sm text-primary border-2 border-primary text-center"
              >
                Découvrir nos plans
              </NavigationLink>
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
      <div className="bg-linear-to-tr from-[#4E56C0] to-[#9089fc] py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tighter leading-none text-pretty text-white">
              Trois étapes simples <br className="hidden sm:block" /> pour commencer
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white leading-tight">
              Préparer le TCF n'a jamais été aussi facile. En quelques minutes,
              créez votre compte, choisissez un plan adapté à vos besoins et
              commencez à progresser à votre rythme.
            </p>
          </div>
          <div className="mx-auto mt-8 sm:mt-12 lg:mt-16 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:max-w-none lg:grid-cols-3">
              {quickSteps.map((feature) => (
                <div key={feature.name} className="flex flex-col bg-accent-foreground/70 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {feature.name}
                  </h3>
                  <dd className="mt-2 flex flex-auto flex-col text-sm sm:text-base text-white/80 leading-snug">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <LandingFeatures />

      {/* Stats Section */}
      <LandingStats />

      {/* How It Works Section */}
      <div id="how-it-works">
        <LandingHowItWorks />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <LandingPricing />
      </div>

      {/* Testimonials Section */}
      <LandingTestimonials />

      {/* FAQ Section */}
      <div id="faq">
        <LandingFAQ />
      </div>

      {/* CTA Section */}
      <div className="bg-accent-foreground">
        <div className="px-4 sm:px-6 py-16 sm:py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tighter leading-tight text-balance text-white">
              Prêt à améliorer votre français?
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-xl text-base sm:text-lg text-pretty text-white/80 px-4">
              Rejoignez des milliers d'apprenants qui préparent leur TCF avec
              succès. Commencez votre préparation dès aujourd'hui.
            </p>
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-6 px-4">
              <NavigationLink
                href="/signup"
                className="w-full sm:w-auto rounded-md bg-white px-6 sm:px-8 py-3 font-bold text-sm sm:text-base text-primary text-center hover:bg-gray-100 transition-colors"
              >
                Inscrivez-vous maintenant
              </NavigationLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
