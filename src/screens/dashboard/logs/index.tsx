"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/molecules/Tabs";
import { Icon } from "@/icons";
import {
  loginActivityService,
  LoginActivityStats,
} from "@/services/login-activity";
import Tracker from "./Tracker";
import Logs from "./Logs";
import Suspicious from "./Suspicious";
import Sessions from "./Sessions";

type TabId = "tracker" | "logs" | "suspicious" | "sessions";

export default function LoginActivityScreen() {
  const [activeTab, setActiveTab] = useState<TabId>("tracker");
  const [stats, setStats] = useState<LoginActivityStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await loginActivityService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Logs</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-green-600" />
              <span className="text-xs text-gray-600">Connexions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.totalLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="close" size={16} className="text-red-600" />
              <span className="text-xs text-gray-600">Echecs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.failedLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-orange-600" />
              <span className="text-xs text-gray-600">Suspects</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.suspiciousLogins}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="remove" size={16} className="text-blue-600" />
              <span className="text-xs text-gray-600">Revoquees</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.sessionsRevoked}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="dashboard" size={16} className="text-purple-600" />
              <span className="text-xs text-gray-600">
                Sessions actives
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.activeSessions}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-red-600" />
              <span className="text-xs text-gray-600">
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
          { id: "tracker", label: "Tracker" },
          { id: "logs", label: "Historique" },
          {
            id: "suspicious",
            label: "Comptes suspects",
            count: stats?.totalFlaggedAccounts || 0,
          },
          {
            id: "sessions",
            label: "Sessions actives",
            count: stats?.activeSessions || 0,
          },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
        size="sm"
        variant="underline"
      />

      {/* Tab Content */}
      {activeTab === "tracker" && <Tracker />}
      {activeTab === "logs" && <Logs />}
      {activeTab === "suspicious" && <Suspicious />}
      {activeTab === "sessions" && <Sessions />}
    </div>
  );
}
