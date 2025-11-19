import ResetPasswordScreen from "@/screens/auth/reset-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | PRET POUR TCF",
  description: "Réinitialisez votre mot de passe",
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
