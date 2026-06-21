"use client";

import { useEffect, useRef } from "react";

const CHECK_INTERVAL = 60_000; // Check every 60 seconds

export function VersionCheck() {
  const currentVersion = useRef<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return;

        const { version } = await res.json();

        if (currentVersion.current === null) {
          // First check — store the initial version
          currentVersion.current = version;
        } else if (version !== currentVersion.current) {
          // Version changed — new deploy detected, reload the page
          window.location.reload();
        }
      } catch {
        // Silently ignore network errors
      }
    };

    // Initial check
    checkVersion();

    // Poll periodically
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null;
}
