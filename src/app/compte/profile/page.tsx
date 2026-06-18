import AccountLayout from "@/layouts/account";
import ProfileScreen from "@/screens/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil — Paramètres du compte | PrêtPourTCF",
  description: "Modifiez vos informations personnelles, gérez votre mot de passe et consultez les détails de votre abonnement PrêtPourTCF.",
};

export default function ProfilePage() {
  return (
    <AccountLayout>
      <ProfileScreen />
    </AccountLayout>
  );
}
