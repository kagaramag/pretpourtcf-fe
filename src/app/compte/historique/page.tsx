import type { Metadata } from "next";
import PracticeHistoryPage from "@/screens/compte/historique";

export const metadata: Metadata = {
  title: "Historique des pratiques — Suivi de progression TCF | PrêtPourTCF",
  description: "Consultez vos résultats, scores et temps de chaque session de pratique TCF. Suivez votre progression et identifiez vos points à améliorer.",
};

export default function HistoriqueServerPage() {
  return <PracticeHistoryPage />;
}
