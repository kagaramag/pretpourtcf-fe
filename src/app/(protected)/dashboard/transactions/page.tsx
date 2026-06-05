import TransactionsScreen from "@/screens/dashboard/transactions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Transactions",
  description: "Consultez l'historique des paiements et transactions sur PrêtPourTCF",
};

export default function ProfilePage() {
  return <TransactionsScreen />;
}
