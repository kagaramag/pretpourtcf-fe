import type { Metadata } from "next";
import ReadingPracticePage from "@/screens/compte/pratique/ce";

export const metadata: Metadata = {
  title: "Compréhension écrite — Exercices de lecture TCF | PrêtPourTCF",
  description: "Pratiquez la compréhension écrite du TCF Canada et Québec avec des textes et QCM chronométrés, corrections détaillées et score sur 699 points.",
};

export default function CEServerPage() {
  return <ReadingPracticePage />;
}
