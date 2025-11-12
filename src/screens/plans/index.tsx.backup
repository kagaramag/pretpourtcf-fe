"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Crown, Check, X } from "lucide-react";
import { planService, SubscriptionPlan } from "@/services/plan";

export function PlansScreen() {
  // Fetch all plans (admin endpoint - includes inactive)
  const { data, isLoading } = useQuery({
    queryKey: ["plans-admin"],
    queryFn: async () => {
      const response = await planService.getAllPlansAdmin();
      return response.data.plans;
    },
  });

  const getPlanTypeBadge = (type: string) => {
    switch (type) {
      case "premium":
        return <Badge className="bg-purple-500">Premium</Badge>;
      case "trial":
        return <Badge className="bg-blue-500">Essai</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const plans = data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plans d'abonnement</h1>
        <p className="text-muted-foreground">
          Liste de tous les plans d'abonnement disponibles
        </p>
      </div>

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Crown className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun plan disponible
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Populaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans && plans.map((plan) => (
                    <TableRow key={plan._id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{getPlanTypeBadge(plan.type)}</TableCell>
                      <TableCell>{plan.duration_days} jours</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ${plan.price}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {plan.details.co > 0 && (
                            <div>
                              <span className="text-muted-foreground">CO:</span>{" "}
                              {plan.details.co}
                            </div>
                          )}
                          {plan.details.ce > 0 && (
                            <div>
                              <span className="text-muted-foreground">CE:</span>{" "}
                              {plan.details.ce}
                            </div>
                          )}
                          {plan.details.eo > 0 && (
                            <div>
                              <span className="text-muted-foreground">EO:</span>{" "}
                              {plan.details.eo}
                            </div>
                          )}
                          {plan.details.ee > 0 && (
                            <div>
                              <span className="text-muted-foreground">EE:</span>{" "}
                              {plan.details.ee}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {plan.details.correction && (
                              <Badge variant="secondary" className="text-xs">
                                Correction
                              </Badge>
                            )}
                            {plan.details.streak && (
                              <Badge variant="secondary" className="text-xs">
                                Streak
                              </Badge>
                            )}
                            {plan.details.history && (
                              <Badge variant="secondary" className="text-xs">
                                Historique
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="h-3 w-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.popular ? (
                          <Badge className="bg-orange-500">
                            <Crown className="h-3 w-3 mr-1" />
                            Populaire
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
