import { DashboardOverview } from "@/screens/dashboard/overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord | PRET POUR TCF",
  description: "Vue d'ensemble du tableau de bord PRET POUR TCF",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
