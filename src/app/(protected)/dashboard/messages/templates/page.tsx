import { EmailTemplatesScreen } from "@/screens/dashboard/messages/templates";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Modèles d'e-mails",
  description: "Gérez les modèles d'e-mails pour la communication avec les utilisateurs PrêtPourTCF",
};

export default function EmailTemplatesPage() {
  return <EmailTemplatesScreen />;
}
