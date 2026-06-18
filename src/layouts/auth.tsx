"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Lottie from "lottie-react";
import Logo from "@/assets/images/logo.svg";
import Icon from "@/assets/images/icon.svg";
import Image from "next/image";
import Link from "next/link";
import happyUserAnimation from "@/assets/lotties/happy-user.json";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  console.log("jurl", pathname);
  return (
    <div className="w-full h-screen mx-auto flex flex-row overflow-hidden">
      <div className="w-xl h-full bg-primary lg:flex items-end justify-center relative hidden">
        <div className="-mb-4">
          <Lottie animationData={happyUserAnimation} loop={true} />
        </div>
      </div>
      <div className="flex-1 relative">
        <div className="absolute top-0 w-full p-4 flex items-center z-30">
          <div className="flex-1">
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
          </div>
          <div className="flex gap-4 items-center">
            <Link href={"/"} className="text-primary hover:underline">
              Accueil
            </Link>
            {pathname === "/signup" && (
              <Link href={"/login"} className="text-primary hover:underline">
                <Button variant={"tertiary"}>Se connecter</Button>
              </Link>
            )}
            {pathname === "/login" && (
              <Link href={"/signup"} className="text-primary hover:underline">
                <Button>Créer un compte</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center flex-col h-screen relative">
          <div className="mx-auto w-sm lg:px-0 px-6">{children}</div>
          <div className="mt-6  lg:px-0 px-10">
            <p className="text-center text-xs text-gray-600 px-2">
              En vous connectant, vous acceptez nos{" "}
              <Link href="/conditions" className="text-primary hover:underline" target="_blank">
                Conditions d'utilisation
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
