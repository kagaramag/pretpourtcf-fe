"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Calendar, Menu, X, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/logo_white.svg";
import Icon from "@/assets/images/icon.svg";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LearnerNavigation from "@/components/molecules/learner-navigation";

export default function Header() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Examens", href: "/compte" },
    // { name: "Tarifs", href: "/tarifs" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 140) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fullName = user ? `${user.first_name}`.trim() : "User";

  const getUserLink = (role: any | null) => {
    switch (role) {
      case "client":
        return "/compte";
      case "trainer":
        return "/trainer";
      case "admin":
        return "/dashboard";
      case "super_admin":
        return "/dashboard";
      default:
        return "/";
    }
  };

  return (
    <div>
      {/* {!isLoading && !isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_200%] animate-gradient px-4 py-3 text-center text-white lg:text-md text-sm">
          Offre exclusive! -30% avec le code{" "}
          <span className="font-semibold">GO30</span> sur tous nos tests,
          exercices, et outils.
          <a href="/signup" className="whitespace-nowrap underline pl-2">
            Créer un compte maintenant
          </a>
        </div>
      )} */}
      <header className="inset-x-0 top-0 z-50 bg-black/60 backdrop-blur-md transition-all duration-300 fixed">
        <div className="flex items-center justify-between gap-2 sm:gap-6 px-2 lg:px-0 lg:mx-auto mx-4 my-0 py-2 max-w-7xl">
          <div className="w-[120px] sm:w-[180px] lg:w-[190px]">
            <Link href="/">
              <div className="w-2.5 sm:w-[180px] lg:w-[190px] hidden lg:block">
                <Image
                  src={Logo}
                  width={190}
                  height={90}
                  priority
                  alt="logo"
                  className="w-full mx-auto"
                />
              </div>
              <div className="w-[46px] sm:w-[46px] lg:w-[46px] lg:hidden p-0.5">
                <Image
                  src={Icon}
                  width={36}
                  height={36}
                  priority
                  alt="logo"
                  className="w-full mx-auto"
                />
              </div>
            </Link>
          </div>
          <div className="hidden flex-1 lg:flex lg:gap-x-0 flex-row items-center h-12 px-0 sm:px-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="font-semibold text-sm px-2 py-1 text-white"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href={"/book"}
              className="text-sm pl-3 pr-1 py-0.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/30 rounded-full ml-4 flex items-center gap-1"
            >
              Séance gratuite
              <span className="bg-black p-1.5 rounded-full">
                <Calendar className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {!isLoading && isAuthenticated && (
            <div className="lg:w-[210px] hidden lg:flex flex-1 items-center justify-end py-2 px-0 sm:px-0 gap-2 sm:gap-4">
              <Link href={getUserLink(user?.role)}>
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full sm:pl-4 pl-0 lg:pr-1 lg:py-1 cursor-pointer hover:bg-white/20 transition-colors">
                  <span className="text-xs sm:text-sm text-white hidden sm:inline">
                    Mon compte
                  </span>
                  <div className="w-9 h-9 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                    <UserRound className="lg:h-3 lg:w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
              </Link>
            </div>
          )}
          <div className="lg:hidden gap-1 flex">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-primary text-white rounded-full"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
          {!isLoading && !isAuthenticated && (
            <div className="flex gap-1 sm:gap-1 justify-end flex-1">
              <Link href="/login">
                <Button variant={"tertiary"}>Se connecter</Button>
              </Link>
              <Link
                href="/signup?next=/compte/essai-gratuit&package=trial"
                className="lg:flex hidden"
              >
                <Button>Créer un compte</Button>
              </Link>
            </div>
          )}
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-400/20 shadow-lg absolute inset-x-0 top-full z-40">
            <div className="w-full space-y-2 flex flex-col px-4 py-4">
              {!isLoading && isAuthenticated ? (
                <LearnerNavigation
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              ) : (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-semibold text-sm px-2 py-3 text-primary hover:bg-gray-50 rounded-lg"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
