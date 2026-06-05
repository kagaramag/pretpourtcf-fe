import ResetPasswordScreen from "@/screens/auth/reset-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Réinitialiser le mot de passe",
  description: "Réinitialisez votre mot de passe PrêtPourTCF pour retrouver l'accès à votre compte",
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
