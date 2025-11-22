import { LoginForm } from "@/screens/auth/login";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion | PRET POUR TCF",
  description: "Connectez-vous à l'application PRET POUR TCF",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
