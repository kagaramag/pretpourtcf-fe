"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/table";
import { Edit } from "@/icons";
import { planService, SubscriptionPlan } from "@/services/plan";

interface FormationTabProps {
  onEditPlan: (plan: SubscriptionPlan) => void;
}

export function FormationTab({ onEditPlan }: FormationTabProps) {
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans-admin", "training"],
    queryFn: async () => {
      const response = await planService.getAllPlansAdmin("training");
      return response.data.plans;
    },
  });

  const plans = plansData || [];

  const getPlanTypeBadge = (type: string) => {
    switch (type) {
      case "premium":
        return <Badge variant="secondary">Premium</Badge>;
      case "trial":
        return <Badge variant="secondary">Essai</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const trainingColumns: Column<SubscriptionPlan>[] = [
    {
      key: "name",
      header: "Nom",
      render: (plan) => <span>{plan.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (plan) => getPlanTypeBadge(plan.type),
    },
    {
      key: "price_rwf",
      header: "Prix",
      render: (plan) => (
        <div className="text-sm">
          <span>{plan.price_rwf?.toLocaleString()} RWF</span>
          <span className="text-muted-foreground ml-1">/ ${plan.price_usd}</span>
        </div>
      ),
    },
    {
      key: "sessions",
      header: "Séances",
      render: (plan) => (
        <span>{plan.training_details?.sessions || 0} séances</span>
      ),
    },
    {
      key: "duration",
      header: "Durée",
      render: (plan) => (
        <span>{plan.training_details?.duration_days || 0} jours</span>
      ),
    },
    {
      key: "is_active",
      header: "Statut",
      render: (plan) =>
        plan.is_active ? (
          <Badge variant="secondary">Actif</Badge>
        ) : (
          <Badge variant="secondary">Inactif</Badge>
        ),
    },
    {
      key: "popular",
      header: "Populaire",
      render: (plan) =>
        plan.popular ? (
          <Badge variant="secondary">Populaire</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (plan) => (
        <Button variant="ghost" size="sm" onClick={() => onEditPlan(plan)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        data={plans}
        columns={trainingColumns}
        keyExtractor={(plan) => plan._id}
        isLoading={plansLoading}
        emptyMessage="Aucun tarif pour la formation disponible"
      />
    </div>
  );
}
