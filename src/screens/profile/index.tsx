"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneNumberInput from "@/components/ui/phone-input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Shield,
  Monitor,
  Smartphone,
  Tablet,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { authService, DeviceInfo } from "@/services/auth";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function ProfileScreen() {
  const { user, updateProfile, isLoading } = useAuth();
  const { trackClick } = useActivityTracker();

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Device management state
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null);

  // Load devices
  const loadDevices = async () => {
    try {
      setDevicesLoading(true);
      const data = await authService.getMyDevices();
      setDevices(data);
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === "client" || user.role === "trainer")) {
      loadDevices();
    }
  }, [user]);

  const handleRemoveDevice = async (deviceId: string) => {
    const currentDeviceId = localStorage.getItem("device_id");
    if (deviceId === currentDeviceId) {
      toast.error("Vous ne pouvez pas supprimer l'appareil actuel");
      return;
    }
    trackClick({ label: "Supprimer appareil", metadata: { deviceId } });
    try {
      setRemovingDeviceId(deviceId);
      await authService.removeDevice(deviceId);
      toast.success("Appareil supprimé");
      loadDevices();
    } catch (error) {
      toast.error("Échec de la suppression de l'appareil");
    } finally {
      setRemovingDeviceId(null);
    }
  };

  const handleLogoutAllDevices = async () => {
    trackClick({ label: "Déconnecter tous les appareils" });
    try {
      await authService.logoutAllDevices();
      toast.success("Déconnexion de tous les appareils réussie");
    } catch (error) {
      toast.error("Échec de la déconnexion");
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-muted-foreground" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-muted-foreground" />;
      case "desktop":
        return <Monitor className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Monitor className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      // Ensure phone number has + prefix for E.164 format
      const userPhone = user.phone || "";
      setPhone(userPhone.startsWith("+") ? userPhone : `+${userPhone}`);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    trackClick({ action: "form_submitted", label: "Mise à jour profil" });

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
      });
    } catch (error) {
      // Error handled in auth context
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "agent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatRole = (role: string) => {
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-3xl text-gray-900">My Profile</h1>
        <div className="text-gray-500 mt-1">
          Manage your account settings and preferences
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <div className="p-2 space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getRoleBadgeColor(user?.role || "")}`}>
                  {formatRole(user?.role || "")}
                </Badge>
                <Badge
                  variant={user?.status === "active" ? "default" : "secondary"}
                >
                  {user?.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings Card */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneNumberInput
                value={phone}
                onChange={(value) => setPhone(value || "")}
                placeholder="+243 XXX XXX XXX"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
      {/* Device Management Card - only for clients and trainers */}
      {user && (user.role === "client" || user.role === "trainer") && (
        <Card className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Mes appareils</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vous pouvez utiliser jusqu&apos;a 3 appareils. Un seul
                  appareil peut etre actif a la fois.
                </p>
              </div>
              {devices.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogoutAllDevices}
                >
                  Tout deconnecter
                </Button>
              )}
            </div>

            <Separator />

            {devicesLoading ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Chargement des appareils...
              </div>
            ) : devices.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">
                Aucun appareil enregistre
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => {
                  const currentDeviceId =
                    typeof window !== "undefined"
                      ? localStorage.getItem("device_id")
                      : null;
                  const isCurrentDevice = device.deviceId === currentDeviceId;

                  return (
                    <div
                      key={device.deviceId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {device.deviceName}
                            </span>
                            {isCurrentDevice && (
                              <Badge variant="default" className="text-xs">
                                Cet appareil
                              </Badge>
                            )}
                            {device.isActive && (
                              <Badge
                                variant="outline"
                                className="text-xs text-green-600 border-green-300"
                              >
                                Actif
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {/* {device.ipAddress && (
                              <span>IP: {device.ipAddress} &middot; </span>
                            )} */}
                            Derniere activite:{" "}
                            {new Date(device.lastActivityAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                      {!isCurrentDevice && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDevice(device.deviceId)}
                          disabled={removingDeviceId === device.deviceId}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
