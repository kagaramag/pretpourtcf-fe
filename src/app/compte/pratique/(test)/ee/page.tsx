import type { Metadata } from "next";
import WritingPracticePage from "./ee-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Expression écrite",
  description: "Pratiquez l'expression écrite du TCF avec des sujets de rédaction et des corrections détaillées",
};

export default function EEServerPage() {
  return <WritingPracticePage />;
}
