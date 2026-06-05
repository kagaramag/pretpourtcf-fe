import { UsersScreen } from "@/screens/dashboard/users";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Utilisateurs",
  description: "Gérez les utilisateurs, rôles et accès sur la plateforme PrêtPourTCF",
};

export default function UsersPage() {
  return <UsersScreen />;
}
