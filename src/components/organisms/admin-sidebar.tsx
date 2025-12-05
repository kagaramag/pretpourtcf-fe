"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/assets/images/logo.svg";
import Icon from "@/assets/images/icon.svg";
import Image from "next/image";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS, CUSTOM_PERMISSIONS } from "@/config/permissions";
import {
  Home,
  User,
  ArrowLeftToLine,
  ArrowRightToLine,
  Menu,
  X,
  Flame,
  ReceiptText,
  BookA,
  Tag,
  UserPlus,
  Newspaper,
  Wallet,
  Radius,
  LibraryBig,
  Notebook,
} from "lucide-react";

interface MenuItem {
  name: string;
  href: string | string[];
  icon: React.ReactNode;
  permission: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    href: "/dashboard",
    permission: CUSTOM_PERMISSIONS.DASHBOARD_READ,
  },
  {
    name: "Practices",
    icon: <LibraryBig className="h-5 w-5" />,
    href: "/dashboard/practices",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Users",
    icon: <User className="h-5 w-5" />,
    href: "/dashboard/users",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    name: "Streaks",
    icon: <Flame className="h-5 w-5" />,
    href: "/dashboard/streaks",
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Subscriptions",
    icon: <Radius className="h-5 w-5" />,
    href: "/dashboard/subscriptions",
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Plans",
    icon: <ReceiptText className="h-5 w-5" />,
    href: "/dashboard/plans",
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Transactions",
    icon: <Wallet className="h-5 w-5" />,
    href: "/dashboard/transactions",
    permission: PERMISSIONS.TRANSACTION_READ,
  },
  {
    name: "Promo Codes",
    icon: <Tag className="h-5 w-5" />,
    href: "/dashboard/promo-codes",
    permission: PERMISSIONS.TRANSACTION_READ,
  },
  {
    name: "Referrals",
    icon: <UserPlus className="h-5 w-5" />,
    href: "/dashboard/referrals",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    name: "Blog",
    icon: <Notebook className="h-5 w-5" />,
    href: "/dashboard/blog",
    permission: PERMISSIONS.PRACTICES_READ,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const sidebarCollapsed = localStorage.getItem("sidebar_collapsed");
    if (sidebarCollapsed) {
      setIsCollapsed(sidebarCollapsed === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-border"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col h-screen bg-white border-r border-border transition-all duration-300",
          "fixed lg:relative z-40 lg:z-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed ? (
            <div className="my-2.5 py-0.5 w-[170px] sm:w-[200px] mx-auto">
              <Image
                src={Logo}
                width={200}
                height={120}
                priority
                alt="logo"
                className="w-full mx-auto"
              />
            </div>
          ) : (
            <div className="mb-5 my-3.5 w-[64px] mx-auto">
              <Image
                src={Icon}
                width={64}
                height={64}
                priority
                alt="logo"
                className="w-[64px] mx-auto"
              />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 relative">
          <ul className="space-y-1 px-2">
            {visibleMenuItems.map((item) => {
              const href = Array.isArray(item.href) ? item.href[0] : item.href;
              const isActive = Array.isArray(item.href)
                ? item.href.some((h) => pathname.startsWith(h))
                : pathname === href ||
                  (pathname.startsWith(href + "/") && href !== "/dashboard");

              return (
                <li key={item.name}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-full transition-colors",
                      isActive
                        ? "bg-tertiary text-primary-foreground"
                        : "text-black hover:bg-gray-100",
                      isCollapsed ? "justify-center" : "gap-3"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors absolute bottom-2 right-3 cursor-pointer hidden lg:block",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ArrowRightToLine className="h-5 w-5" />
            ) : (
              <ArrowLeftToLine className="h-5 w-5" />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
