"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Edit,
  Loader2,
  Trash2,
  BookOpen,
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
      toast.error(
        error.response?.data?.message || "Failed to delete question"
      );
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
    <div className="space-y-6">
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
          <p className="text-muted-foreground mt-1">
            Practice exam details and questions
          </p>
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
        <CardHeader>
          <CardTitle>Practice Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge className={getTypeColor(practice.type)}>
                {practice.type.charAt(0).toUpperCase() +
                  practice.type.slice(1)}
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
                <span className="font-medium">{practice.durationMinutes} min</span>
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
              <p className="text-sm text-muted-foreground">Created</p>
              <span className="text-sm font-medium">
                {formatDate(practice.createdAt)}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Actual Questions
              </p>
              <span className="text-sm font-medium">{pagination.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({pagination.total})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingQuestions ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Loading questions...
                    </p>
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
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
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell className="font-medium">
                      {question.number}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
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
                    </TableCell>
                    <TableCell>{question.score} pts</TableCell>
                    <TableCell>
                      {question.difficulty ? (
                        <Badge className={getLevelColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
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
                              href={question.media.image}
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
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {canUpdate && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedQuestion(question);
                                setFormMode("edit");
                                setQuestionFormDialog(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Question
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteQuestion(question)}
                                disabled={deleteQuestionMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Question
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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
        </CardContent>
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
