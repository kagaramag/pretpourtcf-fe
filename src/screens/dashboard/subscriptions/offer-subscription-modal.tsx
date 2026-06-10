"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Loading } from "@/icons";
import { subscriptionService, AdminOfferData } from "@/services/subscription";
import { planService, SubscriptionPlan } from "@/services/plan";
import { userService } from "@/services/user";
import { toast } from "sonner";

interface OfferSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfferSubscriptionModal({
  isOpen,
  onClose,
}: OfferSubscriptionModalProps) {
  const queryClient = useQueryClient();

  const [userSearch, setUserSearch] = useState("");
  const debouncedUserSearch = useDebounce(userSearch, 400);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserLabel, setSelectedUserLabel] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentType, setPaymentType] = useState<"free" | "manual_payment">(
    "free"
  );

  // Fetch users for search
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users-search", debouncedUserSearch],
    queryFn: () =>
      userService.getAllUsers({
        search: debouncedUserSearch,
        role: "client",
        limit: 10,
      }),
    enabled: debouncedUserSearch.length >= 2,
  });

  const users = usersData?.data?.users || [];

  // Fetch active plans
  const { data: plansData } = useQuery({
    queryKey: ["admin-plans-active"],
    queryFn: () => planService.getAllPlansAdmin(),
    enabled: isOpen,
  });

  const activePlans: SubscriptionPlan[] = (plansData?.data?.plans || [])
    .filter((p: SubscriptionPlan) => p.is_active)
    .sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
      const catCompare = (a.category || "").localeCompare(b.category || "");
      if (catCompare !== 0) return catCompare;
      return (b.price_rwf || 0) - (a.price_rwf || 0);
    });

  const selectedPlan = activePlans.find((p) => p._id === selectedPlanId);

  // Mutation
  const offerMutation = useMutation({
    mutationFn: (data: AdminOfferData) =>
      subscriptionService.adminOfferSubscription(data),
    onSuccess: () => {
      toast.success("Abonnement offert avec succes");
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erreur lors de l'offre d'abonnement";
      toast.error(message);
    },
  });

  const handleClose = () => {
    setUserSearch("");
    setSelectedUserId("");
    setSelectedUserLabel("");
    setSelectedPlanId("");
    setPaymentType("free");
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedUserId || !selectedPlanId) {
      toast.error("Veuillez selectionner un client et un plan");
      return;
    }
    offerMutation.mutate({
      user_id: selectedUserId,
      plan_id: selectedPlanId,
      payment_type: paymentType,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Offrir un abonnement"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedUserId || !selectedPlanId}
            isLoading={offerMutation.isPending}
          >
            Offrir
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* User search */}
        <div>
          <label className="block text-sm font-medium mb-1">Client</label>
          {selectedUserId ? (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-sm flex-1">{selectedUserLabel}</span>
              <Button
                iconOnly
                icon="close"
                variant="ghost"
                onClick={() => {
                  setSelectedUserId("");
                  setSelectedUserLabel("");
                  setUserSearch("");
                }}
              />
            </div>
          ) : (
            <div className="space-y-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un client..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {debouncedUserSearch.length >= 2 && (
                <div className="border border-gray-200 rounded max-h-40 overflow-y-auto">
                  {usersLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loading className="h-4 w-4 animate-spin" />
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-3 text-sm text-gray-600 text-center">
                      Aucun client trouve
                    </div>
                  ) : (
                    users.map((user: any) => (
                      <button
                        key={user._id || user.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-200 last:border-b-0 cursor-pointer"
                        onClick={() => {
                          const id = user._id || user.id;
                          setSelectedUserId(id);
                          setSelectedUserLabel(
                            `${user.first_name} ${user.last_name} (${user.email})`
                          );
                          setUserSearch("");
                        }}
                      >
                        <div>
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {user.email}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <Select
            value={selectedPlanId}
            onChange={(value) => setSelectedPlanId(value)}
            options={activePlans.map((p) => ({
              value: p._id,
              label: `${p.name}(${p.category}) — ${p.price_rwf?.toLocaleString()} RWF (${p.duration_days}j)`,
            }))}
            placeholder="Choisir un plan"
          />
          {selectedPlan && (
            <div className="mt-1 text-xs text-muted-foreground">
              {selectedPlan.category} &middot; {selectedPlan.type} &middot;{" "}
              {selectedPlan.duration_days} jours
            </div>
          )}
        </div>

        {/* Payment type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Type de paiement
          </label>
          <Select
            value={paymentType}
            onChange={(value) =>
              setPaymentType(value as "free" | "manual_payment")
            }
            options={[
              { value: "free", label: "Gratuit (offert)" },
              { value: "manual_payment", label: "Paiement manuel (deja paye)" },
            ]}
            placeholder="Type de paiement"
          />
          {paymentType === "free" && selectedPlan && (
            <p className="mt-1 text-xs text-muted-foreground">
              Le montant de la transaction sera 0 RWF
            </p>
          )}
          {paymentType === "manual_payment" && selectedPlan && (
            <p className="mt-1 text-xs text-muted-foreground">
              La transaction sera de {selectedPlan.price_rwf?.toLocaleString()}{" "}
              RWF (paiement recu hors plateforme)
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
