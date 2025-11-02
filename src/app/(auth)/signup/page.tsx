import { SignupForm } from "@/screens/auth/signup";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up | Pret Pour TCF",
  description: "Create your Pret Pour TCF account",
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
