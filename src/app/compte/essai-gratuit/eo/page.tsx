import type { Metadata } from "next";
import FreeSpeakingPracticePage from "./eo-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit — Expression orale",
  description: "Essayez gratuitement un exercice d'expression orale TCF avec des conseils pour améliorer votre score",
};

export default function FreeEOServerPage() {
  return <FreeSpeakingPracticePage />;
}
