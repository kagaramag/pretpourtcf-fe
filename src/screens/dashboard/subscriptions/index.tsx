"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabPanel } from "@/components/molecules/Tabs";
import { Loading, Plus } from "@/icons";
import { SubscriptionPlan } from "@/services/plan";
import { PlanDialog } from "@/screens/dashboard/plans/plan-dialog";
import { SubscriptionsTab } from "./subscriptions";
import { PratiquesTab } from "./pratiques";
import { FormationTab } from "./formation";

type ActiveTab = "subscriptions" | "preparation" | "training";

function SubscriptionsScreenContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("subscriptions");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Subscriptions & Tarifs</h1>
        {(activeTab === "preparation" || activeTab === "training") && (
          <Button onClick={handleCreatePlan} icon="plus" iconOnly />
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "subscriptions", label: "Subscriptions" },
          { id: "preparation", label: "Tarif pour pratiques" },
          { id: "training", label: "Tarif pour la formation" },
        ]}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as ActiveTab)}
        variant="underline"
      />

      {/* Subscriptions Tab */}
      <TabPanel id="subscriptions" activeTab={activeTab} className="mt-4">
        <SubscriptionsTab />
      </TabPanel>

      {/* Tarif pour pratiques Tab */}
      <TabPanel id="preparation" activeTab={activeTab} className="mt-4">
        <PratiquesTab onEditPlan={handleEditPlan} />
      </TabPanel>

      {/* Tarif pour la formation Tab */}
      <TabPanel id="training" activeTab={activeTab} className="mt-4">
        <FormationTab onEditPlan={handleEditPlan} />
      </TabPanel>

      {/* Plan Dialog */}
      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
        defaultCategory={activeTab === "training" ? "training" : "preparation"}
      />
    </div>
  );
}

export default function SubscriptionScreen() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SubscriptionsScreenContent />
    </Suspense>
  );
}
