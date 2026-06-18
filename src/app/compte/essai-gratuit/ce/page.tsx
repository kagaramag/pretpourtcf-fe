import type { Metadata } from "next";
import FreeReadingPracticePage from "@/screens/compte/essai-gratuit/ce";

export const metadata: Metadata = {
  title: "Essai gratuit — Compréhension écrite TCF | PrêtPourTCF",
  description: "Essayez gratuitement un exercice de compréhension écrite du TCF Canada et Québec avec textes, QCM chronométrés et correction détaillée.",
};

export default function FreeCEServerPage() {
  return <FreeReadingPracticePage />;
}
