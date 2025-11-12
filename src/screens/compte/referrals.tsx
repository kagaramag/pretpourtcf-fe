"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Mail, UserPlus, Users, Check, Clock, X, Copy, Loader2 } from "lucide-react";
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
            <X className="h-3 w-3 mr-1" />
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
        <h1 className="text-3xl font-bold">Parrainages</h1>
        <p className="text-muted-foreground mt-2">
          Invitez vos amis à rejoindre la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardTitle className="text-sm font-medium">
              Invitations acceptées
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">{acceptedReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs qui ont rejoint grâce à vous
            </p>
          </CardContent>
        </Card>

        <Card>
            <CardTitle className="text-sm font-medium">
              Invitations en attente
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          <CardContent>
            <div className="text-2xl font-bold">{pendingReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Invitations envoyées non acceptées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Send Invitation Form */}
      <Card>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer une invitation
          </CardTitle>
            Entrez l'adresse e-mail de la personne que vous souhaitez inviter
        <CardContent>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes parrainages
          </CardTitle>
            Liste de toutes vos invitations
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
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

            <TabsContent value="all">
              <ReferralsTable
                referrals={referrals}
                isLoading={isLoading}
                getStatusBadge={getStatusBadge}
                copyReferralLink={copyReferralLink}
              />
            </TabsContent>

            <TabsContent value="accepted">
              <ReferralsTable
                referrals={acceptedReferrals}
                isLoading={isLoading}
                getStatusBadge={getStatusBadge}
                copyReferralLink={copyReferralLink}
              />
            </TabsContent>

            <TabsContent value="pending">
              <ReferralsTable
                referrals={pendingReferrals}
                isLoading={isLoading}
                getStatusBadge={getStatusBadge}
                copyReferralLink={copyReferralLink}
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
  copyReferralLink,
}: {
  referrals: Referral[];
  isLoading: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  copyReferralLink: (token: string) => void;
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
        Aucun parrainage pour le moment
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email invité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d'invitation</TableHead>
            <TableHead>Date d'acceptation</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell className="font-medium">
                {referral.invitee ? (
                  <div>
                    <div className="font-medium">
                      {referral.invitee.first_name} {referral.invitee.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {referral.inviteeEmail}
                    </div>
                  </div>
                ) : (
                  referral.inviteeEmail
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
              <TableCell className="text-right">
                {referral.status === "pending" && referral.token && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyReferralLink(referral.token!)}
                    title="Copier le lien d'invitation"
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
