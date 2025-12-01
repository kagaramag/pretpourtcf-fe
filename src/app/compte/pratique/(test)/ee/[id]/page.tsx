"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { practiceSessionService } from "@/services/practice-session";
import { Practice, PracticeQuestion, PracticeSession } from "@/types";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import PracticeLayout from "@/layouts/practice";
import Header from "@/components/organisms/header-practice";
import MDEditor from "@uiw/react-md-editor";

// Question time limits and word count requirements
const QUESTION_CONFIG = [
  { time: 15, minWords: 60, maxWords: 120, label: "Réduction d'un message" },
  { time: 20, minWords: 80, maxWords: 120, label: "Blog" },
  { time: 25, minWords: 120, maxWords: 150, label: "Conciliation" },
];

const TOTAL_TIME = 60; // 60 minutes total

export default function WritingPracticeSessionPage() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Test state
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [timeRemaining, setTimeRemaining] = useState(0); // seconds
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0); // Total time in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorHeight, setEditorHeight] = useState(240); // Dynamic height for editor

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    initializePractice();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [practiceId]);

  const onClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
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

      if (questionsData.length !== 3) {
        toast.error("Cet exercice doit contenir exactement 3 questions");
        router.push("/compte/pratique/ee");
        return;
      }

      setQuestions(questionsData);
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

  const startTest = async () => {
    try {
      // Start practice session
      const sessionResponse = await practiceSessionService.startSession({
        practiceId,
      });
      setSession(sessionResponse.data.session);
      setHasStarted(true);
      setCurrentQuestionIndex(0);

      // Start timer for first question (15 minutes)
      startQuestionTimer(0);

      // Start total timer
      startTotalTimer();

      toast.success("Test démarré! Bonne chance!");
    } catch (error: any) {
      console.error("Error starting session:", error);
      toast.error(error.response?.data?.message || "Erreur lors du démarrage");
    }
  };

  const startQuestionTimer = (questionIndex: number) => {
    const timeLimit = QUESTION_CONFIG[questionIndex].time * 60; // Convert to seconds
    setTimeRemaining(timeLimit);
    questionStartTimeRef.current = Date.now();

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up for this question - auto-advance
          if (timerRef.current) clearInterval(timerRef.current);
          handleNext(true); // true = auto-submit due to timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTotalTimer = () => {
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
    }

    totalTimerRef.current = setInterval(() => {
      setTotalTimeElapsed((prev) => {
        const newTotal = prev + 1;
        if (newTotal >= TOTAL_TIME * 60) {
          // 60 minutes elapsed - force submit
          if (totalTimerRef.current) clearInterval(totalTimerRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinalSubmit(true); // true = auto-submit due to timeout
        }
        return newTotal;
      });
    }, 1000);
  };

  const handleNext = async (autoSubmit = false) => {
    const nextIndex = currentQuestionIndex + 1;

    if (autoSubmit) {
      toast.info("Temps écoulé pour cette question. Passage à la suivante.");
    }

    if (nextIndex < 3) {
      // Move to next question
      setCurrentQuestionIndex(nextIndex);
      startQuestionTimer(nextIndex);
      // Reset editor height when moving to next question
      setEditorHeight(240);
    } else {
      // All questions answered - submit
      handleFinalSubmit(autoSubmit);
    }
  };

  // Calculate dynamic editor height based on content
  const calculateEditorHeight = (text: string) => {
    const lines = text.split("\n").length;
    const minHeight = 240;
    const lineHeight = 24; // Approximate height per line
    const toolbarHeight = 30; // Toolbar height
    const padding = 20; // Extra padding
    const calculatedHeight = Math.max(
      minHeight,
      lines * lineHeight + toolbarHeight + padding
    );
    return calculatedHeight;
  };

  const handleFinalSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (!session) {
        toast.error("Session non trouvée");
        return;
      }

      if (timerRef.current) clearInterval(timerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);

      // Prepare answers for submission
      const answersData = questions.map((question, index) => ({
        questionId: question._id,
        questionNumber: question.number,
        textAnswer: answers[index] || "",
      }));

      // Submit all answers and complete session
      await practiceSessionService.bulkSubmitAndComplete({
        sessionId: session._id,
        timeElapsedSeconds: totalTimeElapsed,
        answers: answersData,
      });

      if (autoSubmit) {
        toast.success("Test terminé automatiquement (temps écoulé)");
      } else {
        toast.success("Test soumis avec succès!");
      }

      // Redirect to history or results page
      router.push("/compte/historique");
    } catch (error: any) {
      console.error("Error submitting answers:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la soumission"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const countWords = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const getWordCountColor = (
    wordCount: number,
    minWords: number,
    maxWords: number
  ) => {
    if (wordCount < minWords) return "text-orange-600";
    if (wordCount > maxWords) return "text-red-600";
    return "text-green-600";
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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  if (!questions || questions.length !== 3) {
    return (
      <PracticeLayout>
        <Header title={practice.title} onClose={onClose} />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Cet exercice doit contenir exactement 3 questions
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

  // Start screen
  if (!hasStarted) {
    return (
      <PracticeLayout>
        <Header title={practice.title} onClose={onClose} />
        <div className="container mx-auto lg:p-6 p-4 max-w-3xl">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Expression écrite</h2>

            <div className="space-y-4 mb-8">
              <Alert>
                <AlertDescription>
                  Ce test contient 3 tâches avec des limites de temps
                  spécifiques. Le temps total est de 60 minutes.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {QUESTION_CONFIG.map((config, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{config.label}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {config.time} min
                        </span>
                        <span>
                          {config.minWords}-{config.maxWords} mots
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={startTest} size="lg" className="px-8">
                Commencer
              </Button>
            </div>
          </Card>
        </div>
      </PracticeLayout>
    );
  }

  // Test screen
  const currentQuestion = questions[currentQuestionIndex];
  const currentConfig = QUESTION_CONFIG[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const wordCount = countWords(currentAnswer);

  return (
    <PracticeLayout>
      <Header title={practice.title} onClose={onClose} />
      <div className="container mx-auto lg:p-6 p-4 max-w-4xl">
        {/* Progress and Timer */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm ">Question</p>
              <div>{currentQuestionIndex + 1} / 3</div>
            </div>
            <div className="h-12 w-px bg-gray-300" />
            <div>
              <p className="text-sm ">Temps restant (tâche)</p>
              <div
                className={`${timeRemaining < 60 ? "text-red-600" : "text-green-600"}`}
              >
                {formatTime(timeRemaining)}
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300" />
            <div>
              <p className="text-sm">Temps total écoulé</p>
              <div className="flex flex-row">
                <div className="w-12">{formatTime(totalTimeElapsed)}</div>/{" "}
                <div className="ml-2 w-12">{TOTAL_TIME}:00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">
                Tâche {currentQuestionIndex + 1}: {currentConfig.label}
              </h3>
              <div className="text-sm text-text-gray-500">
                {currentConfig.minWords}-{currentConfig.maxWords} mots requis
              </div>
            </div>

            <div className="prose max-w-none">
              <ReactMarkdown>{currentQuestion.text}</ReactMarkdown>
            </div>
          </div>

          {/* Answer Editor */}
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Votre réponse:</label>
              <div
                className={`text-sm font-medium ${getWordCountColor(wordCount, currentConfig.minWords, currentConfig.maxWords)}`}
              >
                {wordCount} mot{wordCount !== 1 ? "s" : ""}
                {wordCount < currentConfig.minWords &&
                  ` (minimum: ${currentConfig.minWords})`}
                {wordCount > currentConfig.maxWords &&
                  ` (maximum: ${currentConfig.maxWords})`}
              </div>
            </div>

            <div data-color-mode="light">
              <MDEditor
                value={currentAnswer}
                onChange={(value) => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestionIndex] = value || "";
                  setAnswers(newAnswers);
                  // Update editor height based on content
                  const newHeight = calculateEditorHeight(value || "");
                  setEditorHeight(newHeight);
                }}
                preview="edit"
                height={editorHeight}
                textareaProps={{
                  placeholder:
                    "Écrivez votre réponse ici... Vous pouvez utiliser le formatage markdown.",
                }}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-muted-foreground">
            {currentQuestionIndex < 2
              ? "Cliquez sur Suivant pour passer à la question suivante"
              : "Cliquez sur Terminer pour soumettre votre test"}
          </div>
          <Button
            onClick={() => handleNext(false)}
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission...
              </>
            ) : currentQuestionIndex < 2 ? (
              <>
                Suivant
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Terminer le test"
            )}
          </Button>
        </div>
      </div>
    </PracticeLayout>
  );
}
