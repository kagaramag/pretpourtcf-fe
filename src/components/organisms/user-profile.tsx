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
    { name: "Compte", href: "/compte", icon: UserRound, show: true },
    {
      name: "Séries",
      href: "/compte/series",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Abos",
      href: "/compte/plans",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Activité",
      href: "/compte/historique",
      show: !isLoading && user?.subscription !== null,
    },
    {
      name: "Invites",
      href: "/compte/parrainages",
      show: true,
    },
  ];
  return (
    <div>
      <div className="pb-3 pt-22 bg-gray-900 text-white">
        <div className="mx-auto max-w-6xl px-4 lg:px-0 md:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2">
            <div className="w-14 h-14  bg-black rounded-full items-center justify-center flex-shrink-0 hidden sm:flex">
              <UserRound className="h-4 w-4 sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div>
                {!isLoading && user && (
                  <h3 className="text-lg lg:text-xl flex flex-col sm:flex-row sm:items-center gap-2 truncate">
                    Hello, {user?.first_name}!
                  </h3>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm truncate hidden lg:block">
                  {user?.email}
                </div>
                {user?.subscription && (
                  <Link
                    href="/compte/plans"
                    className="text-sm inline-block whitespace-nowrap"
                  >
                    Abonnement: {user?.subscription?.plan?.name} {"("}
                    {user?.subscription?.days_remaining} Jours{")"}
                  </Link>
                )}
                {!user?.subscription && (
                  <div className="py-1 text-sm rounded-full whitespace-nowrap self-start sm:self-auto">
                    Plan: Mode gratuit
                  </div>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto lg:block md:block hidden">
              <Button
                onClick={handleLogout}
                size={"sm"}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      {user?.role === "client" && (
        <div className="py-2 bg-gray-800 text-white mb-2">
          <div className="mx-auto max-w-6xl px-4 lg:px-0 md:px-6 flex flex-col sm:flex-row gap-3 sm:gap-0">
            <div className="flex-1 overflow-x-auto">
              <ul className="flex items-center gap-3 sm:gap-5 whitespace-nowrap">
                {navigation.map((item, idx) => (
                  <li key={idx}>
                    {item.show ? (
                      <Link
                        href={`${item.href}`}
                        className={` text-sm hover:text-primary transition-colors`}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className={`text-sm text-gray-200/70`}>
                        {item.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
