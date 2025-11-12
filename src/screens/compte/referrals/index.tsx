"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Users, Check, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { referralService, Referral } from "@/services/referral";
import { formatDate } from "@/lib/utils";

export default function ReferralsScreen() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
  const [acceptedReferrals, setAcceptedReferrals] = useState<Referral[]>([]);
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    fetchReferrals();
  }, [currentTab, search]);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const status = currentTab === "all" ? undefined : (currentTab as "pending" | "accepted" | "expired");

      const response = await referralService.getAllReferrals({
        page: 1,
        limit: 1000,
        status,
        search: search || undefined,
      });

      setReferrals(response.referrals);
      setPendingReferrals(
        response.referrals.filter((r) => r.status === "pending")
      );
      setAcceptedReferrals(
        response.referrals.filter((r) => r.status === "accepted")
      );
    } catch (error: any) {
      // Don't show error toast if it's just empty results
      // Only show error if there's an actual server/network error
      if (error?.response?.status && error.response.status >= 500) {
        toast.error("Erreur lors du chargement des parrainages");
      }
      // For other cases (404, empty, etc.), just set empty arrays
      setReferrals([]);
      setPendingReferrals([]);
      setAcceptedReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" />
            Accepté
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Expiré
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReferralsForTab = () => {
    switch (currentTab) {
      case "accepted":
        return acceptedReferrals;
      case "pending":
        return pendingReferrals;
      default:
        return referrals;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Parrainages</h1>
        <p className="text-muted-foreground mt-2">
          Gérer tous les parrainages de la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Tous les parrainages
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">{acceptedReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs qui ont rejoint
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">{pendingReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Invitations non acceptées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des parrainages
          </CardTitle>
            Tous les parrainages de la plateforme
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Tous ({referrals.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Acceptés ({acceptedReferrals.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({pendingReferrals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-4">
              <ReferralsTable
                referrals={getReferralsForTab()}
                isLoading={isLoading}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Separate table component
function ReferralsTable({
  referrals,
  isLoading,
  getStatusBadge,
}: {
  referrals: Referral[];
  isLoading: boolean;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun parrainage trouvé
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parrain</TableHead>
            <TableHead>Email invité</TableHead>
            <TableHead>Invité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d'invitation</TableHead>
            <TableHead>Date d'acceptation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {referral.referrer.first_name} {referral.referrer.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {referral.referrer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {referral.inviteeEmail}
              </TableCell>
              <TableCell>
                {referral.invitee ? (
                  <div>
                    <div className="font-medium">
                      {referral.invitee.first_name} {referral.invitee.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {referral.invitee.email}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(referral.status)}</TableCell>
              <TableCell>
                {formatDate(new Date(referral.createdAt))}
              </TableCell>
              <TableCell>
                {referral.acceptedAt
                  ? formatDate(new Date(referral.acceptedAt))
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
