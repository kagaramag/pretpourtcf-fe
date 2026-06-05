import type { Metadata } from "next";
import FreeReadingPracticePage from "./ce-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit — Compréhension écrite",
  description: "Essayez gratuitement un exercice de compréhension écrite TCF avec correction détaillée",
};

export default function FreeCEServerPage() {
  return <FreeReadingPracticePage />;
}
