"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { toast } from "sonner";
import { config } from "@/config";
import AudioPlayer from "@/components/organisms/player";

export default function SpeakingPracticeDetailPage() {
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPracticeAndQuestions();
  }, [practiceId]);

  const fetchPracticeAndQuestions = async () => {
    try {
      setLoading(true);

      // Fetch practice details
      const practiceResponse = await practiceService.getPracticeById(practiceId);
      const practiceData = practiceResponse.data.practice;
      setPractice(practiceData);

      // Fetch questions for this practice
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
          <a href="/trainer/pratiques/eo" className="text-blue-600 underline">
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
        <p className="text-gray-600">Questions et Réponses - Expression Orale</p>
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

                {/* Question media - Image */}
                {question.media?.image && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowImages(prev => ({
                        ...prev,
                        [question._id]: !prev[question._id]
                      }))}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 mb-2"
                    >
                      {showImages[question._id] ? 'Masquer l\'image' : 'Afficher l\'image'}
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

                {/* Question media - Audio */}
                {question.media?.audio && (
                  <div className="mb-4">
                    <AudioPlayer
                      src={`${config.cloudFlarePublicUrl}practices/audio/${question.media.audio}`}
                    />
                  </div>
                )}

                {/* Question text */}
                <p className="mb-4">{question.text}</p>

                {/* Speaking practice specific instructions */}
                {question.type === "speaking" || !question.options || question.options.length === 0 ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      Instructions pour l'expression orale:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Cette question nécessite une réponse orale</li>
                      <li>L'étudiant doit structurer sa réponse de manière logique</li>
                      <li>Temps de préparation recommandé: 1-2 minutes</li>
                      <li>Durée de la réponse: 2-3 minutes</li>
                    </ul>
                  </div>
                ) : null}
              </div>

              {/* Answer options */}
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

              {/* Show correct answer index if no options */}
              {(!question.options || question.options.length === 0) &&
               question.correct !== undefined && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800">
                    Note: Pour cette question d'expression orale, évaluez la qualité de la réponse selon les critères de prononciation, vocabulaire et structure.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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