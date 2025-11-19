import ApprenantsScreen from "@/screens/trainer/apprenants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "apprenants | PRET POUR TCF",
  description: "Invitez vos amis à rejoindre la plateforme",
};

export default function ApprenantsPage() {
  return <ApprenantsScreen />;
}
