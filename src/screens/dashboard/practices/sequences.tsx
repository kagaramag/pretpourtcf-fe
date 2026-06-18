"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { Ellipsis, Loading, ArrowLeft } from "@/icons";
import {
  sequenceService,
  CreateSequenceData,
  UpdateSequenceData,
} from "@/services/sequence";
import { practiceService } from "@/services/practice";
import { questionService } from "@/services/question";
import {
  Sequence,
  Practice,
  PracticeQuestion,
  SequenceQuestion,
} from "@/types";
import { toast } from "sonner";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS } from "@/config/permissions";
import Link from "next/link";

// Fixed practice IDs for EO tâches
const EO_TACHE_2_PRACTICE_ID = "692c1d115778a7b3364f6fde";
const EO_TACHE_3_PRACTICE_ID = "692c1df65778a7b3364f7011";

// Helper to get question text from a populated sequence question
function getQuestionText(sq: SequenceQuestion): string {
  if (!sq.questionId) return "—";
  if (typeof sq.questionId === "string") return sq.questionId;
  return sq.questionId.text || "—";
}

// ─── Sequence Form Dialog ─────────────────────────────────────────────────────

interface SequenceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequence?: Sequence | null;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

function SequenceFormDialog({
  open,
  onOpenChange,
  sequence,
  mode,
  onSuccess,
}: SequenceFormDialogProps) {
  const [type, setType] = useState<"speaking" | "writing">("speaking");

  // Practices for EE (writing) — each tâche picks from writing practices
  const [writingPractices, setWritingPractices] = useState<Practice[]>([]);

  // Questions loaded per tâche
  const [tache1Questions, setTache1Questions] = useState<PracticeQuestion[]>([]);
  const [tache2Questions, setTache2Questions] = useState<PracticeQuestion[]>([]);
  const [tache3Questions, setTache3Questions] = useState<PracticeQuestion[]>([]);

  // Selected values
  const [tache1PracticeId, setTache1PracticeId] = useState("");
  const [tache2PracticeId, setTache2PracticeId] = useState("");
  const [tache3PracticeId, setTache3PracticeId] = useState("");
  const [tache1QuestionId, setTache1QuestionId] = useState("");
  const [tache2QuestionId, setTache2QuestionId] = useState("");
  const [tache3QuestionId, setTache3QuestionId] = useState("");

  const [isLoadingPractices, setIsLoadingPractices] = useState(false);

  // Question IDs already used in other sequences (to exclude from dropdowns)
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(
    new Set()
  );

  // Load practices and EO questions on open
  useEffect(() => {
    if (!open) return;
    loadInitialData();
  }, [open]);

  // Populate form in edit mode
  useEffect(() => {
    if (open && sequence && mode === "edit") {
      setType(sequence.type);

      for (const q of sequence.questions) {
        const qId =
          typeof q.questionId === "object" && q.questionId
            ? q.questionId._id
            : (q.questionId as string) || "";
        const pId =
          typeof q.practiceId === "object" && q.practiceId
            ? q.practiceId._id
            : (q.practiceId as string) || "";

        if (q.tache === 1) {
          setTache1PracticeId(pId);
          setTache1QuestionId(qId);
        } else if (q.tache === 2) {
          setTache2PracticeId(pId);
          setTache2QuestionId(qId);
        } else if (q.tache === 3) {
          setTache3PracticeId(pId);
          setTache3QuestionId(qId);
        }
      }
    } else if (!open) {
      resetForm();
    }
  }, [open, sequence, mode]);

  // For EO: auto-load questions from fixed practices when type is speaking
  useEffect(() => {
    if (type === "speaking") {
      setTache2PracticeId(EO_TACHE_2_PRACTICE_ID);
      setTache3PracticeId(EO_TACHE_3_PRACTICE_ID);
    }
  }, [type]);

  // Load questions when practice selection changes (for EE tâche selectors)
  useEffect(() => {
    if (tache1PracticeId) loadQuestions(tache1PracticeId, setTache1Questions);
    else setTache1Questions([]);
  }, [tache1PracticeId]);

  useEffect(() => {
    if (tache2PracticeId) loadQuestions(tache2PracticeId, setTache2Questions);
    else setTache2Questions([]);
  }, [tache2PracticeId]);

  useEffect(() => {
    if (tache3PracticeId) loadQuestions(tache3PracticeId, setTache3Questions);
    else setTache3Questions([]);
  }, [tache3PracticeId]);

  const loadInitialData = async () => {
    try {
      setIsLoadingPractices(true);
      const [writingRes, seqRes] = await Promise.all([
        practiceService.getAllPractices({ type: "writing", limit: 100 }),
        sequenceService.getAll({ limit: 100 }),
      ]);
      if (writingRes.data) setWritingPractices(writingRes.data.practices);

      // Build set of question IDs already used in other sequences
      if (seqRes.data) {
        const used = new Set<string>();
        const currentId = mode === "edit" && sequence ? sequence._id : null;
        for (const seq of seqRes.data.sequences) {
          if (seq._id === currentId) continue; // exclude current sequence in edit mode
          for (const q of seq.questions) {
            if (q.questionId) {
              const id =
                typeof q.questionId === "object"
                  ? q.questionId._id
                  : q.questionId;
              if (id) used.add(id);
            }
          }
        }
        setUsedQuestionIds(used);
      }
    } catch {
      toast.error("Failed to load practices");
    } finally {
      setIsLoadingPractices(false);
    }
  };

  const loadQuestions = async (
    practiceId: string,
    setter: (q: PracticeQuestion[]) => void
  ) => {
    try {
      const res = await questionService.getAllQuestions({
        examId: practiceId,
        limit: 1000,
        sort: "number",
      });
      if (res.data) setter(res.data.questions);
    } catch {
      toast.error("Failed to load questions");
    }
  };

  const resetForm = () => {
    setType("speaking");
    setTache1PracticeId("");
    setTache2PracticeId("");
    setTache3PracticeId("");
    setTache1QuestionId("");
    setTache2QuestionId("");
    setTache3QuestionId("");
    setTache1Questions([]);
    setTache2Questions([]);
    setTache3Questions([]);
  };

  // When type changes in create mode, reset question selections
  useEffect(() => {
    if (mode === "create") {
      setTache1PracticeId("");
      setTache1QuestionId("");
      setTache2QuestionId("");
      setTache3QuestionId("");
      if (type === "speaking") {
        setTache2PracticeId(EO_TACHE_2_PRACTICE_ID);
        setTache3PracticeId(EO_TACHE_3_PRACTICE_ID);
      } else {
        setTache2PracticeId("");
        setTache3PracticeId("");
      }
    }
  }, [type]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSequenceData) => sequenceService.create(data),
    onSuccess: () => {
      toast.success("Séquence créée avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de la création de la séquence"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: UpdateSequenceData }) =>
      sequenceService.update(data.id, data.data),
    onSuccess: () => {
      toast.success("Séquence mise à jour avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la mise à jour de la séquence"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "speaking") {
      if (!tache2QuestionId || !tache3QuestionId) {
        toast.error(
          "Veuillez sélectionner une question pour Tâche 2 et Tâche 3"
        );
        return;
      }
    } else {
      if (!tache1QuestionId || !tache2QuestionId || !tache3QuestionId) {
        toast.error("Veuillez sélectionner une question pour chaque tâche");
        return;
      }
    }

    const questions: CreateSequenceData["questions"] = [];

    if (type === "speaking") {
      questions.push({ tache: 1, questionId: null, practiceId: null });
      questions.push({
        tache: 2,
        questionId: tache2QuestionId,
        practiceId: EO_TACHE_2_PRACTICE_ID,
      });
      questions.push({
        tache: 3,
        questionId: tache3QuestionId,
        practiceId: EO_TACHE_3_PRACTICE_ID,
      });
    } else {
      questions.push({
        tache: 1,
        questionId: tache1QuestionId,
        practiceId: tache1PracticeId,
      });
      questions.push({
        tache: 2,
        questionId: tache2QuestionId,
        practiceId: tache2PracticeId,
      });
      questions.push({
        tache: 3,
        questionId: tache3QuestionId,
        practiceId: tache3PracticeId,
      });
    }

    if (mode === "create") {
      createMutation.mutate({ type, questions });
    } else if (sequence) {
      updateMutation.mutate({
        id: sequence._id,
        data: { questions },
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const makeWritingPracticeOptions = () =>
    writingPractices.map((p) => ({ value: p._id, label: p.title }));

  const makeQuestionOptions = (questions: PracticeQuestion[]) =>
    questions
      .filter((q) => !usedQuestionIds.has(q._id))
      .map((q) => ({
        value: q._id,
        label: `Q${q.number}: ${q.text.substring(0, 80)}${q.text.length > 80 ? "..." : ""}`,
      }));

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={
        mode === "create"
          ? "Créer une nouvelle séquence"
          : "Modifier la séquence"
      }
      size="lg"
    >
      {isLoadingPractices ? (
        <div className="flex items-center justify-center py-12">
          <Loading className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-2">
            {/* Type selector */}
            <div className="space-y-2">
              <Label>
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={type}
                onChange={(v) => setType(v as "speaking" | "writing")}
                options={[
                  { value: "speaking", label: "Expression Orale (EO)" },
                  { value: "writing", label: "Expression Écrite (EE)" },
                ]}
                placeholder="Sélectionner le type"
                disabled={mode === "edit"}
              />
            </div>

            {/* ── Speaking (EO) ── */}
            {type === "speaking" ? (
              <>
                {/* Tâche 1 — fixed */}
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700">
                    Tâche 1 — Présentation
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Toujours fixe : &quot;Présentez-vous en 2 minutes&quot;
                  </p>
                </div>

                {/* Tâche 2 — Sujet (fixed practice, pick question) */}
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-medium">Tâche 2 — Sujet</p>
                  <div className="space-y-2">
                    <Label className="text-xs">Question</Label>
                    <Select
                      value={tache2QuestionId}
                      onChange={setTache2QuestionId}
                      options={makeQuestionOptions(tache2Questions)}
                      placeholder="Sélectionner la question"
                    />
                  </div>
                </div>

                {/* Tâche 3 — Sujet de dissertation (fixed practice, pick question) */}
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-medium">
                    Tâche 3 — Sujet de dissertation
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs">Question</Label>
                    <Select
                      value={tache3QuestionId}
                      onChange={setTache3QuestionId}
                      options={makeQuestionOptions(tache3Questions)}
                      placeholder="Sélectionner la question"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── Writing (EE) — pick practice then question for each tâche ── */}
                {[1, 2, 3].map((tache) => {
                  const practiceId =
                    tache === 1
                      ? tache1PracticeId
                      : tache === 2
                        ? tache2PracticeId
                        : tache3PracticeId;
                  const setPracticeId =
                    tache === 1
                      ? setTache1PracticeId
                      : tache === 2
                        ? setTache2PracticeId
                        : setTache3PracticeId;
                  const questionId =
                    tache === 1
                      ? tache1QuestionId
                      : tache === 2
                        ? tache2QuestionId
                        : tache3QuestionId;
                  const setQuestionId =
                    tache === 1
                      ? setTache1QuestionId
                      : tache === 2
                        ? setTache2QuestionId
                        : setTache3QuestionId;
                  const questions =
                    tache === 1
                      ? tache1Questions
                      : tache === 2
                        ? tache2Questions
                        : tache3Questions;

                  return (
                    <div
                      key={tache}
                      className="space-y-3 rounded-lg border border-gray-200 p-4"
                    >
                      <p className="text-sm font-medium">Tâche {tache}</p>
                      <div className="space-y-2">
                        <Label className="text-xs">Practice</Label>
                        <Select
                          value={practiceId}
                          onChange={setPracticeId}
                          options={makeWritingPracticeOptions()}
                          placeholder="Sélectionner la pratique"
                        />
                      </div>
                      {practiceId && (
                        <div className="space-y-2">
                          <Label className="text-xs">Question</Label>
                          <Select
                            value={questionId}
                            onChange={setQuestionId}
                            options={makeQuestionOptions(questions)}
                            placeholder="Sélectionner la question"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loading className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Création..." : "Mise à jour..."}
                </>
              ) : mode === "create" ? (
                "Créer la séquence"
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Sequences Screen ─────────────────────────────────────────────────────────

function SequencesScreenContent() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const canCreate = hasPermission(PERMISSIONS.PRACTICES_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PRACTICES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRACTICES_DELETE);

  const [typeFilter, setTypeFilter] = useState<"speaking" | "writing" | "">(
    ""
  );
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(
    null
  );

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sequenceService.delete(id),
    onSuccess: () => {
      toast.success("Séquence supprimée avec succès");
      fetchSequences();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la suppression de la séquence"
      );
    },
  });

  useEffect(() => {
    fetchSequences();
  }, [pagination.page, typeFilter]);

  const fetchSequences = async () => {
    try {
      setIsLoading(true);
      const response = await sequenceService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        type: typeFilter || undefined,
        sort: "number",
      });

      if (response.data) {
        setSequences(response.data.sequences);
        setPagination(response.data.pagination);
      }
    } catch {
      toast.error("Échec du chargement des séquences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (seq: Sequence) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la Séquence ${seq.number} ? Les séquences restantes seront renumérotées.`
      )
    ) {
      deleteMutation.mutate(seq._id);
    }
  };

  const columns: Column<Sequence>[] = [
    {
      key: "number",
      header: "N°",
      width: "w-12",
      render: (seq) => (
        <span className="font-medium">#{seq.number}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "w-12",
      render: (seq) => (
        <Badge
          className={
            seq.type === "speaking"
              ? "bg-orange-100 text-orange-800"
              : "bg-purple-100 text-purple-800"
          }
        >
          {seq.type === "speaking" ? "EO" : "EE"}
        </Badge>
      ),
    },
    {
      key: "tache2",
      header: "Tâche 2",
      render: (seq) => {
        const t2 = seq.questions.find((q) => q.tache === 2);
        if (!t2) return "—";
        const text = getQuestionText(t2);
        return (
          <div
            className="text-sm text-gray-700 line-clamp-4 [&_*]:inline cursor-pointer hover:text-gray-900"
            dangerouslySetInnerHTML={{ __html: text }}
            onClick={() => {
              setPreviewTitle(`Séquence #${seq.number} — Tâche 2`);
              setPreviewHtml(text);
              setPreviewOpen(true);
            }}
          />
        );
      },
    },
    {
      key: "tache3",
      header: "Tâche 3",
      render: (seq) => {
        const t3 = seq.questions.find((q) => q.tache === 3);
        if (!t3) return "—";
        const text = getQuestionText(t3);
        return (
          <div
            className="text-sm text-gray-700 line-clamp-4 [&_*]:inline cursor-pointer hover:text-gray-900"
            dangerouslySetInnerHTML={{ __html: text }}
            onClick={() => {
              setPreviewTitle(`Séquence #${seq.number} — Tâche 3`);
              setPreviewHtml(text);
              setPreviewOpen(true);
            }}
          />
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "w-20",
      render: (seq) => (
        <Menu
          trigger={
            <Button variant="ghost" size="icon">
              <Ellipsis className="h-4 w-4" />
            </Button>
          }
          items={[
            ...(canUpdate
              ? [
                  {
                    type: "button" as const,
                    label: "Modifier",
                    onClick: () => {
                      setSelectedSequence(seq);
                      setFormMode("edit");
                      setFormOpen(true);
                    },
                    icon: "edit" as const,
                  },
                ]
              : []),
            ...(canDelete
              ? [
                  {
                    type: "button" as const,
                    label: "Supprimer",
                    onClick: () => handleDelete(seq),
                    icon: "dustbin" as const,
                    variant: "danger" as const,
                    disabled: deleteMutation.isPending,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/practices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl">Séquences</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={typeFilter}
          onChange={(v) =>
            setTypeFilter(v as "speaking" | "writing" | "")
          }
          options={[
            { value: "speaking", label: "Expression Orale (EO)" },
            { value: "writing", label: "Expression Écrite (EE)" },
          ]}
          placeholder="Tous les types"
          className="w-[220px]"
        />

        <div className="flex-1" />

        {canCreate && (
          <Button
            onClick={() => {
              setSelectedSequence(null);
              setFormMode("create");
              setFormOpen(true);
            }}
            icon="plus"
            iconOnly
          />
        )}
      </div>

      <Table
        data={sequences}
        columns={columns}
        keyExtractor={(s) => s._id}
        isLoading={isLoading}
        emptyMessage="Aucune séquence trouvée"
        striped
      />

      {/* Pagination */}
      {!isLoading && sequences.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Affichage de{" "}
            {(pagination.page - 1) * pagination.limit + 1} à{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}{" "}
            sur {pagination.total} séquences
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              disabled={!pagination.hasPrevPage}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              disabled={!pagination.hasNextPage}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Question Preview Modal */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={previewTitle}
        size="lg"
      >
        <div
          className="prose prose-sm max-w-none py-4"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>

      {/* Sequence Form Dialog */}
      <SequenceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        sequence={formMode === "edit" ? selectedSequence : undefined}
        onSuccess={fetchSequences}
      />
    </div>
  );
}

export function SequencesScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      }
    >
      <SequencesScreenContent />
    </Suspense>
  );
}
