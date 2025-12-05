"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, Crown, Check, X, Plus, Pencil } from "lucide-react";
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const renderPreparationTable = () => (
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
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
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderTrainingTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Séances</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Populaire</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan._id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>{getPlanTypeBadge(plan.type)}</TableCell>
              <TableCell className="font-semibold text-primary">
                ${plan.price}
              </TableCell>
              <TableCell>
                {plan.training_details?.sessions || 0} séances
              </TableCell>
              <TableCell>
                {plan.training_details?.duration_days || 0} jours
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
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plans</h1>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un plan
        </Button>
      </div>

      {/* Tabs for Plan Categories */}
      <Tabs
        defaultValue="preparation"
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as PlanCategory)}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="preparation">Plans de préparation</TabsTrigger>
          <TabsTrigger value="training">Plans & Tarif pour la formation</TabsTrigger>
        </TabsList>

        <TabsContent value="preparation" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Crown className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun plan de préparation disponible
              </p>
            </div>
          ) : (
            renderPreparationTable()
          )}
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Crown className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucun plan de formation disponible
              </p>
            </div>
          ) : (
            renderTrainingTable()
          )}
        </TabsContent>
      </Tabs>

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
