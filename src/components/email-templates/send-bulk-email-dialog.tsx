"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loading, Verified, Remove } from "@/icons";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailTemplateService, EmailTemplate } from "@/services/email-template";
import { userService } from "@/services/user";
import { User } from "@/types";

const formSchema = z.object({
  recipientIds: z
    .array(z.string())
    .min(1, "Veuillez sélectionner au moins un destinataire"),
});

type FormValues = z.infer<typeof formSchema>;

interface SendBulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
}

export function SendBulkEmailDialog({
  open,
  onOpenChange,
  template,
}: SendBulkEmailDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [sendResult, setSendResult] = useState<{
    successCount: number;
    failureCount: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
      setSendResult(null);
      form.reset({ recipientIds: [] });
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getAllUsers({
        status: "active",
        limit: 1000,
      });

      if (response.data) {
        const mappedUsers = response.data.users.map((user: any) => ({
          id: user._id || user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: user.status,
        }));
        setUsers(mappedUsers);
      }
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      toast.error("Échec du chargement des utilisateurs");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: (data: any) => emailTemplateService.sendBulkEmail(data),
    onSuccess: (response) => {
      setSendResult(response.data);
      toast.success(
        `E-mails envoyés: ${response.data.successCount} réussis, ${response.data.failureCount} échoués`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de l'envoi des e-mails"
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!template) return;

    sendMutation.mutate({
      templateId: template._id,
      recipientIds: values.recipientIds,
    });
  };

  const selectAll = () => {
    form.setValue(
      "recipientIds",
      users.map((u) => u.id)
    );
  };

  const deselectAll = () => {
    form.setValue("recipientIds", []);
  };

  const selectedCount = form.watch("recipientIds").length;

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Envoyer des e-mails en masse" size="lg">
        <p className="text-gray-600 text-sm mb-4">
          {template?.name} - Sélectionnez les destinataires
        </p>

        {sendResult ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Résultats de l&apos;envoi:</h3>
              <div className="space-y-1 text-sm">
                <p className="text-green-600 dark:text-green-400">
                  ✓ Réussis: {sendResult.successCount}
                </p>
                <p className="text-red-600 dark:text-red-400">
                  ✗ Échoués: {sendResult.failureCount}
                </p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {sendResult.results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded bg-muted/50"
                >
                  {result.success ? (
                    <Verified className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <Remove className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                  <span className="text-sm flex-1">{result.email}</span>
                  {result.error && (
                    <span className="text-xs text-gray-600">
                      {result.error}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Fermer</Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientIds"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>
                        Destinataires ({selectedCount} sélectionné{selectedCount > 1 ? "s" : ""})
                      </FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAll}
                        >
                          Tout sélectionner
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={deselectAll}
                        >
                          Tout désélectionner
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      Sélectionnez les utilisateurs qui recevront cet e-mail
                    </FormDescription>

                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loading className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto border rounded-lg p-4 space-y-3">
                        {users.map((user) => (
                          <FormField
                            key={user.id}
                            control={form.control}
                            name="recipientIds"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(user.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            user.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== user.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-0 leading-none flex-1">
                                  <FormLabel className="font-normal">
                                    {user.first_name} {user.last_name}
                                  </FormLabel>
                                  <FormDescription>{user.email}</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={sendMutation.isPending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={sendMutation.isPending}>
                  {sendMutation.isPending ? (
                    <>
                      <Loading className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    `Envoyer à ${selectedCount} utilisateur${selectedCount > 1 ? "s" : ""}`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
    </Modal>
  );
}
