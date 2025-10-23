import { SignupForm } from "@/screens/auth/signup";
import type { Metadata } from "next";
import AuthLayout from "@/layouts/auth";

export const metadata: Metadata = {
  title: "Sign Up | Pret Pour TCF",
  description: "Create your Pret Pour TCF account",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
