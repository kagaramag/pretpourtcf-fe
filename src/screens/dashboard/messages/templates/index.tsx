"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/table";
import { Menu } from "@/components/ui/menu";
import {
  Plus,
  Ellipsis,
  Loading,
} from "@/icons";
import { emailTemplateService, EmailTemplate } from "@/services/email-template";
import { toast } from "sonner";
import { EmailTemplateFormDialog } from "@/components/email-templates/email-template-form-dialog";
import { EmailTemplatePreviewDialog } from "@/components/email-templates/email-template-preview-dialog";
import { SendBulkEmailDialog } from "@/components/email-templates/send-bulk-email-dialog";
import { formatDate } from "@/lib/date-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function EmailTemplatesScreen() {
  const queryClient = useQueryClient();

  // Dialogs
  const [formDialog, setFormDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [sendBulkDialog, setSendBulkDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Modèle supprimé avec succès");
      setDeleteDialog(false);
      setTemplateToDelete(null);
      fetchTemplates();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de la suppression du modèle"
      );
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      emailTemplateService.updateTemplate(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Statut du modèle mis à jour");
      fetchTemplates();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la mise à jour du statut du modèle"
      );
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const templates = await emailTemplateService.getAllTemplates();
      console.log("::##::", templates);
      setTemplates(templates);
    } catch (error: any) {
      console.error("Failed to fetch templates:", error);
      toast.error("Échec du chargement des modèles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setFormMode("create");
    setSelectedTemplate(null);
    setFormDialog(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormMode("edit");
    setSelectedTemplate(template);
    setFormDialog(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewDialog(true);
  };

  const handleSendBulk = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSendBulkDialog(true);
  };

  const handleDelete = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
    }
  };

  const handleToggleStatus = (template: EmailTemplate) => {
    toggleStatusMutation.mutate({
      id: template._id,
      isActive: !template.isActive,
    });
  };

  const columns: Column<EmailTemplate>[] = [
    {
      key: "name",
      header: "Nom",
      render: (template) => <span>{template.name}</span>,
    },
    {
      key: "subject",
      header: "Sujet",
      render: (template) => (
        <span className="max-w-[200px] truncate block">{template.subject}</span>
      ),
    },
    {
      key: "variables",
      header: "Variables",
      render: (template) =>
        template.variables.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 1).map((variable) => (
              <Badge key={variable} variant="outline">
                {variable}
              </Badge>
            ))}
            {template.variables.length > 2 && (
              <Badge variant="outline">
                +{template.variables.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-600 text-sm">Aucune</span>
        ),
    },
    {
      key: "isActive",
      header: "Statut",
      render: (template) => (
        <Badge variant={template.isActive ? "default" : "secondary"}>
          {template.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdBy",
      header: "Créé par",
      render: (template) => (
        <div className="text-sm">
          <div className="font-medium">
            {template.createdBy.first_name} {template.createdBy.last_name}
          </div>
          <div className="text-gray-600">
            {template.createdBy.email}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date de création",
      render: (template) => <span>{formatDate(template.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (template) => (
        <div className="text-right">
          <Menu
            trigger={
              <Button variant="ghost" size="icon">
                <Ellipsis className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                type: "button",
                label: "Preview",
                onClick: () => handlePreview(template),
                icon: "open",
              },
              {
                type: "button",
                label: "Change",
                onClick: () => handleEdit(template),
                icon: "edit",
              },
              {
                type: "button",
                label: template.isActive ? "Deactivate" : "Activate",
                onClick: () => handleToggleStatus(template),
                icon: template.isActive ? "stop" : "validate",
              },
              {
                type: "button",
                label: "Send a message",
                onClick: () => handleSendBulk(template),
                icon: "email",
              },
              {
                type: "button",
                label: "Delete",
                onClick: () => handleDelete(template._id),
                icon: "dustbin",
                variant: "danger",
              },
            ]}
          />
        </div>
      ),
    },
  ];

  console.log("##", templates);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email templates</h1>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      {/* Table */}
      <div>
        <Table
          data={templates}
          columns={columns}
          keyExtractor={(t) => t._id}
          isLoading={isLoading}
          emptyMessage="Aucun modèle trouvé"
        />
      </div>

      {/* Dialogs */}
      <EmailTemplateFormDialog
        open={formDialog}
        onOpenChange={setFormDialog}
        mode={formMode}
        template={selectedTemplate}
        onSuccess={fetchTemplates}
      />

      <EmailTemplatePreviewDialog
        open={previewDialog}
        onOpenChange={setPreviewDialog}
        template={selectedTemplate}
      />

      <SendBulkEmailDialog
        open={sendBulkDialog}
        onOpenChange={setSendBulkDialog}
        template={selectedTemplate}
      />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera
              définitivement ce modèle d&apos;e-mail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loading className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
