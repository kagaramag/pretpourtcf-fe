import AccountLayout from "@/layouts/account";
import ProfileScreen from "@/screens/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Mon Profil",
  description: "Gérez vos informations personnelles et paramètres de compte",
};

export default function ProfilePage() {
  return (
    <AccountLayout>
      <ProfileScreen />
    </AccountLayout>
  );
}
