import { useAuth } from "@/contexts/auth-context";
import { User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";

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
      <div className="py-2 bg-gray-100/50">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-18 h-18 border bg-white rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div>
                  {user?.last_name} {user?.first_name}
                </div>
                <Link href="/compte/plans">
                  <div className="px-2 text-xs bg-secondary text-white rounded-4xl font-semibold">
                    {user?.subscription?.plan?.name}{" "}({user?.subscription?.days_remaining}jours)
                  </div>
                </Link>
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
      {user?.role === "client" && (
        <div className="py-2 bg-gray-100 mb-2 border-b border-t border-gray-300">
          <div className="mx-auto max-w-5xl">
            <ul className="flex items-center gap-5">
              {navigation.map((item, idx) => (
                <li key={idx}>
                  <Link href={`${item.href}`} className="text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
