import SubscriptionScreen from "@/screens/dashboard/subscriptions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Abonnements",
  description: "Gérez les formules d'abonnement et l'accès aux fonctionnalités premium PrêtPourTCF",
};

export default function SubscriptionsPage() {
  return <SubscriptionScreen />;
}
