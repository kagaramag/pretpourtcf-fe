import { Messages } from "@/screens/dashboard/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modeles d'e-mails | PRET POUR TCF",
  description:
    "Gerez les modeles d'e-mails pour la communication avec les utilisateurs",
};

export default function MessagesPage() {
  return <Messages />;
}
