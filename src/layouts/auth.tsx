"use client";

import { ReactNode } from "react";
import Header from "@/components/organisms/header";
import Lottie from "lottie-react";
import Footer from "@/components/organisms/footer";
import happyUserAnimation from "@/assets/lotties/happy-user.json";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="mt-4 flex-1 overflow-auto p-4 sm:p-6 min-h-screen flex items-center justify-center flex-col">
          <div className="w-full max-w-6xl mx-auto flex flex-row -mt-8 sm:-mt-12 px-4 sm:px-0 lg:border-4 lg:border-primary lg:rounded-4xl overflow-hidden">
            <div className="flex-1 min-h-[600px] bg-primary flex items-end justify-center relative">
              <div className="-mb-4">
                <Lottie animationData={happyUserAnimation} loop={true} />
              </div>
            </div>
            <div className="w-xl border p-4 flex items-center justify-center flex-col">
              <div className="max-w-[420px] mx-auto">{children}</div>
              <div className="mt-2">
                <p className="text-center text-xs text-muted-foreground px-2">
                  En vous connectant, vous acceptez nos Conditions d'utilisation
                  <br className="hidden sm:block" />
                  <span className="sm:inline"> </span>et notre Politique de
                  confidentialité.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
