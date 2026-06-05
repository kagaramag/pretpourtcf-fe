import type { Metadata } from "next";
import FreeListeningPracticePage from "./co-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit — Compréhension orale",
  description: "Essayez gratuitement un exercice de compréhension orale TCF avec audio et correction",
};

export default function FreeCOServerPage() {
  return <FreeListeningPracticePage />;
}
