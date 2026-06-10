"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabPanel } from "@/components/molecules/Tabs";
import { Loading } from "@/icons";
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
  const [activePreviewTab, setActivePreviewTab] = useState("html");

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
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Prévisualisation du modèle" size="xl">
        <p className="text-muted-foreground text-sm mb-4">
          {template?.name} - Aperçu avec des données d&apos;exemple
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading className="h-8 w-8 animate-spin" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Sujet:</h3>
              <p className="text-sm bg-muted p-3 rounded">{preview.subject}</p>
            </div>

            <Tabs
              tabs={[
                { id: "html", label: "HTML" },
                { id: "text", label: "Texte" },
              ]}
              activeTab={activePreviewTab}
              onTabChange={setActivePreviewTab}
            />
            <TabPanel id="html" activeTab={activePreviewTab} className="mt-4">
              <div className="border rounded-lg p-4 bg-white">
                <div
                  dangerouslySetInnerHTML={{ __html: preview.htmlContent }}
                />
              </div>
            </TabPanel>
            <TabPanel id="text" activeTab={activePreviewTab} className="mt-4">
              <pre className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                {preview.textContent}
              </pre>
            </TabPanel>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune prévisualisation disponible
            </p>
          </div>
        )}
    </Modal>
  );
}
