"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/table";
import { Icon } from "@/icons";
import {
  loginActivityService,
  LoginActivityLog,
} from "@/services/login-activity";
import { toast } from "sonner";
import { date } from "@/utils";

const getActionBadge = (action: string) => {
  switch (action) {
    case "login_success":
      return <div className="text-green-800 uppercase">Connexion</div>;
    case "login_failed":
      return <div className=" text-red-800 uppercase">Echec</div>;
    case "suspicious_login":
      return <div className="text-orange-800 uppercase">Suspect</div>;
    case "device_session_revoked":
      return <div className="text-blue-800 uppercase">Session revoquee</div>;
    default:
      return <div className="uppercase">{action}</div>;
  }
};

export default function Logs() {
  const [logs, setLogs] = useState<LoginActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginActivityService.getLogs({
        page: pagination.page,
        limit: pagination.limit,
        action: actionFilter !== "all" ? actionFilter : undefined,
      });
      setLogs(data.logs);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch {
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [actionFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const columns: Column<LoginActivityLog>[] = [
    {
      key: "user",
      header: "Utilisateur",
      render: (log) =>
        log.user_id ? (
          <div>
            {log.user_id.first_name} {log.user_id.last_name}
          </div>
        ) : (
          <span className="text-muted-foreground">
            {log.metadata?.email || "-"}
          </span>
        ),
    },
    {
      key: "action",
      header: "Action",
      render: (log) => getActionBadge(log.action),
    },
    {
      key: "ip",
      header: "IP",
      render: (log) => (
        <span className="font-mono">{log.ip_address || "-"}</span>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (log) => (
        <span className="max-w-48 truncate block">
          {log.metadata?.device_name || log.metadata?.reason || "-"}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (log) => (
        <span>{date(log.timestamp, false, "DD/MM/YYYY hh:mmA")}</span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-48 rounded-md border border-border px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
        >
          <option value="all">Toutes les actions</option>
          <option value="login_success">Connexions reussies</option>
          <option value="login_failed">Echecs</option>
          <option value="suspicious_login">Suspects</option>
          <option value="device_session_revoked">Sessions revoquees</option>
        </select>
      </div>

      <Table<LoginActivityLog>
        data={logs}
        columns={columns}
        isLoading={loading}
        emptyMessage="Aucun log de connexion"
        keyExtractor={(log) => log._id}
        striped
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} sur {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <Icon name="arrowLeft" size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
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
