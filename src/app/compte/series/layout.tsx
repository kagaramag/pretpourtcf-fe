import { Metadata } from "next";
import AccountLayout from "@/layouts/account";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Mes Séries",
  description: "Gérez vos séries d'exercices TCF et gagnez des emblèmes en progressant",
};

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayout>{children}</AccountLayout>;
}
