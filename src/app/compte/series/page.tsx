import type { Metadata } from "next";
import StreaksPage from "@/screens/compte/series";

export const metadata: Metadata = {
  title: "Mes séries — Défi 7 jours TCF | PrêtPourTCF",
  description: "Relevez le défi des séries TCF : complétez 20 exercices en 7 jours avec 90% de score, gagnez des emblèmes et maintenez votre flamme quotidienne.",
};

export default function SeriesServerPage() {
  return <StreaksPage />;
}
