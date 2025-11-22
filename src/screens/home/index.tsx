import Hero from "@/assets/images/hero-bg.svg";
import Wave from "@/assets/images/hero-waves.svg";
import TCFMethod from "@/assets/images/tcf_method.svg";
import TCFPhoto from "@/assets/images/tcf_photo.jpg";
import Image from "next/image";
import { NavigationLink } from "@/components/ui/navigation-link";
import LandingFeatures from "./landing-features";
import LandingHowItWorks from "./landing-how-it-works";
import LandingPricing from "./landing-pricing";
import LandingTestimonials from "./landing-testimonials";
import LandingFAQ from "./landing-faq";
import LandingStats from "./landing-stats";
import { Button } from "@/components/ui/button";

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
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-2xl -sm:top-40"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 30.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 90.1%, 80.5% 50.3%, 80.2% 34.5%, 50.5% 76.7%, 0.1% 64.9%, 45.9% 100%, 70.6% 76.8%, 90.1% 97.7%, 90.1% 44.1%)",
            }}
            className="relative right-[calc(50%-5rem)] aspect-1155/678 w-300 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-5rem)] sm:w-340"
          />
        </div>
        <div className="mx-auto max-w-6xl py-28 sm:py-56 md:py-18 lg:py-24 flex items-center relative">
          <div className="px-2 sm:px-0 flex-1">
            <h1 className="text-xl text-primary sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-none tracking-tight pb-2">
              Préparez votre test TCF avec assurance. La réussite, c'est 0%
              magie, 100% préparation.
            </h1>
            <h4 className="mb-4 mt-2 text-black/80 sm:text-lg md:text-md text-pretty max-w-[550px]">
              Entraînez-vous en ligne, progressez à votre rythme, et réussissez
              votre test du premier coup
            </h4>
            <div className="mt-6 flex flex-row gap-2 sm:gap-x-2">
              <NavigationLink href="/signup">
                <Button size="lg">Créer un compte</Button>
              </NavigationLink>
              <NavigationLink href="/compte/essai-gratuit">
                <Button variant={"outline"} size="lg">
                  Essayer gratuitement
                </Button>
              </NavigationLink>
            </div>
          </div>
          <div className="w-[373px] h-[440px] relative">
            <div className="w-[373px] h-[440px] absolute right-0 bottom-0">
              <Image
                src={TCFMethod}
                width={373}
                height={440}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="w-[191px] h-[210px] absolute -top-[56px] -left-[50px] overflow-hidden rounded-3xl">
              <Image
                src={TCFPhoto}
                width={191}
                height={210}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
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
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-primary opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>
      <div className="bg-primary py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl lg:mx-0">
            <h2 className="text-2xl sm:text-2xl md:text-5xl font-semibold tracking-tight leading-none text-pretty text-white">
              Etapes simples commencer
            </h2>
            <h4 className="text-base sm:text-lg text-white leading-tight mt-2">
              Préparer le TCF n'a jamais été aussi facile. En quelques minutes,
              créez votre compte, choisissez un plan adapté à vos besoins et
              commencez à progresser à votre rythme.
            </h4>
          </div>
          <div className="mx-auto mt-2 sm:mt-12 lg:mt-16 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:max-w-none lg:grid-cols-3">
              {quickSteps.map((feature) => (
                <div
                  key={feature.name}
                  className="flex flex-col bg-white/5 p-4 sm:p-6 rounded-lg"
                >
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
      {/* <div id="how-it-works">
        <LandingHowItWorks />
      </div> */}

      {/* Testimonials Section */}
      <LandingTestimonials />

      {/* FAQ Section */}
      <div id="faq">
        <LandingFAQ />
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="px-4 sm:px-6 py-10 sm:py-24 md:py-20 lg:px-4">
          <div className="mx-auto max-w-5xl text-center flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl  font-semibold tracking-tighter leading-tight text-balance text-white">
              Prêt à améliorer votre français?
            </h2>
            <p className="mx-auto max-w-xl text-base sm:text-lg text-white/50 px-4">
              Rejoignez des milliers d'apprenants qui préparent leur TCF avec
              succès. Commencez votre préparation dès aujourd'hui.
            </p>
            <div className="flex items-center justify-center gap-x-6 px-4">
              <NavigationLink href="/signup">
                <Button size="lg" variant={"tertiary"}>
                  Créer un compte
                </Button>
              </NavigationLink>
              <NavigationLink href="/compte/essai-gratuit">
                <Button variant={"outline"} size="lg">
                  Essayer gratuitement
                </Button>
              </NavigationLink>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
