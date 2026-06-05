import type { Metadata } from "next";
import AccountPage from "./account-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Mon compte",
  description: "Accédez à votre espace personnel PrêtPourTCF : exercices, séries, historique et abonnement",
};

export default function AccountServerPage() {
  return <AccountPage />;
}
