"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Users,
  Check,
  Clock,
  X,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { referralService, Referral } from "@/services/referral";
import { formatDate } from "@/lib/utils";

export default function ApprenantScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pendingReferrals, setPendingReferrals] = useState<Referral[]>([]);
  const [acceptedReferrals, setAcceptedReferrals] = useState<Referral[]>([]);
  const [currentTab, setCurrentTab] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, [currentTab]);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const status =
        currentTab === "all"
          ? undefined
          : (currentTab as "pending" | "accepted" | "expired");

      // Fetch only the logged-in user's referrals
      const response = await referralService.getUserReferrals({
        page: 1,
        limit: 1000,
        status,
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
        toast.error("Erreur lors du chargement des apprenants");
      }
      // For other cases (404, empty, etc.), just set empty arrays
      setReferrals([]);
      setPendingReferrals([]);
      setAcceptedReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteApprenant = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    try {
      setIsInviting(true);
      const response = await referralService.sendInvitation(inviteEmail);

      if (response.success) {
        toast.success(response.message || "Invitation envoyée avec succès!");
        setInviteEmail("");
        setIsInviteModalOpen(false);
        // Refresh the list
        fetchReferrals();
      } else {
        toast.error(
          response.message || "Erreur lors de l'envoi de l'invitation"
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de l'envoi de l'invitation";
      toast.error(errorMessage);
    } finally {
      setIsInviting(false);
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
      <div className="flex items-center">
        <h1 className="text-3xl font-bold flex-1">Mes Apprenants</h1>
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un apprenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Inviter un nouvel apprenant</DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email à un nouvel apprenant pour
                qu'il rejoigne la plateforme.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div className="col-span-3 relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="apprenant@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isInviting) {
                        handleInviteApprenant();
                      }
                    }}
                    className="pl-8"
                    disabled={isInviting}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteEmail("");
                }}
                disabled={isInviting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleInviteApprenant}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer l'invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border p-3 flex items-center">
          <div className="text-sm font-medium flex-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>Total des invitations</div>
          </div>
          <div className="text-2xl font-bold">{referrals.length}</div>
        </div>
        <div className="border p-3 flex items-center">
          <div className="text-sm font-medium flex-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>En attente</div>
          </div>
          <div className="text-2xl font-bold">{pendingReferrals.length}</div>
        </div>
        <div className="border p-3 flex items-center">
          <div className="text-sm font-medium flex-1">
            <Check className="h-4 w-4 text-green-500" />
            <div>Acceptées</div>
          </div>
          <div className="text-2xl font-bold">{acceptedReferrals.length}</div>
        </div>
      </div>

      {/* Referrals List */}
      <div>
        <ReferralsTable
          referrals={getReferralsForTab()}
          isLoading={isLoading}
          getStatusBadge={getStatusBadge}
        />
      </div>
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
      <div className="text-center py-12 text-muted-foreground">
        <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium mb-2">Aucun apprenant invité</p>
        <p className="text-sm">
          Commencez par inviter des apprenants en utilisant le bouton ci-dessus
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date d'invitation</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>
                {referral.invitee ? (
                  <div>
                    <div className="font-medium">
                      {referral.invitee.first_name} {referral.invitee.last_name}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">
                    Non inscrit
                  </span>
                )}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {referral.inviteeEmail}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(referral.status)}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(new Date(referral.createdAt))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {referral.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Copy invitation link or resend invitation
                      toast.info(
                        "Fonctionnalité de renvoi d'invitation à venir"
                      );
                    }}
                  >
                    <Send className="h-4 w-4" />
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
