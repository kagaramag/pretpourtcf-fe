"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/contexts/permission-context";
import { PERMISSIONS, CUSTOM_PERMISSIONS } from "@/config/permissions";
import {
  Home,
  UserCog,
  ClipboardList,
  Menu,
  X,
  BookOpen,
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
    name: "Users",
    icon: <UserCog className="h-5 w-5" />,
    href: "/dashboard/users",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    name: "Practices",
    icon: <BookOpen className="h-5 w-5" />,
    href: "/dashboard/practices",
    permission: PERMISSIONS.PRACTICES_READ,
  },
  {
    name: "Subscriptions",
    icon: <ClipboardList className="h-5 w-5" />,
    href: "/dashboard/subscriptions",
    permission: PERMISSIONS.FOLLOWUPS_READ,
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
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                A
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Pret Pour TCF</h1>
              <p className="text-xs text-muted-foreground">Backoffice</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleMenuItems.map((item) => {
            const href = Array.isArray(item.href) ? item.href[0] : item.href;
            const isActive =
              href === "/"
                ? pathname === "/"
                : Array.isArray(item.href)
                ? item.href.some((h) => pathname.startsWith(h))
                : pathname.startsWith(href + "/") || pathname === href;

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
      </nav>
    </div>
  );
}
