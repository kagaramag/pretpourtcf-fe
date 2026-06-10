"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, Column } from "@/components/ui/table";
import { Icon } from "@/icons";
import { loginActivityService, ActiveSession } from "@/services/login-activity";
import { toast } from "sonner";
import { date } from "@/utils";

export default function Sessions() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginActivityService.getActiveSessions({
        page: pagination.page,
        limit: pagination.limit,
      });
      setActiveSessions(data.sessions);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const columns: Column<ActiveSession>[] = [
    {
      key: "user",
      header: "Utilisateur",
      render: (session) => (
        <div>
          {session.userId?.first_name} {session.userId?.last_name}
        </div>
      ),
    },
    {
      key: "device",
      header: "Appareil",
      render: (session) => (
        <div className="flex items-center gap-2">{session.deviceName}</div>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (session) => (
        <span className="font-mono">{session.ipAddress || "-"}</span>
      ),
    },
    {
      key: "lastActivity",
      header: "Derniere activite",
      render: (session) => (
        <span>{date(session.lastActivityAt, false, "MM/DD/YYYY hh:mmA")}</span>
      ),
    },
    {
      key: "loginAt",
      header: "Connexion",
      render: (session) => <span>{date(session.loginAt, true)}</span>,
    },
  ];

  return (
    <>
      <h3 className="text-lg mb-4">Sessions actives</h3>
      <Table<ActiveSession>
        data={activeSessions}
        columns={columns}
        isLoading={loading}
        emptyMessage="Aucune session active"
        keyExtractor={(session) => session._id}
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
    </>
  );
}
