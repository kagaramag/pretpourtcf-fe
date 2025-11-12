import ApprenantsScreen from "@/screens/trainer/apprenants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "apprenants | Pret Pour TCF",
  description: "Invitez vos amis à rejoindre la plateforme",
};

export default function ApprenantsPage() {
  return <ApprenantsScreen />;
}
