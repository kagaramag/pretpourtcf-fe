import type { Metadata } from "next";
import WritingPracticePage from "@/screens/compte/pratique/ee";

export const metadata: Metadata = {
  title: "Expression écrite — Exercices de rédaction TCF | PrêtPourTCF",
  description: "Entraînez-vous à l'expression écrite du TCF Canada et Québec : 3 tâches chronométrées avec éditeur intégré, compteur de mots et soumission en temps réel.",
};

export default function EEServerPage() {
  return <WritingPracticePage />;
}
