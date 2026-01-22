"use client";
import { useState, useEffect } from "react";
import AccountLayout from "@/layouts/account";
import { practiceService } from "@/services/practice";
import { Practice, PracticeType } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, MoveRight, Crown } from "lucide-react";

type PracticeCategory = {
  type: PracticeType;
  label: string;
  slug: "co" | "eo" | "ce" | "ee";
};

const categories: PracticeCategory[] = [
  { type: "listening", label: "Compréhension Orale", slug: "co" },
  { type: "reading", label: "Compréhension Ecrite", slug: "ce" },
  { type: "speaking", label: "Expression Orale", slug: "eo" },
  { type: "writing", label: "Expression Ecrite", slug: "ee" },
];

function PratiqueGratuitPage() {
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

  // Handle URL parameter on mount
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      const category = categories.find((cat) => cat.slug === typeParam);
      if (category) {
        handleCategoryClick(category.type);
      }
    }
  }, [searchParams]);

  return (
    <AccountLayout>
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Essais gratuit</h2>
          <div className="flex flex-row gap-2 bg-primary/10 p-2 rounded-full">
            {categories.map((category) => (
              <button
                key={category.type}
                onClick={() => handleCategoryClick(category.type)}
                className={`px-4 py-2 text-left rounded-full transition-colors cursor-pointer ${
                  selectedCategory === category.type
                    ? "bg-primary text-white"
                    : "bg-white hover:bg-primary/5"
                }`}
              >
                {category.label}
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
                        className="flex items-center gap-4 px-6 py-3 bg-gray-50/30 border border-gray-100/90 cursor-pointer hover:bg-gray-50 rounded-lg"
                        onClick={() => {
                          const categorySlug = categories.find(
                            (cat) => cat.type === practice.type
                          )?.slug;
                          if (categorySlug) {
                            router.push(
                              `/compte/essai-gratuit/${categorySlug}/${practice._id}`
                            );
                          }
                        }}
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{practice.title}</h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>
                              Duration: {practice.durationMinutes} min
                            </span>
                            <span>Questions: {practice.totalQuestions}</span>
                          </div>
                        </div>
                        {practice.freemium ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm">
                            Free
                          </span>
                        ) : (
                          <div className="w-8 h-8 bg-primary/10 text-primary flex items-center justify-center rounded">
                            <Crown className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <Button
                            variant={practice.freemium ? "default" : "ghost"}
                            disabled={!practice.freemium}
                          >
                            <MoveRight className="h-4 w-4" />
                            <span>Commencer</span>
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

export default PratiqueGratuitPage;
