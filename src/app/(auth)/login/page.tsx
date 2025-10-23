import { LoginForm } from "@/screens/auth/login";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";

export const metadata: Metadata = {
  title: "Connexion | Pret Pour TCF",
  description: "Connectez-vous à l'application Pret Pour TCF",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
