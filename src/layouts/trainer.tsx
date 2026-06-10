"use client";

import { ReactNode, useState } from "react";
import { SidebarOpen } from "@/icons";
import Header from "@/components/organisms/header";
import Footer from "@/components/organisms/footer";
import ProfileCard from "@/components/organisms/user-profile";
import { useActivityTracker } from "@/hooks/useActivityTracker";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function TrainerLayout({ children }: AccountLayoutProps) {
  useActivityTracker();

  return (
    <div className="min-h-screen">
      <Header />
      <ProfileCard />

      <main className="max-w-5xl w-full mx-auto pt-4 pb-8">
        <div className="lg:p-0 p-4">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
