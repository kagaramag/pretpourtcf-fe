import ForgotPasswordScreen from "@/screens/auth/forgot-password";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Pret Pour TCF",
  description: "Demandez une réinitialisation de votre mot de passe",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
