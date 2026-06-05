"use client";

import {
  User,
  ReceiptText,
  History,
  List,
  UserPlus,
  Flame,
  ChevronDown,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Mon compte, Pratiques, abonnements, Historique, Series, Parrainages,

const navigation = [
  { name: "Mon compte", href: "/trainer", icon: User },
  { name: "Apprenants", href: "/trainer/apprenants", icon: List },
  {
    name: "Pratiques",
    href: "/trainer/pratiques",
    icon: ReceiptText,
    submenu: [
      { name: "Compréhension orale", href: "/trainer/pratiques/co" },
      { name: "Compréhension écrite", href: "/trainer/pratiques/ce" },
      { name: "Expression orale", href: "/trainer/pratiques/eo" },
      { name: "Expression écrite", href: "/trainer/pratiques/ee" },
    ],
  },
];
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  // Strict matching logic for nested routes
  const isActiveLink = (href: string) => {
    // Exact match for the current path
    if (pathname === href) return true;

    // Special case: /compte should only match exactly /compte, not sub-routes
    if (href === "/trainer") return false;

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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={classNames(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-full",
          "bg-white lg:bg-transparent",
          "transform transition-transform duration-300 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "flex flex-col h-screen lg:h-auto overflow-y-auto lg:overflow-visible",
          "shadow-xl lg:shadow-none"
        )}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="w-full space-y-2 flex flex-col px-4 lg:px-0">
          <nav className="relative flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = isActiveLink(item.href);
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
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
                                item.name !== "Pratiques" &&
                                toggleSubmenu(item.name)
                              }
                              className={classNames(
                                isActive || isSubmenuActive(item.submenu)
                                  ? "text-gray-400"
                                  : "text-gray-400",
                                "group flex gap-x-3 items-center rounded-full pt-2 pl-2 text-sm/6 w-full",
                                item.name === "Pratiques" && "cursor-default"
                              )}
                            >
                              <span className="flex-1 text-left">
                                {item.name}
                              </span>
                              {item.name !== "Pratiques" && (
                                <ChevronDown
                                  className={classNames(
                                    "size-3 transition-transform",
                                    isExpanded ? "rotate-180" : ""
                                  )}
                                />
                              )}
                            </button>
                            {isExpanded && (
                              <ul className="mt-1 ml-0 space-y-1">
                                {item.submenu?.map((subItem) => {
                                  const isSubActive = isActiveLink(
                                    subItem.href
                                  );
                                  return (
                                    <li key={subItem.name}>
                                      <Link
                                        href={subItem.href}
                                        onClick={onClose}
                                        className={classNames(
                                          isSubActive
                                            ? "bg-accent text-white"
                                            : "text-gray-600 bg-gray-50 hover:bg-gray-50 hover:text-primary",
                                          "group flex gap-x-1 items-center rounded-full py-2 px-4 text-sm/6"
                                        )}
                                      >
                                        <item.icon
                                          aria-hidden="true"
                                          className={classNames(
                                            isActive
                                              ? "text-primary hover:text-white"
                                              : "text-gray-400 group-hover:text-white",
                                            "size-4 shrink-0"
                                          )}
                                        />
                                        <span>{subItem.name}</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={onClose}
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
                                "size-4 shrink-0"
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
        </div>
      </div>
    </>
  );
}
