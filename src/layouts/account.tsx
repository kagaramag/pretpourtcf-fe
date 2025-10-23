"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/organisms/admin-sidebar";
import Header from "@/components/organisms/header";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="flex">
      <Header />
      <main className="max-w-5xl w-full mx-auto py-16">{children}</main>
    </div>
  );
}
