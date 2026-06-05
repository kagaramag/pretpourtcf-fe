import { ComposeMessage } from "@/screens/dashboard/messages/compose";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Composer un message",
  description:
    "Rédigez et envoyez un message aux utilisateurs de la plateforme PrêtPourTCF",
};

export default function ComposeMessagePage() {
  return <ComposeMessage />;
}
