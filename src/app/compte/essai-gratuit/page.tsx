import type { Metadata } from "next";
import PratiqueGratuitPage from "@/screens/compte/free-trial";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit",
  description: "Testez gratuitement la plateforme PrêtPourTCF avec des exercices de préparation au TCF sans engagement",
};

export default function EssaiGratuitServerPage() {
  return <PratiqueGratuitPage />;
}
