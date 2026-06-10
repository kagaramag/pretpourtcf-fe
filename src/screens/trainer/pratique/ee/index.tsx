"use client";

import { useEffect, useState } from "react";
import { practiceService } from "@/services/practice";
import { toast } from "sonner";
import { Practice } from "@/types";
import { PracticeTask } from "@/components/molecules/practice-task";
import { PRACTICE_CATEGORIES } from "@/components/molecules/practice-category";

const category = PRACTICE_CATEGORIES.find((c) => c.slug === "ee")!;

export default function TrainerEEListScreen() {
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
        <h1 className="text-2xl font-semibold">
          Pratique - Expression Écrite
        </h1>
      </div>

      {practices.length === 0 ? (
        <p>Aucun exercice disponible</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {practices.map((practice) => (
            <PracticeTask
              key={practice._id}
              practice={practice}
              variant="trainer"
              category={category}
              href={`/trainer/pratiques/ee/${practice._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
