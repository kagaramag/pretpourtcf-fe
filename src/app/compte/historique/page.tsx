import type { Metadata } from "next";
import PracticeHistoryPage from "./historique-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Historique",
  description: "Consultez votre historique de pratiques et suivez votre progression dans la préparation au TCF",
};

export default function HistoriqueServerPage() {
  return <PracticeHistoryPage />;
}
