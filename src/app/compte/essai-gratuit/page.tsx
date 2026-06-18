import type { Metadata } from "next";
import PratiqueGratuitPage from "@/screens/compte/free-trial";

export const metadata: Metadata = {
  title: "Essai gratuit — Exercices TCF offerts | PrêtPourTCF",
  description: "Testez gratuitement PrêtPourTCF : exercices de compréhension orale, écrite, expression orale et écrite pour le TCF Canada et Québec, sans engagement.",
};

export default function EssaiGratuitServerPage() {
  return <PratiqueGratuitPage />;
}
