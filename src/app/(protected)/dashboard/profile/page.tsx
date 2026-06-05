import ProfileScreen from "@/screens/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Profil",
  description: "Gérez vos informations personnelles et paramètres de profil PrêtPourTCF",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
