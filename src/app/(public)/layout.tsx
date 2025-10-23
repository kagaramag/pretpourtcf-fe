"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import PublicLayout from "@/layouts/public";

export default function PublicLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  return <PublicLayout>{children}</PublicLayout>;
}
