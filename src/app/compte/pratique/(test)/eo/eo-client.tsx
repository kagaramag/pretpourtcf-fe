"use client";

import { useEffect, useState } from "react";
import AccountLayout from "@/layouts/account";
import Link from "next/link";
import MethodEO from "./methodology";
import { Button } from "@/components/ui/button";
import { practiceService } from "@/services/practice";
import { PracticeWithQuestions } from "@/types";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { CaretDown, Clock, ChevronUp, MessageSquare, FileText } from "@/icons";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function SpeakingPracticePage() {
  const [practicesData, setPracticesData] = useState<PracticeWithQuestions[]>(
    []
  );
  const { trackClick } = useActivityTracker();
  const [loading, setLoading] = useState(true);
  const [expandedPractices, setExpandedPractices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchSpeakingPractices();
  }, []);

  const fetchSpeakingPractices = async () => {
    try {
      setLoading(true);
      const response = await practiceService.getSpeakingPracticeQuestions();
      setPracticesData(response.data.practices);
    } catch (error: any) {
      console.error("Error fetching speaking practices:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des exercices"
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePractice = (practiceId: string) => {
    setExpandedPractices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(practiceId)) {
        newSet.delete(practiceId);
      } else {
        newSet.add(practiceId);
      }
      return newSet;
    });
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

  // Filter practices by specific IDs
  const targetPracticeIds = [
    "692c1d115778a7b3364f6fde",
    "692c1df65778a7b3364f7011",
  ];
  const filteredPractices = practicesData
    .filter((practice) => targetPracticeIds.includes(practice.practice.id))
    .sort(
      (a, b) =>
        targetPracticeIds.indexOf(a.practice.id) -
        targetPracticeIds.indexOf(b.practice.id)
    );

  if (loading) {
    return (
      <AccountLayout>
        <div className="container mx-auto">
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AccountLayout>
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
          <h1 className="lg:text-3xl text-xl">Expression Orale</h1>
          <div className="text-gray-500">
            Choisissez un exercice d&apos;expression orale pour pratiquer votre
            expression et prononciation
          </div>
        </div>
        <MethodEO />
        <div className="mt-6 flex flex-col justify-center items-center gap-4 border-2 border-dashed border-tertiary rounded-lg p-6 bg-tertiary/10 text-center">
          <div>
            <h4 className="text-xl font-semibold">
              Prêt pour un test aléatoire ?
            </h4>
            <h5 className="max-w-md">
              Entraînez-vous dans les conditions réelles de l'examen: un sujet
              sera tiré au sort parmi les thèmes disponibles
            </h5>
          </div>
          <Link
            href="/compte/pratique/eo/test"
            onClick={() =>
              trackClick({
                action: "link_clicked",
                label: "Paid: EO Practice — Random Test",
              })
            }
          >
            <Button size={"lg"}>Lancer un test aléatoire</Button>
          </Link>
        </div>

        {/* Display Speaking Practices with Questions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Pratiques disponibles</h2>

          {filteredPractices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune pratique disponible
              </h3>
              <p className="text-muted-foreground">
                Les pratiques d&apos;expression orale ne sont pas encore
                disponibles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPractices.map((practiceData) => {
                const isExpanded = expandedPractices.has(
                  practiceData.practice.id
                );
                return (
                  <div
                    key={practiceData.practice.id}
                    className="border-2 border-tertiary rounded-lg overflow-hidden"
                  >
                    {/* Practice Header */}
                    <div
                      className="bg-tertiary/20 p-4 cursor-pointer hover:bg-tertiary/40 transition-colors border-b-2 border-tertiary"
                      onClick={() => togglePractice(practiceData.practice.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {practiceData.practice.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
                            {practiceData.practice.level && (
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(
                                  practiceData.practice.level
                                )}`}
                              >
                                {practiceData.practice.level}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {practiceData.practice.durationMinutes} min
                            </span>
                          </div>
                        </div>
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="h-6 w-6 text-gray-600" />
                          ) : (
                            <CaretDown className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Questions List */}
                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <h4 className="font-semibold mb-3 text-gray-700">
                          Sujets:
                        </h4>
                        <div className="space-y-3">
                          {practiceData.questions.map((question) => (
                            <div
                              key={question._id}
                              className="border-l-4 border-tertiary pl-4 py-2 bg-gray-50/50 rounded-r"
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold  min-w-[30px]">
                                  Q{question.number}
                                </span>
                                <div className="flex-1">
                                  <ReactMarkdown>{question.text}</ReactMarkdown>
                                  {question.options &&
                                    question.options.length > 0 && (
                                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                        {question.options.map((option, idx) => (
                                          <li key={idx}>
                                            {String.fromCharCode(65 + idx)}.{" "}
                                            {option}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="p-4 border border-border bg-blue-50 rounded-lg">
            <h3 className="flex items-center gap-2 text-blue-900 font-semibold mb-2">
              Conseils pour réussir
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Préparez-vous dans un environnement calme</p>
              <p>• Lisez attentivement chaque question avant de répondre</p>
              <p>• Pratiquez votre prononciation à voix haute</p>
              <p>
                • Les questions n&apos;ont ni audio ni image pour ces exercices
              </p>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
