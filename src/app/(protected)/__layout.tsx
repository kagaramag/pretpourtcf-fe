"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import MainLayout from "@/layouts/main";

export default function ProtectedLayout({
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

  // Redirect clients to account page
  useEffect(() => {
    if (user && user.role === "client") {
      router.push("/compte");
    }
  }, [user, router]);

  return <MainLayout>{children}</MainLayout>;
}
