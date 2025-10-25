"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface NavigationLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
  className?: string;
  showSpinner?: boolean;
}

/**
 * NavigationLink component that shows a loading state when navigating
 * Uses Next.js router for client-side navigation with visual feedback
 */
export function NavigationLink({
  href,
  children,
  className,
  showSpinner = true,
  onClick,
  ...props
}: NavigationLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Don't handle if:
    // - Default was prevented
    // - It's a modifier click (ctrl, cmd, shift, etc.)
    // - It's not a left click
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();
    setIsNavigating(true);

    startTransition(() => {
      router.push(href.toString());
    });

    // Fallback to reset loading state if navigation doesn't complete
    setTimeout(() => {
      setIsNavigating(false);
    }, 3000);
  };

  const loading = isPending || isNavigating;

  return (
    <Link
      href={href}
      className={cn(
        "relative",
        loading && "pointer-events-none opacity-80",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {loading && showSpinner && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-md">
          <Spinner className="size-5" />
        </span>
      )}
      <span className={cn(loading && showSpinner && "invisible")}>
        {children}
      </span>
    </Link>
  );
}
