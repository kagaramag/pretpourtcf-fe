import type { Metadata } from "next";
import FreeSpeakingPracticePage from "@/screens/compte/essai-gratuit/eo";

export const metadata: Metadata = {
  title: "Essai gratuit — Expression orale TCF | PrêtPourTCF",
  description: "Essayez gratuitement un exercice d'expression orale du TCF Canada et Québec avec sujets aléatoires, enregistrement audio et gestion du temps.",
};

export default function FreeEOServerPage() {
  return <FreeSpeakingPracticePage />;
}
