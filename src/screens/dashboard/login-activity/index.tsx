"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/molecules/Tabs";
import { Table, Column } from "@/components/ui/table";
import { Icon } from "@/icons";
import {
  loginActivityService,
  LoginActivityStats,
  LoginActivityLog,
  SuspiciousAccount,
  ActiveSession,
} from "@/services/login-activity";
import { toast } from "sonner";

type TabId = "logs" | "suspicious" | "sessions";

export default function LoginActivityScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("logs");
  const [stats, setStats] = useState<LoginActivityStats | null>(null);
  const [logs, setLogs] = useState<LoginActivityLog[]>([]);
  const [suspiciousAccounts, setSuspiciousAccounts] = useState<
    SuspiciousAccount[]
  >([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await loginActivityService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

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
    } catch (error) {
      toast.error("Erreur lors du chargement des logs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter]);

  const loadSuspicious = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginActivityService.getSuspiciousAccounts({
        page: pagination.page,
        limit: pagination.limit,
      });
      setSuspiciousAccounts(data.flaggedAccounts);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loginActivityService.getActiveSessions({
        page: pagination.page,
        limit: pagination.limit,
      });
      setActiveSessions(data.sessions);
      setPagination((prev) => ({ ...prev, ...data.pagination }));
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, actionFilter]);

  useEffect(() => {
    if (activeTab === "logs") loadLogs();
    else if (activeTab === "suspicious") loadSuspicious();
    else if (activeTab === "sessions") loadSessions();
  }, [activeTab, loadLogs, loadSuspicious, loadSessions]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "login_success":
        return <Badge className="bg-green-100 text-green-800">Connexion</Badge>;
      case "login_failed":
        return <Badge className="bg-red-100 text-red-800">Echec</Badge>;
      case "suspicious_login":
        return <Badge className="bg-orange-100 text-orange-800">Suspect</Badge>;
      case "device_session_revoked":
        return (
          <Badge className="bg-blue-100 text-blue-800">Session revoquee</Badge>
        );
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  // Table columns for login logs
  const logColumns: Column<LoginActivityLog>[] = [
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
      render: (log) => <span>{formatDate(log.timestamp)}</span>,
    },
  ];

  // Table columns for active sessions
  const sessionColumns: Column<ActiveSession>[] = [
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
      render: (session) => <span>{formatDate(session.lastActivityAt)}</span>,
    },
    {
      key: "loginAt",
      header: "Connexion",
      render: (session) => <span>{formatDate(session.loginAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Login activities
        </h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-green-600" />
              <span className="text-xs text-muted-foreground">Connexions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="close" size={16} className="text-red-600" />
              <span className="text-xs text-muted-foreground">Echecs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.failedLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-orange-600" />
              <span className="text-xs text-muted-foreground">Suspects</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.suspiciousLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="remove" size={16} className="text-blue-600" />
              <span className="text-xs text-muted-foreground">Revoquees</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.sessionsRevoked}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="dashboard" size={16} className="text-purple-600" />
              <span className="text-xs text-muted-foreground">
                Sessions actives
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-red-600" />
              <span className="text-xs text-muted-foreground">
                Comptes signales
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {stats.totalFlaggedAccounts}
            </p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "logs", label: "Historique" },
          { id: "suspicious", label: "Comptes suspects", count: stats?.totalFlaggedAccounts || 0 },
          { id: "sessions", label: "Sessions actives", count: stats?.activeSessions || 0 },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
        size="sm"
        variant="underline"
      />

      {/* Tab Content */}
      {activeTab === "logs" && (
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
            columns={logColumns}
            isLoading={loading}
            emptyMessage="Aucun log de connexion"
            keyExtractor={(log) => log._id}
            // compact
          />
        </div>
      )}

      {activeTab === "suspicious" && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4">
              Comptes suspects de partage
            </h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Chargement...
              </div>
            ) : suspiciousAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun compte suspect detecte
              </div>
            ) : (
              <div className="space-y-4">
                {suspiciousAccounts.map((account, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon
                          name="info"
                          size={20}
                          className="text-orange-500"
                        />
                        <div>
                          <span className="font-medium">
                            {account.user
                              ? `${account.user.first_name} ${account.user.last_name}`
                              : "Utilisateur inconnu"}
                          </span>
                          {account.user && (
                            <div className="text-xs text-muted-foreground">
                              {account.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {account.flagCount} alerte
                        {account.flagCount > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      {account.recentEvents.map((event, eIdx) => (
                        <div
                          key={eIdx}
                          className="text-xs grid grid-cols-4 gap-2 text-muted-foreground"
                        >
                          <span>
                            IP: {event.previous_ip} → {event.current_ip}
                          </span>
                          <span>
                            {event.previous_device} → {event.current_device}
                          </span>
                          <span>
                            {event.minutes_since_last_activity} min entre
                          </span>
                          <span>{formatDate(event.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === "sessions" && (
        <Card>
          <h3 className="text-lg mb-4">Sessions actives</h3>
          <Table<ActiveSession>
            data={activeSessions}
            columns={sessionColumns}
            isLoading={loading}
            emptyMessage="Aucune session active"
            keyExtractor={(session) => session._id}
            // compact
          />
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
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
