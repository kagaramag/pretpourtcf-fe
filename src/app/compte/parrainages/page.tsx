import AccountLayout from "@/layouts/account";
import { ReferralsScreen } from "@/screens/compte/referrals";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Parrainages",
  description: "Parrainez vos proches et invitez-les à préparer le TCF sur PrêtPourTCF",
};

export default function ReferralsPage() {
  return (
    <AccountLayout>
      <ReferralsScreen />
    </AccountLayout>
  );
}
