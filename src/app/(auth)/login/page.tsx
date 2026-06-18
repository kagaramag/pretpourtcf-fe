import { Login } from "@/screens/auth/login";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";
import { Suspense } from "react";
import { Loading } from "@/icons";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Connexion",
  description: "Connectez-vous à votre compte PrêtPourTCF pour accéder à vos exercices et suivre vos progrès TCF",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <Loading className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <Login />
      </Suspense>
    </AuthLayout>
  );
}
