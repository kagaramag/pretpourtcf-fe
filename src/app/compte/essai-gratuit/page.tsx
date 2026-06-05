import type { Metadata } from "next";
import PratiqueGratuitPage from "./essai-gratuit-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Essai gratuit",
  description: "Testez gratuitement la plateforme PrêtPourTCF avec des exercices de préparation au TCF sans engagement",
};

export default function EssaiGratuitServerPage() {
  return <PratiqueGratuitPage />;
}
