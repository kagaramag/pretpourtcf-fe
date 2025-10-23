import { LoginForm } from "@/screens/auth/login";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Pret Pour TCF",
  description: "Connectez-vous à l'application Pret Pour TCF",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">
                A
              </span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">Pret Pour TCF</h1>
              <p className="text-sm text-muted-foreground">Backoffice</p>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
