"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { emailTemplateService, EmailTemplate } from "@/services/email-template";
import { toast } from "sonner";

interface EmailTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
}

export function EmailTemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: EmailTemplatePreviewDialogProps) {
  const [preview, setPreview] = useState<{
    subject: string;
    htmlContent: string;
    textContent: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (template && open) {
      fetchPreview();
    }
  }, [template, open]);

  const fetchPreview = async () => {
    if (!template) return;

    try {
      setIsLoading(true);
      const preview = await emailTemplateService.previewTemplate(template._id);
      setPreview(preview);
    } catch (error: any) {
      console.error("Failed to fetch preview:", error);
      toast.error("Échec du chargement de la prévisualisation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation du modèle</DialogTitle>
          <DialogDescription>
            {template?.name} - Aperçu avec des données d&apos;exemple
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Sujet:</h3>
              <p className="text-sm bg-muted p-3 rounded">{preview.subject}</p>
            </div>

            <Tabs defaultValue="html">
              <TabsList>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="text">Texte</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="mt-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div
                    dangerouslySetInnerHTML={{ __html: preview.htmlContent }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="text" className="mt-4">
                <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                  {preview.textContent}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune prévisualisation disponible
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
