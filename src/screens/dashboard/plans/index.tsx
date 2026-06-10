"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/table";
import { Tabs, TabPanel } from "@/components/molecules/Tabs";
import { Loading, Certificate, Check, Close, Plus, Edit } from "@/icons";
import { planService, SubscriptionPlan, PlanCategory } from "@/services/plan";
import { PlanDialog } from "./plan-dialog";

export function PlansScreen() {
  const [selectedCategory, setSelectedCategory] = useState<PlanCategory>("preparation");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Fetch plans based on selected category
  const { data, isLoading } = useQuery({
    queryKey: ["plans-admin", selectedCategory],
    queryFn: async () => {
      const response = await planService.getAllPlansAdmin(selectedCategory);
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
        <Loading className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const plans = data || [];

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const preparationColumns: Column<SubscriptionPlan>[] = [
    {
      key: "name",
      header: "Nom",
      render: (plan) => <span className="font-medium">{plan.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (plan) => getPlanTypeBadge(plan.type),
    },
    {
      key: "duration_days",
      header: "Durée",
      render: (plan) => <span>{plan.duration_days} jours</span>,
    },
    {
      key: "price_rwf",
      header: "Prix",
      render: (plan) => (
        <div className="text-sm">
          <span className="font-semibold text-primary">{plan.price_rwf?.toLocaleString()} RWF</span>
          <span className="text-muted-foreground ml-1">/ ${plan.price_usd}</span>
        </div>
      ),
    },
    {
      key: "details",
      header: "Détails",
      render: (plan) => (
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
      ),
    },
    {
      key: "is_active",
      header: "Statut",
      render: (plan) =>
        plan.is_active ? (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Close className="h-3 w-3 mr-1" />
            Inactif
          </Badge>
        ),
    },
    {
      key: "popular",
      header: "Populaire",
      render: (plan) =>
        plan.popular ? (
          <Badge className="bg-orange-500">
            <Certificate className="h-3 w-3 mr-1" />
            Populaire
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (plan) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditPlan(plan)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const trainingColumns: Column<SubscriptionPlan>[] = [
    {
      key: "name",
      header: "Nom",
      render: (plan) => <span className="font-medium">{plan.name}</span>,
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
          <span className="font-semibold text-primary">{plan.price_rwf?.toLocaleString()} RWF</span>
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
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Close className="h-3 w-3 mr-1" />
            Inactif
          </Badge>
        ),
    },
    {
      key: "popular",
      header: "Populaire",
      render: (plan) =>
        plan.popular ? (
          <Badge className="bg-orange-500">
            <Certificate className="h-3 w-3 mr-1" />
            Populaire
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (plan) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditPlan(plan)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans</h1>
        </div>
        <Button onClick={handleCreatePlan} icon="plus" iconOnly />
      </div>

      {/* Tabs for Plan Categories */}
      <Tabs
        tabs={[
          { id: "preparation", label: "Plans de préparation" },
          { id: "training", label: "Plans & Tarif pour la formation" },
        ]}
        activeTab={selectedCategory}
        onTabChange={(value) => setSelectedCategory(value as PlanCategory)}
        // className="w-full"
      />

      <TabPanel id="preparation" activeTab={selectedCategory} className="mt-6">
        <div className="overflow-x-auto">
          <Table
            data={plans}
            columns={preparationColumns}
            keyExtractor={(plan) => plan._id}
            isLoading={isLoading}
            emptyMessage="Aucun plan de préparation disponible"
          />
        </div>
      </TabPanel>

      <TabPanel id="training" activeTab={selectedCategory} className="mt-6">
        <div className="overflow-x-auto">
          <Table
            data={plans}
            columns={trainingColumns}
            keyExtractor={(plan) => plan._id}
            isLoading={isLoading}
            emptyMessage="Aucun plan de formation disponible"
          />
        </div>
      </TabPanel>

      {/* Plan Dialog */}
      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
        defaultCategory={selectedCategory}
      />
    </div>
  );
}
