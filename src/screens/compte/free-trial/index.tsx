"use client";
import { useState, useEffect, Suspense } from "react";
import AccountLayout from "@/layouts/account";
import { practiceService } from "@/services/practice";
import { Practice, PracticeType } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useAuth } from "@/contexts/auth-context";
import {
  PRACTICE_CATEGORIES,
  PracticeCategoryCard,
} from "@/components/molecules/practice-category";
import { PracticeTask } from "@/components/molecules/practice-task";
import { Button } from "@/components/ui/button";

const categories = PRACTICE_CATEGORIES;

function PratiqueGratuitScreen() {
  const { trackClick } = useActivityTracker();
  const { user } = useAuth();
  const router = useRouter();
  const hasActiveSubscription = user?.subscription?.status === "active";
  const [selectedCategory, setSelectedCategory] = useState<PracticeType | null>(
    null
  );
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  if (hasActiveSubscription) {
    return (
      <AccountLayout>
        <div className="flex flex-col items-center justify-center gap-6 py-16">
          <h2 className="text-3xl font-semibold">
            Vous avez un abonnement actif
          </h2>
          <div className="text-gray-600 text-center max-w-md">
            Vous avez déjà accès à toutes les pratiques avec votre abonnement.
            Accédez à vos examens pour continuer votre préparation.
          </div>
          <Button size="lg" onClick={() => router.push("/compte")}>
            Accéder aux examens
          </Button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <h2 className="text-2xl mb-4">Essais gratuit</h2>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
            {categories.map((category) => (
              <PracticeCategoryCard
                key={category.slug}
                category={category}
                selected={selectedCategory === category.type}
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
              />
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
                    .map((practice) => {
                      const categorySlug = categories.find(
                        (cat) => cat.type === practice.type
                      )?.slug;
                      const cat = categories.find(
                        (c) => c.type === selectedCategory
                      );
                      return (
                        <PracticeTask
                          key={practice._id}
                          practice={practice}
                          variant="list"
                          category={cat}
                          href={`/compte/essai-gratuit/${categorySlug}/${practice._id}`}
                          onClick={() => {
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
                            }
                          }}
                        />
                      );
                    })}
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
