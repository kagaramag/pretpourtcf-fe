"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import {
  Loading,
  Verified,
  Remove,
  Email,
  Close,
  Open,
  FileText,
} from "@/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailTemplateService, EmailTemplate } from "@/services/email-template";
import { userService } from "@/services/user";
import { User } from "@/types";

const formSchema = z.object({
  recipientIds: z
    .array(z.string())
    .min(1, "Please select at least one recipient"),
  templateId: z.string().min(1, "Please select an email template"),
});

type FormValues = z.infer<typeof formSchema>;

interface SendResult {
  successCount: number;
  failureCount: number;
  results: Array<{ email: string; success: boolean; error?: string }>;
}

export function ComposeMessage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientIds: [],
      templateId: "",
    },
  });

  // Fetch email templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      return await emailTemplateService.getAllTemplates();
    },
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

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
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: (data: any) => emailTemplateService.sendBulkEmail(data),
    onSuccess: (response) => {
      setSendResult(response);
      toast.success(
        `Emails sent: ${response.successCount} successful, ${response.failureCount} failed`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send emails");
    },
  });

  const onSubmit = (values: FormValues) => {
    sendMutation.mutate({
      templateId: values.templateId,
      recipientIds: values.recipientIds,
    });
  };

  const handleUserSelect = (userId: string) => {
    if (userId && !selectedUsers.find((u) => u.id === userId)) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        const newSelectedUsers = [...selectedUsers, user];
        setSelectedUsers(newSelectedUsers);
        form.setValue(
          "recipientIds",
          newSelectedUsers.map((u) => u.id)
        );
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(newSelectedUsers);
    form.setValue(
      "recipientIds",
      newSelectedUsers.map((u) => u.id)
    );
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplate(template || null);
    form.setValue("templateId", templateId);
  };

  const watchedTemplateId = form.watch("templateId");

  // Filter out already selected users from dropdown
  const availableUsers = users.filter(
    (user) => !selectedUsers.find((su) => su.id === user.id)
  );

  if (sendResult) {
    return (
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold">Compose Message</h1>
        </div>

        <Card className="space-y-4">
          <div className="space-y-2">
            <h5 className="flex items-center gap-2">
              <Verified className="h-5 w-5 text-green-600" />
              Email Sending Results
            </h5>
            <p className="text-sm text-muted-foreground">
              Summary of the email delivery status
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {sendResult.successCount}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Successfully Sent
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {sendResult.failureCount}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">
                Failed
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-semibold mb-2">Detailed Results</h4>
            {sendResult.results.map((result, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border"
              >
                {result.success ? (
                  <Verified className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <Remove className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <span className="text-sm flex-1 font-medium">
                  {result.email}
                </span>
                {result.error && (
                  <span className="text-xs text-muted-foreground">
                    {result.error}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSendResult(null);
                setSelectedUsers([]);
                form.reset();
              }}
            >
              Send Another Email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Compose Message</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" href="/dashboard/messages">
            Messages
          </Button>
          <Button variant="ghost" href="/dashboard/messages/templates">
            Templates
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          {/* Step 1: Select Users */}
          <Card className="space-y-2">
            <h5 className="font-semibold">Step 1: Recipients</h5>
            <FormField
              control={form.control}
              name="recipientIds"
              render={() => (
                <FormItem>
                  <FormLabel>Add Recipients</FormLabel>
                  <div className="space-y-3">
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loading className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <Select
                        onChange={handleUserSelect}
                        value=""
                        options={availableUsers
                          .filter((a) => a.role === "client")
                          .map((user) => ({
                            value: user.id,
                            label: `${user.first_name} ${user.last_name} (${user.email})`,
                          }))}
                        placeholder={
                          users.length === 0
                            ? "No users available"
                            : availableUsers.length === 0
                            ? "All users have been selected"
                            : "Select a user to add..."
                        }
                      />
                    )}

                    {/* Selected Users as Badges */}
                    {selectedUsers.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">
                          Selected Recipients ({selectedUsers.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map((user) => (
                            <Badge
                              key={user.id}
                              variant="tertiary"
                              className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-2"
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {user.first_name} {user.last_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 hover:bg-black/50"
                                onClick={() => handleRemoveUser(user.id)}
                              >
                                <Close className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {/* Step 2: Select Template */}
          <Card className="space-y-2">
            <h5 className="font-semibold">Step 2: Select template</h5>
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select
                    onChange={handleTemplateChange}
                    value={field.value}
                    options={templates
                      .filter((t) => t.isActive)
                      .map((template) => ({
                        value: template._id,
                        label: template.name,
                      }))}
                    placeholder={
                      isLoadingTemplates
                        ? "Loading..."
                        : templates.length === 0
                        ? "No templates available"
                        : "Select a template"
                    }
                    disabled={isLoadingTemplates}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTemplate && (
              <div className="mt-4 p-4 border border-border rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Preview</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate.description || "No description"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2"
                  >
                    <Open className="h-4 w-4" />
                    Preview Full Email
                  </Button>
                </div>
                <Separator />
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Subject:
                  </div>
                  <h3 className="font-semibold">{selectedTemplate.subject}</h3>
                </div>
                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Variables:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="tertiary"
                          className="text-xs"
                        >
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Step 3: Review and Send */}
          <Card className="space-y-2">
            <h5 className="font-semibold">Step 3: Review and Send</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Recipients
                </div>
                <div className="text-2xl font-bold">{selectedUsers.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedUsers.length === 1 ? "user" : "users"} selected
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Template
                </div>
                <div className="text-lg font-semibold truncate">
                  {selectedTemplate?.name || "Not selected"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedTemplate ? "Ready to send" : "Please select"}
                </div>
              </div>
            </div>

            {selectedUsers.length > 0 && watchedTemplateId && (
              <Alert>
                <Email className="h-4 w-4" />
                <AlertDescription>
                  You are about to send{" "}
                  <strong>{selectedTemplate?.name}</strong> to{" "}
                  <strong>{selectedUsers.length}</strong>{" "}
                  {selectedUsers.length === 1 ? "user" : "users"}.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedTemplate(null);
                  setSelectedUsers([]);
                }}
                disabled={sendMutation.isPending}
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant={"tertiary"}
                disabled={
                  sendMutation.isPending ||
                  selectedUsers.length === 0 ||
                  !watchedTemplateId
                }
                className="min-w-40"
              >
                {sendMutation.isPending ? <>Sending...</> : <>Send</>}
              </Button>
            </div>
          </Card>
        </form>
      </Form>

      {/* Email Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Email Preview" size="xl">
          <p className="text-muted-foreground text-sm mb-4">
            Preview of how the email will appear to recipients
          </p>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Subject
                  </div>
                  <div className="text-sm font-semibold">
                    {selectedTemplate.subject}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Email Body (HTML)</div>
                <div
                  className="min-h-[400px] border border-border"
                  dangerouslySetInnerHTML={{
                    __html: selectedTemplate.htmlContent,
                  }}
                />
              </div>
              {selectedTemplate.variables.length > 0 && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <div className="text-sm">
                      <strong>Note:</strong> Variables like{" "}
                      {selectedTemplate.variables
                        .map((v) => `{{${v}}}`)
                        .join(", ")}{" "}
                      will be replaced with actual user data when sent.
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
      </Modal>
    </div>
  );
}
