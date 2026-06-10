"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AppIcon from "@/assets/images/icon.svg";
import Image from "next/image";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS, CUSTOM_PERMISSIONS } from "@/config/permissions";
import { Icon } from "@/icons";

interface MenuItem {
  name: string;
  href: string | string[];
  icon: React.ReactNode;
  permission: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Dashboard",
    icon: <Icon name="home" size={20} />,
    href: "/dashboard",
    permission: CUSTOM_PERMISSIONS.DASHBOARD_READ,
  },
  {
    name: "Practices",
    icon: <Icon name="write" size={20} />,
    href: "/dashboard/practices",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Corporates",
    icon: <Icon name="corporate" size={20} />,
    href: "/dashboard/corporates",
    permission: PERMISSIONS.CORPORATES_READ,
  },
  {
    name: "Subscriptions",
    icon: <Icon name="subscription" size={20} />,
    href: ["/dashboard/subscriptions", "/dashboard/plans"],
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Users",
    icon: <Icon name="user" size={20} />,
    href: "/dashboard/users",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    name: "Streaks",
    icon: <Icon name="certificate" size={20} />,
    href: "/dashboard/streaks",
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Messages",
    icon: <Icon name="message" size={20} />,
    href: "/dashboard/messages",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Transactions",
    icon: <Icon name="sum" size={20} />,
    href: "/dashboard/transactions",
    permission: PERMISSIONS.TRANSACTION_READ,
  },
  {
    name: "Promo Codes",
    icon: <Icon name="promo" size={20} />,
    href: "/dashboard/promo-codes",
    permission: PERMISSIONS.TRANSACTION_READ,
  },
  {
    name: "Referrals",
    icon: <Icon name="user" size={20} />,
    href: "/dashboard/referrals",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    name: "Blog",
    icon: <Icon name="post" size={20} />,
    href: "/dashboard/blog",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Logs",
    icon: <Icon name="report" size={20} />,
    href: "/dashboard/logs",
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
        className="lg:hidden fixed top-2 left-4 z-50 p-2 bg-tertiary rounded-lg"
      >
        {isMobileOpen ? (
          <Icon name="close" size={20} />
        ) : (
          <Icon name="ellipsis" size={20} />
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
          "flex flex-col h-screen bg-gray-900 transition-all duration-300",
          "fixed lg:relative z-40 lg:z-0",
          isCollapsed ? "w-16" : "w-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-start px-4">
          {!isCollapsed ? (
            <div className="my-2.5 py-0.5 w-[64px] sm:w-[64px]">
              <Image
                src={AppIcon}
                width={44}
                height={44}
                priority
                alt="logo"
                className="w-ful"
              />
            </div>
          ) : (
            <div className="mb-5 my-3.5 w-[64px]">
              <Image
                src={AppIcon}
                width={44}
                height={44}
                priority
                alt="logo"
                className="w-[64px]"
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
                        : "text-gray-300 hover:bg-gray-100/5",
                      isCollapsed ? "justify-center" : "gap-3"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {item.icon}
                    {!isCollapsed && (
                      <span className="text-sm">{item.name}</span>
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
              <Icon name="sidebarOpen" size={20} />
            ) : (
              <Icon name="sidebarClose" size={20} />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
