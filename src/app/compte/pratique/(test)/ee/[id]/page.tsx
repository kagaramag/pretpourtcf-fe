"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle, PenTool, Eye, EyeOff } from "lucide-react";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { Practice, PracticeQuestion } from "@/types";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { config } from "@/config";
import PracticeLayout from "@/layouts/practice";
import Header from "@/components/organisms/header-practice";
import AudioPlayer from "@/components/organisms/player";

export default function WritingPracticeSessionPage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});

  // Initialize practice
  useEffect(() => {
    initializePractice();
  }, [practiceId]);

  const onClose = () => {
    router.push("/compte/pratique/ee");
  };

  const initializePractice = async () => {
    try {
      setLoading(true);

      // Fetch practice details
      const practiceResponse =
        await practiceService.getPracticeById(practiceId);
      const practiceData = practiceResponse.data.practice;
      setPractice(practiceData);

      // Fetch questions
      const questionsResponse = await questionService.getAllQuestions({
        examId: practiceId,
        sort: "number",
        limit: 1000,
      });
      const questionsData = questionsResponse.data.questions;
      setQuestions(questionsData);

      // Check if there are no questions
      if (questionsData.length === 0) {
        toast.error("Aucune question disponible pour cet exercice");
      }
    } catch (error: any) {
      console.error("Error initializing practice:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de l'initialisation"
      );
      router.push("/compte/pratique/ee");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PracticeLayout>
        <Header
          title="Chargement en cours, veuillez patienter"
          onClose={onClose}
        />
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">
              Chargement de l&apos;exercice...
            </p>
          </div>
        </div>
      </PracticeLayout>
    );
  }

  if (!practice) {
    return (
      <PracticeLayout>
        <Header title="Exercice introuvable" onClose={onClose} />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Exercice introuvable
              </h3>
              <Button onClick={() => router.push("/compte/pratique/ee")}>
                Retour aux exercices
              </Button>
            </CardContent>
          </Card>
        </div>
      </PracticeLayout>
    );
  }

  // Check if there are no questions
  if (!questions || questions.length === 0) {
    return (
      <PracticeLayout>
        <Header title={practice.title} onClose={onClose} />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune question disponible
              </h3>
              <Button onClick={() => router.push("/compte/pratique/ee")}>
                Retour aux exercices
              </Button>
            </CardContent>
          </Card>
        </div>
      </PracticeLayout>
    );
  }

  return (
    <PracticeLayout>
      <Header title={practice.title} onClose={onClose} />
      <div className="container mx-auto lg:p-6 p-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Sujets d'actualité</h2>
          <p className="text-muted-foreground">
            Total: {questions.length} sujets
          </p>
        </div>

        {/* All Questions */}
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question._id} className="lg:p-5 p-4">
                <h4 className="text-xl font-medium">
                  Tâche {question.number}
                </h4>
              <div className="space-y-3">
                {question?.text && (
                  <div>
                    <ReactMarkdown>{question.text}</ReactMarkdown>
                  </div>
                )}

                {/* Answer options if MCQ type - display only, no interaction */}
                {question.options && question.options.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-muted-foreground font-medium">
                      Options disponibles:
                    </p>
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => router.push("/compte/pratique/ee")}
            variant="outline"
            size="lg"
          >
            Retour aux exercices
          </Button>
        </div>
      </div>
    </PracticeLayout>
  );
}
