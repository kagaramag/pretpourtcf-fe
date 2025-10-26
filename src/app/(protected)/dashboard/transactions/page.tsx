import TransactionsScreen from "@/screens/transactions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions | Pret Pour TCF",
  description: "Gérez vos paramètres de profil",
};

export default function ProfilePage() {
  return <TransactionsScreen />;
}
