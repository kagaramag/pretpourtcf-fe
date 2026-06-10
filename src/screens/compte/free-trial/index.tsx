"use client";
import { useState, useEffect, Suspense } from "react";
import AccountLayout from "@/layouts/account";
import { practiceService } from "@/services/practice";
import { Practice, PracticeType } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/icons";
// import { Read, ArrowRight, Certificate } from "@/icons";
import { useActivityTracker } from "@/hooks/useActivityTracker";

type PracticeCategory = {
  type: PracticeType;
  label: string;
  slug: "co" | "eo" | "ce" | "ee";
  description: string;
  icon: "listen" | "read" | "speak" | "write";
  color: string;
  iconBg: string;
  iconColor: string;
  border: string;
  selectedBg: string;
};

const categories: PracticeCategory[] = [
  {
    type: "listening",
    label: "Compréhension Orale",
    slug: "co",
    description: "Tendez l'oreille — chaque son compte",
    icon: "listen",
    color: "bg-primary",
    iconBg: "bg-primary/70",
    iconColor: "text-white",
    border: "border-primary/30",
    selectedBg: "bg-primary/10",
  },
  {
    type: "reading",
    label: "Compréhension Ecrite",
    slug: "ce",
    description: "Décodez les mots, maîtrisez le sens",
    icon: "read",
    color: "bg-secondary",
    iconBg: "bg-secondary/70",
    iconColor: "text-white",
    border: "border-secondary/30",
    selectedBg: "bg-secondary/10",
  },
  {
    type: "speaking",
    label: "Expression Orale",
    slug: "eo",
    description: "Prenez la parole avec assurance",
    icon: "speak",
    color: "bg-accent",
    iconBg: "bg-accent",
    iconColor: "text-white",
    border: "border-accent/30",
    selectedBg: "bg-accent/10",
  },
  {
    type: "writing",
    label: "Expression Ecrite",
    slug: "ee",
    description: "Transformez vos idées en mots justes",
    icon: "write",
    color: "bg-orange-400",
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    border: "border-orange-200",
    selectedBg: "bg-orange-50",
  },
];

function PratiqueGratuitScreen() {
  const { trackClick } = useActivityTracker();
  const [selectedCategory, setSelectedCategory] = useState<PracticeType | null>(
    null
  );
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = async (type: PracticeType) => {
    setSelectedCategory(type);
    setLoading(true);
    setError(null);

    try {
      const response = await practiceService.getAllPractices({
        type,
        isActive: true,
        limit: 40,
        sort: "_id",
      });

      if (response.status === "success" && response.data) {
        setPractices(response.data.practices);
      } else {
        setError("Failed to load practices");
      }
    } catch (err) {
      setError("An error occurred while loading practices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL parameter on mount, default to CO (listening)
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const category = categories.find((cat) => cat.slug === typeParam);
      if (category) {
        handleCategoryClick(category.type);
        return;
      }
    }
    handleCategoryClick("listening");
  }, [searchParams]);

  return (
    <AccountLayout>
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <h2 className="text-2xl mb-4">Essais gratuit</h2>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            {categories.map((category) => (
              <button
                key={category.type}
                onClick={() => {
                  trackClick({
                    label: `Trial: ${category.label}`,
                    metadata: {
                      source: "essai-gratuit",
                      practiceType: category.slug,
                    },
                  });
                  handleCategoryClick(category.type);
                }}
                className="group text-left"
              >
                <div
                  className={`relative overflow-hidden cursor-pointer rounded-2xl border ${category.border} p-5 transition-all duration-200 hover:shadow-md ${
                    selectedCategory === category.type
                      ? `${category.selectedBg}`
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 text-white items-center justify-center rounded-xl ${category.iconBg}`}
                    >
                      <Icon
                        name={category.icon}
                        size={24}
                        color={category.iconColor}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {category.label}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    <div className="shrink-0 mt-1 text-gray-600 transition-transform group-hover:translate-x-1 opacity-70">
                      <Icon
                        name="arrowRight"
                        size={32}
                      />
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 h-1 w-full ${category.color}`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 py-4">
          {!selectedCategory && (
            <div className="text-gray-500 text-center mt-8">
              Sélectionnez une catégorie pour afficher les pratiques disponibles
            </div>
          )}

          {loading && <div className="text-center mt-8">Chargement...</div>}

          {error && (
            <div className="text-red-500 text-center mt-8">{error}</div>
          )}

          {!loading && !error && selectedCategory && (
            <div>
              {practices.length === 0 ? (
                <div className="text-gray-500">
                  Aucune pratique gratuite disponible pour cette catégorie pour
                  le moment
                </div>
              ) : (
                <div className="grid gap-2">
                  {practices
                    .sort((a: any, b: any) => b._id - a._id)
                    .map((practice) => (
                      <div
                        key={practice._id}
                        className="flex lg:flex-row flex-col items-center justify-baseline gap-4 px-4 py-2.5 bg-gray-50/30 border border-gray-100/90 cursor-pointer hover:bg-gray-50 rounded-lg"
                        onClick={() => {
                          const categorySlug = categories.find(
                            (cat) => cat.type === practice.type
                          )?.slug;
                          if (categorySlug) {
                            trackClick({
                              label: `Trial: ${practice.title}`,
                              metadata: {
                                practiceId: practice._id,
                                practiceTitle: practice.title,
                                practiceType: categorySlug,
                                freemium: practice.freemium,
                              },
                            });
                            router.push(
                              `/compte/essai-gratuit/${categorySlug}/${practice._id}`
                            );
                          }
                        }}
                      >
                        {(() => {
                          const cat = categories.find((c) => c.type === selectedCategory);
                          return cat ? (
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${cat.iconBg}`}>
                              <Icon name={cat.icon} size={20} color={cat.iconColor} />
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gray-50" />
                          );
                        })()}
                        <div className="w-5/12 flex items-center">
                          <h3 className="text-sm">{practice.title}</h3>
                          {practice.freemium ? (
                            <span className="bg-green-600 text-green-50 px-2 py-0.5 rounded-full text-xs mx-2">
                              Free
                            </span>
                          ) : (
                            <div className="w-6 h-6 text-primary">
                              <Icon name="premium" />
                            </div>
                          )}
                        </div>
                        <div className="w-3/12 flex flex:flex-row flex-row items-center justify-start gap-4 text-sm">
                          <span>Questions: {practice.totalQuestions}</span>
                          <span>Duration: {practice.durationMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-2 justify-end ml-auto">
                          <Button
                            variant={practice.freemium ? "default" : "ghost"}
                            disabled={!practice.freemium}
                            icon="arrowRight"
                          >
                            Commencer
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}

export default function PratiqueGratuitPage() {
  return (
    <Suspense
      fallback={
        <AccountLayout>
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <h2 className="text-2xl font-semibold mb-4">Essais gratuit</h2>
              <div className="text-center mt-8">Chargement...</div>
            </div>
          </div>
        </AccountLayout>
      }
    >
      <PratiqueGratuitScreen />
    </Suspense>
  );
}
