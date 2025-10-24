"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, House, ReceiptText, BookA } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import Link from "next/link";
const navigation = [
  { name: "Accueil", href: "/" },
  // { name: "Formations", href: "/" },
  { name: "Plans & Tarifs", href: "/" },
  { name: "Contact-nous", href: "/" },
];

export default function Header() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const fullName = user ? `${user.first_name}`.trim() : "User";

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-6 py-2">
        <div className="flex-1">
          <Link href="/">
            <div className="w-[220px]">
              <Image
                src={Logo}
                width={220}
                height={120}
                priority
                alt="logo"
                className="w-[220px] mx-auto"
              />
            </div>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm/6 text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-end h-16 px-6 gap-4">
          {!isLoading && isAuthenticated && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="relative">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No new notifications
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-1 py-1 cursor-pointer hover:bg-gray-200 transition-colors">
                    <span className="text-sm text-gray-600">{fullName}</span>
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === "client" && (
                    <>
                      <DropdownMenuItem onClick={() => router.push("/compte")}>
                        <House className="mr-2 h-4 w-4" />
                        <span>Mon compte</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/compte/practice")}>
                        <BookA className="mr-2 h-4 w-4" />
                        <span>Pratique</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/compte/abonnements")}>
                        <ReceiptText className="mr-2 h-4 w-4" />
                        <span>Abonnements</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      <House className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isLoading && !isAuthenticated && (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-6 py-2.5 font-semibold text-sm text-white"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-white px-6 py-2 font-semibold text-sm text-primary border-2 border-primary"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
