import { PlansScreen } from "@/screens/plans";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans | PRET POUR TCF",
  description: "Gérez les plans d'abonnement PRET POUR TCF",
};

export default function PlansPage() {
  return <PlansScreen />;
}
