"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, Verified, Clock, ArrowRight, Open, Trophy, XCircle, RotateCcw, CaretLeft } from "@/icons";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { practiceSessionService } from "@/services/practice-session";
import {
  Practice,
  PracticeQuestion,
  PracticeSession,
  SessionResult,
} from "@/types";
import { toast } from "sonner";
import { config } from "@/config";
import PracticeLayout from "@/layouts/practice";
import Header from "@/components/organisms/header-practice";
import { AutoLinkToStreak } from "@/components/streak/auto-link-to-streak";
import AudioPlayer from "@/components/organisms/player";
import { FreemiumRestricted } from "@/components/practice/freemium-restricted";

export default function FreePracticeSessionPage() {
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

  const [isNotFreemium, setIsNotFreemium] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize practice session
  useEffect(() => {
    initializePractice();
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

  const onClose = async () => {
    try {
      // OPTIMIZATION: Stop the timer IMMEDIATELY before any async operations
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // OPTIMIZATION: Freeze the countdown display immediately
      setTimeRemaining(0);

      // OPTIMIZATION: Cancel session and navigate in parallel (don't wait for backend)
      // Fire and forget the backend call - don't await it
      if (session) {
        practiceSessionService.cancelSession(session._id).catch((error) => {
          console.error("Error cancelling session on backend:", error);
          // Log but don't show error to user since they're already navigating away
        });
      }

      // Navigate immediately without waiting for backend response
      router.push("/compte/essai-gratuit?type=co");
    } catch (error: any) {
      console.error("Error closing session:", error);
      // Still navigate even if there's an error
      router.push("/compte/essai-gratuit?type=co");
    }
  };

  const initializePractice = async () => {
    try {
      setLoading(true);

      // Fetch practice details
      const practiceResponse =
        await practiceService.getPracticeById(practiceId);
      const practiceData = practiceResponse.data.practice;

      // Validate that this is a freemium practice
      if (!practiceData.freemium) {
        setIsNotFreemium(true);
        setLoading(false);
        return;
      }

      setPractice(practiceData);

      // Fetch questions
      const questionsResponse = await questionService.getAllQuestions({
        examId: practiceId,
        sort: "number",
        limit: 1000,
      });
      const questionsData = questionsResponse.data.questions;
      setQuestions(questionsData);

      // Check if there are no questions - don't start a session
      if (questionsData.length === 0) {
        toast.error("Aucune question disponible pour cet exercice");
        setLoading(false);
        return;
      }

      // Start or resume session
      const sessionResponse = await practiceSessionService.startSession({
        practiceId,
      });
      const sessionData = sessionResponse.data.session;
      setSession(sessionData);

      // If resuming with answers, cancel it and start fresh
      // (Since we now store answers locally, we can't resume mid-session)
      if (sessionData.answers.length > 0) {
        try {
          await practiceSessionService.cancelSession(sessionData._id);
          toast.info("Session précédente annulée. Rechargement...");
          // Reload to start fresh
          window.location.reload();
          return;
        } catch (error) {
          console.error("Error cancelling session:", error);
          toast.error("Erreur lors de l'annulation de la session");
          setLoading(false);
          return;
        }
      }
    } catch (error: any) {
      console.error("Error initializing practice:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors de l'initialisation"
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

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

      // Bulk submit all answers and complete session in one call
      const response = await practiceSessionService.bulkSubmitAndComplete({
        sessionId: session._id,
        timeElapsedSeconds: timeElapsed,
        answers: answersToSubmit,
      });

      const completedSession = response.data.session;
      setSessionResult(completedSession);

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

  const getResultColor = (grade: string) => {
    switch (grade) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getResultIcon = (grade: string) => {
    switch (grade) {
      case "excellent":
        return <Trophy className="h-16 w-16 text-green-600" />;
      case "good":
        return <Verified className="h-16 w-16 text-orange-600" />;
      default:
        return <Info className="h-16 w-16 text-red-600" />;
    }
  };

  const handleRetakeTest = () => {
    try {
      setRetaking(true);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      toast.success("Rechargement de l'exercice...");

      // Reload the page to start a fresh session
      // When the page reloads, initializePractice() will call startSession()
      // Since the current session is completed (not in-progress), the backend
      // will automatically create a new session and the timer will restart
      window.location.reload();
    } catch (error: any) {
      console.error("Error retaking test:", error);
      toast.error(
        error.response?.data?.message || "Erreur lors du rechargement"
      );
      setRetaking(false);
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

  if (isNotFreemium) {
    return <FreemiumRestricted categorySlug="co" />;
  }

  if (!practice || !session) {
    return (
      <PracticeLayout>
        <Header title="Exercice introuvable" onClose={onClose} />
        <div className="container mx-auto p-6">
          <Card>
            <div className="p-6 flex flex-col items-center justify-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Exercice introuvable
              </h3>
              <Button onClick={() => router.push("/compte/essai-gratuit?type=co")}>
                Retour aux exercices
              </Button>
            </div>
          </Card>
        </div>
      </PracticeLayout>
    );
  }

  // Show results
  if (sessionResult) {
    // Show review mode
    if (showReview) {
      return (
        <PracticeLayout>
          <Header title="Revue des réponses" onClose={onClose} />
          <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
              <Button
                onClick={() => setShowReview(false)}
                variant="outline"
                className="gap-2"
              >
                <CaretLeft className="h-4 w-4" />
                Retour au résumé
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-2xl mb-4">
                  Revue des réponses
                </h3>
                <p className="text-muted-foreground mb-6">
                  Analysez vos réponses pour mieux comprendre vos erreurs
                </p>
                <div className="space-y-6">
                  {questionsWithAnswers.map((item, index) => (
                    <Card
                      key={item.question._id}
                      className={`border-2 ${
                        item.isCorrect
                          ? "border-green-200 bg-green-50/50"
                          : "border-red-200 bg-red-50/50"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="text-xl font-semibold">
                              Question {item?.question?.number}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {item.isCorrect ? (
                              <div className="flex items-center gap-1">
                                <Verified className="h-5 w-5 text-green-600" />
                                <span className="text-green-600">Correct</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-red-600">Incorrect</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {/* Question media */}
                          {item.question.media?.image && (
                            <div className="flex justify-center">
                              <img
                                src={`${config.cloudFlarePublicUrl}practices/images/${item.question.media.image}`}
                                alt="Question"
                                className="max-w-full h-auto rounded-lg"
                              />
                            </div>
                          )}
                          {item.question.media?.audio && (
                            <div className="flex items-center">
                              <AudioPlayer
                                src={`${config.cloudFlarePublicUrl}practices/audio/${item.question.media.audio}`}
                              />
                            </div>
                          )}

                          {/* Question text */}
                          <p className="text-sm font-medium">
                            {item.question.text}
                          </p>

                          {/* Options */}
                          <div className="space-y-2">
                            {item.question.options?.map((option, optIndex) => {
                              const isUserAnswer = item.userAnswer === optIndex;
                              const isCorrectAnswer =
                                item.correctAnswer === optIndex;

                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border-2 ${
                                    isCorrectAnswer
                                      ? "border-green-500 bg-green-50"
                                      : isUserAnswer
                                        ? "border-red-500 bg-red-50"
                                        : "border-border bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        isCorrectAnswer
                                          ? "border-green-600 bg-green-600"
                                          : isUserAnswer
                                            ? "border-red-600 bg-red-600"
                                            : "border-gray-300"
                                      }`}
                                    >
                                      {(isCorrectAnswer || isUserAnswer) && (
                                        <div className="w-3 h-3 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span className="flex-1">{option}</span>
                                    {isCorrectAnswer && (
                                      <Verified className="h-5 w-5 text-green-600" />
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {!item.isCorrect && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-900">
                                <strong>Bonne réponse:</strong>{" "}
                                {item.question.options?.[item.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </PracticeLayout>
      );
    }

    // Show summary
    return (
      <PracticeLayout>
        <Header title={practice.title} onClose={onClose} />
        <div className="container mx-auto p-6 max-w-4xl">
          <Card className={`border-2 ${getResultColor(sessionResult.grade)}`}>
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                {getResultIcon(sessionResult.grade)}
              </div>
              <h3 className="font-semibold text-3xl mb-2 text-center">
                {sessionResult.message}
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Exercice terminé
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Score
                      </p>
                      <p className="text-3xl font-bold">
                        {sessionResult.totalScore}/
                        {sessionResult.maxPossibleScore}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Pourcentage
                      </p>
                      <p className="text-3xl font-bold">
                        {sessionResult.percentageScore}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Temps
                      </p>
                      <p className="text-3xl font-bold">
                        {formatTime(sessionResult.timeElapsedSeconds)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Automatic Streak Linking - Triggers on mount if score >= 90% */}
                {session && (
                  <div className="mt-6">
                    <AutoLinkToStreak
                      sessionId={session._id}
                      percentageScore={sessionResult.percentageScore}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button
                    onClick={() => setShowReview(true)}
                    variant="default"
                    size="lg"
                    className="gap-2"
                  >
                    <Open className="h-4 w-4" />
                    Voir les réponses
                  </Button>
                  <Button
                    onClick={handleRetakeTest}
                    disabled={retaking}
                    variant="accent"
                    size="lg"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {retaking ? "Rechargement..." : "Refaire l'exercice"}
                  </Button>
                  <Button
                    onClick={() => router.push("/compte/essai-gratuit?type=co")}
                    variant="outline"
                    size="lg"
                  >
                    Retour aux exercices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PracticeLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <PracticeLayout>
        <Header title={practice.title} onClose={onClose} />
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center py-12">
              <Info className="h-16 w-16 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune question disponible
              </h3>
              <Button onClick={() => router.push("/compte/essai-gratuit?type=co")}>
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
        <div className="lg:p-5 lg:border border-border rounded-2xl">
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
            <p className="text-base font-medium mb-4">{currentQuestion.text}</p>

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
                            : "border-border hover:border-primary/50 hover:bg-gray-50"
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
                          <Verified className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {/* Navigation buttons */}
            <div className="flex justify-between items-center gap-4 pt-4">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || submitting}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <CaretLeft className="h-4 w-4" />
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
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PracticeLayout>
  );
}
