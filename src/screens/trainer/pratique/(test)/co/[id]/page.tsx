"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  EyeClosed,
  Trophy,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import {
  Practice,
  PracticeQuestion,
  PracticeSession,
  SessionResult,
} from "@/types";
import { toast } from "sonner";
import { config } from "@/config";
import Header from "@/components/organisms/header-practice";
import AudioPlayer from "@/components/organisms/player";

export default function PracticeSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const practiceId = params.id as string;

  const [practice, setPractice] = useState<Practice | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(
    null
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const [retaking, setRetaking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<
    Array<{
      question: PracticeQuestion;
      userAnswer: number | null;
      correctAnswer: number;
      isCorrect: boolean;
    }>
  >([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize practice session
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [practiceId]);

  // Timer effect
  useEffect(() => {
    if (session && !sessionResult && practice) {
      startTimeRef.current = Date.now();
      const totalSeconds = practice.durationMinutes * 60;
      setTimeRemaining(totalSeconds);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeElapsed(elapsed);
        const remaining = totalSeconds - elapsed;
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          handleTimeExpired();
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [session, sessionResult, practice]);


  const handleTimeExpired = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    toast.error("Temps écoulé! L'exercice va se terminer automatiquement.");

    // Submit all answers that were completed and finish the session
    await submitAllAnswersAndComplete();
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // Restore the previously selected answer for this question
      const prevQuestion = questions[prevIndex];
      const prevAnswer = userAnswers[prevQuestion.number];
      setSelectedAnswer(prevAnswer !== undefined ? prevAnswer : null);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error("Veuillez sélectionner une réponse");
      return;
    }

    if (!session || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];

    // Store answer locally
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.number]: selectedAnswer,
    }));

    // Update progress
    const answeredCount = Object.keys(userAnswers).length + 1;
    const newProgress = Math.round((answeredCount / questions.length) * 100);
    setProgressPercent(newProgress);

    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // All questions answered, submit to backend and complete session
      await submitAllAnswersAndComplete();
    }
  };

  const submitAllAnswersAndComplete = async () => {
    if (!session) return;

    try {
      setSubmitting(true);

      // Collect all answers
      const allAnswers = { ...userAnswers };
      // Add the last answer if it's not already in the state
      if (selectedAnswer !== null) {
        const currentQuestion = questions[currentQuestionIndex];
        allAnswers[currentQuestion.number] = selectedAnswer;
      }

      // Prepare bulk submission data
      const answersToSubmit = questions
        .filter((question) => allAnswers[question.number] !== undefined)
        .map((question) => ({
          questionId: question._id,
          questionNumber: question.number,
          selectedAnswer: allAnswers[question.number],
        }));

      // Clear timer before submission
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }


      // Prepare review data - combine questions with user answers and correct answers
      const reviewData = questions.map((question) => {
        const userAnswer = allAnswers[question.number];
        const correctAnswer = question.correct ?? 0;
        const isCorrect = userAnswer === correctAnswer;

        return {
          question,
          userAnswer: userAnswer !== undefined ? userAnswer : null,
          correctAnswer,
          isCorrect,
        };
      });

      setQuestionsWithAnswers(reviewData);
    } catch (error: any) {
      console.error("Error submitting answers:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de la soumission"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };


  if (loading) {
    return (
      <div>
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
      </div>
    );
  }


  const currentQuestion = questions[currentQuestionIndex];


  return (
    <div>
      <Header title={practice.title} onClose={onClose} />
      <div className="container mx-auto lg:p-6 p-4 max-w-3xl">
        {/* Header with timer and progress */}
        <div className="mb-6 flex gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex justify-between text-sm text-muted-foreground gap-2">
              <span>
                Question {currentQuestionIndex + 1} sur {questions.length}
              </span>
              <span>{progressPercent}% complété</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          <div
            className={`flex items-center text-sm gap-2 px-3 py-0 rounded-full ${
              timeRemaining < 60
                ? "bg-red-100 text-red-700"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Clock className="h-3 w-3" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="lg:p-5 lg:border border-gray-200 rounded-2xl">
          <div className="lg:mb-6 mb-3 flex justify-between items-center">
            <div className="text-xl">Question {currentQuestion.number}</div>
          </div>
          <div className="space-y-3">
            {/* Image if exists */}
            {currentQuestion.media?.image && (
              <div className="flex justify-center">
                <img
                  src={`${config.cloudFlarePublicUrl}practices/images/${currentQuestion.media.image}`}
                  alt="Question"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            {/* Audio player if exists */}
            {currentQuestion.media?.audio && (
              <div className="flex items-center">
                <AudioPlayer
                  src={`${config.cloudFlarePublicUrl}practices/audio/${currentQuestion.media.audio}`}
                />
              </div>
            )}

            {/* Question text */}
            <div className="flex">
              <div className="text-sm flex-1">{currentQuestion.text}</div>
              <Button
                onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {showCorrectAnswer ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeClosed className="h-4 w-4" />
                )}
              </Button>
            </div>
            {/* Answer options */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="space-y-1">
                {currentQuestion.options.map((option, index) => {
                  const isCorrectAnswer =
                    showCorrectAnswer &&
                    currentQuestion.correct !== undefined &&
                    currentQuestion.correct === index;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={submitting}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isCorrectAnswer
                          ? "border-green-500 bg-green-50 shadow-md"
                          : selectedAnswer === index
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                      } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isCorrectAnswer
                              ? "border-green-600 bg-green-600"
                              : selectedAnswer === index
                                ? "border-primary bg-primary"
                                : "border-gray-300"
                          }`}
                        >
                          {(selectedAnswer === index || isCorrectAnswer) && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="flex-1">{option}</span>
                        {isCorrectAnswer && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || submitting}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédente
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || submitting}
                size="lg"
                className="lg:min-w-[200px]"
              >
                {submitting
                  ? "Envoi en cours..."
                  : currentQuestionIndex === questions.length - 1
                    ? "Terminer l'exercice"
                    : "Suivante"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
