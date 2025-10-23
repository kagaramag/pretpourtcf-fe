import ResetPasswordScreen from "@/screens/auth/reset-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | Pret Pour TCF",
  description: "Réinitialisez votre mot de passe",
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
