"use client";

import { ReactNode } from "react";

interface PracticeLayoutProps {
  children: ReactNode;
}

export default function PracticeLayout({ children }: PracticeLayoutProps) {
  return (
    <div className="relative">
      <div className="relative w-full h-auto">{children}</div>
    </div>
  );
}
