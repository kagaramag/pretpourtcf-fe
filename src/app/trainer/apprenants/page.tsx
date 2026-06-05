import ApprenantsScreen from "@/screens/trainer/apprenants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Apprenants",
  description: "Gérez vos apprenants et suivez leur progression dans la préparation au TCF",
};

export default function ApprenantsPage() {
  return <ApprenantsScreen />;
}
