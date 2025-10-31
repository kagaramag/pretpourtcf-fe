import { StreaksScreen } from "@/screens/streaks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Streaks | Pret Pour TCF",
  description: "Consultez l'historique des streaks Pret Pour TCF",
};

export default function StreaksPage() {
  return <StreaksScreen />;
}
