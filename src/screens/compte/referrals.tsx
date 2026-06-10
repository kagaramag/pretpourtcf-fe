"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, Column } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabPanel } from "@/components/molecules/Tabs";
import { Email, Check, Clock, Close, Loading, Copy, UserPlus, UserGroup } from "@/icons";
import { toast } from "sonner";
import { referralService, Referral } from "@/services/referral";
import { formatDate } from "@/lib/utils";

export function ReferralsScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
  const [acceptedReferrals, setAcceptedReferrals] = useState<Referral[]>([]);
  const [activeReferralTab, setActiveReferralTab] = useState("all");

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const response = await referralService.getUserReferrals({
        page: 1,
        limit: 100,
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

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Veuillez entrer une adresse e-mail");
      return;
    }

    try {
      setIsSending(true);
      const response = await referralService.sendInvitation(email);

      if (response.success) {
        toast.success(response.message);
        setEmail("");
        fetchReferrals(); // Refresh the list
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de l'envoi de l'invitation";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const copyReferralLink = (token: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/signup?ref=${token}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Lien copié dans le presse-papiers!");
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
            <Close className="h-3 w-3 mr-1" />
            Expiré
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl">Parrainages</h1>
        <p className="text-gray-600 mt-2">
          Invitez vos amis à rejoindre la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-sm">
            Invitations acceptées
          </h3>
          <UserPlus className="h-4 w-4 text-gray-600" />
          <div>
            <div className="text-2xl">{acceptedReferrals.length}</div>
            <p className="text-xs text-gray-600">
              Utilisateurs qui ont rejoint grâce à vous
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-sm">
            Invitations en attente
          </h3>
          <Clock className="h-4 w-4 text-gray-600" />
          <div>
            <div className="text-2xl font-bold">{pendingReferrals.length}</div>
            <p className="text-xs text-gray-600">
              Invitations envoyées non acceptées
            </p>
          </div>
        </Card>
      </div>

      {/* Send Invitation Form */}
      <Card>
        <h4 className="flex items-center gap-2">
          <Email className="h-5 w-5" />
          Envoyer une invitation
        </h4>
        <div className="text-gray-600 text-sm">
          Entrez l'adresse e-mail de la personne que vous souhaitez inviter
        </div>
        <div>
          <form onSubmit={handleSendInvitation} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSending}
              />
            </div>
            <Button type="submit" disabled={isSending}>
              {isSending ? (
                <>
                  <Loading className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Email className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Referrals List */}
      <Card>
        <h4 className="flex items-center gap-2">
          <UserGroup className="h-5 w-5" />
          Mes parrainages
        </h4>
        <div className="text-gray-600 text-sm">
          Liste de toutes vos invitations
        </div>
        <div>
          <Tabs
            tabs={[
              { id: "all", label: `Tous (${referrals.length})` },
              { id: "accepted", label: `Acceptés (${acceptedReferrals.length})` },
              { id: "pending", label: `En attente (${pendingReferrals.length})` },
            ]}
            className="w-full"
            onTabChange={(tabId) => setActiveReferralTab(tabId)}
          />

          <TabPanel id="all" activeTab={activeReferralTab}>
            <ReferralsTable
              referrals={referrals}
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              copyReferralLink={copyReferralLink}
            />
          </TabPanel>

          <TabPanel id="accepted" activeTab={activeReferralTab}>
            <ReferralsTable
              referrals={acceptedReferrals}
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              copyReferralLink={copyReferralLink}
            />
          </TabPanel>

          <TabPanel id="pending" activeTab={activeReferralTab}>
            <ReferralsTable
              referrals={pendingReferrals}
              isLoading={isLoading}
              getStatusBadge={getStatusBadge}
              copyReferralLink={copyReferralLink}
            />
          </TabPanel>
        </div>
      </Card>
    </div>
  );
}

// Separate table component
function ReferralsTable({
  referrals,
  isLoading,
  getStatusBadge,
  copyReferralLink,
}: {
  referrals: Referral[];
  isLoading: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  copyReferralLink: (token: string) => void;
}) {
  const columns: Column<Referral>[] = [
    {
      key: "inviteeEmail",
      header: "Email invité",
      render: (referral) =>
        referral.invitee ? (
          <div>
            <div className="font-medium">
              {referral.invitee.first_name} {referral.invitee.last_name}
            </div>
            <div className="text-sm text-gray-600">
              {referral.inviteeEmail}
            </div>
          </div>
        ) : (
          <span>{referral.inviteeEmail}</span>
        ),
    },
    {
      key: "status",
      header: "Statut",
      render: (referral) => getStatusBadge(referral.status),
    },
    {
      key: "createdAt",
      header: "Date d'invitation",
      render: (referral) => (
        <span>{formatDate(new Date(referral.createdAt))}</span>
      ),
    },
    {
      key: "acceptedAt",
      header: "Date d'acceptation",
      render: (referral) => (
        <span>
          {referral.acceptedAt
            ? formatDate(new Date(referral.acceptedAt))
            : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (referral) =>
        referral.status === "pending" && referral.token ? (
          <div className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyReferralLink(referral.token!)}
              title="Copier le lien d'invitation"
            >
              <Copy className="h-4 w-4" />
              Copier le lien
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <Table
      data={referrals}
      columns={columns}
      keyExtractor={(r) => r.id}
      isLoading={isLoading}
      emptyMessage="Aucun parrainage pour le moment"
    />
  );
}
