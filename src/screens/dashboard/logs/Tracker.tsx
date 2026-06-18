"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/table";
import { Icon } from "@/icons";
import { Select } from "@/components/ui/select";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";
import { userService } from "@/services/user";
import { toast } from "sonner";
import { date } from "@/utils";

interface TrackerActivityLog {
  _id: string;
  user_id?: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  action: string;
  category: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface TrackerResponse {
  status: string;
  data: {
    logs: TrackerActivityLog[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

interface UserOption {
  _id: string;
  first_name: string;
  last_name: string;
}

const trackerActionLabels: Record<string, string> = {
  page_viewed: "Page consultée",
  button_clicked: "Bouton cliqué",
  link_clicked: "Lien cliqué",
  form_submitted: "Formulaire soumis",
  login_success: "Connexion",
  logout: "Déconnexion",
  practice_started: "Pratique démarrée",
  practice_completed: "Pratique terminée",
};

const practiceTypeLabels: Record<string, string> = {
  listening: "CO",
  reading: "CE",
  writing: "EE",
  speaking: "EO",
};

function getPracticeLabel(metadata: Record<string, any>): string {
  const type =
    practiceTypeLabels[metadata.practice_type] || metadata.practice_type;
  const title = metadata.practice_title || "";
  const prefix = metadata.is_freemium ? "Essai" : "Payant";
  return `${prefix}: ${type} — ${title}`;
}

function getPageLabel(path: string): string {
  const segments: Record<string, string> = {
    "/compte": "Accueil compte",
    "/compte/plans": "Plans",
    "/compte/series": "Séries",
    "/compte/historique": "Historique",
    "/compte/profile": "Profil",
    "/compte/pratique/co": "Pratique payante — CO",
    "/compte/pratique/ce": "Pratique payante — CE",
    "/compte/pratique/eo": "Pratique payante — EO",
    "/compte/pratique/ee": "Pratique payante — EE",
    "/compte/essai-gratuit": "Essai gratuit",
    "/compte/essai-gratuit/co": "Essai — CO",
    "/compte/essai-gratuit/ce": "Essai — CE",
    "/compte/essai-gratuit/eo": "Essai — EO",
    "/compte/essai-gratuit/ee": "Essai — EE",
    "/compte/parrainages": "Parrainages",
    "/compte/abonner": "Abonnement",
    "/trainer": "Tableau formateur",
    "/trainer/apprenants": "Apprenants",
    "/trainer/pratiques/co": "Pratiques CO",
    "/trainer/pratiques/eo": "Pratiques EO",
    "/trainer/profile": "Profil formateur",
  };
  if (segments[path]) return segments[path];
  for (const [prefix, label] of Object.entries(segments)) {
    if (path.startsWith(prefix + "/")) return label;
  }
  return path;
}

export default function Tracker() {
  const [activities, setActivities] = useState<TrackerActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  });
  const [users, setUsers] = useState<UserOption[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await userService.getAllUsers({ limit: 200 });
      setUsers(
        (response.data.users || []).map((u: any) => ({
          _id: u._id,
          first_name: u.first_name,
          last_name: u.last_name,
        }))
      );
    } catch {
      // silent
    }
  }, []);

  const loadTracker = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (userFilter !== "all") params.append("user_id", userFilter);
      if (actionFilter !== "all") params.append("action", actionFilter);

      const response = await apiClient.get<TrackerResponse>(
        `${API_ENDPOINTS.ANALYTICS_USER_ACTIVITY}?${params}`
      );
      setActivities(response.data.logs);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.total_pages,
      }));
    } catch {
      toast.error("Erreur lors du chargement du tracker");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, userFilter, actionFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [userFilter, actionFilter]);

  useEffect(() => {
    loadTracker();
  }, [loadTracker]);

  const columns: Column<TrackerActivityLog>[] = [
    {
      key: "user",
      header: "Utilisateur",
      render: (log) => {
        const userName = log.user_id
          ? `${log.user_id.first_name} ${log.user_id.last_name}`
          : "Anonyme";
        return <span>{userName}</span>;
      },
    },
    {
      key: "role",
      header: "Rôle",
      render: (log) => {
        return <div className="uppercase">{log.user_id?.role}</div>;
      },
    },
    {
      key: "action",
      header: "Action",
      render: (log) => (
        <span>{trackerActionLabels[log.action] || log.action}</span>
      ),
    },
    {
      key: "details",
      header: "Détails",
      render: (log) => {
        const isPageView = log.action === "page_viewed";
        const isPracticeEvent =
          log.action === "practice_started" ||
          log.action === "practice_completed";
        const pagePath = log.metadata?.page_path || "";
        const label = log.metadata?.label || "";

        if (isPageView) return <span>{getPageLabel(pagePath)}</span>;
        if (isPracticeEvent && log.metadata)
          return <span>{getPracticeLabel(log.metadata)}</span>;
        if (label) return <span>{label}</span>;
        return <span className="text-gray-600">-</span>;
      },
    },
    {
      key: "date",
      header: "Date",
      align: "right",
      render: (log) => (
        <span>
          {date(log.timestamp, false, "DD/MM/YYYY hh:mmA")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Select
          className="w-56"
          value={userFilter}
          onChange={setUserFilter}
          placeholder="Tous les utilisateurs"
          searchPlaceholder="Rechercher un utilisateur..."
          options={[
            { value: "all", label: "Tous les utilisateurs" },
            ...users.map((u) => ({
              value: u._id,
              label: `${u.first_name} ${u.last_name}`,
            })),
          ]}
        />
        <Select
          className="w-48"
          value={actionFilter}
          onChange={setActionFilter}
          placeholder="Toutes les actions"
          searchPlaceholder="Rechercher..."
          options={[
            { value: "all", label: "Toutes les actions" },
            { value: "page_viewed", label: "Pages consultées" },
            { value: "button_clicked", label: "Boutons cliqués" },
            { value: "login_success", label: "Connexions" },
            { value: "logout", label: "Déconnexions" },
            { value: "practice_started", label: "Pratiques démarrées" },
            { value: "practice_completed", label: "Pratiques terminées" },
          ]}
        />
      </div>

      <Table<TrackerActivityLog>
        data={activities}
        columns={columns}
        isLoading={loading}
        emptyMessage="Aucune activité enregistrée"
        keyExtractor={(log) => log._id}
        striped
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
            >
              <Icon name="arrowLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
            >
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
