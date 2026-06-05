import type { Metadata } from "next";
import ListeningPracticePage from "./co-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Compréhension orale",
  description: "Entraînez-vous à la compréhension orale du TCF avec des exercices audio interactifs et des corrections détaillées",
};

export default function COServerPage() {
  return <ListeningPracticePage />;
}
