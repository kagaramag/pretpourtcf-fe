"use client";

import { ReactNode } from "react";
import Header from "@/components/organisms/header";
import Footer from "@/components/organisms/footer";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div>
      <Header />
      <main className="max-w-5xl w-full min-h-screen mx-auto py-12 sm:py-16 px-0 sm:px-6 lg:px-8">{children}</main>
      <Footer />
    </div>
  );
}
