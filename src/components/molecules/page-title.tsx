"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/icons";
import { Button } from "../ui/button";

interface PageTitleProps {
  title: string;
  description?: string;
  children?: ReactNode;
  showBack?: boolean;
}

function PageTitle({ title, description, children, showBack }: PageTitleProps) {
  const router = useRouter();

  return (
    <div className="py-2 flex gap-2">
      <div className="flex-1 flex items-start gap-2">
        {showBack && (
          <Button
            onClick={() => router.back()}
            icon="arrowLeft"
            iconOnly
            variant="secondary"
          />
        )}
        <div>
          <h1 className="text-2xl">{title}</h1>
          {description && (
            <div className="text-gray-600 text-sm">{description}</div>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export { PageTitle };
