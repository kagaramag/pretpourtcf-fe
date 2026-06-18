"use client";

import { useAuth } from "@/contexts/auth-context";
import { Icon } from "@/icons";
import { useRouter } from "next/navigation";
import Logo from "@/assets/images/icon.svg";
import Image from "next/image";

interface HeaderPracticeProps {
  title: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function Header({
  title,
  onClose,
  onRefresh,
}: HeaderPracticeProps) {
  const router = useRouter();
  const { user } = useAuth();

  const fullName = user ? `${user.first_name}`.trim() : "User";

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-gray-100 bg-white">
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
          <h1 className="lg:text-2xl text-xl lg:font-bold text-center leading-none">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <button
              className="bg-primary text-white p-2.5 cursor-pointer hover:bg-primary/80 rounded-full"
              onClick={onRefresh}
            >
              <Icon name="refresh" size={20} />
            </button>
          )}
          <button
            className="bg-red-600 text-white p-2.5 cursor-pointer hover:bg-red-600/80 rounded-full"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
