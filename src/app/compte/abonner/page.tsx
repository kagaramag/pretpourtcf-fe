import type { Metadata } from "next";
import AbonnerPage from "@/screens/compte/abonner";

export const metadata: Metadata = {
  title: "S'abonner — Paiement sécurisé | PrêtPourTCF",
  description: "Finalisez votre abonnement PrêtPourTCF par carte bancaire, Mobile Money ou SPENN. Paiement sécurisé et accès immédiat aux exercices TCF.",
};

export default function AbonnerServerPage() {
  return <AbonnerPage />;
}
