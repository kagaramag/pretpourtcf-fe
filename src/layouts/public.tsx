"use client";

import { ReactNode } from "react";
import Header from "@/components/organisms/header";
import Footer from "@/components/organisms/footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="w-full mx-auto pt-24">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
