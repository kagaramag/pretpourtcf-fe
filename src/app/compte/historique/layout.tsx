"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import AccountLayoutComponent from "@/layouts/account";

export default function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role === "admin" || user?.role === "super_admin") {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  return <AccountLayoutComponent>{children}</AccountLayoutComponent>;
}
