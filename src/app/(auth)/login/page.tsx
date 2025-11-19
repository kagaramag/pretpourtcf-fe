import { LoginForm } from "@/screens/auth/login";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";

export const metadata: Metadata = {
  title: "Connexion | PRET POUR TCF",
  description: "Connectez-vous à l'application PRET POUR TCF",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
