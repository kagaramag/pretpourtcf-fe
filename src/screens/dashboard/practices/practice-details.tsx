"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Loader2,
  Clock,
  FileQuestion,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import { Practice, PracticeQuestion } from "@/types";
import { toast } from "sonner";
import { QuestionFormDialog } from "@/components/practices/question-form-dialog";
import { formatDate } from "@/lib/date-utils";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS } from "@/config/permissions";
import { config } from "@/config";
import AudioPlayer from "@/components/organisms/player";

function PracticeDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const practiceId = params?.id as string;
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(PERMISSIONS.PRACTICES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PRACTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRACTICES_DELETE);

  const [practice, setPractice] = useState<Practice | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Dialogs
  const [questionFormDialog, setQuestionFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedQuestion, setSelectedQuestion] =
    useState<PracticeQuestion | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewQuestion, setPreviewQuestion] =
    useState<PracticeQuestion | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    if (practiceId) {
      fetchPractice();
      fetchQuestions();
    }
  }, [practiceId, pagination.page]);

  const fetchPractice = async () => {
    try {
      setIsLoadingPractice(true);
      const response = await practiceService.getPracticeById(practiceId);
      if (response.data) {
        setPractice(response.data.practice);
      }
    } catch (error: any) {
      console.error("Failed to fetch practice:", error);
      toast.error("Failed to load practice details");
      router.push("/dashboard/practices");
    } finally {
      setIsLoadingPractice(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await questionService.getAllQuestions({
        examId: practiceId,
        page: pagination.page,
        limit: pagination.limit,
        sort: "number",
      });

      if (response.data) {
        setQuestions(response.data.questions);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to fetch questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => questionService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted successfully");
      fetchQuestions();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete question");
    },
  });

  const handleDeleteQuestion = (question: PracticeQuestion) => {
    if (
      window.confirm(
        `Are you sure you want to delete Question #${question.number}?`
      )
    ) {
      deleteQuestionMutation.mutate(question._id);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      listening: "bg-blue-100 text-blue-800",
      reading: "bg-green-100 text-green-800",
      writing: "bg-purple-100 text-purple-800",
      speaking: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || colors.listening;
  };

  const getLevelColor = (level?: string) => {
    if (!level) return "bg-gray-100 text-gray-800";
    const colors = {
      A1: "bg-emerald-100 text-emerald-800",
      A2: "bg-teal-100 text-teal-800",
      B1: "bg-blue-100 text-blue-800",
      B2: "bg-indigo-100 text-indigo-800",
      C1: "bg-purple-100 text-purple-800",
      C2: "bg-pink-100 text-pink-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getQuestionTypeLabel = (type: string) => {
    const labels = {
      mcq: "Multiple Choice",
      short_answer: "Short Answer",
      audio: "Audio Response",
      essay: "Essay",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const columns: Column<PracticeQuestion>[] = [
    {
      key: "number",
      header: "No.",
      render: (question) => <span>{question.number}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (question) => (
        <Badge variant="outline">
          {getQuestionTypeLabel(question.type)}
        </Badge>
      ),
    },
    {
      key: "text",
      header: "Question",
      width: "max-w-[220px]",
      render: (question) => (
        <div>
          <p className="truncate">{question.text}</p>
          {question.tags && question.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {question.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "score",
      header: "Score",
      render: (question) => <span>{question.score} pts</span>,
    },
    {
      key: "difficulty",
      header: "Difficulty",
      render: (question) =>
        question.difficulty ? (
          <Badge className={getLevelColor(question.difficulty)}>
            {question.difficulty}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        ),
    },
    {
      key: "media",
      header: "Media",
      render: (question) => (
        <div className="flex gap-2">
          {question.media?.audio && (
            <div className="flex items-center gap-1">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <a
                href={question.media.audio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Play
              </a>
            </div>
          )}
          {question.media?.image && (
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-green-600" />
              <a
                href={`${config.cloudFlarePublicUrl}${question.media.image}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View
              </a>
            </div>
          )}
          {!question.media?.audio && !question.media?.image && (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (question) => (
        <div className="text-right flex items-center justify-end gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => {
                setPreviewQuestion(question);
                setPreviewDialog(true);
              }}
            >
              Preview
            </Button>
          </div>
          <Menu
            trigger={
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              ...(canUpdate
                ? [
                    {
                      type: "button" as const,
                      label: "Edit Question",
                      onClick: () => {
                        setSelectedQuestion(question);
                        setFormMode("edit");
                        setQuestionFormDialog(true);
                      },
                      icon: "edit" as const,
                    },
                  ]
                : []),
              ...(canDelete
                ? [
                    {
                      type: "button" as const,
                      label: "Delete Question",
                      onClick: () => handleDeleteQuestion(question),
                      icon: "dustbin" as const,
                      variant: "danger" as const,
                      disabled: deleteQuestionMutation.isPending,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  if (isLoadingPractice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Practice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/practices")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{practice.title}</h1>
        </div>
        {canCreate && (
          <Button
            className="gap-2"
            onClick={() => {
              setSelectedQuestion(null);
              setFormMode("create");
              setQuestionFormDialog(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        )}
      </div>

      {/* Practice Info Card */}
      <Card>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge className={getTypeColor(practice.type)}>
                {practice.type.charAt(0).toUpperCase() + practice.type.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              {practice.level ? (
                <Badge className={getLevelColor(practice.level)}>
                  {practice.level}
                </Badge>
              ) : (
                <span className="text-sm">N/A</span>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {practice.durationMinutes} min
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <div className="flex items-center gap-1">
                <FileQuestion className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{practice.totalQuestions}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                className={
                  practice.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {practice.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actual Questions</p>
              <span className="text-sm font-medium">{pagination.total}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      <Card>
        <div>
          <Table
            data={questions}
            columns={columns}
            keyExtractor={(q) => q._id}
            isLoading={isLoadingQuestions}
            emptyMessage="No questions yet"
            emptyComponent={
              <div className="text-center py-8 text-muted-foreground">
                <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No questions yet</p>
                {canCreate && (
                  <Button
                    variant="link"
                    onClick={() => {
                      setSelectedQuestion(null);
                      setFormMode("create");
                      setQuestionFormDialog(true);
                    }}
                  >
                    Add your first question
                  </Button>
                )}
              </div>
            }
          />

          {/* Pagination */}
          {!isLoadingQuestions && questions.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} questions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Question Form Dialog */}
      <QuestionFormDialog
        open={questionFormDialog}
        onOpenChange={setQuestionFormDialog}
        mode={formMode}
        question={formMode === "edit" ? selectedQuestion : undefined}
        examId={practiceId}
        practice={practice}
        onSuccess={fetchQuestions}
      />

      {/* Question Preview Modal */}
      <Modal isOpen={previewDialog} onClose={() => setPreviewDialog(false)} title="Question Preview" size="lg">
          {previewQuestion && (
            <div className="space-y-4">
              {/* Question Number and Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">#{previewQuestion.number}</Badge>
                  <Badge variant="outline">
                    {getQuestionTypeLabel(previewQuestion.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Score: {previewQuestion.score} pts
                  </span>
                </div>
                {previewQuestion.difficulty && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      <span className="text-sm text-muted-foreground mb-1">
                        Difficulty
                      </span>{" "}
                      <Badge
                        className={getLevelColor(previewQuestion.difficulty)}
                      >
                        {previewQuestion.difficulty}
                      </Badge>
                    </span>
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div>
                <div className="text-sm text-muted-foreground">Question</div>
                {previewQuestion?.text && (
                  <div>
                    <ReactMarkdown>{previewQuestion.text}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Media */}
              {(previewQuestion.media?.audio ||
                previewQuestion.media?.image) && (
                <div>
                  <div className="space-y-2">
                    {previewQuestion.media.image && (
                      <div>
                        <img
                          src={`${config.cloudFlarePublicUrl}practices/images/${previewQuestion.media.image}`}
                          alt="Question media"
                          className="w-full rounded-md"
                        />
                      </div>
                    )}
                    {previewQuestion.media.audio && (
                      <div className="flex items-center">
                        <AudioPlayer
                          src={`${config.cloudFlarePublicUrl}practices/audio/${previewQuestion.media.audio}`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Options (for MCQ) */}
              {previewQuestion.type === "mcq" &&
                previewQuestion.options &&
                previewQuestion.options.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Options</p>
                    <div className="space-y-2">
                      {previewQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-md ${
                            previewQuestion.correct === index
                              ? "bg-green-50 border-green-300"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span>{option}</span>
                            {previewQuestion.correct === index && (
                              <Badge className="ml-auto bg-green-600">
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Tags */}
              {previewQuestion.tags && previewQuestion.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {previewQuestion.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {formatDate(previewQuestion.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(previewQuestion.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </Modal>
    </div>
  );
}

export function PracticeDetailsScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PracticeDetailsContent />
    </Suspense>
  );
}
