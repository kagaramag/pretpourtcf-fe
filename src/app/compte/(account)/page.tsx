import type { Metadata } from "next";
import AccountPage from "@/screens/compte/account";

export const metadata: Metadata = {
  title: "Mon compte — Espace pratique TCF | PrêtPourTCF",
  description: "Accédez à vos exercices de préparation au TCF Canada et TCF Québec : compréhension orale et écrite, expression orale et écrite, séries et suivi de progression.",
};

export default function AccountServerPage() {
  return <AccountPage />;
}
