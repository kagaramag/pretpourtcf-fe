import { DashboardOverview } from "@/screens/dashboard/overview";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord | Pret Pour TCF",
  description: "Vue d'ensemble du tableau de bord Pret Pour TCF",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
