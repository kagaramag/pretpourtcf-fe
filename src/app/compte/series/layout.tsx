import { Metadata } from "next";
import AccountLayout from "@/layouts/account";

export const metadata: Metadata = {
  title: "Mes Séries | TCF",
  description: "Gérez vos séries d'exercices et gagnez des récompenses",
};

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayout>{children}</AccountLayout>;
}
