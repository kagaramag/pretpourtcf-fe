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
      <main className="flex-1 max-w-5xl w-full mx-auto sm:pt-4 sm:pb-20 px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 w-full lg:w-auto pb-12">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
