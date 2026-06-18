import type { Metadata } from "next";
import FreeListeningPracticePage from "@/screens/compte/essai-gratuit/co";

export const metadata: Metadata = {
  title: "Essai gratuit — Compréhension orale TCF | PrêtPourTCF",
  description: "Essayez gratuitement un exercice de compréhension orale du TCF Canada et Québec avec audio, chronomètre et correction détaillée.",
};

export default function FreeCOServerPage() {
  return <FreeListeningPracticePage />;
}
