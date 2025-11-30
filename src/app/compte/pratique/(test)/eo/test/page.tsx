"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import PracticeLayout from "@/layouts/practice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/organisms/header-practice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Loader2, Mic, Square, Play, Pause, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { questionService } from "@/services/question";
import { PracticeQuestion } from "@/types";
import { toast } from "sonner";

type TacheType = 1 | 2 | 3;

interface AudioRecording {
  blob: Blob | null;
  url: string | null;
}

const TACHE_TIME_LIMITS = {
  1: 120, // 2 minutes
  2: 240, // 4 minutes
  3: 240, // 4 minutes
};

export default function SpeakingPracticeSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [fetchedQuestionIds, setFetchedQuestionIds] = useState<Set<string>>(
    new Set()
  );

  // Audio recording states
  const [activeRecordingTache, setActiveRecordingTache] =
    useState<TacheType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTimes, setRecordingTimes] = useState<
    Record<TacheType, number>
  >({
    1: 0,
    2: 0,
    3: 0,
  });
  const [audioRecordings, setAudioRecordings] = useState<
    Record<TacheType, AudioRecording>
  >({
    1: { blob: null, url: null },
    2: { blob: null, url: null },
    3: { blob: null, url: null },
  });
  const [isPlaying, setIsPlaying] = useState<Record<TacheType, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementsRef = useRef<Record<TacheType, HTMLAudioElement | null>>({
    1: null,
    2: null,
    3: null,
  });

  // Cleanup function for audio recordings
  const cleanupAudioRecordings = () => {
    // Revoke blob URLs to free up memory
    Object.values(audioRecordings).forEach((recording) => {
      if (recording.url) {
        URL.revokeObjectURL(recording.url);
      }
    });

    // Stop all audio playback
    Object.values(audioElementsRef.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    });

    // Reset recordings
    setAudioRecordings({
      1: { blob: null, url: null },
      2: { blob: null, url: null },
      3: { blob: null, url: null },
    });

    setIsPlaying({
      1: false,
      2: false,
      3: false,
    });
  };

  // Cleanup on unmount or when leaving the page
  useEffect(() => {
    return () => {
      cleanupAudioRecordings();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const onClose = () => {
    cleanupAudioRecordings();
    router.push("/compte/pratique/eo");
  };

  const startRecording = async (tacheNumber: TacheType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Cleanup previous recording for this tache
        if (audioRecordings[tacheNumber].url) {
          URL.revokeObjectURL(audioRecordings[tacheNumber].url);
        }

        setAudioRecordings((prev) => ({
          ...prev,
          [tacheNumber]: { blob: audioBlob, url: audioUrl },
        }));

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        setActiveRecordingTache(null);
      };

      mediaRecorder.start();
      setActiveRecordingTache(tacheNumber);
      setIsPaused(false);
      setRecordingTimes((prev) => ({ ...prev, [tacheNumber]: 0 }));

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTimes((prev) => {
          const newTime = prev[tacheNumber] + 1;
          // Auto-stop when time limit reached
          if (newTime >= TACHE_TIME_LIMITS[tacheNumber]) {
            stopRecording();
          }
          return { ...prev, [tacheNumber]: newTime };
        });
      }, 1000);

      toast.success("Enregistrement démarré");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erreur lors du démarrage de l'enregistrement");
    }
  };

  const pauseRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      toast.info("Enregistrement en pause");
    }
  };

  const resumeRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "paused" &&
      activeRecordingTache
    ) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Resume timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTimes((prev) => {
          const newTime = prev[activeRecordingTache] + 1;
          if (newTime >= TACHE_TIME_LIMITS[activeRecordingTache]) {
            stopRecording();
          }
          return { ...prev, [activeRecordingTache]: newTime };
        });
      }, 1000);

      toast.info("Enregistrement repris");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      toast.success("Enregistrement arrêté");
    }
  };

  const playAudio = (tacheNumber: TacheType) => {
    const recording = audioRecordings[tacheNumber];
    if (!recording.url) return;

    const audio = new Audio(recording.url);
    audioElementsRef.current[tacheNumber] = audio;

    audio.onended = () => {
      setIsPlaying((prev) => ({ ...prev, [tacheNumber]: false }));
    };

    audio.play();
    setIsPlaying((prev) => ({ ...prev, [tacheNumber]: true }));
  };

  const pauseAudio = (tacheNumber: TacheType) => {
    const audio = audioElementsRef.current[tacheNumber];
    if (audio) {
      audio.pause();
      setIsPlaying((prev) => ({ ...prev, [tacheNumber]: false }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchPractice = async () => {
    try {
      setLoading(true);

      // Practice IDs for specific taches
      const TACHE_2_ID = "692c1d115778a7b3364f6fde";
      const TACHE_3_ID = "692c1df65778a7b3364f7011";

      const selectedQuestions: PracticeQuestion[] = [];
      const newFetchedIds = new Set(fetchedQuestionIds);

      // Fetch all questions from Tache 2
      const tache2Response = await questionService.getAllQuestions({
        examId: TACHE_2_ID,
        limit: 1000,
      });

      const allTache2Questions = tache2Response.data.questions;
      let availableTache2 = allTache2Questions.filter(
        (q) => !fetchedQuestionIds.has(q._id)
      );

      // If all Tache 2 questions have been used, reset and use all questions
      if (availableTache2.length === 0 && allTache2Questions.length > 0) {
        availableTache2 = allTache2Questions;
        // Remove Tache 2 question IDs from the fetched set
        allTache2Questions.forEach((q) => newFetchedIds.delete(q._id));
      }

      if (availableTache2.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTache2.length);
        const selectedQuestion = availableTache2[randomIndex];
        selectedQuestions.push(selectedQuestion);
        newFetchedIds.add(selectedQuestion._id);
      }

      // Fetch all questions from Tache 3
      const tache3Response = await questionService.getAllQuestions({
        examId: TACHE_3_ID,
        limit: 1000,
      });

      const allTache3Questions = tache3Response.data.questions;
      let availableTache3 = allTache3Questions.filter(
        (q) => !fetchedQuestionIds.has(q._id)
      );

      // If all Tache 3 questions have been used, reset and use all questions
      if (availableTache3.length === 0 && allTache3Questions.length > 0) {
        availableTache3 = allTache3Questions;
        // Remove Tache 3 question IDs from the fetched set
        allTache3Questions.forEach((q) => newFetchedIds.delete(q._id));
        toast.info("Tâche 3: Réinitialisation des questions");
      }

      if (availableTache3.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableTache3.length);
        const selectedQuestion = availableTache3[randomIndex];
        selectedQuestions.push(selectedQuestion);
        newFetchedIds.add(selectedQuestion._id);
      }

      if (selectedQuestions.length === 0) {
        toast.error("Aucune question disponible pour les tâches 2 et 3");
        return;
      }

      setQuestions(selectedQuestions);
      setFetchedQuestionIds(newFetchedIds);
      setHasStarted(true);
    } catch (error: any) {
      console.error("Error fetching practice:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement de la pratique"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    fetchPractice();
    cleanupAudioRecordings(); // Cleanup any previous recordings when starting new session
  };

  const isRecording = activeRecordingTache !== null;
  const allRecordingsComplete =
    audioRecordings[1].url && audioRecordings[2].url && audioRecordings[3].url;

  return (
    <PracticeLayout>
      <Header title="Expression orale" onClose={onClose} />
      <div className="container mx-auto lg:p-6 p-2 max-w-3xl">
        <Card className="px-4">
          {!hasStarted ? (
            <div className="space-y-2 mb-8">
              <Alert>
                <AlertDescription>
                  Ce test contient 3 tâches avec des limites de temps
                  spécifiques.
                </AlertDescription>
              </Alert>
              <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Presentation</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />2 mins
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Sujet: Poser les questions</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />4 mins
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Sujet de dissertation</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />4 mins
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button size="lg" onClick={handleStart} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Commencer"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  Utilisez les contrôles d&apos;enregistrement pour chaque
                  tâche. Les enregistrements ne sont pas sauvegardés.
                </AlertDescription>
              </Alert>

              {/* Tache 1: Presentation */}
              <div className="space-y-1 p-4 border rounded-lg border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-1 relative">
                    <h3 className="font-semibold mb-2">
                      Tâche 1: Presentation
                    </h3>
                    <p className="mb-3">
                      Présentez-vous en français (2 minutes maximum)
                    </p>
                    {/* Recording controls for Tache 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span
                          className={`font-mono ${
                            recordingTimes[1] >= TACHE_TIME_LIMITS[1] - 10
                              ? "text-red-600 font-semibold"
                              : ""
                          }`}
                        >
                          {formatTime(recordingTimes[1])} /{" "}
                          {formatTime(TACHE_TIME_LIMITS[1])}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {activeRecordingTache !== 1 ? (
                          <Button
                            onClick={() => startRecording(1)}
                            size="sm"
                            className="gap-2"
                            variant={"tertiary"}
                            disabled={
                              isRecording || audioRecordings[1].url !== null
                            }
                          >
                            <Mic className="h-4 w-4" />
                            Enregistrer
                          </Button>
                        ) : (
                          <>
                            {!isPaused ? (
                              <Button
                                onClick={pauseRecording}
                                size="sm"
                                variant="outline"
                                className="gap-2"
                              >
                                <Pause className="h-4 w-4" />
                                Pause
                              </Button>
                            ) : (
                              <Button
                                onClick={resumeRecording}
                                size="sm"
                                variant="outline"
                                className="gap-2"
                              >
                                <Play className="h-4 w-4" />
                                Reprendre
                              </Button>
                            )}
                            <Button
                              onClick={stopRecording}
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                            >
                              <Square className="h-4 w-4" />
                              Arrêter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {audioRecordings[1].url && (
                      <div className="absolute top-0 right-0 flex gap-2 items-center p-1 bg-green-500 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tache 2 */}
              {questions.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      2
                    </div>
                    <div className="flex-1 relative">
                      <h3 className="font-semibold mb-2">
                        Tâche 2: Poser les questions
                      </h3>
                      <div className="prose prose-sm mb-3">
                        <ReactMarkdown>{questions[0].text}</ReactMarkdown>
                      </div>

                      <div className="space-y-3 relative">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span
                            className={`font-mono ${
                              recordingTimes[2] >= TACHE_TIME_LIMITS[2] - 10
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {formatTime(recordingTimes[2])} /{" "}
                            {formatTime(TACHE_TIME_LIMITS[2])}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {activeRecordingTache !== 2 ? (
                            <Button
                              onClick={() => startRecording(2)}
                              size="sm"
                              className="gap-2"
                              variant={"tertiary"}
                              disabled={
                                isRecording ||
                                !audioRecordings[1].url ||
                                audioRecordings[2].url !== null
                              }
                            >
                              <Mic className="h-4 w-4" />
                              Enregistrer
                            </Button>
                          ) : (
                            <>
                              {!isPaused ? (
                                <Button
                                  onClick={pauseRecording}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                >
                                  <Pause className="h-4 w-4" />
                                  Pause
                                </Button>
                              ) : (
                                <Button
                                  onClick={resumeRecording}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                >
                                  <Play className="h-4 w-4" />
                                  Reprendre
                                </Button>
                              )}
                              <Button
                                onClick={stopRecording}
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                              >
                                <Square className="h-4 w-4" />
                                Arrêter
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tache 3 */}
              {questions.length > 1 && (
                <div className="space-y-4 p-4 border rounded-lg border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      3
                    </div>
                    <div className="flex-1 relative">
                      <h3 className="font-semibold mb-2">
                        Tâche 3: Sujet de dissertation
                      </h3>
                      <div className="prose prose-sm mb-3">
                        <ReactMarkdown>{questions[1].text}</ReactMarkdown>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span
                            className={`font-mono ${
                              recordingTimes[3] >= TACHE_TIME_LIMITS[3] - 10
                                ? "text-red-600 font-semibold"
                                : ""
                            }`}
                          >
                            {formatTime(recordingTimes[3])} /{" "}
                            {formatTime(TACHE_TIME_LIMITS[3])}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {activeRecordingTache !== 3 ? (
                            <Button
                              onClick={() => startRecording(3)}
                              size="sm"
                              className="gap-2"
                              variant={"tertiary"}
                              disabled={
                                isRecording ||
                                !audioRecordings[2].url ||
                                audioRecordings[3].url !== null
                              }
                            >
                              <Mic className="h-4 w-4" />
                              Enregistrer
                            </Button>
                          ) : (
                            <>
                              {!isPaused ? (
                                <Button
                                  onClick={pauseRecording}
                                  size="sm"
                                  variant="outline"
                                  className="gap-2"
                                >
                                  <Pause className="h-4 w-4" />
                                  Pause
                                </Button>
                              ) : (
                                <Button
                                  onClick={resumeRecording}
                                  size="sm"
                                  variant="tertiary"
                                  className="gap-2"
                                >
                                  <Play className="h-4 w-4" />
                                  Reprendre
                                </Button>
                              )}
                              <Button
                                onClick={stopRecording}
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                              >
                                <Square className="h-4 w-4" />
                                Arrêter
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {audioRecordings[3].url && (
                        <div className="absolute top-0 right-0 flex gap-2 items-center p-1 bg-green-500 rounded-full">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Playback section - only show when all recordings are complete */}
              {allRecordingsComplete && (
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <h3 className="font-semibold text-lg mb-4 text-green-900">
                    Tous les enregistrements terminés
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vous pouvez maintenant écouter vos enregistrements
                  </p>

                  <div className="space-y-3">
                    {/* Tache 1 Playback */}
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="font-medium">Tâche 1: Présentation</span>
                      {!isPlaying[1] ? (
                        <Button
                          onClick={() => playAudio(1)}
                          size="sm"
                          variant="tertiary"
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Écouter
                        </Button>
                      ) : (
                        <Button
                          onClick={() => pauseAudio(1)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                    </div>

                    {/* Tache 2 Playback */}
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="font-medium">
                        Tâche 2: Poser les questions
                      </span>
                      {!isPlaying[2] ? (
                        <Button
                          onClick={() => playAudio(2)}
                          size="sm"
                          variant="tertiary"
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Écouter
                        </Button>
                      ) : (
                        <Button
                          onClick={() => pauseAudio(2)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                    </div>

                    {/* Tache 3 Playback */}
                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="font-medium">
                        Tâche 3: Sujet de dissertation
                      </span>
                      {!isPlaying[3] ? (
                        <Button
                          onClick={() => playAudio(3)}
                          size="sm"
                          variant="tertiary"
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Écouter
                        </Button>
                      ) : (
                        <Button
                          onClick={() => pauseAudio(3)}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-4">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={loading || isRecording}
                  variant="tertiary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Charger de nouvelles questions"
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PracticeLayout>
  );
}
