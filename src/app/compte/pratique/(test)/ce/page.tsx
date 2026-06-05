import type { Metadata } from "next";
import ReadingPracticePage from "./ce-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Compréhension écrite",
  description: "Entraînez-vous à la compréhension écrite du TCF avec des exercices de lecture et des corrections détaillées",
};

export default function CEServerPage() {
  return <ReadingPracticePage />;
}
