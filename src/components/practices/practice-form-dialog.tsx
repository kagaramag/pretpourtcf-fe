"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Practice" : "Edit Practice"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new TCF practice exam."
              : "Update practice exam information."}
          </DialogDescription>
        </DialogHeader>

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
                  onValueChange={(value: PracticeType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="listening">Listening</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="speaking">Speaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">CEFR Level</Label>
                <Select
                  value={formData.level || "none"}
                  onValueChange={(value: CEFRLevel | "none") =>
                    setFormData({ ...formData, level: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C2">C2</SelectItem>
                  </SelectContent>
                </Select>
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
                <p className="text-xs text-muted-foreground">
                  Make this practice available to students
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
                <p className="text-xs text-muted-foreground">
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

          <DialogFooter>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Practice"
              ) : (
                "Update Practice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
