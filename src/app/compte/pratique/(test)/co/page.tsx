"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, Headphones, Play } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import AccountLayout from "@/layouts/account";
import MethodCO from "./methodology";

export default function ListeningPracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListeningPractices();
  }, []);

  const fetchListeningPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getAllPractices({
        type: "listening",
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
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="container mx-auto max-w-6xl">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h1 className="lg:text-3xl text-xl font-bold">
              Compréhension Orale
            </h1>
          </div>
          <p className="text-black/45 text-sm">
            Choisissez un exercice d&apos;écoute pour pratiquer votre
            compréhension orale
          </p>
        </div>
        <MethodCO />
        <div>
          <h1 className="lg:text-3xl text-xl font-bold my-4">Pratiques</h1>
        </div>

        {practices.length === 0 ? (
          <div>
            <Headphones className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aucun exercice disponible
            </h3>
            <div className="text-muted-foreground text-center max-w-md">
              Il n&apos;y a pas d&apos;exercices de compréhension orale
              disponibles pour le moment.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {practices.map((practice) => (
              <Link
                href={`/compte/pratique/co/${practice._id}`}
                key={practice._id}
              >
                <div className="border border-gray-400 p-4 hover:bg-primary/5 hover:border-primary hover:text-primary cursor-pointer flex flex-row items-center gap-3 rounded-2xl">
                  <h3 className="font-semibold flex-1 tracking-wide leading-tight">
                    {practice.title}
                  </h3>
                  <div className="w-6 h-6">
                    <Play className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="p-4 border border-gray-200 bg-blue-50">
            <h3 className="flex items-center gap-2 text-blue-900">
              <BarChart className="h-5 w-5" />
              Conseils pour réussir
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Assurez-vous d&apos;avoir une bonne connexion internet</p>
              <p>• Utilisez des écouteurs pour une meilleure qualité audio</p>
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
