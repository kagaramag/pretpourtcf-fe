import AccountLayout from "@/layouts/account";
import { ReferralsScreen } from "@/screens/compte/referrals";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parrainages — Invitez vos proches | PrêtPourTCF",
  description: "Parrainez vos amis et proches pour la préparation au TCF. Envoyez des invitations et suivez vos parrainages acceptés sur PrêtPourTCF.",
};

export default function ReferralsPage() {
  return (
    <AccountLayout>
      <ReferralsScreen />
    </AccountLayout>
  );
}
