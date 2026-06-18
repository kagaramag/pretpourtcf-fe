"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Clock, Info, Read, Flame, Trophy, Zap } from "@/icons";
import { streakService, CreateStreakData } from "@/services/streak";
import { practiceService } from "@/services/practice";
import { Practice } from "@/types";
import { toast } from "sonner";

interface CreateStreakDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStreakCreated?: () => void;
}

export function CreateStreakDialog({
  open,
  onOpenChange,
  onStreakCreated,
}: CreateStreakDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>("");
  const [loadingPractices, setLoadingPractices] = useState(false);

  // Fetch practices when dialog opens
  useEffect(() => {
    if (open) {
      fetchPractices();
    }
  }, [open]);

  const fetchPractices = async () => {
    try {
      setLoadingPractices(true);
      const response = await practiceService.getAllPractices({
        isActive: true,
        limit: 100, // Get all active practices
      });

      if (response.status === "success") {
        // Filter practices that have at least 20 questions
        const validPractices = response.data.practices.filter(
          (p) => p.totalQuestions >= 20
        );
        setPractices(validPractices);

        // Auto-select first practice if available
        if (validPractices.length > 0) {
          setSelectedPracticeId(validPractices[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching practices:", error);
      toast.error("Erreur lors du chargement des exercices");
    } finally {
      setLoadingPractices(false);
    }
  };

  const handleCreateStreak = async () => {
    if (!selectedPracticeId) {
      toast.error("Veuillez sélectionner un exercice");
      return;
    }

    try {
      setIsLoading(true);
      const data: CreateStreakData = { practiceId: selectedPracticeId };
      const response = await streakService.createStreak(data);

      if (response.status === "success") {
        toast.success(response.data.message || "Série créée avec succès!");
        onOpenChange(false);
        setSelectedPracticeId(""); // Reset selection
        onStreakCreated?.();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de la série"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPracticeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      listening: "Compréhension orale",
      reading: "Compréhension écrite",
      writing: "Expression écrite",
      speaking: "Expression orale",
    };
    return labels[type] || type;
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Démarrer une nouvelle série"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateStreak}
            disabled={isLoading || !selectedPracticeId || loadingPractices}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Création...
              </>
            ) : (
              <>
                <Flame className="mr-2 h-4 w-4" />
                Démarrer la série
              </>
            )}
          </Button>
        </>
      }
    >
      <p className="text-gray-600 text-sm mb-4">
        Relevez le défi et gagnez des emblème exclusives!
      </p>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              Fonctionnalité premium uniquement. Vous devez avoir un abonnement
              actif pour créer une série.
            </AlertDescription>
          </Alert>

          {/* Practice Selection */}
          <div className="space-y-2">
            <Label htmlFor="practice" className="flex items-center gap-2">
              <Read className="h-4 w-4" />
              Choisir un exercice
            </Label>
            <Select
              value={selectedPracticeId}
              onChange={setSelectedPracticeId}
              disabled={loadingPractices || practices.length === 0}
              options={practices.map((practice) => ({
                value: practice._id,
                label: `${practice.title} - ${getPracticeTypeLabel(practice.type)} (${practice.totalQuestions} questions)`,
              }))}
              placeholder={
                loadingPractices
                  ? "Chargement..."
                  : practices.length === 0
                  ? "Aucun exercice disponible"
                  : "Sélectionnez un exercice"
              }
            />
            <p className="text-xs text-gray-600">
              La série utilisera 20 questions de cet exercice
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
              <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">20 Exercices</h4>
                <p className="text-xs text-gray-600">
                  Complétez 20 exercices avec au moins 90% de score
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">12 heures</h4>
                <p className="text-xs text-gray-600">
                  Complétez un exercice toutes les 12 heures pour maintenir
                  votre série
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
              <Flame className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">7 jours</h4>
                <p className="text-xs text-gray-600">
                  La série dure 7 jours. Terminez tous les exercices avant
                  l'expiration
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50">
              <Zap className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">
                  Emblème exclusives
                </h4>
                <p className="text-xs text-gray-600">
                  Gagnez une récompense unique pour chaque 3 exercices
                  complétés
                </p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Attention:</strong> Vous ne pouvez avoir qu'une seule
              série active à la fois. Si vous ne complétez pas d'exercice dans
              les 12 heures, votre série brûlera!
            </AlertDescription>
          </Alert>
        </div>

    </Modal>
  );
}
