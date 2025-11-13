import { useAuth } from "@/contexts/auth-context";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ProfileCard({ isOpen = true, onClose }: any) {
  const { user, isLoading, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  const navigation = [
    { name: "Mon compte", href: "/compte", icon: User },
    {
      name: "Pratiques",
      href: "/compte/pratiques",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Séries",
      href: "/compte/series",
      show: !isLoading && user?.subscription !== null,
    },
    { name: "Abonnements", href: "/compte/plans" },
    {
      name: "Parrainages",
      href: "/compte/parrainages",
    },
    {
      name: "Historique",
      href: "/compte/historique",
    },
  ];

  return (
    <div className="">
      <div className="py-2 bg-gray-100/50 border-b border-gray-200">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-18 h-18 border bg-white rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {user?.last_name} {user?.last_name}
              </h3>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            <div className="">
              <Button onClick={handleLogout} size={"sm"} variant={"ghost"}>
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-2 bg-gray-100/50 mb-2 border-b border-gray-200">
        <div className="mx-auto max-w-5xl">
          <ul className="flex items-center gap-5">
            {navigation.map((item, idx) => (
              <li key={idx}>
                <Link href={`${item.href}`} className="text-sm">{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
