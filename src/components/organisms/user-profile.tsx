import { useAuth } from "@/contexts/auth-context";
import { Icon } from "@/icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileCard({ isOpen = true, onClose }: any) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await logout();
  };
  const navigation = isLoading
    ? []
    : user?.role === "trainer"
      ? [
          { name: "Examens", href: "/trainer", icon: "certificate" as const, show: true },
          { name: "Apprenants", href: "/trainer/apprenants", icon: "userLine" as const, show: true },
          {
            name: "Compréhension Orale",
            href: "/trainer/pratiques/co",
            icon: "listen" as const,
            show: true,
          },
          {
            name: "Compréhension Ecrite",
            href: "/trainer/pratiques/ce",
            icon: "read" as const,
            show: true,
          },
          {
            name: "Expression Orale",
            href: "/trainer/pratiques/eo",
            icon: "speak" as const,
            show: true,
          },
          {
            name: "Expression Ecrite",
            href: "/trainer/pratiques/ee",
            icon: "write" as const,
            show: true,
          },
          {
            name: "My profile",
            href: "/trainer/profile",
            icon: "write" as const,
            show: true,
          },
        ]
      : [
          { name: "Examens", href: "/compte", icon: "certificate" as const, show: true },
          {
            name: "Séries",
            href: "/compte/series",
            icon: "player" as const,
            show: !isLoading && user?.subscription !== null,
          },
          {
            name: "Abos",
            href: "/compte/plans",
            icon: "sign" as const,
            show: !isLoading && user?.subscription !== null,
          },
          {
            name: "Activité",
            href: "/compte/historique",
            icon: "chartView" as const,
            show: !isLoading && user?.subscription !== null,
          },
          { name: "Invites", href: "/compte/parrainages", icon: "userLine" as const, show: true },
          { name: "My profile", href: "/compte/profile", icon: "userLine" as const, show: true },
        ];
  return (
    <div>
      <div className="pb-4 pt-22 bg-gray-900 text-white">
        <div className="mx-auto max-w-5xl px-4 lg:px-0 md:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-2">
            <div className="w-14 h-14  bg-black rounded-full items-center justify-center flex-shrink-0 hidden sm:flex">
              <Icon name="userLine" className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div>
                {!isLoading && user && (
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg lg:text-xl flex flex-col sm:flex-row sm:items-center gap-2 truncate">
                      Hello, {user?.first_name}.
                    </h3>
                    {user.role === "trainer" && (
                      <span className="px-3 py-0.5 bg-tertiary/10 text-tertiary hover:bg-tertiary/30 rounded-full text-xs">
                        Trainer
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                {user?.corporate ? (
                  <div className="text-sm truncate hidden lg:block">
                    {user?.corporate.name} - {user?.corporate?.location}
                  </div>
                ) : (
                  <div className="text-sm truncate hidden lg:block">
                    {user?.email}
                  </div>
                )}
                {user?.subscription && (
                  <Link
                    href="/compte/plans"
                    className="text-sm inline-block whitespace-nowrap"
                  >
                    Abonnement: {user?.subscription?.plan?.name} {"("}
                    {user?.subscription?.days_remaining} Jours{")"}
                  </Link>
                )}
                {!user?.subscription && user?.role === "client" && (
                  <div className="py-1 text-sm rounded-full whitespace-nowrap self-start sm:self-auto">
                    Plan: Mode gratuit
                  </div>
                )}
              </div>
            </div>
            <div className="w-full sm:w-auto lg:block md:block hidden">
              <Button onClick={handleLogout} variant="danger">
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
      {navigation.length > 0 && (
        <div className="bg-gray-800 pt-2 text-white mb-2">
          <div className="mx-auto max-w-5xl px-4 lg:px-0 md:px-6 flex flex-col sm:flex-row gap-3 sm:gap-0">
            <ul className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              {navigation.map((item, idx) => (
                <li key={idx}>
                  {item.show ? (
                    <Link
                      href={item.href}
                      className={`text-sm py-1.5 px-2.5 border-b-4 transition-colors flex items-center gap-1.5 ${
                        isActive(item.href)
                          ? "border-tertiary bg-tertiary/10"
                          : "border-none"
                      }`}
                    >
                      {item.icon && <Icon name={item.icon} size={16} />}
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-200/70 flex items-center gap-1.5">
                      {item.icon && <Icon name={item.icon} size={16} />}
                      {item.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
