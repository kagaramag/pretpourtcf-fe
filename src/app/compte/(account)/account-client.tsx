"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import Serie from "@/assets/images/serie.svg";
import { StreakStatusWidget } from "@/components/streak/streak-status-widget";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackClick } = useActivityTracker();

  useEffect(() => {
    if (user && user.role === "client" && !user.subscription) {
      router.push("/compte/plans");
    }
  }, [user, router]);

  if (user?.subscription) {
    return (
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl">Mes Pratiques</h1>
          <div className="text-gray-700 text-sm">
            Accédez à vos exercices TCF et suivez votre progression
          </div>
        </div>
        {/* Active Streak Status Widget */}
        <div>
          <StreakStatusWidget />
        </div>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 my-4">
          {[
            {
              href: "/compte/pratique/co",
              icon: "listen" as const,
              title: "Compréhension orale",
              description: "Tendez l'oreille — chaque son compte",
              color: "bg-primary",
              iconBg: "bg-primary/70",
              iconColor: "text-white",
              border: "border-primary/30",
            },
            {
              href: "/compte/pratique/ce",
              icon: "read" as const,
              title: "Compréhension écrite",
              description: "Décodez les mots, maîtrisez le sens",
              color: "bg-secondary",
              iconBg: "bg-secondary/70",
              iconColor: "text-white",
              border: "border-secondary/30",
            },
            {
              href: "/compte/pratique/eo",
              icon: "speak" as const,
              title: "Expression orale",
              description: "Prenez la parole avec assurance",
              color: "bg-accent",
              iconBg: "bg-accent",
              iconColor: "text-white",
              border: "border-accent/30",
            },
            {
              href: "/compte/pratique/ee",
              icon: "write" as const,
              title: "Expression écrite",
              description: "Transformez vos idées en mots justes",
              color: "bg-orange-400",
              iconBg: "bg-orange-500",
              iconColor: "text-white",
              border: "border-orange-200",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group" onClick={() => trackClick({ action: "link_clicked", label: item.title })}>
              <div
                className={`relative overflow-hidden rounded-2xl bg-white border ${item.border} p-5 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon name={item.icon} size={24} color={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 mt-1 transition-transform group-hover:translate-x-1">
                    <Icon
                      name="arrowRight"
                      size={18}
                      className="text-gray-400"
                    />
                  </div>
                </div>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full ${item.color}`}
                />
              </div>
            </Link>
          ))}
        </div>
        {/* Premium Streak Feature */}
        <div className="py-4 px-6 border-4 border-tertiary rounded-3xl my-5 flex lg:flex-row flex-col items-center gap-4">
          <div className="lg:w-22 lg:h-28 w-16 h-20 rounded-2xl flex items-center justify-center">
            <Image src={Serie} width={80} height={96} priority alt="Serie" />
          </div>
          <div className="flex-1">
            <h3 className="flex items-center gap-2 text-2xl">
              Flamme TCF – Jeu de série
            </h3>
            <h5>Pratiquez quotidiennement, maintenez votre série.</h5>
            <div className="text-sm max-w-[650px] text-gray-600 mt-2">
              Relevez le défi! Complétez 20 exercices en 7 jours avec au moins
              90% de score. Gagnez une récompense unique tous les 3 exercices.
            </div>
          </div>
          <div className="mt-4">
            <Link href="/compte/series" onClick={() => trackClick({ action: "link_clicked", label: "Gérer mes séries" })}>
              <Button variant="tertiary" size="lg">
                Gérer mes séries
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state or no subscription (will redirect)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
