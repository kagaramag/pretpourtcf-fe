import PromoCodesScreen from "@/screens/promo-codes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Codes Promo",
  description: "Gérez les codes promotionnels et les réductions pour les abonnements PrêtPourTCF",
};

export default function PromoCodesPage() {
  return <PromoCodesScreen />;
}
