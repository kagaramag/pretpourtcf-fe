"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { toast } from "sonner";
import { config } from "@/config";
import AudioPlayer from "@/components/organisms/player";
import { Practice, PracticeQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function TrainerEODetailScreen() {
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

      const practiceResponse =
        await practiceService.getPracticeById(practiceId);
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
      toast.error(error.response?.data?.message || "Erreur lors du chargement");
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
          <a href="/trainer/pratiques/eo" className="text-blue-600 underline">
            Retour aux exercices
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold mb-2">{practice.title}</h1>
        <p className="text-gray-600">
          Questions et Réponses - Expression Orale
        </p>
      </div>

      {questions.length === 0 ? (
        <p>Aucune question disponible pour cet exercice</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="border border-gray-200 p-4 rounded-lg bg-white"
            >
              <div>
                <h3 className="font-semibold text-base">
                  Question {question.number || index + 1}
                </h3>

                {question.media?.image && (
                  <div className="mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setShowImages((prev) => ({
                          ...prev,
                          [question._id]: !prev[question._id],
                        }))
                      }
                    >
                      {showImages[question._id]
                        ? "Masquer l'image"
                        : "Afficher l'image"}
                    </Button>
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

                {question.media?.audio && (
                  <div className="mb-4">
                    <AudioPlayer
                      src={`${config.cloudFlarePublicUrl}practices/audio/${question.media.audio}`}
                    />
                  </div>
                )}

                <div><ReactMarkdown>{question.text}</ReactMarkdown></div>
              </div>

              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium mb-2">Options:</div>
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

              {(!question.options || question.options.length === 0) &&
                question.correct !== undefined && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800">
                      Note: Pour cette question d&apos;expression orale, évaluez
                      la qualité de la réponse selon les critères de
                      prononciation, vocabulaire et structure.
                    </p>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 mt-4 rounded-2xl p-4 mb-4">
        <p className="text-sm text-blue-900 font-medium mb-2">
          Instructions pour l&apos;expression orale:
        </p>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Cette question nécessite une réponse orale</li>
          <li>L&apos;étudiant doit structurer sa réponse de manière logique</li>
          <li>Temps de préparation recommandé: 1-2 minutes</li>
          <li>Durée de la réponse: 2-3 minutes</li>
        </ul>
      </div>
      <div className="mt-8 text-center">
        <a
          href="/trainer/pratiques/eo"
          className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Retour aux exercices
        </a>
      </div>
    </div>
  );
}
