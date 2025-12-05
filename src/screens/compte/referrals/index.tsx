"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
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
import {
  Search,
  UserPlus,
  Users,
  Check,
  Clock,
  X,
  Loader2,
} from "lucide-react";
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
      const status =
        currentTab === "all"
          ? undefined
          : (currentTab as "pending" | "accepted" | "expired");

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
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Parrainages</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-2 md:grid-cols-3">
        <Card>
          <h5 className="text-sm font-medium">Total</h5>
          <div>
            <div className="text-2xl font-bold">{referrals.length}</div>
            <p className="text-xs">Tous les parrainages</p>
          </div>
        </Card>

        <Card>
          <h5 className="text-sm font-medium">Acceptés</h5>
          <div>
            <div className="text-2xl font-bold">{acceptedReferrals.length}</div>
            <p className="text-xs">Utilisateurs qui ont rejoint</p>
          </div>
        </Card>

        <Card>
          <h5 className="text-sm font-medium">En attente</h5>
          <div>
            <div className="text-2xl font-bold">{pendingReferrals.length}</div>
            <p className="text-xs">Invitations non acceptées</p>
          </div>
        </Card>
      </div>

      {/* Referrals List */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedReferrals.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingReferrals.length})
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
    <div>
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
              <TableCell>{formatDate(new Date(referral.createdAt))}</TableCell>
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
