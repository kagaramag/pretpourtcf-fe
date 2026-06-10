"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { ArrowRight, FileText } from "@/icons";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import AccountLayout from "@/layouts/account";
import MethodCE from "./methodology";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function FreeReadingPracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackClick } = useActivityTracker();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreeReadingPractices();
  }, []);

  const fetchFreeReadingPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getAllPractices({
        type: "reading",
        isActive: true,
        freemium: true,
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

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
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
            <h1 className="lg:text-3xl text-xl font-bold">
              Compréhension écrite - Essai Gratuit
            </h1>
          </div>
          <h5>
            Essayez gratuitement nos exercices de lecture pour pratiquer votre compréhension
            écrite
          </h5>
        </div>
        <MethodCE />
        <div>
          <h1 className="lg:text-3xl text-xl font-bold my-4">Pratiques Gratuites</h1>
        </div>

        {practices.length === 0 ? (
          <div>
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun exercice gratuit disponible
            </h3>
            <div className="text-muted-foreground text-center max-w-md">
              Il n&apos;y a pas d&apos;exercices de compréhension écrite gratuits
              disponibles pour le moment.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {practices.map((practice) => (
              <Link
                href={`/compte/essai-gratuit/ce/${practice._id}`}
                key={practice._id}
                onClick={() =>
                  trackClick({
                    action: "link_clicked",
                    label: `Trial: CE Practice — ${practice.title}`,
                  })
                }
              >
                <div className="border border-gray-400 p-4 hover:bg-primary/5 hover:border-primary hover:text-primary cursor-pointer flex flex-row items-center gap-3 rounded-2xl">
                  <h3 className="font-semibold flex-1 tracking-wide leading-tight">
                    {practice.title}
                  </h3>
                  <div className="w-6 h-6">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
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
