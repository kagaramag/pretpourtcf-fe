"use client";

import { useEffect, useState } from "react";
import { practiceService } from "@/services/practice";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Practice } from "@/types";

export default function TrainerCOListScreen() {
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

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="flex justify-center items-center py-12">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl">Pratique - Compréhension Orale</h1>
      </div>

      {practices.length === 0 ? (
        <p>Aucun exercice disponible</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {practices.map((practice) => (
            <Link
              href={`/trainer/pratiques/co/${practice._id}`}
              key={practice._id}
            >
              <div className="border p-3 rounded-lg flex items-center">
                <h2 className="flex-1 text-sm font-semibold leading-none">
                  {practice.title}
                </h2>
                <div>
                  <Button icon="arrowRight">View</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
