"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  User,
  ReceiptText,
  History,
  List,
  UserPlus,
  Flame,
  ChevronDown,
  Crown,
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
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  const navigation = [
    { name: "Mon compte", href: "/compte", icon: User },
    {
      name: "Pratiques",
      href: "/compte/pratiques",
      icon: ReceiptText,
      show: !isLoading && user?.subscription !== null,
      submenu: [
        { name: "Compréhension orale", href: "/compte/pratique/co" },
        { name: "Compréhension écrite", href: "/compte/pratique/ce" },
        { name: "Expression orale", href: "/compte/pratique/eo" },
        { name: "Expression écrite", href: "/compte/pratique/ee" },
      ],
    },
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

  const toggleSubmenu = (itemName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenu?: { href: string }[]) => {
    if (!submenu) return false;
    return submenu.some((subItem) => isActiveLink(subItem.href));
  };

  return (
    <nav className="relative flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isInactive = item.show === false;
              // Always show Pratiques submenu, toggle others
              const isExpanded =
                item.name === "Pratiques" ||
                expandedMenus[item.name] ||
                isSubmenuActive(item.submenu);

              return (
                <li key={item.name}>
                  {hasSubmenu ? (
                    <div className="mb-4">
                      <button
                        onClick={() =>
                          !isInactive &&
                          item.name !== "Pratiques" &&
                          toggleSubmenu(item.name)
                        }
                        disabled={isInactive}
                        className={classNames(
                          isActive || isSubmenuActive(item.submenu)
                            ? "text-gray-400"
                            : "text-gray-400",
                          "group flex gap-x-3 items-center rounded-full pt-2 pl-2 text-sm/6 w-full",
                          item.name === "Pratiques" && "cursor-default",
                          isInactive && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <span className="flex-1 text-left flex items-center gap-x-2">
                          {item.name}
                          {isInactive && (
                            <Crown className="size-4 text-amber-500" />
                          )}
                        </span>
                        {item.name !== "Pratiques" && (
                          <ChevronDown
                            className={classNames(
                              "size-4 transition-transform",
                              isExpanded ? "rotate-180" : ""
                            )}
                          />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-0 space-y-1">
                          {item.submenu?.map((subItem) => {
                            const isSubActive = isActiveLink(subItem.href);
                            return (
                              <li key={subItem.name}>
                                {isInactive ? (
                                  <div
                                    className={classNames(
                                      "text-gray-600 opacity-40 cursor-not-allowed",
                                      "group flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6"
                                    )}
                                  >
                                    <item.icon
                                      aria-hidden="true"
                                      className="text-gray-400 size-5 shrink-0"
                                    />
                                    <span className="flex-1 flex items-center gap-x-2">
                                      {subItem.name}
                                    </span>
                                  </div>
                                ) : (
                                  <Link
                                    href={subItem.href}
                                    onClick={onLinkClick}
                                    className={classNames(
                                      isSubActive
                                        ? "bg-accent text-white"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-primary",
                                      "group flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6"
                                    )}
                                  >
                                    <item.icon
                                      aria-hidden="true"
                                      className={classNames(
                                        isActive
                                          ? "text-primary hover:text-white"
                                          : "text-gray-400 group-hover:text-white",
                                        "size-5 shrink-0"
                                      )}
                                    />
                                    <span>{subItem.name}</span>
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <>
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
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onLinkClick}
                          className={classNames(
                            isActive
                              ? "bg-accent text-white"
                              : "text-gray-700 hover:bg-gray-50 hover:text-primary",
                            "group border border-accent/20 flex gap-x-3 items-center rounded-full py-2 px-4 text-sm/6 font-semibold"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-primary",
                              "size-5 shrink-0"
                            )}
                          />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </>
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
