"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Table, Column } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Loading, Open, Search } from "@/icons";
import { toast } from "sonner";
import { corporateService } from "@/services/corporate";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useActivityTracker } from "@/hooks/useActivityTracker";

export default function TrainerLearnersScreen() {
  const router = useRouter();
  const { trackClick } = useActivityTracker();
  const [isLoading, setIsLoading] = useState(true);
  const [learners, setLearners] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchLearners();
  }, [debouncedSearch, pagination.page]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  const fetchLearners = async () => {
    try {
      setIsLoading(true);
      const response = await corporateService.getMyLearners({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
      });

      if (response.data) {
        setLearners(response.data.learners);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error: any) {
      if (error?.response?.status && error.response.status >= 500) {
        toast.error("Erreur lors du chargement des apprenants");
      }
      setLearners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Nom",
      render: (learner) => (
        <span>
          {learner.first_name} {learner.last_name}
        </span>
      ),
    },
    {
      key: "subscriptionExpiry",
      header: "Abonnement",
      render: (learner) => {
        const endDate = learner.subscription?.end_date;
        if (!endDate) return <span className="text-gray-600">-</span>;
        const isExpired = new Date(endDate) < new Date();
        return (
          <div className="text-sm">
            <span className={isExpired ? "text-red-500" : ""}>
              {formatDate(new Date(endDate))}
            </span>
            {isExpired && <Badge>Expiré</Badge>}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (learner) => (
        <Badge variant={learner.status === "active" ? "success" : "secondary"}>
          {learner.status === "active" ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (learner) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            trackClick({ label: "Voir profil apprenant", metadata: { learnerId: learner.id || (learner as any)._id } });
            router.push(
              `/trainer/apprenants/${learner.id || (learner as any)._id}`
            );
          }}
          title="Voir le profil"
        >
          <Open className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading && learners.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold flex-1">
          Apprenants
        </h1>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
        <Input
          placeholder="Rechercher un apprenant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {learners.length === 0 && !isLoading ? (
        <div className="text-center py-12 text-gray-600">
          <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-600/50" />
          <p className="text-lg font-medium mb-2">Aucun apprenant</p>
          <p className="text-sm">
            Les apprenants seront affichés ici une fois ajoutés par
            l'administrateur
          </p>
        </div>
      ) : (
        <div className="rounded-md">
          <Table
            data={learners}
            columns={columns}
            keyExtractor={(l) => l.id || (l as any)._id}
            isLoading={isLoading}
            onRowClick={(learner) => {
              router.push(
                `/trainer/apprenants/${learner.id || (learner as any)._id}`
              );
            }}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
