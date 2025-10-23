"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  // Fetch user details
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUserById(userId),
  });

  const user = userData?.data?.user;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "client":
        return "bg-blue-100 text-blue-800";
      case "super_admin":
        return "bg-green-100 text-green-800";
      default:
        return "";
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
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Utilisateur non trouvé</p>
              <Button
                onClick={() => router.push("dashboard/users")}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux utilisateurs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
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
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{user.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Rôle</p>
                <Badge className={getRoleBadge(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Date de création
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Client location info removed - not applicable */}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Locations removed - not applicable for client users */}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historique des paiements enregistrés</CardTitle>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="paid">Payé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="overdue">En retard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {payments.length === 0
                    ? "Aucun paiement enregistré"
                    : "Aucun paiement ne correspond aux filtres sélectionnés"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const client =
                        typeof payment.client === "object"
                          ? payment.client
                          : null;

                      return (
                        <TableRow key={payment._id}>
                          <TableCell className="font-mono text-sm">
                            {payment.ref}
                          </TableCell>
                          <TableCell>
                            {client ? (
                              <button
                                onClick={() =>
                                  router.push(`/clients/${client._id}`)
                                }
                                className="text-left hover:underline focus:outline-none"
                              >
                                <div className="font-medium text-blue-600 hover:text-blue-800">
                                  {client.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {client.code}
                                </div>
                              </button>
                            ) : (
                              <div>
                                <div className="font-medium">N/A</div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatMonth(payment.month, payment.year)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(payment.rate)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {format(
                              new Date(payment.createdAt),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
