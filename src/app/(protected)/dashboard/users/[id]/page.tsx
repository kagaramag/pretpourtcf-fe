import type { Metadata } from "next";
import UserDetailsScreen from "@/screens/dashboard/users/view";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Détails utilisateur",
  description: "Consultez les informations détaillées et l'activité d'un utilisateur PrêtPourTCF",
};

export default function UserDetailsPage() {
  return <UserDetailsScreen />;
}
