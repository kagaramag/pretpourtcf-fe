"use client";

import { Badge } from "@/components/ui/badge";
import { Loading } from "@/icons";
import { config } from "@/config";
import ReactMarkdown from "react-markdown";

const categoryLabels: Record<string, string> = {
  listening: "Compréhension Orale",
  reading: "Compréhension Écrite",
  speaking: "Expression Orale",
  writing: "Expression Écrite",
};

interface SessionAnswer {
  questionId: string;
  questionNumber: number;
  selectedAnswer?: number;
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  question: {
    number: number;
    type: "mcq" | "short_answer" | "audio" | "essay";
    text: string;
    options?: string[];
    correct?: number;
    answer?: string;
    score: number;
    media?: { audio?: string; image?: string };
  } | null;
}

export interface SessionAnswersData {
  session: {
    id: string;
    practice: { id: string; title: string; type: string; level?: string };
    totalScore: number;
    maxPossibleScore: number;
    percentageScore: number;
    timeElapsedSeconds: number;
    completedAt: string;
  };
  answers: SessionAnswer[];
}

interface AnswersContentProps {
  loading: boolean;
  data: SessionAnswersData | null;
}

const getImageUrl = (filename?: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${config.cloudFlarePublicUrl}practices/images/${filename}`;
};

const getAudioUrl = (filename?: string) => {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${config.cloudFlarePublicUrl}practices/audio/${filename}`;
};

export default function AnswersContent({ loading, data }: AnswersContentProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Session summary */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 pb-3 border-b">
        <Badge variant="outline">
          {categoryLabels[data.session.practice.type] || data.session.practice.type}
        </Badge>
        {data.session.practice.level && (
          <Badge variant="outline">{data.session.practice.level}</Badge>
        )}
        <span>
          Score: {data.session.percentageScore.toFixed(0)}% (
          {data.session.totalScore}/{data.session.maxPossibleScore} pts)
        </span>
        <span>
          {data.answers.filter((a) => a.isCorrect).length}/
          {data.answers.length} correctes
        </span>
      </div>

      {/* Answers list */}
      <div className="space-y-3">
        {data.answers.map((answer, idx) => (
          <div
            key={answer.questionId || idx}
            className={`p-4 rounded-xl border ${
              answer.isCorrect
                ? "border-green-200 bg-green-50/50"
                : "border-red-200 bg-red-50/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h5 className="text-sm font-medium">
                Question {answer.questionNumber}
                {answer.question && (
                  <span className="ml-2 text-xs text-gray-600 font-normal uppercase">
                    {answer.question.type === "mcq" && "QCM"}
                    {answer.question.type === "essay" && "Rédaction"}
                    {answer.question.type === "short_answer" && "Réponse courte"}
                    {answer.question.type === "audio" && "Audio"}
                  </span>
                )}
              </h5>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-600">
                  {answer.pointsEarned}/{answer.question?.score ?? "?"} pts
                </span>
                <Badge
                  variant={answer.isCorrect ? "default" : "destructive"}
                  className="text-xs"
                >
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            </div>

            {answer.question && (
              <div className="text-sm mb-3"><ReactMarkdown>{answer.question.text}</ReactMarkdown></div>
            )}

            {/* Audio media */}
            {answer.question?.media?.audio && (
              <audio
                controls
                className="w-full mb-3 h-8"
                src={getAudioUrl(answer.question.media.audio)}
              />
            )}

            {/* Image media */}
            {answer.question?.media?.image && (
              <img
                src={getImageUrl(answer.question.media.image)}
                alt="Question media"
                className="max-h-40 rounded mb-3"
              />
            )}

            {/* MCQ answers */}
            {answer.question?.type === "mcq" && answer.question.options && (
              <div className="space-y-1">
                {answer.question.options.map((option, optIdx) => {
                  const isSelected = answer.selectedAnswer === optIdx;
                  const isCorrectOption = answer.question!.correct === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        isCorrectOption
                          ? "bg-green-100 text-green-800 font-medium"
                          : isSelected
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      <span className="mr-2 text-xs font-medium">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {option}
                      {isSelected && !isCorrectOption && (
                        <span className="ml-2 text-xs">
                          (choix de l&apos;apprenant)
                        </span>
                      )}
                      {isCorrectOption && (
                        <span className="ml-2 text-xs">(bonne réponse)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Text answers (essay, short_answer, audio) */}
            {answer.question?.type !== "mcq" && (
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-600">
                    Réponse de l&apos;apprenant :
                  </span>
                  <div className="mt-1 text-sm bg-white border rounded-lg p-3">
                    {answer.textAnswer ? (
                      <ReactMarkdown>{answer.textAnswer}</ReactMarkdown>
                    ) : (
                      <span className="italic text-gray-600">
                        Aucune réponse
                      </span>
                    )}
                  </div>
                </div>
                {answer.question?.answer && (
                  <div>
                    <span className="text-xs font-medium text-gray-600">
                      Réponse attendue :
                    </span>
                    <div className="mt-1 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                      <ReactMarkdown>{answer.question.answer}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
