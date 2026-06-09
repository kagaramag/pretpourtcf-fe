"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PenTool } from "lucide-react";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { Icon } from "@/icons";
import { toast } from "sonner";
import AccountLayout from "@/layouts/account";
import Link from "next/link";
import MethodEE from "./methodology";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function WritingPracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { trackClick } = useActivityTracker();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWritingPractices();
  }, []);

  const fetchWritingPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getAllPractices({
        type: "writing",
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="lg:text-3xl text-xl font-bold">Expression écrite</h1>
          </div>
          <h5>
            Choisissez un exercice d&apos;expression écrite pour pratiquer votre
            rédaction et votre grammaire
          </h5>
        </div>
        <MethodEE />

        {/* tabs: list of questions | list of series */}

        <div className="mt-6">
          {practices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <PenTool className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucun exercice disponible
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Il n&apos;y a pas d&apos;exercices d&apos;expression écrite
                disponibles pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {practices.map((practice) => (
                <Link
                  href={`/compte/pratique/ee/${practice._id}`}
                  key={practice._id}
                  onClick={() =>
                    trackClick({
                      action: "link_clicked",
                      label: `Paid: EE Practice — ${practice.title}`,
                    })
                  }
                >
                  <div className="p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-row items-center gap-3 rounded-2xl">
                    <h2 className="text-sm flex-1 tracking-wide leading-tight">
                      {practice.title}
                    </h2>
                    <div className="w-6 h-6">
                      <Icon name="play" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
