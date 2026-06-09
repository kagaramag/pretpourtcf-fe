"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import apiClient from "@/lib/api-client";

type ClickAction = "button_clicked" | "link_clicked" | "form_submitted";

interface TrackClickOptions {
  action?: ClickAction;
  label: string;
  metadata?: Record<string, any>;
}

function sendTrackEvent(
  action: string,
  category: "navigation" | "interaction",
  metadata: Record<string, any>
) {
  // Fire and forget - don't block the UI
  apiClient
    .post("/analytics/track", { action, category, metadata })
    .catch(() => {
      // Silently fail - tracking should never break the app
    });
}

/**
 * Hook that auto-tracks page views and provides a trackClick function
 * for tracking button/link clicks on /compte and /trainer pages.
 */
export function useActivityTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  // Auto-track page views when pathname changes
  useEffect(() => {
    if (!pathname) return;

    // Only track /compte and /trainer pages
    if (!pathname.startsWith("/compte") && !pathname.startsWith("/trainer")) {
      return;
    }

    // Avoid duplicate tracking for the same path
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    sendTrackEvent("page_viewed", "navigation", {
      page_path: pathname,
      page_title: document.title,
      referrer: document.referrer || undefined,
      timestamp: new Date().toISOString(),
    });
  }, [pathname]);

  // Manual click tracking
  const trackClick = useCallback(
    (options: TrackClickOptions) => {
      const { action = "button_clicked", label, metadata = {} } = options;

      sendTrackEvent(action, "interaction", {
        page_path: pathname,
        label,
        ...metadata,
        timestamp: new Date().toISOString(),
      });
    },
    [pathname]
  );

  return { trackClick };
}
