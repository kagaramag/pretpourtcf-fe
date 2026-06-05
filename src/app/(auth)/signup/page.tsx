import { SignupForm } from "@/screens/auth/signup";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "PrêtPourTCF | Inscription",
  description: "Créez votre compte PrêtPourTCF et commencez votre préparation au TCF Canada ou TCF Québec dès maintenant",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
