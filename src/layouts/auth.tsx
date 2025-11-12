"use client";

import { ReactNode } from "react";
import Lottie from "lottie-react";
import Logo from "@/assets/images/logo.svg";
import Icon from "@/assets/images/icon.svg";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/organisms/footer";
import happyUserAnimation from "@/assets/lotties/happy-user.json";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full h-screen mx-auto flex flex-row overflow-hidden">
      <div className="w-xl h-full bg-primary flex items-end justify-center relative">
        <div className="-mb-4">
          <Lottie animationData={happyUserAnimation} loop={true} />
        </div>
      </div>
      <div className="flex-1 border p-4 relative">
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
        <div className="flex items-center justify-center flex-col h-screen">
          <div className="mx-auto w-sm">{children}</div>
          <div className="mt-2">
            <p className="text-center text-xs text-muted-foreground px-2">
              En vous connectant, vous acceptez nos Conditions d'utilisation
              <br className="hidden sm:block" />
              <span className="sm:inline"> </span>et notre Politique de
              confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
