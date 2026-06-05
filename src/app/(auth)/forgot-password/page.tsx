import ForgotPasswordScreen from "@/screens/auth/forgot-password";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Mot de passe oublié",
  description: "Demandez une réinitialisation de votre mot de passe PrêtPourTCF",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordScreen />
    </AuthLayout>
  );
}
