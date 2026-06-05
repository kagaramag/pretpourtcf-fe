import { StreaksScreen } from "@/screens/streaks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Séries",
  description: "Consultez l'historique des séries et la progression des utilisateurs sur PrêtPourTCF",
};

export default function StreaksPage() {
  return <StreaksScreen />;
}
