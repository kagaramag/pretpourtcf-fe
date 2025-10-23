"use client";

import type React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionProvider>{children}</PermissionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
