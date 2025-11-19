import PromoCodesScreen from "@/screens/promo-codes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Codes Promo | PRET POUR TCF",
  description: "Gérer les codes promotionnels et les réductions",
};

export default function PromoCodesPage() {
  return <PromoCodesScreen />;
}
