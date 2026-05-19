"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import Hero from "@/assets/images/hero-bg.svg";
import TCFMethod from "@/assets/images/tcf_method.svg";
import OnBlueBG from "@/assets/images/on-blue-bg.svg";
import TCFPhoto from "@/assets/images/tcf_photo.jpg";
import { NavigationLink } from "@/components/ui/navigation-link";
import LandingFeatures from "./landing-features";
import LandingTestimonials from "./landing-testimonials";
import LandingFAQ from "./landing-faq";
import LandingStats from "./landing-stats";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
  const { user, isLoading, isAuthenticated } = useAuth();
  return (
    <>
      <div className="relative isolate px-4 sm:px-6 pt-14 bg-gray-900 lg:px-8">
        <div className="w-full max-w-[1200px] absolute bottom-0 right-0 left-0 mx-auto -z-10 lg:block hidden ">
          <Image
            src={Hero}
            width={1200}
            height={514}
            priority
            alt="logo"
            className="w-full mx-auto"
          />
        </div>
        <div className="mx-auto max-w-6xl  mt-20 py-6 sm:py-56 md:py-18 lg:py-24 flex flex-col lg:flex-row items-center relative text-white">
          <div className="px-2 sm:px-0 flex-1 text-center lg:text-left mt-20">
            <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-5xl font-medium lg:leading-none tracking-tight pb-2">
              Préparez votre test TCF avec assurance. La réussite, c'est 0%
              magie, 100% préparation.
            </h1>
            <h4 className="mb-4 mt-2 text-white/60 text-sm lg:text-lg lg:max-w-[550px]">
              Entraînez-vous en ligne, progressez à votre rythme, et réussissez
              votre test du premier coup
            </h4>
            <div className="mt-6 flex lg:flex-row flex-col gap-2 sm:gap-x-2">
              {!isLoading && isAuthenticated ? (
                <>
                  <NavigationLink href="/compte">
                    <Button size="lg">
                      Mon compte
                      <ArrowRight className="mx-2 h-4 w-4" />
                    </Button>
                  </NavigationLink>
                </>
              ) : (
                <>
                  <NavigationLink href="/signup">
                    <Button size="lg">Créer un compte</Button>
                  </NavigationLink>
                  <NavigationLink href="/compte/essai-gratuit">
                    <Button variant={"outline"} size="lg">
                      Essayer gratuitement
                    </Button>
                  </NavigationLink>
                </>
              )}
            </div>
          </div>
          <div className="w-[373px] h-[440px] relative">
            <div className="sm:w-[373px] sm:h-[440px] w-[360px] h-[300px] top-0 absolute right-0 bottom-0">
              <Image
                src={TCFMethod}
                width={373}
                height={440}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
            <div className="w-[191px] h-[220px] absolute -top-[56px] -left-[50px] overflow-hidden lg:block hidden">
              <Image
                src={TCFPhoto}
                width={191}
                height={220}
                priority
                alt="logo"
                className="w-full mx-auto rounded-3xl"
              />
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="opacity-50 sm:block hidden  md:hidden absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
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
      <div className="bg-black py-16 sm:py-20 md:py-12 relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 z-10 relative">
          <div className="mx-auto max-w-4xl lg:mx-0 text-center">
            <h2 className="text-4xl sm:text-xl md:text-5xl tracking-tight leading-none text-pretty text-white">
              Etapes simples commencer
            </h2>
            <h4 className="text-base sm:text-lg text-white/60 leading-tight mt-2">
              Préparer le TCF n'a jamais été aussi facile. En quelques minutes,
              créez votre compte, choisissez un plan adapté à vos besoins et
              commencez à progresser à votre rythme.
            </h4>
          </div>
          <div className="mx-auto mt-2 sm:mt-12 lg:mt-6 max-w-6xl w-full">
            <dl className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 w-full lg:grid-cols-3">
              {quickSteps.map((feature) => (
                <div
                  key={feature.name}
                  className="flex flex-col bg-gray-900 p-4 sm:p-6 rounded-lg"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {feature.name}
                  </h3>
                  <h5 className="mt-2 flex flex-auto flex-col text-sm sm:text-base text-white/60 leading-snug">
                    {feature.description}
                  </h5>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="w-full h-full bottom-0 top-0 opacity-30 absolute right-0 left-0 z-0 lg:block hidden">
          <Image
            src={OnBlueBG}
            width={1000}
            height={400}
            priority
            alt="lines"
            className="w-full mx-auto border"
          />
        </div>
      </div>
      <LandingFeatures />

      <LandingStats />
      <LandingTestimonials />

      <div id="faq">
        <LandingFAQ />
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="px-4 sm:px-6 py-10 sm:py-24 md:py-20 lg:px-4">
          <div className="mx-auto max-w-5xl text-center flex flex-col gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter leading-tight text-balance text-white">
              Prêt à améliorer votre français?
            </h2>
            <p className="mx-auto max-w-xl text-base sm:text-lg text-white/50 px-4">
              Rejoignez des milliers d'apprenants qui préparent leur TCF avec
              succès. Commencez votre préparation dès aujourd'hui.
            </p>
            <div className="flex items-center lg:flex-row flex-col justify-center lg:gap-2 gap-2 px-4">
              {!isLoading && isAuthenticated ? (
                <>
                  <NavigationLink href="/compte">
                    <Button size="lg" variant={"tertiary"}>
                      Mon compte <ArrowRight className="mx-2 h-4 w-4" />
                    </Button>
                  </NavigationLink>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
