"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import AccountLayoutComponent from "@/layouts/account";

export default function AccountLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!hasFetched.current) {
      hasFetched.current = true;
      refreshUser().catch((error) => {
        console.error("Failed to fetch user profile:", error);
      });
    }
  }, [router, refreshUser]);

  // Redirect admins and super_admins to dashboard
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return <AccountLayoutComponent>{children}</AccountLayoutComponent>;
}
