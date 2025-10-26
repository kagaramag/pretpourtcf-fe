"use client";

import { useAuth } from "@/contexts/auth-context";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/icon.svg";
import Image from "next/image";
const navigation = [
  { name: "Accueil", href: "/" },
  // { name: "Formations", href: "/" },
  { name: "Plans & Tarifs", href: "/" },
  { name: "Contact-nous", href: "/" },
];

interface HeaderPracticeProps {
  title: string;
  onClose: () => void;
}

export default function Header({ title, onClose }: HeaderPracticeProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const fullName = user ? `${user.first_name}`.trim() : "User";

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b bg-white">
      <div className="w-full mx-auto flex items-center gap-6 py-2 px-2">
        <div className="w-[56px]">
          <Image
            src={Logo}
            width={56}
            height={56}
            priority
            alt="logo"
            className="w-[56px] mx-auto"
          />
        </div>
        <div className="flex-1">
          <h1 className="lg:text-2xl text-xl lg:font-bold text-center leading-none">{title}</h1>
        </div>
        <div
          className="w-[56px]"
          onClick={onClose}
        >
          <button
            className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg"
            onClick={onClose}
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      </div>
    </header>
  );
}
