import { DashboardOverview } from "@/screens/dashboard/overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Tableau de bord",
  description: "Vue d'ensemble des statistiques, utilisateurs et activités sur PrêtPourTCF",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
