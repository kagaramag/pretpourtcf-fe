import type { Metadata } from "next";
import FreeWritingPracticePage from "@/screens/compte/essai-gratuit/ee";

export const metadata: Metadata = {
  title: "Essai gratuit — Expression écrite TCF | PrêtPourTCF",
  description: "Essayez gratuitement un exercice d'expression écrite du TCF Canada et Québec avec éditeur intégré, compteur de mots et chronomètre.",
};

export default function FreeEEServerPage() {
  return <FreeWritingPracticePage />;
}
