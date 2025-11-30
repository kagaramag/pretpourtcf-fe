"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  User,
  ReceiptText,
  History,
  List,
  UserPlus,
  Flame,
  Crown,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface LearnerNavigationProps {
  onLinkClick?: () => void;
}

export default function LearnerNavigation({
  onLinkClick,
}: LearnerNavigationProps) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  // Don't render navigation if user is not logged in
  if (!user && !isLoading) {
    return null;
  }

  const navigation = [
    { name: "Mon compte", href: "/compte", icon: User },
    { name: "Abonnements", href: "/compte/plans", icon: List },
    {
      name: "Historique",
      href: "/compte/historique",
      icon: History,
    },
    {
      name: "Séries",
      href: "/compte/series",
      show: !isLoading && user?.subscription !== null,
      icon: Flame,
    },
    {
      name: "Parrainages",
      href: "/compte/parrainages",
      icon: UserPlus,
    },
    {
      name: "Se déconnecter",
      href: "#",
      icon: LogOut,
      isLogout: true,
    },
  ];

  // Strict matching logic for nested routes
  const isActiveLink = (href: string) => {
    // Exact match for the current path
    if (pathname === href) return true;

    // Special case: /compte should only match exactly /compte, not sub-routes
    if (href === "/compte") return false;

    // For other nested routes: check if current path starts with href followed by a slash
    if (pathname.startsWith(href + "/")) return true;

    return false;
  };

  const handleLogout = async () => {
    await logout();
    onLinkClick?.();
  };


  return (
    <nav className="relative flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              const isInactive = item.show === false;

              return (
                <li key={item.name}>
                  {isInactive ? (
                    <div
                      className={classNames(
                        "text-gray-700 opacity-40 cursor-not-allowed",
                        "group border border-accent/20 flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6 font-semibold"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className="text-gray-400 size-5 shrink-0"
                      />
                      <span className="flex-1 flex items-center gap-x-2">
                        {item.name}
                        <Crown className="size-4 text-amber-500" />
                      </span>
                    </div>
                  ) : item.isLogout ? (
                    <button
                      onClick={handleLogout}
                      className={classNames(
                        "text-gray-700 hover:bg-gray-50 hover:text-gray-50",
                        "group border border-gray-300/50 flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6 font-semibold w-full"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className="text-gray-400 group-hover:text-primary size-5 shrink-0"
                      />
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={classNames(
                        isActive
                          ? "bg-gray-50"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-50",
                        "group border border-gray-300/50 flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6 font-semibold"
                      )}
                    >
                      <item.icon
                        aria-hidden="true"
                        className={classNames(
                          isActive
                            ? "text-gray-700"
                            : "text-gray-400 group-hover:text-primary",
                          "size-5 shrink-0"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </nav>
  );
}
