import LoginActivityScreen from "@/screens/dashboard/logs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Activité de connexion",
  description: "Suivez les connexions et détectez le partage de comptes",
};

export default function LoginActivityPage() {
  return <LoginActivityScreen />;
}
