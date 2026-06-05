"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { corporateService } from "@/services/corporate";
import { Corporate } from "@/types";
import { toast } from "sonner";

interface CorporateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corporate?: Corporate | null;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function CorporateFormDialog({
  open,
  onOpenChange,
  corporate,
  mode,
  onSuccess,
}: CorporateFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    phone: "",
    maxTrainers: 0,
    maxLearners: 0,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && corporate && mode === "edit") {
      setFormData({
        name: corporate.name,
        location: corporate.location,
        email: corporate.email || "",
        phone: corporate.phone || "",
        maxTrainers: corporate.maxTrainers || 0,
        maxLearners: corporate.maxLearners || 0,
      });
    } else if (!open) {
      setFormData({
        name: "",
        location: "",
        email: "",
        phone: "",
        maxTrainers: 0,
        maxLearners: 0,
      });
    }
  }, [open, corporate, mode]);

  const createMutation = useMutation({
    mutationFn: corporateService.createCorporate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporates"] });
      toast.success("Corporate created successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create corporate"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      corporateService.updateCorporate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporates"] });
      toast.success("Corporate updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update corporate"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      maxTrainers: formData.maxTrainers,
      maxLearners: formData.maxLearners,
    };

    if (mode === "create") {
      createMutation.mutate(payload);
    } else if (corporate) {
      updateMutation.mutate({ id: corporate._id, data: payload });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={mode === "create" ? "Create Corporate" : "Edit Corporate"}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter corporate name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="Enter location"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+250..."
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxTrainers">Max Trainers</Label>
            <Input
              id="maxTrainers"
              type="number"
              min={0}
              placeholder="0 = unlimited"
              value={formData.maxTrainers}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxTrainers: parseInt(e.target.value) || 0,
                }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxLearners">Max Learners</Label>
            <Input
              id="maxLearners"
              type="number"
              min={0}
              placeholder="0 = unlimited"
              value={formData.maxLearners}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxLearners: parseInt(e.target.value) || 0,
                }))
              }
              disabled={isLoading}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
