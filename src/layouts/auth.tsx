"use client";

import { ReactNode } from "react";
import Header from "@/components/organisms/header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 min-h-screen flex items-center justify-center flex-col">
          <div className="w-full max-w-md mx-auto -mt-12">
            <div>{children}</div>
            <div className="mt-2">
              <p className="text-center text-xs text-muted-foreground">
                En vous connectant, vous acceptez nos Conditions d’utilisation<br />
                et notre Politique de confidentialité.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
