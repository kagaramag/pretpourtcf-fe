"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  emailTemplateService,
  EmailTemplate,
} from "@/services/email-template";

const formSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  htmlContent: z
    .string()
    .min(10, "Le contenu HTML doit contenir au moins 10 caractères"),
  textContent: z
    .string()
    .min(10, "Le contenu texte doit contenir au moins 10 caractères"),
  variables: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EmailTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  template?: EmailTemplate | null;
  onSuccess?: () => void;
}

export function EmailTemplateFormDialog({
  open,
  onOpenChange,
  mode,
  template,
  onSuccess,
}: EmailTemplateFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      htmlContent: "",
      textContent: "",
      variables: "",
      description: "",
      isActive: true,
    },
  });

  // Reset form when template changes
  useEffect(() => {
    if (template && mode === "edit") {
      form.reset({
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables.join(", "),
        description: template.description || "",
        isActive: template.isActive,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        subject: "",
        htmlContent: "",
        textContent: "",
        variables: "",
        description: "",
        isActive: true,
      });
    }
  }, [template, mode, open]);

  const createMutation = useMutation({
    mutationFn: (data: any) => emailTemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Modèle créé avec succès");
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de la création du modèle"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      emailTemplateService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Modèle mis à jour avec succès");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de la mise à jour du modèle"
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    const data = {
      ...values,
      variables: values.variables
        ? values.variables
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
        : [],
    };

    if (mode === "create") {
      createMutation.mutate(data);
    } else if (template) {
      updateMutation.mutate({ id: template._id, data });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={mode === "create" ? "Créer un nouveau modèle" : "Modifier le modèle"}
      size="lg"
    >
        <p className="text-muted-foreground text-sm mb-4">
          {mode === "create"
            ? "Créez un nouveau modèle d'e-mail pour la communication avec les utilisateurs"
            : "Modifiez ce modèle d'e-mail"}
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du modèle</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Message de bienvenue"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet de l&apos;e-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bienvenue sur PrêtPourTCF"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="htmlContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu HTML</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="<html>...</html>"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Utilisez des variables comme {"{"}{"{"} first_name {"}"}{"}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="textContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu texte</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Version texte de l'e-mail..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Version texte brut pour les clients qui ne supportent pas
                    le HTML
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variables</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="first_name, last_name, email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Variables séparées par des virgules
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du modèle..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Modèle actif</FormLabel>
                    <FormDescription>
                      Seuls les modèles actifs peuvent être utilisés pour
                      envoyer des e-mails
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loading className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "create" ? "Création..." : "Mise à jour..."}
                  </>
                ) : mode === "create" ? (
                  "Créer le modèle"
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </form>
        </Form>
    </Modal>
  );
}
