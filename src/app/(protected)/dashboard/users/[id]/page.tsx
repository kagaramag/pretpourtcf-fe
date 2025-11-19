import type { Metadata } from "next";
import UserDetailsScreen from "@/screens/users/user-details";

export const metadata: Metadata = {
  title: "Détails utilisateur | PRET POUR TCF",
  description: "Consultez les détails de l'utilisateur",
};

export default function UserDetailsPage() {
  return <UserDetailsScreen />;
}
