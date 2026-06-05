import { Messages } from "@/screens/dashboard/messages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Messages",
  description:
    "Gérez les messages et la communication avec les utilisateurs PrêtPourTCF",
};

export default function MessagesPage() {
  return <Messages />;
}
