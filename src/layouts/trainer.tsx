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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useActivityTracker();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ProfileCard />

      <main className="flex-1 max-w-5xl w-full mx-auto sm:py-4 px-4 sm:px-6 lg:px-0">
        <div className="flex-1 w-full lg:w-auto">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
