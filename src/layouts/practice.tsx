"use client";

import { ReactNode } from "react";
import { useActivityTracker } from "@/hooks/useActivityTracker";

interface PracticeLayoutProps {
  children: ReactNode;
}

export default function PracticeLayout({ children }: PracticeLayoutProps) {
  useActivityTracker();

  return (
    <div className="relative">
      <div className="relative w-full h-auto">{children}</div>
    </div>
  );
}
