import type { Metadata } from "next";
import PlansPage from "@/screens/compte/subscribe";

export const metadata: Metadata = {
  title: "Plans et tarifs — Abonnement préparation TCF | PrêtPourTCF",
  description: "Comparez nos formules de préparation au TCF Canada et TCF Québec. Accès illimité aux exercices de compréhension orale, écrite, expression orale et écrite.",
};

export default function PlansServerPage() {
  return <PlansPage />;
}
