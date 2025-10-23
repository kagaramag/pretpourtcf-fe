import { UsersScreen } from "@/screens/users";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilisateurs | Pret Pour TCF",
  description: "Gérez les utilisateurs et agents Pret Pour TCF",
};

export default function UsersPage() {
  return <UsersScreen />;
}
