import type { Metadata } from "next";
import PlansPage from "@/screens/compte/subscribe";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Plans et tarifs",
  description: "Choisissez le plan qui vous convient pour accéder aux exercices de préparation au TCF Canada et TCF Québec",
};

export default function PlansServerPage() {
  return <PlansPage />;
}
