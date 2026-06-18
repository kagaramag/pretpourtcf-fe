import type { Metadata } from "next";
import ListeningPracticePage from "@/screens/compte/pratique/co";

export const metadata: Metadata = {
  title: "Compréhension orale — Exercices d'écoute TCF | PrêtPourTCF",
  description: "Entraînez-vous à la compréhension orale du TCF Canada et Québec avec des simulations audio chronométrées, corrections détaillées et score sur 699 points.",
};

export default function COServerPage() {
  return <ListeningPracticePage />;
}
