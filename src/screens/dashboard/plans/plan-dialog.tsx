"use client";

import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Loading } from "@/icons";
import {
  planService,
  SubscriptionPlan,
  PlanCategory,
  PlanType,
} from "@/services/plan";
import { corporateService } from "@/services/corporate";
import { toast } from "sonner";

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  defaultCategory?: PlanCategory;
}

export function PlanDialog({
  open,
  onOpenChange,
  plan,
  defaultCategory = "preparation",
}: PlanDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    type: "premium" as PlanType,
    category: defaultCategory,
    duration_days: 0,
    price_rwf: 0,
    price_usd: 0,
    description: "",
    is_active: true,
    popular: false,
    corporateId: "" as string,
    features: [] as string[],
    // Preparation plan details
    details: {
      co: 0,
      ce: 0,
      eo: 0,
      ee: 0,
      correction: true,
      streak: true,
      history: true,
    },
    // Training plan details
    training_details: {
      sessions: 0,
      duration_days: 0,
    },
  });

  const [featureInput, setFeatureInput] = useState("");

  // Fetch corporates for the dropdown
  const { data: corporatesData } = useQuery({
    queryKey: ["corporates-list"],
    queryFn: async () => {
      const response = await corporateService.getAllCorporates({
        limit: 100,
        isActive: true,
      });
      return response.data.corporates;
    },
    enabled: open,
  });

  const corporates = corporatesData || [];

  useEffect(() => {
    if (plan) {
      // Extract corporateId from populated or raw value
      let corpId = "";
      if (plan.corporateId) {
        if (typeof plan.corporateId === "object" && plan.corporateId !== null) {
          corpId = (plan.corporateId as any)._id || "";
        } else {
          corpId = plan.corporateId as string;
        }
      }

      setFormData({
        name: plan.name,
        type: plan.type,
        category: plan.category,
        duration_days: plan.duration_days,
        price_rwf: plan.price_rwf || 0,
        price_usd: plan.price_usd || 0,
        description: plan.description || "",
        is_active: plan.is_active,
        popular: plan.popular,
        corporateId: corpId,
        features: plan.features || [],
        details: plan.details,
        training_details: plan.training_details || {
          sessions: 0,
          duration_days: 0,
        },
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: "",
        type: "premium",
        category: defaultCategory,
        duration_days: 0,
        price_rwf: 0,
        price_usd: 0,
        description: "",
        is_active: true,
        popular: false,
        corporateId: "",
        features: [],
        details: {
          co: 0,
          ce: 0,
          eo: 0,
          ee: 0,
          correction: true,
          streak: true,
          history: true,
        },
        training_details: {
          sessions: 0,
          duration_days: 0,
        },
      });
    }
  }, [plan, defaultCategory, open]);

  const createMutation = useMutation({
    mutationFn: (data: any) => planService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans-admin"] });
      toast.success("Plan créé avec succès");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Erreur lors de la création du plan"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => planService.updatePlan(plan!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans-admin"] });
      toast.success("Plan mis à jour avec succès");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de la mise à jour du plan"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For training plans, copy training_details.duration_days to root duration_days
    const submitData: any = { ...formData };
    if (submitData.category === "training") {
      submitData.duration_days = submitData.training_details.duration_days;
    }

    // Send corporateId as null if empty
    submitData.corporateId = submitData.corporateId || null;

    if (plan) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isTrainingPlan = formData.category === "training";

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={plan ? "Modifier le plan" : "Créer un nouveau plan"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div>
          <Label htmlFor="name">Nom du plan *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        {/* Corporate Assignment */}
        <div>
          <Label htmlFor="corporateId">Entreprise (optionnel)</Label>
          <Select
            value={formData.corporateId}
            onChange={(value) =>
              setFormData({ ...formData, corporateId: value })
            }
            placeholder="Aucune (plan public)"
            options={[
              { value: "", label: "Aucune (plan public)" },
              ...corporates.map((corp) => ({
                value: corp._id,
                label: corp.name,
              })),
            ]}
          />
          {formData.corporateId && (
            <p className="text-xs text-muted-foreground mt-1">
              Ce plan sera visible uniquement par les apprenants de cette
              entreprise
            </p>
          )}
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onChange={(value) =>
                setFormData({ ...formData, type: value as PlanType })
              }
              options={[
                { value: "trial", label: "Essai" },
                { value: "basic", label: "Basic" },
                { value: "advanced", label: "Advanced" },
                { value: "premium", label: "Premium" },
              ]}
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={formData.category}
              onChange={(value) =>
                setFormData({ ...formData, category: value as PlanCategory })
              }
              options={[
                { value: "preparation", label: "Préparation" },
                { value: "training", label: "Formation" },
              ]}
            />
          </div>
          {!isTrainingPlan && (
            <div className="flex-1">
              <Label htmlFor="duration_days">Durée (jours) *</Label>
              <Input
                id="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_days: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          )}
        </div>
        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_rwf">Prix RWF *</Label>
            <Input
              id="price_rwf"
              type="number"
              value={formData.price_rwf}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price_rwf: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="price_usd">Prix USD *</Label>
            <Input
              id="price_usd"
              type="number"
              value={formData.price_usd}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price_usd: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
        </div>

        {/* Category-specific fields */}
        {!isTrainingPlan ? (
          <>
            {/* Preparation Plan Details */}
            <div className="space-y-2">
              <Label>Détails du plan de préparation</Label>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="co">CO</Label>
                  <Input
                    id="co"
                    type="number"
                    value={formData.details.co}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          co: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ce">CE</Label>
                  <Input
                    id="ce"
                    type="number"
                    value={formData.details.ce}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          ce: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="eo">EO</Label>
                  <Input
                    id="eo"
                    type="number"
                    value={formData.details.eo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          eo: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="ee">EE</Label>
                  <Input
                    id="ee"
                    type="number"
                    value={formData.details.ee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          ee: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="correction"
                    checked={formData.details.correction}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, correction: checked },
                      })
                    }
                  />
                  <Label htmlFor="correction">Correction</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="streak"
                    checked={formData.details.streak}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, streak: checked },
                      })
                    }
                  />
                  <Label htmlFor="streak">Streak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="history"
                    checked={formData.details.history}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        details: { ...formData.details, history: checked },
                      })
                    }
                  />
                  <Label htmlFor="history">Historique</Label>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Training Plan Details */}
            <div className="space-y-2">
              <Label>Détails du plan de formation</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessions">Nombre de séances *</Label>
                  <Input
                    id="sessions"
                    type="number"
                    value={formData.training_details.sessions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        training_details: {
                          ...formData.training_details,
                          sessions: parseInt(e.target.value),
                        },
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="training_duration">Durée (jours) *</Label>
                  <Input
                    id="training_duration"
                    type="number"
                    value={formData.training_details.duration_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        training_details: {
                          ...formData.training_details,
                          duration_days: parseInt(e.target.value),
                        },
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* Features */}
        <div>
          <div className="space-y-1">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted p-2 rounded"
              >
                <span className="text-sm">{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  Supprimer
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Switches */}
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Actif</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="popular"
              checked={formData.popular}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, popular: checked })
              }
            />
            <Label htmlFor="popular">Populaire</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loading className="mr-2 h-4 w-4 animate-spin" />}
            {plan ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
