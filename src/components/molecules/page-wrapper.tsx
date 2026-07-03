"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/icons";
import { Button } from "../ui/button";

interface PageWrapperProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  showBack?: boolean;
}

function PageWrapper({
  title,
  actions,
  children,
  description,
  showBack,
}: PageWrapperProps) {
  const router = useRouter();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap justify-between items-center gap-2">
        {showBack && (
          <Button
            onClick={() => router.back()}
            icon="arrowLeft"
            iconOnly
            variant="secondary"
          />
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && (
            <div className="text-xs text-gray-600">{description}</div>
          )}
        </div>
        <div>{actions}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export { PageWrapper };
