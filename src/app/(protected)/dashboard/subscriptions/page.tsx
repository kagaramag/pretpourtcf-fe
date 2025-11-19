import SubscriptionScreen from "@/screens/subscriptions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions | PRET POUR TCF",
  description: "Manage your subscription plans and access to premium features",
};

export default function SubscriptionsPage() {
  return <SubscriptionScreen />;
}
