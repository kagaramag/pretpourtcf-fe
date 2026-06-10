"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/icons";
import {
  practiceService,
  CreatePracticeData,
  UpdatePracticeData,
} from "@/services/practice";
import { Practice, PracticeType, CEFRLevel } from "@/types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface PracticeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practice?: Practice | null;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function PracticeFormDialog({
  open,
  onOpenChange,
  practice,
  mode,
  onSuccess,
}: PracticeFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "listening" as PracticeType,
    level: "" as CEFRLevel | "",
    durationMinutes: 40,
    totalQuestions: 10,
    isActive: true,
    freemium: false,
  });

  const queryClient = useQueryClient();

  // Reset form when dialog opens/closes or practice changes
  useEffect(() => {
    if (open && practice && mode === "edit") {
      setFormData({
        title: practice.title,
        type: practice.type,
        level: practice.level || "",
        durationMinutes: practice.durationMinutes,
        totalQuestions: practice.totalQuestions,
        isActive: practice.isActive,
        freemium: practice.freemium,
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        title: "",
        type: "listening",
        level: "",
        durationMinutes: 40,
        totalQuestions: 10,
        isActive: true,
        freemium: false,
      });
    }
  }, [open, practice, mode]);

  // Create practice mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePracticeData) =>
      practiceService.createPractice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practices"] });
      toast.success("Practice created successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create practice");
    },
  });

  // Update practice mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: UpdatePracticeData }) =>
      practiceService.updatePractice(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["practices"] });
      toast.success("Practice updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update practice");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.durationMinutes < 1 || formData.durationMinutes > 300) {
      toast.error("Duration must be between 1 and 300 minutes");
      return;
    }

    if (formData.totalQuestions < 1 || formData.totalQuestions > 200) {
      toast.error("Total questions must be between 1 and 200");
      return;
    }

    const submitData = {
      title: formData.title,
      type: formData.type,
      level: formData.level || undefined,
      durationMinutes: formData.durationMinutes,
      totalQuestions: formData.totalQuestions,
      isActive: formData.isActive,
      freemium: formData.freemium,
    };

    if (mode === "create") {
      createMutation.mutate(submitData);
    } else if (practice) {
      updateMutation.mutate({
        id: practice._id,
        data: submitData,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={mode === "create" ? "Create New Practice" : "Edit Practice"}
      size="sm"
    >
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Create a new TCF practice exam."
            : "Update practice exam information."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Listening Practice 1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onChange={(value) =>
                    setFormData({ ...formData, type: value as PracticeType })
                  }
                  options={[
                    { value: "listening", label: "Listening" },
                    { value: "reading", label: "Reading" },
                    { value: "writing", label: "Writing" },
                    { value: "speaking", label: "Speaking" },
                  ]}
                  placeholder="Select type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">CEFR Level</Label>
                <Select
                  value={formData.level || "none"}
                  onChange={(value) =>
                    setFormData({ ...formData, level: value === "none" ? "" : value as CEFRLevel })
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "A1", label: "A1" },
                    { value: "A2", label: "A2" },
                    { value: "B1", label: "B1" },
                    { value: "B2", label: "B2" },
                    { value: "C1", label: "C1" },
                    { value: "C2", label: "C2" },
                  ]}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">
                  Duration (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      durationMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalQuestions">
                  Total Questions <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.totalQuestions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalQuestions: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-xs text-gray-500">
                  Make this practice available to learners
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="freemium">Freemium</Label>
                <p className="text-xs text-gray-500">
                  Allow free access to this practice
                </p>
              </div>
              <Switch
                id="freemium"
                checked={formData.freemium}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, freemium: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loading className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Practice"
              ) : (
                "Update Practice"
              )}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
