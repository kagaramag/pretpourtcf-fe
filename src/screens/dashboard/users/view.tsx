"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabPanel } from "@/components/molecules/Tabs";
import { Table, Column } from "@/components/ui/table";
import { Icon } from "@/icons";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState("subscriptions");
  const queryClient = useQueryClient();

  // Fetch user details from backend
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });

  const user = userData?.data?.user;
  const practiceHistory = userData?.data?.practiceHistory;
  const subscriptions = userData?.data?.subscriptions || [];
  const devices = userData?.data?.devices || [];

  const terminateDeviceMutation = useMutation({
    mutationFn: (deviceId: string) =>
      userService.terminateDevice(userId, deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("Session terminée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la terminaison"
      );
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      case "super_admin":
        return "bg-green-100 text-green-800";
      case "trainer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "client":
        return "Client";
      case "super_admin":
        return "Super Admin";
      case "trainer":
        return "Formateur";
      default:
        return role;
    }
  };

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "cancelled":
        return "Annulé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const getPracticeStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPracticeStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in_progress":
        return "En cours";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "listening":
        return "bg-blue-100 text-blue-800";
      case "reading":
        return "bg-purple-100 text-purple-800";
      case "writing":
        return "bg-pink-100 text-pink-800";
      case "speaking":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "listening":
        return "CO";
      case "reading":
        return "CE";
      case "writing":
        return "EE";
      case "speaking":
        return "EO";
      default:
        return type;
    }
  };

  const subscriptionColumns: Column<any>[] = [
    {
      key: "plan",
      header: "Plan",
      render: (sub: any, index?: number) => (
        <div className="truncate">
          {sub.plan?.name || "N/A"}
          {"-"}
          {getSubscriptionStatusLabel(sub.status)}
          {index === 0 && sub.status === "active" && (
            <span>
              ss<Badge className="bg-blue-100 text-blue-800">Actuel</Badge>
            </span>
          )}
        </div>
      ),
    },
    {
      key: "start_date",
      header: "Date de début",
      render: (sub: any) => format(new Date(sub.start_date), "dd MMM yyyy"),
      visibleOn: ["md", "lg"],
    },
    {
      key: "end_date",
      header: "Date de fin",
      render: (sub: any) => format(new Date(sub.end_date), "dd MMM yyyy"),
      visibleOn: ["md", "lg"],
    },
    {
      key: "days_remaining",
      header: "Jours restants",
      render: (sub: any) => `${sub.days_remaining} jours`,
      visibleOn: ["lg"],
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (sub: any) => format(new Date(sub.createdAt), "dd MMM yyyy"),
      visibleOn: ["lg"],
    },
  ];

  const practiceColumns: Column<any>[] = [
    {
      key: "title",
      header: "Exercice",
      render: (session: any) => {
        const practice =
          typeof session.practiceId === "object" ? session.practiceId : null;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {practice?.type && getTypeLabel(practice.type)}:{" "}
            {practice?.title || "N/A"}
          </div>
        );
      },
    },
    {
      key: "score",
      header: "Score",
      width: "w-22",
      render: (session: any) => (
        <span>
          {session.totalScore}/{session.maxPossibleScore}
        </span>
      ),
      visibleOn: ["md", "lg"],
    },
    {
      key: "percentage",
      header: "%",
      width: "w-14",
      render: (session: any) => <span>{session.percentageScore}%</span>,
      visibleOn: ["md", "lg"],
    },
    {
      key: "duration",
      header: "Durée",
      width: "w-22",
      render: (session: any) => (
        <span>{Math.floor(session.timeElapsedSeconds / 60)} min</span>
      ),
      visibleOn: ["lg"],
    },
    {
      key: "status",
      header: "Status",
      width: "w-24",
      render: (session: any) => {
        const practice =
          typeof session.practiceId === "object" ? session.practiceId : null;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getPracticeStatusBadge(session.status)}>
              {getPracticeStatusLabel(session.status)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      width: "w-36",
      render: (session: any) =>
        format(new Date(session.startedAt), "MMM dd, yyyy"),
      visibleOn: ["md", "lg"],
    },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return "smartphone";
      case "desktop":
        return "monitor";
      case "tablet":
        return "tablet";
      default:
        return "laptop";
    }
  };

  const deviceColumns: Column<any>[] = [
    {
      key: "device",
      header: "Appareil",
      render: (device: any) => (
        <div className="flex items-center gap-3">
          <Icon
            name={getDeviceIcon(device.deviceType) as any}
            size={20}
            className="text-gray-500"
          />
          <div>
            <p className="font-medium">{device.deviceName}</p>
            <p className="text-xs text-gray-400">{device.deviceType}</p>
          </div>
        </div>
      ),
    },
    {
      key: "ipAddress",
      header: "Adresse IP",
      render: (device: any) => device.ipAddress || "N/A",
      visibleOn: ["md", "lg"],
    },
    {
      key: "status",
      header: "Statut",
      render: (device: any) => (
        <Badge
          className={
            device.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {device.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "loginAt",
      header: "Connexion",
      render: (device: any) =>
        device.loginAt
          ? format(new Date(device.loginAt), "dd MMM yyyy 'à' HH:mm")
          : "N/A",
      visibleOn: ["md", "lg"],
    },
    {
      key: "lastActivityAt",
      header: "Dernière activité",
      render: (device: any) =>
        device.lastActivityAt
          ? format(new Date(device.lastActivityAt), "dd MMM yyyy 'à' HH:mm")
          : "N/A",
      visibleOn: ["lg"],
    },
    {
      key: "actions",
      header: "",
      width: "w-24",
      render: (device: any) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => terminateDeviceMutation.mutate(device.deviceId)}
          disabled={terminateDeviceMutation.isPending}
        >
          Terminer
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-border p-12 text-center">
            <Icon
              name="user"
              size={48}
              className="text-gray-400 mx-auto mb-4"
            />
            <p className="text-gray-500 mb-4">
              {error
                ? "Erreur lors du chargement de l'utilisateur"
                : "Utilisateur non trouvé"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/users")}
              variant="secondary"
              icon="arrowLeft"
              iconOnly
            >
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:px-8 relative">
      <div className="flex items-center gap-4 absolute left-6 top-6">
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/users")}
          icon="arrowLeft"
          iconOnly
        >
          Retour
        </Button>
      </div>
      <div className="max-w-4xl mx-auto space-y-3">
        {/* User Profile */}
        <div className="bg-white rounded-lg border border-border lg:p-6 p-2">
          <div className="flex items-start lg:gap-4 gap-2">
            <div className="h-16 w-16 rounded-full bg-tertiary flex items-center justify-center text-black lg:text-2xl text-md lg:font-bold">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <h1 className="text-2xl font-semibold">
                  {user.first_name} {user.last_name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    className={
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {user.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge className={getRoleBadge(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
              <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-6 gap-2">
                <div>
                  <h5 className="text-sm text-gray-500">Email</h5>
                  <div className="flex items-center gap-2">
                    <Icon name="email" size={16} className="text-gray-400" />
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm text-gray-500">Date de création</h5>
                  <div className="flex items-center gap-2">
                    <Icon name="calendar" size={16} className="text-gray-400" />
                    <p className="text-sm">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "dd MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <h5 className="text-sm text-gray-500">
                      Dernière connexion
                    </h5>
                    <div className="flex items-center gap-2">
                      <Icon
                        name="calendar"
                        size={16}
                        className="text-gray-400"
                      />
                      <p className="text-sm">
                        {format(
                          new Date(user.lastLoginAt),
                          "dd MMM yyyy 'à' HH:mm"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Subscriptions and Practice History */}
        <Tabs
          tabs={[
            {
              id: "subscriptions",
              label: `Abonnements${subscriptions?.length > 0 ? ` (${subscriptions.length})` : ""}`,
            },
            ...(user.role === "client"
              ? [
                  {
                    id: "practice",
                    label: `Practice history${practiceHistory && practiceHistory.length > 0 ? ` (${practiceHistory.length})` : ""}`,
                  },
                ]
              : []),
            {
              id: "devices",
              label: `Devices${devices.length > 0 ? ` (${devices.length})` : ""}`,
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="w-full"
          variant="underline"
        />

        {/* Subscriptions Tab Content */}
        <TabPanel id="subscriptions" activeTab={activeTab} className="lg:mt-6">
          <Table
            data={subscriptions}
            columns={subscriptionColumns}
            keyExtractor={(sub: any) => sub.id}
            emptyComponent={
              <div className="text-center py-8 text-gray-500">
                <Icon
                  name="calendar"
                  size={48}
                  className="mx-auto mb-3 text-gray-400"
                />
                <p>Aucun abonnement enregistré</p>
              </div>
            }
            hoverable
          />
        </TabPanel>

        {/* Practice History Tab Content (for clients only) */}
        {user.role === "client" && (
          <TabPanel id="practice" activeTab={activeTab} className="lg:mt-6">
            <Table
              data={practiceHistory || []}
              columns={practiceColumns}
              striped
              keyExtractor={(session: any) => session._id}
              emptyComponent={
                <div className="text-center py-8 text-gray-500">
                  <Icon
                    name="read"
                    size={48}
                    className="mx-auto mb-3 text-gray-400"
                  />
                  <p>Aucune pratique enregistrée pour le moment</p>
                </div>
              }
              hoverable
            />
          </TabPanel>
        )}
        {/* Devices Tab Content */}
        <TabPanel id="devices" activeTab={activeTab} className="lg:mt-6">
          <Table
            data={devices}
            columns={deviceColumns}
            keyExtractor={(device: any) => device.deviceId}
            emptyComponent={
              <div className="text-center py-8 text-gray-500">
                <Icon
                  name="smartphone"
                  size={48}
                  className="mx-auto mb-3 text-gray-400"
                />
                <p>Aucun appareil connecté</p>
              </div>
            }
            hoverable
          />
        </TabPanel>
      </div>
    </div>
  );
}
