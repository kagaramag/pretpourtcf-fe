import type { Metadata } from "next";
import StreaksPage from "./series-client";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Mes Séries",
  description: "Gérez vos séries d'exercices TCF et gagnez des emblèmes en progressant chaque jour",
};

export default function SeriesServerPage() {
  return <StreaksPage />;
}
