import { LoginForm } from "@/screens/auth/login";
import type { Metadata } from "next";
import Logo from '@/assets/images/logo.svg';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Connexion | Pret Pour TCF",
  description: "Connectez-vous à l'application Pret Pour TCF",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-5 my-3 w-[280px] mx-auto hidden lg:block">
              <Image src={Logo} width={280} height={140} priority alt="logo" className="w-[280px] mx-auto" />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
