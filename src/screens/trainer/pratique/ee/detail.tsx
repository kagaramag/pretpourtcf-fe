"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { toast } from "sonner";
import { config } from "@/config";
import { Practice, PracticeQuestion } from "@/types";

export default function TrainerEEDetailScreen() {
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPracticeAndQuestions();
  }, [practiceId]);

  const fetchPracticeAndQuestions = async () => {
    try {
      setLoading(true);

      const practiceResponse = await practiceService.getPracticeById(practiceId);
      const practiceData = practiceResponse.data.practice;
      setPractice(practiceData);

      const questionsResponse = await questionService.getAllQuestions({
        examId: practiceId,
        sort: "number",
        limit: 1000,
      });
      const questionsData = questionsResponse.data.questions;
      setQuestions(questionsData);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors du chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Exercice introuvable</h3>
          <a href="/trainer/pratiques/ee" className="text-blue-600 underline">
            Retour aux exercices
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{practice.title}</h1>
        <p className="text-gray-600">
          Questions et Réponses - Expression Écrite
        </p>
      </div>

      {questions.length === 0 ? (
        <p>Aucune question disponible pour cet exercice</p>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question._id} className="border p-4 rounded-lg bg-white">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  Question {question.number || index + 1}
                </h3>

                {question.media?.image && (
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setShowImages((prev) => ({
                          ...prev,
                          [question._id]: !prev[question._id],
                        }))
                      }
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 mb-2"
                    >
                      {showImages[question._id]
                        ? "Masquer l'image"
                        : "Afficher l'image"}
                    </button>
                    {showImages[question._id] && (
                      <div className="mt-2">
                        <img
                          src={`${config.cloudFlarePublicUrl}practices/images/${question.media.image}`}
                          alt="Question"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}

                <p className="mb-4">{question.text}</p>

                {/* Writing-specific: show instructions for the trainer */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-900 font-medium mb-2">
                    Instructions pour l&apos;expression écrite:
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>Cette question nécessite une réponse écrite</li>
                    <li>
                      L&apos;étudiant doit rédiger un texte structuré et
                      cohérent
                    </li>
                    <li>
                      Évaluez la qualité de la rédaction: grammaire, vocabulaire,
                      cohérence
                    </li>
                  </ul>
                </div>
              </div>

              {/* MCQ options if present */}
              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium mb-2">Options:</p>
                  {question.options.map((option: string, optIndex: number) => {
                    const isCorrect = question.correct === optIndex;
                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          isCorrect
                            ? "bg-green-50 border-2 border-green-500 font-semibold"
                            : "bg-gray-50 border border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span>{option}</span>
                          {isCorrect && (
                            <span className="ml-auto text-green-600">
                              ✓ Réponse correcte
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Model answer for essay/short_answer questions */}
              {question.answer && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900 mb-2">
                    Réponse modèle:
                  </p>
                  <div className="text-green-800 text-sm whitespace-pre-wrap">
                    {question.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <a
          href="/trainer/pratiques/ee"
          className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Retour aux exercices
        </a>
      </div>
    </div>
  );
}
