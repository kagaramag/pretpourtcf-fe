import type { Metadata } from "next";
import FreeWritingPracticePage from "./ee-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit — Expression écrite",
  description: "Essayez gratuitement un exercice d'expression écrite TCF avec correction détaillée",
};

export default function FreeEEServerPage() {
  return <FreeWritingPracticePage />;
}
