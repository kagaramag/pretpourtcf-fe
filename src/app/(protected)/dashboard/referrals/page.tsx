import ReferralsScreen from "@/screens/compte/referrals/index";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referrals | Admin Dashboard",
  description: "Manage all referrals",
};

export default function AdminReferralsPage() {
  return <ReferralsScreen />;
}
