"use client";

import { ReactNode } from "react";
import Header from "@/components/organisms/header";
import Footer from "@/components/organisms/footer";
import ProfileCard from "@/components/organisms/user-profile";
import { useActivityTracker } from "@/hooks/useActivityTracker";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  useActivityTracker();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProfileCard />
      <main className="max-w-5xl w-full mx-auto">
        <div className="lg:p-0 p-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
