"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Calendar } from "lucide-react";
import { promoCodeService } from "@/services/promo-code";
import { subscriptionService } from "@/services/subscription";
import { toast } from "sonner";
import { CreatePromoCodeRequest } from "@/types/promo-code";

interface CreatePromoCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePromoCodeDialog({
  open,
  onOpenChange,
}: CreatePromoCodeDialogProps) {
  const queryClient = useQueryClient();
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [hasMaxUses, setHasMaxUses] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePromoCodeRequest>();

  // Fetch available plans
  const { data: planData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.getPublicPlans(),
  });

  const plans = planData || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePromoCodeRequest) =>
      promoCodeService.createPromoCode(data),
    onSuccess: () => {
      toast.success("Code promo créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Échec de la création du code promo"
      );
    },
  });

  const onSubmit = (data: CreatePromoCodeRequest) => {
    // Prepare the data
    const payload: CreatePromoCodeRequest = {
      code: data.code.toUpperCase().trim(),
      description: data.description?.trim() || undefined,
      discount_percentage: Number(data.discount_percentage),
      status: data.status || "active",
      start_date: data.start_date,
      end_date: data.end_date,
      max_uses: hasMaxUses && data.max_uses ? Number(data.max_uses) : undefined,
      applicable_plans:
        selectedPlans.length > 0 ? selectedPlans : undefined,
    };

    createMutation.mutate(payload);
  };

  const togglePlan = (planId: string) => {
    setSelectedPlans((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal isOpen={open} onClose={() => onOpenChange(false)} title="Créer un nouveau code promo" size="lg">
      <p className="text-sm text-muted-foreground mb-4">
        Créez un code de réduction pour vos utilisateurs
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">
            Code promo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            placeholder="SUMMER2024"
            {...register("code", {
              required: "Le code promo est requis",
              minLength: {
                value: 3,
                message: "Le code doit contenir au moins 3 caractères",
              },
              maxLength: {
                value: 50,
                message: "Le code ne peut pas dépasser 50 caractères",
              },
              pattern: {
                value: /^[A-Z0-9_-]+$/i,
                message:
                  "Le code ne peut contenir que des lettres, chiffres, tirets et underscores",
              },
            })}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
            }}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Promotion d'été - 50% de réduction sur tous les plans"
            {...register("description")}
            rows={2}
          />
        </div>

        {/* Discount Percentage */}
        <div className="space-y-2">
          <Label htmlFor="discount_percentage">
            Pourcentage de réduction (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="discount_percentage"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="50"
            {...register("discount_percentage", {
              required: "Le pourcentage de réduction est requis",
              min: { value: 0, message: "Minimum 0%" },
              max: { value: 100, message: "Maximum 100%" },
              valueAsNumber: true,
            })}
          />
          {errors.discount_percentage && (
            <p className="text-sm text-red-500">
              {errors.discount_percentage.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Entrez 100 pour un abonnement gratuit (aucun paiement ne sera
            déclenché)
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">
              Date de début <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="start_date"
                type="date"
                min={today}
                className="pl-10"
                {...register("start_date", {
                  required: "La date de début est requise",
                })}
              />
            </div>
            {errors.start_date && (
              <p className="text-sm text-red-500">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">
              Date de fin <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="end_date"
                type="date"
                min={watch("start_date") || today}
                className="pl-10"
                {...register("end_date", {
                  required: "La date de fin est requise",
                  validate: (value) => {
                    const startDate = watch("start_date");
                    if (startDate && value < startDate) {
                      return "La date de fin doit être après la date de début";
                    }
                    return true;
                  },
                })}
              />
            </div>
            {errors.end_date && (
              <p className="text-sm text-red-500">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select
            value={watch("status") || "active"}
            onChange={(value) => setValue("status", value as any)}
            options={[
              { value: "active", label: "Actif" },
              { value: "inactive", label: "Inactif" },
            ]}
            placeholder="Sélectionnez un statut"
          />
        </div>

        {/* Max Uses */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_max_uses"
              checked={hasMaxUses}
              onCheckedChange={(checked) => setHasMaxUses(checked as boolean)}
            />
            <Label htmlFor="has_max_uses" className="cursor-pointer">
              Limiter le nombre d&apos;utilisations
            </Label>
          </div>
          {hasMaxUses && (
            <Input
              id="max_uses"
              type="number"
              min="1"
              placeholder="100"
              {...register("max_uses", {
                min: { value: 1, message: "Minimum 1 utilisation" },
                valueAsNumber: true,
              })}
            />
          )}
          {errors.max_uses && (
            <p className="text-sm text-red-500">{errors.max_uses.message}</p>
          )}
        </div>

        {/* Applicable Plans */}
        <div className="space-y-2">
          <Label>Plans applicables (optionnel)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Si aucun plan n&apos;est sélectionné, le code s&apos;appliquera à tous
            les plans
          </p>
          <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun plan disponible
              </p>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`plan-${plan.id}`}
                    checked={selectedPlans.includes(plan.id)}
                    onCheckedChange={() => togglePlan(plan.id)}
                  />
                  <Label
                    htmlFor={`plan-${plan.id}`}
                    className="cursor-pointer flex-1"
                  >
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({plan.type})
                    </span>
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer le code promo"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
