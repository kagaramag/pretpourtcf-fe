"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Tag,
  Trash2,
  Edit,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import { promoCodeService } from "@/services/promo-code";
import { toast } from "sonner";
import { PromoCode } from "@/types/promo-code";
import CreatePromoCodeDialog from "./create-promo-code-dialog";

function PromoCodesScreenContent() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(
    null
  );

  // Fetch promo codes
  const { data, isLoading, error } = useQuery({
    queryKey: ["promo-codes", statusFilter],
    queryFn: () =>
      promoCodeService.getAllPromoCodes({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const promoCodes = data?.promo_codes || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoCodeService.deletePromoCode(id),
    onSuccess: () => {
      toast.success("Code promo supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      setDeleteDialogOpen(false);
      setSelectedPromoCode(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Échec de la suppression du code promo"
      );
    },
  });

  const handleDelete = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPromoCode) {
      deleteMutation.mutate(selectedPromoCode.id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (promoCode: PromoCode) => {
    const now = new Date();
    return (
      promoCode.status === "active" &&
      new Date(promoCode.start_date) <= now &&
      new Date(promoCode.end_date) >= now
    );
  };

  const getUsagePercentage = (promoCode: PromoCode) => {
    if (!promoCode.max_uses) return null;
    return Math.round((promoCode.current_uses / promoCode.max_uses) * 100);
  };

  if (error) {
    toast.error("Failed to load promo codes");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Codes Promo</h1>
          <p className="text-muted-foreground mt-1">
            Gérer les codes promotionnels et les réductions
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un code promo
            </Button>
          </DialogTrigger>
          <CreatePromoCodeDialog onClose={() => setCreateDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{promoCodes.length}</p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {promoCodes.filter((pc) => isActive(pc)).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirés</p>
                <p className="text-2xl font-bold text-red-600">
                  {promoCodes.filter((pc) => isExpired(pc.end_date)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilisations</p>
                <p className="text-2xl font-bold">
                  {promoCodes.reduce((acc, pc) => acc + pc.current_uses, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Liste des codes promo</CardTitle>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Réduction</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Utilisations</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow key="loading">
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-muted-foreground">
                      Chargement des codes promo...
                    </p>
                  </TableCell>
                </TableRow>
              ) : promoCodes.length === 0 ? (
                <TableRow key="empty">
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Aucun code promo trouvé
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promoCode, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-semibold">
                          {promoCode.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">
                          {promoCode.description || "—"}
                        </p>
                        {promoCode.applicable_plans &&
                          promoCode.applicable_plans.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {promoCode.applicable_plans.length} plan(s)
                              spécifique(s)
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {promoCode.discount_percentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(promoCode.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>→</span>
                          <span>{formatDate(promoCode.end_date)}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {promoCode.current_uses}
                          {promoCode.max_uses && ` / ${promoCode.max_uses}`}
                        </div>
                        {promoCode.max_uses && (
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{
                                  width: `${getUsagePercentage(promoCode)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {getUsagePercentage(promoCode)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(promoCode.status)}>
                        {promoCode.status === "active" && "Actif"}
                        {promoCode.status === "inactive" && "Inactif"}
                        {promoCode.status === "expired" && "Expiré"}
                      </Badge>
                      {isExpired(promoCode.end_date) &&
                        promoCode.status === "active" && (
                          <Badge className="ml-2 bg-orange-100 text-orange-800">
                            Date dépassée
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promoCode)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le code promo{" "}
              <span className="font-semibold">{selectedPromoCode?.code}</span>?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PromoCodesScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PromoCodesScreenContent />
    </Suspense>
  );
}
