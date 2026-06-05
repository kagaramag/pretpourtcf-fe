import ReferralsScreen from "@/screens/compte/referrals/index";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Parrainages",
  description: "Gérez tous les parrainages et suivez les invitations sur PrêtPourTCF",
};

export default function AdminReferralsPage() {
  return <ReferralsScreen />;
}
