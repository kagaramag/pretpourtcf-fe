import AccountLayout from "@/layouts/account";
import { ReferralsScreen } from "@/screens/compte/referrals";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parrainages | Pret Pour TCF",
  description: "Invitez vos amis à rejoindre la plateforme",
};

export default function ReferralsPage() {
  return (
    <AccountLayout>
      <ReferralsScreen />
    </AccountLayout>
  );
}
