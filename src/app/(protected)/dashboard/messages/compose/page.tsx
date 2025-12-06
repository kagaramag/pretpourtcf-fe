import { ComposeMessage } from "@/screens/dashboard/messages/compose";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modeles d'e-mails | PRET POUR TCF",
  description:
    "Gerez les modeles d'e-mails pour la communication avec les utilisateurs",
};

export default function ComposeMessagePage() {
  return <ComposeMessage />;
}
