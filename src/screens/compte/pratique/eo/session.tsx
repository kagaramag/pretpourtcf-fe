"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import PracticeLayout from "@/layouts/practice";
import Header from "@/components/organisms/header-practice";
import { Button } from "@/components/ui/button";
import { Loading, Check } from "@/icons";
import ReactMarkdown from "react-markdown";
import { questionService } from "@/services/question";
import { practiceSessionService } from "@/services/practice-session";
import { PracticeQuestion, PracticeSession } from "@/types";
import { toast } from "sonner";
import {
  TacheType,
  TACHE_TIME_LIMITS,
  CONSIGNE_AUDIO,
  CountdownTimer,
  WaveformVisualizer,
} from "./components";

// ─── Main page ───────────────────────────────────────────────────────
export default function SpeakingPracticeSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [currentTache, setCurrentTache] = useState<TacheType>(1);

  // Consigne (instruction audio)
  const [consigneListened, setConsigneListened] = useState<
    Record<TacheType, boolean>
  >({ 1: false, 2: false, 3: false });
  const [consignePlaying, setConsignePlaying] = useState<TacheType | null>(
    null
  );
  const consigneAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recording
  const [activeRecordingTache, setActiveRecordingTache] =
    useState<TacheType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTimes, setRecordingTimes] = useState<
    Record<TacheType, number>
  >({
    1: TACHE_TIME_LIMITS[1],
    2: TACHE_TIME_LIMITS[2],
    3: TACHE_TIME_LIMITS[3],
  });
  const [audioRecordings, setAudioRecordings] = useState<
    Record<TacheType, { blob: Blob | null; url: string | null }>
  >({
    1: { blob: null, url: null },
    2: { blob: null, url: null },
    3: { blob: null, url: null },
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const reviewAudioRefs = useRef<Record<TacheType, HTMLAudioElement | null>>({
    1: null,
    2: null,
    3: null,
  });

  // ── Fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetchPractice();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      )
        mediaRecorderRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Auto-advance to next tâche when recording completes
  useEffect(() => {
    if (audioRecordings[currentTache].url) {
      if (currentTache < 3) {
        const next = (currentTache + 1) as TacheType;
        const timer = setTimeout(() => setCurrentTache(next), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [audioRecordings, currentTache]);

  const fetchPractice = async () => {
    try {
      setLoading(true);
      const TACHE_2_ID = "692c1d115778a7b3364f6fde";
      const TACHE_3_ID = "692c1df65778a7b3364f7011";
      const selectedQuestions: PracticeQuestion[] = [];

      const [tache2Res, tache3Res] = await Promise.all([
        questionService.getAllQuestions({ examId: TACHE_2_ID, limit: 1000 }),
        questionService.getAllQuestions({ examId: TACHE_3_ID, limit: 1000 }),
      ]);

      const t2 = tache2Res.data.questions;
      if (t2.length > 0)
        selectedQuestions.push(t2[Math.floor(Math.random() * t2.length)]);
      const t3 = tache3Res.data.questions;
      if (t3.length > 0)
        selectedQuestions.push(t3[Math.floor(Math.random() * t3.length)]);

      const sessionRes = await practiceSessionService.startSession({
        practiceId: TACHE_2_ID,
      });
      setSession(sessionRes.data.session);

      setTotalTimeElapsed(0);
      totalTimerRef.current = setInterval(
        () => setTotalTimeElapsed((p) => p + 1),
        1000
      );

      setQuestions(selectedQuestions);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    Object.values(audioRecordings).forEach((r) => {
      if (r.url) URL.revokeObjectURL(r.url);
    });
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    router.push("/compte/pratique/eo");
  };

  const onRefresh = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive")
      mediaRecorderRef.current.stop();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (consigneAudioRef.current) {
      consigneAudioRef.current.pause();
      consigneAudioRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    Object.values(audioRecordings).forEach((r) => {
      if (r.url) URL.revokeObjectURL(r.url);
    });
    setCurrentTache(1);
    setActiveRecordingTache(null);
    setIsPaused(false);
    setAnalyserNode(null);
    setConsigneListened({ 1: false, 2: false, 3: false });
    setConsignePlaying(null);
    setRecordingTimes({
      1: TACHE_TIME_LIMITS[1],
      2: TACHE_TIME_LIMITS[2],
      3: TACHE_TIME_LIMITS[3],
    });
    setAudioRecordings({
      1: { blob: null, url: null },
      2: { blob: null, url: null },
      3: { blob: null, url: null },
    });
    fetchPractice();
  };

  // ── Consigne ────────────────────────────────────────────────────────
  const playConsigne = async (tache: TacheType) => {
    if (consigneAudioRef.current) consigneAudioRef.current.pause();

    // Request mic access now (user gesture) so it's ready when consigne ends
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pendingStreamRef.current = stream;
    } catch {
      toast.error("Impossible d'accéder au microphone");
      return;
    }

    const audio = new Audio(CONSIGNE_AUDIO[tache]);
    consigneAudioRef.current = audio;
    audio.onended = () => {
      setConsignePlaying(null);
    };
    audio.play();
    setConsignePlaying(tache);
    setConsigneListened((p) => ({ ...p, [tache]: true }));
  };

  const stopConsigne = () => {
    if (consigneAudioRef.current) {
      consigneAudioRef.current.pause();
      consigneAudioRef.current = null;
    }
    setConsignePlaying(null);
  };

  // ── Recording ───────────────────────────────────────────────────────
  const startRecording = async (tacheNumber: TacheType) => {
    try {
      const stream =
        pendingStreamRef.current ||
        (await navigator.mediaDevices.getUserMedia({ audio: true }));
      pendingStreamRef.current = null;

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      setAnalyserNode(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (audioRecordings[tacheNumber].url)
          URL.revokeObjectURL(audioRecordings[tacheNumber].url!);
        setAudioRecordings((p) => ({
          ...p,
          [tacheNumber]: { blob, url },
        }));
        stream.getTracks().forEach((t) => t.stop());
        setActiveRecordingTache(null);
        setAnalyserNode(null);
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };

      mediaRecorder.start();
      setActiveRecordingTache(tacheNumber);
      setIsPaused(false);
      setRecordingTimes((p) => ({
        ...p,
        [tacheNumber]: TACHE_TIME_LIMITS[tacheNumber],
      }));

      timerIntervalRef.current = setInterval(() => {
        setRecordingTimes((prev) => {
          const next = prev[tacheNumber] - 1;
          if (next <= 0) {
            stopRecording();
            return { ...prev, [tacheNumber]: 0 };
          }
          return { ...prev, [tacheNumber]: next };
        });
      }, 1000);
    } catch {
      toast.error("Erreur lors du démarrage de l'enregistrement");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused" && activeRecordingTache) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      const tache = activeRecordingTache;
      timerIntervalRef.current = setInterval(() => {
        setRecordingTimes((prev) => {
          const next = prev[tache] - 1;
          if (next <= 0) {
            stopRecording();
            return { ...prev, [tache]: 0 };
          }
          return { ...prev, [tache]: next };
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    if (!session) {
      toast.error("Session introuvable. Veuillez recommencer.");
      return;
    }
    try {
      setIsSubmitting(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      await practiceSessionService.completeSession({
        sessionId: session._id,
        timeElapsedSeconds: totalTimeElapsed,
      });
      toast.success("Test soumis avec succès!");
      Object.values(audioRecordings).forEach((r) => {
        if (r.url) URL.revokeObjectURL(r.url);
      });
      router.push("/compte/pratique/eo");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la soumission"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────
  const getTimeRemaining = (tache: TacheType) => {
    if (activeRecordingTache === tache) return recordingTimes[tache];
    if (audioRecordings[tache].url) return 0;
    return TACHE_TIME_LIMITS[tache];
  };

  const isRecording = activeRecordingTache !== null;
  const allRecordingsComplete =
    audioRecordings[1].url && audioRecordings[2].url && audioRecordings[3].url;

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <PracticeLayout>
        <Header
          title="Expression orale"
          onClose={() => router.push("/compte/pratique/eo")}
        />
        <div className="flex items-center justify-center h-[60vh]">
          <Loading className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PracticeLayout>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <PracticeLayout>
      <Header title="Expression orale" onClose={onClose} onRefresh={onRefresh} />

      <div className="container mx-auto max-w-3xl p-4">
        {/* ── Tâche stepper ─────────────────────────────────────── */}
        <div className="flex justify-center items-center gap-3 mb-8">
          {([1, 2, 3] as TacheType[]).map((t, i) => (
            <div key={t} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    audioRecordings[t].url
                      ? "bg-green-500 text-white"
                      : currentTache === t
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {audioRecordings[t].url ? <Check className="h-4 w-4" /> : t}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentTache === t
                      ? "text-primary"
                      : audioRecordings[t].url
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  Tâche {t}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-8 h-0.5 ${
                    audioRecordings[t].url ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Tâche content ──────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Countdown */}
          <CountdownTimer timeRemaining={getTimeRemaining(currentTache)} />

          {/* Label */}
          <h2 className="text-lg font-semibold underline underline-offset-4">
            Tâche {currentTache}
          </h2>

          {/* Description (rich text) */}
          <div className="max-w-4xl">
            {currentTache === 1 ? (
              <p className="text-gray-700">Présentez-vous en 2 minutes.</p>
            ) : currentTache === 2 && questions[0] ? (
              <div className="prose prose-sm text-gray-700">
                <ReactMarkdown>{questions[0].text}</ReactMarkdown>
              </div>
            ) : currentTache === 3 && questions[1] ? (
              <div className="text-gray-700">
                <h4 className="font-semibold">Sujet : </h4>
                <div className="prose prose-sm inline text-2xl">
                  <ReactMarkdown>{questions[1].text}</ReactMarkdown>
                </div>
              </div>
            ) : null}
          </div>

          {/* Ecoutez la instruction */}
          {!audioRecordings[currentTache].url &&
            activeRecordingTache !== currentTache && (
              <Button
                icon={consignePlaying === currentTache ? "pause" : "play"}
                variant="secondary"
                onClick={() =>
                  consignePlaying === currentTache
                    ? stopConsigne()
                    : playConsigne(currentTache)
                }
              >
                {consignePlaying === currentTache
                  ? "Arrêter les instructions"
                  : "Ecoutez les instructions"}
              </Button>
            )}

          {/* Start recording button — visible after instruction listened, before recording */}
          {consigneListened[currentTache] &&
            !audioRecordings[currentTache].url &&
            activeRecordingTache !== currentTache && (
              <Button
                onClick={() => startRecording(currentTache)}
                className="bg-red-500 border-none"
                size="lg"
                icon="record"
              >
                Commencer l&apos;enregistrement
              </Button>
            )}

          {/* Recording section — visible during active recording */}
          {activeRecordingTache === currentTache &&
            !audioRecordings[currentTache].url && (
              <div className="space-y-4">
                <h3 className="text-lg text-gray-500">
                  Enregistrement en cours...
                </h3>

                <WaveformVisualizer
                  analyserNode={
                    activeRecordingTache === currentTache ? analyserNode : null
                  }
                  isActive={activeRecordingTache === currentTache && !isPaused}
                />

                <div className="flex items-center justify-center gap-3">
                  {isPaused ? (
                    <>
                      <Button
                        onClick={stopRecording}
                        className="bg-red-500 border-none"
                        size="lg"
                        icon="stop"
                      >
                         Arrêter
                      </Button>
                      <Button
                        onClick={resumeRecording}
                        className="bg-gray-500 border-none"
                        size="lg"
                        icon="record"
                      >
                         Reprendre
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={stopRecording}
                        className="bg-red-500 border-none"
                        size="lg"
                        icon="stop"
                      >
                        Arrêter
                      </Button>
                      <Button
                        onClick={pauseRecording}
                        className="bg-gray-500 border-none"
                        size="lg"
                        icon="pause"
                      >
                        Pause
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

          {/* Recording complete for this tâche (not all done yet) */}
          {audioRecordings[currentTache].url && !allRecordingsComplete && (
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">Enregistrement terminé</span>
              </div>

              {currentTache < 3 && (
                <p className="text-sm text-gray-600">
                  Passage à la tâche suivante...
                </p>
              )}
            </div>
          )}

          {/* All recordings complete — review & submit */}
          {allRecordingsComplete && (
            <div className="w-full max-w-md space-y-6">
              <div className="flex items-center gap-2 justify-center text-green-600">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">
                  Toutes les tâches sont terminées
                </span>
              </div>

              <div className="space-y-3">
                {([1, 2, 3] as TacheType[]).map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                  >
                    <span className="text-sm font-medium text-gray-700 shrink-0">
                      Tâche {t}
                    </span>
                    <audio
                      ref={(el) => {
                        reviewAudioRefs.current[t] = el;
                      }}
                      src={audioRecordings[t].url!}
                      controls
                      className="w-full h-8"
                      onPlay={() => {
                        ([1, 2, 3] as TacheType[]).forEach((other) => {
                          if (other !== t && reviewAudioRefs.current[other]) {
                            reviewAudioRefs.current[other]!.pause();
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loading className="mr-2 h-4 w-4 animate-spin" />
                    Soumission...
                  </>
                ) : (
                  "Terminer le test"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PracticeLayout>
  );
}
