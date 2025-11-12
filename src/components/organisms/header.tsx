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
import { User, ArrowRight, LogOut, House } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/logo.svg";
import Icon from "@/assets/images/icon.svg";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "Preparations", href: "/preparations" },
  { name: "Formations", href: "/formations" },
  { name: "Tarifs", href: "/tarifs" },
  // { name: "Contact", href: "/contactez-nous" },
];

export default function Header() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const fullName = user ? `${user.first_name}`.trim() : "User";

  const getUserLink = (role: any | null) => {
    switch (role) {
      case "client":
        return "/compte";
      case "trainer":
        return "/trainer";
      case "admin":
        return "/dashboard";
      default:
        return "/";
    }
  };


  return (
    <div>
      {/* <div className="relative text-center secondary-gradient text-white font-semibold">
Nouveaux inscrits : Accès GRATUIT avec le code FREESTART - Offre limitée!
      </div> */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/50 backdrop-blur-[2px] border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-6 py-0.5 px-6 sm:px-6 ">
          <div className="w-[140px] sm:w-[180px] lg:w-[210px]">
            <Link href="/">
              <div className="w-[140px] sm:w-[180px] lg:w-[210px] hidden lg:block">
                <Image
                  src={Logo}
                  width={210}
                  height={120}
                  priority
                  alt="logo"
                  className="w-full mx-auto"
                />
              </div>
              <div className="w-[64px] sm:w-[64px] lg:w-[64px] lg:hidden">
                <Image
                  src={Icon}
                  width={64}
                  height={64}
                  priority
                  alt="logo"
                  className="w-full mx-auto"
                />
              </div>
            </Link>
          </div>
          <div className="hidden flex-1 lg:flex lg:gap-x-0 flex-row items-center h-14 px-0 sm:px-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-semibold text-sm px-2 py-1"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="lg:w-[210px] flex items-center justify-end h-16 px-0 sm:px-0 gap-2 sm:gap-4">
            {!isLoading && isAuthenticated && (
              <>
                <Link href={getUserLink(user?.role)}>
                  <div className="flex items-center gap-1 sm:gap-2 bg-primary/10 rounded-full pl-2 sm:pl-4 pr-1 py-1 cursor-pointer hover:bg-gray-200 transition-colors">
                    <span className="text-xs sm:text-sm text-primary hidden sm:inline">
                      Mon compte
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                </Link>
                {/* </DropdownMenuTrigger> */}
                {/* <DropdownMenuContent align="end" className="w-56">
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
                        <DropdownMenuItem
                          onClick={() => router.push("/compte")}
                        >
                          <House className="mr-2 h-4 w-4" />
                          <span>Mon compte</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {user?.role === "trainer" && (
                      <DropdownMenuItem onClick={() => router.push("/trainer")}>
                        <House className="mr-2 h-4 w-4" />
                        <span>Mon comple</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                      >
                        <House className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent> */}
                {/* </DropdownMenu> */}
              </>
            )}
            {/* className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-3 sm:px-6 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm text-white" */}
            {!isLoading && !isAuthenticated && (
              <div className="flex gap-1 sm:gap-1">
                <Link href="/login">
                  <Button>Se connecter</Button>
                </Link>
                {/* <Link
                href="/login"
                className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-3 sm:px-6 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm text-white"
              >
                Connexion
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-linear-to-tr from-[#4E56C0] to-[#9089fc] px-3 sm:px-6 py-2 sm:py-2.5 font-semibold text-xs sm:text-sm text-white"
              >
                Commencer Gratuitement
              </Link> */}
                {/* <NavigationLink href="/login">
                <Button>Se connecter</Button>
              </NavigationLink> */}
                <Link href="/signup?next=/compte/essai-gratuit&package=trial">
                  <Button variant="secondary">Essai Gratuit</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
