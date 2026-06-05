"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Column } from "@/components/ui/table";
import { Pencil } from "lucide-react";
import { planService, SubscriptionPlan } from "@/services/plan";

interface PratiquesTabProps {
  onEditPlan: (plan: SubscriptionPlan) => void;
}

export function PratiquesTab({ onEditPlan }: PratiquesTabProps) {
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["plans-admin", "preparation"],
    queryFn: async () => {
      const response = await planService.getAllPlansAdmin("preparation");
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

  const preparationColumns: Column<SubscriptionPlan>[] = [
    {
      key: "name",
      header: "Nom",
      width: "w-72",
      render: (plan) => (
        <div className="flex items-center space-x-2">
          <span>{plan.name}</span>
          {plan.popular && <Badge variant="outline">Popular</Badge>}
          {plan.corporateId && (
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {typeof plan.corporateId === "object" && plan.corporateId !== null
                ? (plan.corporateId as any).name
                : "Corporate"}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "w-24",
      render: (plan) => plan.type.toUpperCase(),
    },
    {
      key: "duration_days",
      header: "Duration",
      width: "w-24",
      render: (plan) => <span>{plan.duration_days} days</span>,
    },
    {
      key: "price_rwf",
      header: "Price",
      width: "w-40",
      render: (plan) => (
        <div className="text-sm">
          <span>{plan.price_rwf?.toLocaleString()} RWF</span>
          <span className="text-muted-foreground ml-1">/ ${plan.price_usd}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (plan) => (
        <div className="text-xs space-y-1">
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
            {plan.details.co > 0 && <span>CO: {plan.details.co}</span>}
            {plan.details.ce > 0 && <span>CE: {plan.details.ce}</span>}
            {plan.details.eo > 0 && <span>EO: {plan.details.eo}</span>}
            {plan.details.ee > 0 && <span>EE: {plan.details.ee}</span>}
          </div>
          {/* <div className="flex flex-wrap gap-1">
            {plan.details.correction && (
              <Badge variant="secondary">Correction</Badge>
            )}
            {plan.details.streak && (
              <Badge variant="secondary" className="text-xs py-0">
                Streak
              </Badge>
            )}
            {plan.details.history && (
              <Badge variant="secondary" className="text-xs py-0">
                Historique
              </Badge>
            )}
          </div> */}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      width: "w-24",
      render: (plan) =>
        plan.is_active ? (
          <Badge>Actif</Badge>
        ) : (
          <Badge variant="destructive">Inactif</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "w-24",
      render: (plan) => (
        <Button variant="ghost" size="sm" onClick={() => onEditPlan(plan)} />
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        data={plans}
        columns={preparationColumns}
        keyExtractor={(plan) => plan._id}
        isLoading={plansLoading}
        emptyMessage="Aucun tarif pour pratiques disponible"
      />
    </div>
  );
}
