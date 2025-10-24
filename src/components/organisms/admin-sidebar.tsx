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
import { Home, User, ClipboardList, Menu, X, BookOpen, House, ReceiptText, BookA } from "lucide-react";

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
    icon: <BookA className="h-5 w-5" />,
    href: "/dashboard/practices",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Subscriptions",
    icon: <ReceiptText className="h-5 w-5" />,
    href: "/dashboard/subscriptions",
    permission: PERMISSIONS.FOLLOWUPS_READ,
  },
  {
    name: "Users",
    icon: <User className="h-5 w-5" />,
    href: "/dashboard/users",
    permission: PERMISSIONS.USERS_READ,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="mb-5 my-3 w-[280px] mx-auto hidden lg:block">
            <Image
              src={Logo}
              width={280}
              height={140}
              priority
              alt="logo"
              className="w-[280px] mx-auto"
            />
          </div>
        ) : (
          <div className="mb-5 my-3 w-[64px] mx-auto hidden lg:block">
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

      <nav className="flex-1 overflow-y-auto py-4 border relative">
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
                    "flex items-center px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-600 hover:bg-gray-100",
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
            "p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors absolute bottom-2 right-3 cursor-pointer",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </nav>
    </div>
  );
}
