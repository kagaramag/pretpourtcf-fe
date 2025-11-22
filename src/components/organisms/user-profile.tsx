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
    { name: "Mon compte", href: "/compte", icon: User, show: true },
    {
      name: "Séries",
      href: "/compte/series",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Abonnements",
      href: "/compte/plans",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Historique",
      href: "/compte/historique",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Parrainages",
      href: "/compte/parrainages",
      show: true,
    },
  ];
  console.log("###", navigation);
  return (
    <div className="">
      <div className="py-2 bg-primary/5">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="w-18 h-18 border border-gray-100 bg-white rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <div>
                  {user?.last_name} {user?.first_name}
                </div>
                {user?.subscription && (
                  <Link href="/compte/plans">
                    <div className="px-2 text-xs bg-secondary text-white rounded-4xl font-semibold">
                      {user?.subscription?.plan?.name} (
                      {user?.subscription?.days_remaining}jours)
                    </div>
                  </Link>
                )}
              </h3>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            <div className="">
              <Button onClick={handleLogout} size={"sm"} variant={"outline"}>
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      {user?.role === "client" && (
        <div className="py-2 bg-primary/10 mb-2 border-b border-t border-primary/40">
          <div className="mx-auto max-w-5xl flex flex-row">
            <div className="flex-1">
              <ul className="flex items-center gap-5">
                {navigation.map((item, idx) => (
                  <li key={idx}>
                    {item.show ? (
                      <Link href={`${item.href}`} className={`text-sm `}>
                        {item.name}
                      </Link>
                    ) : (
                      <span className={`text-sm text-black/30`}>
                        {item.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {!user?.subscription && (
              <div className="bg-black text-white px-3 py-1 text-sm rounded">
                Plan: Mode gratuit
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
