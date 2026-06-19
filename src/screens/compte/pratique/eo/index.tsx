"use client";

import { useEffect, useState } from "react";
import AccountLayout from "@/layouts/account";
import Link from "next/link";
import MethodEO from "./methodology";
import { practiceService } from "@/services/practice";
import { sequenceService } from "@/services/sequence";
import { PracticeQuestion, PracticeWithQuestions, Sequence } from "@/types";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Icon, type IconName } from "@/icons";
import { PracticeTask } from "@/components/molecules/practice-task";
import { PRACTICE_CATEGORIES } from "@/components/molecules/practice-category";

const category = PRACTICE_CATEGORIES.find((c) => c.slug === "eo")!;
import { useActivityTracker } from "@/hooks/useActivityTracker";

type TrainingMode = "serie" | "tache";

const TRAINING_MODES: Array<{
  id: TrainingMode;
  label: string;
  description: string;
  icon: IconName;
  color: string;
  activeClasses: string;
  hoverClasses: string;
}> = [
  {
    id: "serie",
    label: "Groupé par série",
    description:
      "Pratiquez les 3 tâches dans l'ordre, comme le jour de l'examen.",
    icon: "list",
    color: "purple",
    activeClasses: "border-2 border-purple-200 bg-purple-50/30",
    hoverClasses: "border-2 border-gray-200 hover:shadow-md hover:border-purple-200",
  },
  {
    id: "tache",
    label: "Groupé par tâche",
    description:
      "Entraînez-vous sur une tâche spécifique (1, 2 ou 3) séparément.",
    icon: "listView",
    color: "blue",
    activeClasses: "border-2 border-blue-200 bg-blue-50/30",
    hoverClasses: "border-2 border-gray-200 hover:shadow-md hover:border-blue-200",
  },
];

const ICON_BG: Record<string, string> = {
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
};

export default function SpeakingPracticePage() {
  const [practicesData, setPracticesData] = useState<PracticeWithQuestions[]>(
    []
  );
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const { trackClick } = useActivityTracker();
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<TrainingMode>("serie");
  const [expandedPractices, setExpandedPractices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [practicesRes, sequencesRes] = await Promise.all([
        practiceService.getSpeakingPracticeQuestions(),
        sequenceService.getByType("speaking"),
      ]);
      setPracticesData(practicesRes.data.practices);
      setSequences(sequencesRes.data.sequences);
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
            <p className="text-gray-600">Chargement...</p>
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
          <h1 className="lg:text-2xl text-xl">Expression Orale</h1>
          <div className="text-sm text-gray-600">
            Choisissez un exercice d&apos;expression orale pour pratiquer votre
            expression et prononciation
          </div>
        </div>
        <MethodEO />
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            Choisissez votre mode d&apos;entraînement
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TRAINING_MODES.map((mode) => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`relative text-left rounded-2xl px-4 py-3.5 cursor-pointer transition-all ${
                    isActive ? mode.activeClasses : mode.hoverClasses
                  }`}
                >
                  {isActive && mode.id === "serie" && (
                    <span className="absolute -top-3 left-4 bg-purple-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ICON_BG[mode.color]}`}
                    >
                      <Icon name={mode.icon} size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-gray-900">
                        {mode.label}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Random test card (link, not a tab) */}
            <Link
              href="/compte/pratique/eo/test-aleatoire"
              onClick={() =>
                trackClick({
                  action: "link_clicked",
                  label: "Paid: EO Practice — Random Test",
                })
              }
              className="group"
            >
              <div className="relative border-2 border-gray-200 rounded-2xl px-4 py-3.5  transition-all hover:shadow-md hover:border-tertiary">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary/20 text-tertiary">
                    <Icon name="refresh" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900">
                      Test aléatoire
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Un sujet tiré au sort parmi les thèmes disponibles.
                      Conditions réelles.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Tab content: Groupé par série */}
          {activeMode === "serie" && (
            <>
              {sequences.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Séries disponibles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {sequences.map((seq) => (
                      <PracticeTask
                        key={seq._id}
                        category={category}
                        practice={{
                          _id: seq._id,
                          title: `Série ${seq.number}`,
                          type: "speaking",
                          durationMinutes: 0,
                          totalQuestions: seq.questions.length,
                          isActive: seq.isActive,
                          freemium: false,
                          createdAt: seq.createdAt,
                          updatedAt: seq.updatedAt,
                        }}
                        href={`/compte/pratique/eo/test/${seq.number}`}
                        onClick={() =>
                          trackClick({
                            action: "link_clicked",
                            label: `Paid: EO Practice — Séquence ${seq.number}`,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-6">
                  Aucune séquence disponible pour le moment.
                </p>
              )}
            </>
          )}

          {/* Tab content: Grouper par tâche */}
          {activeMode === "tache" && (
            <div className="mt-6">
              {(() => {
                const TASK_INFO: Record<
                  number,
                  { title: string; description: string; duration: string }
                > = {
                  1: {
                    title: "Présentation",
                    description:
                      "Présentez-vous et parlez de votre environnement quotidien.",
                    duration: "2 minutes",
                  },
                  2: {
                    title: "Poser des questions",
                    description:
                      "Posez des questions à partir d'un document pour obtenir des informations.",
                    duration: "5 minutes 30 secondes",
                  },
                  3: {
                    title: "Exprimer son opinion",
                    description:
                      "Donnez votre point de vue sur un sujet de société.",
                    duration: "4 minutes 30 secondes",
                  },
                };

                // Group questions from all sequences by tache
                const groupedByTache: Record<
                  number,
                  Array<{
                    sequenceNumber: number;
                    question: PracticeQuestion;
                  }>
                > = {};

                sequences.forEach((seq) => {
                  seq.questions.forEach((sq) => {
                    if (
                      sq.questionId &&
                      typeof sq.questionId === "object" &&
                      "_id" in sq.questionId
                    ) {
                      if (!groupedByTache[sq.tache]) {
                        groupedByTache[sq.tache] = [];
                      }
                      groupedByTache[sq.tache].push({
                        sequenceNumber: seq.number,
                        question: sq.questionId as PracticeQuestion,
                      });
                    }
                  });
                });

                const tacheNumbers = Object.keys(TASK_INFO)
                  .map(Number)
                  .sort();

                return (
                  <div className="space-y-5">
                    {tacheNumbers.map((tache) => {
                      const info = TASK_INFO[tache];
                      const items = groupedByTache[tache] || [];
                      return (
                        <div key={tache}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-sm font-bold">
                              {tache}
                            </span>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {info.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {info.duration}
                              </p>
                            </div>
                          </div>
                          {tache === 1 ? (
                            <p className="ml-11 text-sm text-gray-600">
                              Présentez-vous en 2 minutes.
                            </p>
                          ) : items.length > 0 ? (
                            <ul className="ml-11 space-y-1.5">
                              {items.map((item, idx) => (
                                <li
                                  key={item.question._id || idx}
                                  className="text-sm text-gray-700 flex items-start gap-2"
                                >
                                  <span className="text-gray-400 mt-0.5 shrink-0">
                                    •
                                  </span>
                                  <span>
                                    <ReactMarkdown>
                                      {item.question.text}
                                    </ReactMarkdown>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="ml-11 text-sm text-gray-400 italic">
                              Aucun sujet disponible
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Display Speaking Practices with Questions */}
        {/* <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Pratiques disponibles</h2>

          {filteredPractices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-600 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune pratique disponible
              </h3>
              <p className="text-gray-600">
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
        </div> */}

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
