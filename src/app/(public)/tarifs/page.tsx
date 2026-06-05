import type { Metadata } from "next";
import TarifsPage from "./tarifs-client";

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: "PrêtPourTCF | Tarifs et abonnements",
  description: "Découvrez nos formules de préparation au TCF Canada et TCF Québec. Choisissez le plan qui vous convient pour accéder aux exercices et formations.",
};

export default function TarifsServerPage() {
  return <TarifsPage />;
}
