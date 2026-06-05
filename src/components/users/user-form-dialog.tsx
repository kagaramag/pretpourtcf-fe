"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/ui/phone-input";
import { Loader2, Copy, Check } from "lucide-react";
import { userService, CreateUserData, UpdateUserData } from "@/services/user";
import { User } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  mode,
  onSuccess,
}: UserFormDialogProps) {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "client" as "admin" | "client" | "trainer",
  });
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // Determine if current user is admin (not super_admin)
  const isCurrentUserAdmin = currentUser?.role === "admin";

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && user && mode === "edit") {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        role:
          user.role === "super_admin"
            ? "admin"
            : (user.role as "admin" | "client" | "trainer"),
      });
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "client",
      });
      setTempPassword("");
      setCopied(false);
    }
  }, [open, user, mode]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (response.data?.temp_password) {
        setTempPassword(response.data.temp_password);
        toast.success(
          "User created successfully! Please save the temporary password."
        );
      } else {
        toast.success("User created successfully");
        handleClose();
        onSuccess?.();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: UpdateUserData }) =>
      userService.updateUser(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      handleClose();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (mode === "create") {
      createMutation.mutate({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      });
    } else if (user) {
      updateMutation.mutate({
        id: user.id,
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        },
      });
    }
  };

  const handleClose = () => {
    if (tempPassword) {
      // Don't close if there's a temp password that hasn't been copied/acknowledged
      return;
    }
    onOpenChange(false);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordAcknowledged = () => {
    setTempPassword("");
    setCopied(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Show password display if temp password exists
  if (tempPassword) {
    return (
      <Modal
        isOpen={open}
        onClose={() => {}}
        title="User Created Successfully!"
        size="sm"
        footer={
          <Button onClick={handlePasswordAcknowledged}>
            I've Saved the Password
          </Button>
        }
      >
        <p className="text-muted-foreground text-sm mb-4">
          Please save this temporary password. It will not be shown again.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Temporary Password</Label>
            <div className="flex gap-2">
              <Input value={tempPassword} readOnly className="font-mono" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              The user will be required to change this password on first
              login.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={mode === "create" ? "Register new user" : "Edit user"}
      size="sm"
    >
      <p className="text-muted-foreground text-sm mb-4">
        {mode === "create"
          ? "Create a new user account. A temporary password will be generated."
          : "Update user information."}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onChange={(value) =>
                  setFormData({ ...formData, role: value as "admin" | "client" | "trainer" })
                }
                options={[
                  ...(!isCurrentUserAdmin ? [{ value: "admin", label: "Admin" }] : []),
                  { value: "trainer", label: "Trainer" },
                  { value: "client", label: "Client" },
                ]}
                placeholder="Select role"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone
            </Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) =>
                setFormData({ ...formData, phone: value || "" })
              }
              placeholder="+250 123 456 789 (optional)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
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
              "Create User"
            ) : (
              "Update User"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
