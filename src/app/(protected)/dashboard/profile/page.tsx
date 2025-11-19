import ProfileScreen from "@/screens/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil | PRET POUR TCF",
  description: "Gérez vos paramètres de profil",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
