import type { Metadata } from "next";
import SpeakingPracticePage from "@/screens/compte/pratique/eo";

export const metadata: Metadata = {
  title: "Expression orale — Entraînement oral TCF | PrêtPourTCF",
  description: "Préparez l'expression orale du TCF Canada et Québec : présentation, questions et dissertation avec enregistrement audio et gestion du temps.",
};

export default function EOServerPage() {
  return <SpeakingPracticePage />;
}
