import { PlansScreen } from "@/screens/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans | Pret Pour TCF",
  description: "Gérez les plans d'abonnement Pret Pour TCF",
};

export default function PlansPage() {
  return <PlansScreen />;
}
