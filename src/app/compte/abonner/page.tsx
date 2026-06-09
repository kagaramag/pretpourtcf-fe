import type { Metadata } from "next";
import AbonnerPage from "./index";

export const metadata: Metadata = {
  title: "PrêtPourTCF | S'abonner",
  description: "Souscrivez à un abonnement PrêtPourTCF pour accéder à tous les exercices de préparation au TCF",
};

export default function AbonnerServerPage() {
  return <AbonnerPage />;
}
