import { useAuth } from "@/contexts/auth-context";
import { UserRound } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ProfileCard({ isOpen = true, onClose }: any) {
  const { user, isLoading, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  const navigation = [
    { name: "Mon compte", href: "/compte", icon: UserRound, show: true },
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
  return (
    <div>
      <div className="py-3 md:py-2 bg-primary/5">
        <div className="mx-auto max-w-5xl px-4 lg:px-0 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
            <div className="w-16 h-16 sm:w-18 sm:h-18 border border-gray-100 bg-white rounded-full items-center justify-center flex-shrink-0 hidden sm:flex">
              <UserRound className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div>
                <h3 className="text-2xl lg:text-2xl font-semibold flex flex-col sm:flex-row sm:items-center gap-2 truncate">
                  {user?.last_name} {user?.first_name}
                </h3>
              </div>
              <div className="text-sm text-gray-500 truncate hidden lg:block">
                {user?.email}
              </div>
              {user?.subscription && (
                <Link href="/compte/plans">
                  <div className="text-xs inline-block whitespace-nowrap">
                    Abonnement: {user?.subscription?.plan?.name} {" - "}
                    {user?.subscription?.days_remaining} Jours
                  </div>
                </Link>
              )}
            </div>
            <div className="w-full sm:w-auto lg:block md:block hidden">
              <Button
                onClick={handleLogout}
                size={"sm"}
                variant={"outline"}
                className="w-full sm:w-auto"
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      {user?.role === "client" && (
        <div className="py-2 bg-primary/10 mb-2 border-b border-t border-primary/40">
          <div className="mx-auto max-w-5xl px-4 lg:px-0 md:px-6 flex flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="flex-1 overflow-x-auto">
              <ul className="flex items-center gap-3 sm:gap-5 whitespace-nowrap">
                {navigation.map((item, idx) => (
                  <li key={idx}>
                    {item.show ? (
                      <Link
                        href={`${item.href}`}
                        className={`text-sm hover:text-primary transition-colors`}
                      >
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
              <div className="bg-black text-white px-3 py-1 text-sm rounded whitespace-nowrap self-start sm:self-auto">
                Plan: Mode gratuit
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
