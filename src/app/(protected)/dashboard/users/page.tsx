import { UsersScreen } from "@/screens/dashboard/users";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilisateurs | PRET POUR TCF",
  description: "Gérez les utilisateurs et agents PRET POUR TCF",
};

export default function UsersPage() {
  return <UsersScreen />;
}
