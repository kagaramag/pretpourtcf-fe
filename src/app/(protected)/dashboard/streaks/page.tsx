import { StreaksScreen } from "@/screens/streaks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaks | PRET POUR TCF",
  description: "Consultez l'historique des streaks PRET POUR TCF",
};

export default function StreaksPage() {
  return <StreaksScreen />;
}
