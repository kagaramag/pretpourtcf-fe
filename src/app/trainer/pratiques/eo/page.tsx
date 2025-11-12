"use client";

import { useEffect, useState } from "react";
import { practiceService } from "@/services/practice";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpeakingPracticePage() {
  const [practices, setPractices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpeakingPractices();
  }, []);

  const fetchSpeakingPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getAllPractices({
        type: "speaking",
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
          Pratique - Expression Orale
        </h1>
      </div>

      {practices.length === 0 ? (
        <p>Aucun exercice disponible</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {practices.map((practice) => (
            <Link href={`/trainer/pratiques/eo/${practice._id}`} key={practice._id}>
              <div className="border p-3 rounded-lg flex items-center">
                <h2 className="text-sm font-semibold leading-none">{practice.title}</h2>
                <div>
                  <Button size={"sm"}>View</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}