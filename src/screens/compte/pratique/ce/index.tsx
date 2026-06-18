"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Read, Clock, ChartView, ArrowRight, FileText } from "@/icons";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import AccountLayout from "@/layouts/account";
import MethodCE from "./methodology";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { PracticeTask } from "@/components/molecules/practice-task";
import { PRACTICE_CATEGORIES } from "@/components/molecules/practice-category";

const category = PRACTICE_CATEGORIES.find((c) => c.slug === "ce")!;

export default function ReadingPracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackClick } = useActivityTracker();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadingPractices();
  }, []);

  const fetchReadingPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getAllPractices({
        type: "reading",
        isActive: true,
        sort: "_id",
        limit: 100,
      });

      setPractices(response.data.practices);
    } catch (error: any) {
      console.error("Error fetching practices:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des exercices"
      );
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level?: string) => {
    const colors: Record<string, string> = {
      A1: "bg-green-100 text-green-800",
      A2: "bg-blue-100 text-blue-800",
      B1: "bg-yellow-100 text-yellow-800",
      B2: "bg-orange-100 text-orange-800",
      C1: "bg-red-100 text-red-800",
      C2: "bg-purple-100 text-purple-800",
    };
    return level
      ? colors[level] || "bg-gray-100 text-gray-800"
      : "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-2">
          <Link
            href="/compte"
            className="px-0 text-blue-600 hover:text-blue-400"
          >
            &larr; Retour aux pratiques
          </Link>
        </div>
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="lg:text-2xl text-xl font-semibold">
              Compréhension écrite
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            Choisissez un exercice de lecture pour pratiquer votre compréhension
            écrite
          </div>
        </div>
        <MethodCE />
        <div>
          <h1 className="lg:text-2xl text-xl font-semibold my-4">Pratiques</h1>
        </div>

        {practices.length === 0 ? (
          <div>
            <FileText className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun exercice disponible
            </h3>
            <div className="text-gray-600 text-center max-w-md">
              Il n&apos;y a pas d&apos;exercices de compréhension écrite
              disponibles pour le moment.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {practices.map((practice) => (
              <PracticeTask
                key={practice._id}
                practice={practice}
                category={category}
                href={`/compte/pratique/ce/${practice._id}`}
                onClick={() =>
                  trackClick({
                    action: "link_clicked",
                    label: `Paid: CE Practice — ${practice.title}`,
                  })
                }
              />
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="p-4 border border-border bg-blue-50">
            <h3 className="flex items-center gap-2 text-blue-900">
              Conseils pour réussir
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Assurez-vous d&apos;avoir une bonne connexion internet</p>
              <p>• Lisez attentivement chaque texte avant de répondre</p>
              <p>
                • Vous ne pouvez pas sauter de questions, répondez dans
                l&apos;ordre
              </p>
              <p>• Le chronomètre démarre dès le début de l&apos;exercice</p>
              <p>• Votre score est calculé sur 699 points maximum</p>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
