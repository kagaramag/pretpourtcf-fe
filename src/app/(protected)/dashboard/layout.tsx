"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import DashboardLayout from "@/layouts/dashboard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth context to finish initializing (it handles token refresh)
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Redirect clients to account page
    if (user?.role === "client") {
      router.push("/compte");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
