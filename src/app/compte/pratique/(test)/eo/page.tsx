import type { Metadata } from "next";
import SpeakingPracticePage from "./eo-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Expression orale",
  description: "Pratiquez l'expression orale du TCF avec des exercices guidés et des conseils pour améliorer votre score",
};

export default function EOServerPage() {
  return <SpeakingPracticePage />;
}
