"use client";

import { useAuth } from "@/contexts/auth-context";
import { Menu, type MenuItem } from "@/components/ui/menu";
import Link from "next/link";
import { Globe, Bell, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const fullName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "User";

  return (
    <header className="sticky top-0 z-10 bg-gray-900">
      <div className="flex items-center justify-end h-14 sm:h-16 px-3 sm:px-6 gap-2 sm:gap-2">
        <Link
          href="/"
          className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary rounded-full flex items-center justify-center transition-colors"
        >
          <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
        </Link>
        <Menu
          trigger={
            <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary rounded-full flex items-center justify-center transition-colors cursor-pointer">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </button>
          }
          items={[
            {
              type: "button",
              label: "No new notifications",
              disabled: true,
            },
          ]}
        />

        <Menu
          trigger={
            <div className="flex items-center gap-1 sm:gap-2 bg-tertiary rounded-full pl-2 sm:pl-4 pr-1 py-1 cursor-pointer  transition-colors">
              <span className="text-xs sm:text-sm text-black hidden sm:inline">{fullName}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          }
          items={[
            {
              type: "link",
              label: "My Profile",
              to: "/profile",
              icon: "profile",
            },
            {
              type: "button",
              label: "Log out",
              onClick: handleLogout,
              icon: "logout",
              variant: "danger",
            },
          ]}
        />
      </div>
    </header>
  );
}
