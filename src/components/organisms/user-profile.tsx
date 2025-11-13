import { useAuth } from "@/contexts/auth-context";
import { User } from "lucide-react";
import { Button } from "../ui/button";

export default function ProfileCard({ isOpen = true, onClose }: any) {
  const { user, isLoading, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <div className="py-4 bg-gray-100/50 mb-2 border-b border-gray-200">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2">
          <div className="w-20 h-20 border bg-white rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">
              {user?.last_name} {user?.last_name}
            </h3>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
          <div className="">
            <Button onClick={handleLogout}
            size={"sm"}
            variant={"ghost"}

            >Se déconnecter</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
