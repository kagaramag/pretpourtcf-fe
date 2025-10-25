"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, BarChart, Headphones, Play } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";
import AccountLayout from "@/layouts/account";

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
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AccountLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Headphones className="lg:h-8 lg:w-8 w-6 h-6 text-primary" />
            <h1 className="lg:text-3xl text-xl font-bold">Compréhension Orale (CO)</h1>
          </div>
          <p className="text-muted-foreground">
            Choisissez un exercice d&apos;écoute pour pratiquer votre
            compréhension orale
          </p>
        </div>

        {practices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Headphones className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun exercice disponible
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Il n&apos;y a pas d&apos;exercices de compréhension orale
                disponibles pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {practices.map((practice) => (
              <Card
                key={practice._id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {practice.title}
                      </CardTitle>
                      {practice.level && (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(
                            practice.level
                          )}`}
                        >
                          {practice.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-xs mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{practice.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{practice.totalQuestions} questions</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NavigationLink href={`/compte/pratique/co/${practice._id}`}>
                    <Button className="w-full group-hover:bg-primary/90" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Commencer l&apos;exercice
                    </Button>
                  </NavigationLink>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BarChart className="h-5 w-5" />
                Conseils pour réussir
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>• Assurez-vous d&apos;avoir une bonne connexion internet</p>
              <p>• Utilisez des écouteurs pour une meilleure qualité audio</p>
              <p>
                • Vous ne pouvez pas sauter de questions, répondez dans
                l&apos;ordre
              </p>
              <p>• Le chronomètre démarre dès le début de l&apos;exercice</p>
              <p>• Votre score est calculé sur 699 points maximum</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
}
