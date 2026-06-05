import type { Metadata } from "next";
import CorporateView from "@/screens/dashboard/corporates/view";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Détails de l'entreprise",
  description: "Consultez les informations détaillées et les utilisateurs d'une entité corporate",
};

export default function CorporateDetailsPage() {
  return <CorporateView />;
}
